# Infomaster Formación

Rediseño de la web de [Infomaster Formación](https://www.infomasterformacion.es/), empresa de formación para empresas con sede en Málaga.

**Web en vivo: https://dluisvaldivia.github.io/INFOMASTER/**

[![CI/CD](https://github.com/dluisvaldivia/INFOMASTER/actions/workflows/ci.yml/badge.svg)](https://github.com/dluisvaldivia/INFOMASTER/actions/workflows/ci.yml)

## Qué hay en el repo

| Carpeta | Contenido |
| --- | --- |
| [`infomaster/`](infomaster/) | La web: Vite + React 19 + TypeScript + Tailwind CSS v4 |
| [`rag/`](rag/) | Servicio RAG (Python) que alimenta el chat con el catálogo de cursos |
| [`.github/workflows/`](.github/workflows/) | CI/CD: lint, build y despliegue en GitHub Pages |

## Desarrollo local

Requiere Node 22.

```bash
cd infomaster
npm install
npm run dev       # servidor de desarrollo
npm run lint      # oxlint
npm run build     # tsc + build de producción en dist/
npm run preview   # sirve el build
```

El chat necesita el servicio RAG. Copia `infomaster/.env.example` a `infomaster/.env.local` y apunta `VITE_RAG_URL` al servicio. Las instrucciones para arrancarlo están en [`rag/README.md`](rag/README.md).

## CI/CD

El workflow [`ci.yml`](.github/workflows/ci.yml) se ejecuta en cada push y pull request:

1. `npm ci`, `npm run lint` y `npm run build`.
2. Solo en `main`: publica `infomaster/dist` en GitHub Pages.

Para el despliegue, la app se compila con `BASE_PATH=/INFOMASTER/` porque Pages la sirve en esa subruta. Además, se copia `index.html` a `404.html` para que al recargar una ruta interna (por ejemplo, `/cursos`) cargue igualmente la app.

Para activar el chat en la web publicada, crea la variable de repositorio `VITE_RAG_URL` en *Settings → Secrets and variables → Actions → Variables* con la URL pública del servicio RAG.

## Licencia

Ver [LICENSE](LICENSE).
