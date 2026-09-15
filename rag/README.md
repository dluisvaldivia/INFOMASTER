# RAG del catálogo de cursos

Servicio que responde preguntas sobre el catálogo de Infomaster desde el widget
de chat de la web. Recuperación híbrida sobre `CATALOGO.xlsx` + generación con Groq.

## Puesta en marcha

```bash
cd rag
python3 -m venv .venv                     # si no existe
.venv/bin/python -m pip install -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

cp .env.example .env                      # y pon tu GROQ_API_KEY

.venv/bin/python -m app.ingest --sample 200    # pruebas: ~220 cursos, segundos
.venv/bin/python -m app.ingest                 # producción: 13.690 cursos

.venv/bin/uvicorn app.main:app --reload --port 8000
```

En `infomaster/.env.local`: `VITE_RAG_URL=http://localhost:8000`.

## Modos del catálogo

| Modo | Comando | Cursos | Para qué |
|---|---|---|---|
| Muestra | `python -m app.ingest --sample 200` | ~217 | Desarrollo y pruebas |
| Completo | `python -m app.ingest` | 13.690 | Producción |

La muestra es **estratificada** (8 por familia × 26 familias) más casos borde
forzados, no `head(200)`: las 200 primeras filas del Excel son todas de la misma
familia y no probarían nada. En modo muestra los conteos son los de la muestra
(8 cursos de informática, no 1.673); el prompt lo advierte solo.

## Verificación

```bash
.venv/bin/python -m app.ingest --no-embed   # valida el parseo del Excel completo
.venv/bin/python -m eval.run_eval           # recuperación, sin LLM: gratis y determinista
.venv/bin/python -m eval.smoke_graph        # extremo a extremo, requiere GROQ_API_KEY
```

`run_eval` es el que conviene correr en cada cambio del retriever: no gasta
llamadas y es reproducible.

## Cómo está montado

```
CATALOGO.xlsx ─► ingest.py ─► cursos.parquet + Chroma
                                    │
Navegador ─► POST /chat ─► FastAPI ─► LangGraph ─► Groq ─► {answer, sources}
```

- **Embeddings en local** (`intfloat/multilingual-e5-small`, CPU) y **LLM remoto**:
  la ingesta hace 13.690 embeddings y no puede depender de un rate limit; la
  generación es una llamada por mensaje. Así todo cabe en capa gratuita.
- **Recuperación híbrida** BM25 + denso fusionados con RRF. No es un lujo: el
  único texto indexable es un título corto lleno de siglas y códigos
  (`UF2361`, `PRL`, `Excel`, `AFDA001PO`), donde los vectores densos fallan.
- **Un curso = un documento.** Sin chunking: partir una fila solo separaría un
  título de sus horas.
- **La ruta `listar`** responde los conteos contando sobre el parquet. Por
  búsqueda vectorial, "¿cuántos cursos de informática?" devuelve 6 filas y el
  modelo contesta "6", con seguridad y mal.

## Reglas de negocio incrustadas

- **El chat nunca cita precios.** El 29% del PVP del Excel está roto (`#REF!`) y
  las tarifas son B2B. `precio_eur` se guarda en metadatos para uso futuro pero
  no entra jamás en el contexto del LLM (`config.EXPOSE_PRICES = False`).
- **Nunca afirma modalidad, fechas ni acreditación**: no están en el Excel.
- **UF/MF no se recomiendan** (~3.400 unidades y módulos formativos), pero sí se
  localizan si el usuario nombra el código.
- Toda respuesta útil cierra derivando a `info@infomasterformacion.es` / `+34 951 333 677`.

## Actualizar el catálogo

Los proveedores (VÉRTICE, Academia Integral) actualizan sus ficheros por su
cuenta y nada sincroniza. Al llegar uno nuevo:

```bash
cp CATALOGO-nuevo.xlsx rag/data/CATALOGO.xlsx
.venv/bin/python -m app.ingest
```

La ingesta **aborta** si el fichero no cuadra con el perfil esperado (13.690
cursos, 26 familias, 3.968 precios rotos) en vez de indexar a medias. Si el
catálogo ha cambiado a propósito, actualiza los `EXPECTED_*` de `app/config.py`.

## Despliegue (HF Space, SDK docker)

El `Dockerfile` hornea el modelo y construye el índice **en build**, para que el
arranque en frío no reindexe. `GROQ_API_KEY` va como *secret* del Space. El tier
gratuito duerme tras inactividad (~30 s de arranque); por eso el widget cae al
mensaje de contacto si el backend no responde en 30 s.

Para producción, cambia en el `Dockerfile`:
`RUN python -m app.ingest --sample 200` → `RUN python -m app.ingest`.
