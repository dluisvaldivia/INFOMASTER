# RAG del catálogo de cursos

Servicio que responde preguntas sobre el catálogo de Infomaster desde el widget
de chat de la web. Recuperación híbrida sobre el catálogo limpio de
`data/Catalogue/` + generación con Groq.

## Puesta en marcha

```bash
cd rag
python3 -m venv .venv                     # si no existe
.venv/bin/python -m pip install -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

cp .env.example .env                      # y pon tu GROQ_API_KEY

.venv/bin/python -m app.ingest --sample 200    # pruebas: ~220 cursos, segundos
.venv/bin/python -m app.ingest                 # producción: 13.327 cursos

.venv/bin/uvicorn app.main:app --reload --port 8000
```

En `infomaster/.env.local`: `VITE_RAG_URL=http://localhost:8000`.

## Modos del catálogo

| Modo | Comando | Cursos | Para qué |
|---|---|---|---|
| Muestra | `python -m app.ingest --sample 200` | ~217 | Desarrollo y pruebas |
| Completo | `python -m app.ingest` | 13.327 | Producción |

La muestra es **estratificada** (8 por familia × 26 familias) más casos borde
forzados, no `head(200)`: las 200 primeras filas son todas de la misma familia y
no probarían nada. En modo muestra los conteos son los de la muestra (8 cursos
de informática, no 1.659); el prompt lo advierte solo. Varios casos del set
dorado solo existen en el catálogo completo.

## Verificación

```bash
.venv/bin/python -m app.ingest --no-embed   # valida la carga del catálogo completo
.venv/bin/python -m eval.run_eval           # recuperación, sin LLM: gratis y determinista
.venv/bin/python -m eval.smoke_graph        # extremo a extremo, requiere GROQ_API_KEY
```

`run_eval` es el que conviene correr en cada cambio del retriever: no gasta
llamadas y es reproducible.

## Cómo está montado

```
catalog_public.jsonl ┐
catalog_private.jsonl┴► ingest.py ─► cursos.parquet + Chroma
                                    │
Navegador ─► POST /chat ─► FastAPI ─► LangGraph ─► Groq ─► {answer, sources}
```

- **Embeddings en local** (`intfloat/multilingual-e5-small`, CPU) y **LLM remoto**:
  la ingesta hace 13.327 embeddings y no puede depender de un rate limit; la
  generación es una llamada por mensaje. Así todo cabe en capa gratuita.
- **Recuperación híbrida** BM25 + denso fusionados con RRF. El denso embebe el
  `embed_text` del catálogo (nombre + tema + sector + público); BM25 añade los
  códigos, temas y tipo, que son tokens que el usuario escribe tal cual
  (`PRL`, `Excel`, `AFDA001PO`) y donde los vectores densos fallan.
- **Público y privado.** Del `catalog_private.jsonl` solo se usan los códigos
  (para buscar) y el precio (metadato). Nada del privado llega al LLM.
- **Un curso = un documento.** Sin chunking: partir una fila solo separaría un
  título de sus horas.
- **La ruta `listar`** responde los conteos contando sobre el parquet. Por
  búsqueda vectorial, "¿cuántos cursos de informática?" devuelve 6 filas y el
  modelo contesta "6", con seguridad y mal.

## Reglas de negocio incrustadas

- **El chat nunca cita precios** ni confirma cálculos: son tarifas B2B, y como
  todo el catálogo vale 7,5 €/h el precio se deduce de las horas. `precio_eur`
  se guarda en metadatos pero no entra jamás en el contexto del LLM.
- **Los códigos se buscan pero no se enseñan** (SEPE, UF/MF y del proveedor).
  Si el usuario escribe un código exacto, ese curso va primero y el contexto lo
  marca sin incluir el código.
- **Nunca afirma modalidad, fechas, validez oficial ni acreditación**: no están
  en el catálogo, y "Máster" u "Online" en un nombre no prueban nada.
- **El tipo sale del código, no del bloque.** Certificado = `HOTR0108` (dos
  dígitos ≠ 00 + año); `HOTR00NN` es especialidad; UF/MF se recomiendan como
  cualquier curso pero se presentan como unidad/módulo de un certificado.
- No recoge datos personales, no nombra proveedores ni competidores, y tiene
  plantillas fijas (sin LLM) para precio, modalidad, FUNDAE, validez,
  inscripción, datos personales, alumnos y saludo.
- Toda respuesta útil cierra derivando a `info@infomasterformacion.es` / `+34 951 333 677`.

## Actualizar el catálogo

Los proveedores (VÉRTICE, Academia Integral) actualizan sus ficheros por su
cuenta y nada sincroniza. Al llegar uno nuevo, pásalo por la limpieza para
regenerar `catalog_public.jsonl` y `catalog_private.jsonl` en `data/Catalogue/`
y reindexa:

```bash
.venv/bin/python -m app.ingest
```

La ingesta **aborta** si el catálogo no cuadra con el perfil esperado (13.327
cursos, 26 familias, mismos ids en público y privado) en vez de indexar a
medias. Si ha cambiado a propósito, actualiza los `EXPECTED_*` de `app/config.py`.

## Despliegue (HF Space, SDK gradio + ZeroGPU)

En vivo: https://dannyvaldivia-infomaster-rag.hf.space (`/chat`, `/health`, y
una página de prueba en `/`). La web lo usa vía la variable de repo
`VITE_RAG_URL` del workflow.

Una cuenta gratuita de HF no puede alojar Spaces Docker ni CPU: solo ZeroGPU,
que exige Gradio. `space/space_app.py` monta las rutas de `app.main` sobre un
`gradio.Server` (que es un FastAPI) con una función `@spaces.GPU` vacía; todo
corre en CPU y nunca se pide GPU.

El Space es **público** (ocultar los ficheros exige PRO). Por eso no se sube
`data/Catalogue/`: `space/build.py` empaqueta el parquet y Chroma ya construidos
en local, sin `precio_eur`. Los códigos sí viajan (la búsqueda por código los
necesita).

```bash
.venv/bin/python -m app.ingest          # si el catálogo ha cambiado
.venv/bin/python space/build.py         # genera .space-build/
.venv/bin/hf upload dannyvaldivia/infomaster-rag .space-build . --repo-type space
```

`GROQ_API_KEY` es un *secret* del Space. El Space duerme tras ~48 h sin uso y
tarda un par de minutos en despertar; el widget cae al mensaje de contacto si
el backend no responde en 30 s, así que conviene abrir la URL antes de una demo.

El `Dockerfile` se mantiene para hosts Docker (o un Space Docker con PRO).
