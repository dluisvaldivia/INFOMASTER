---
title: Infomaster RAG
emoji: 🎓
colorFrom: red
colorTo: yellow
sdk: gradio
sdk_version: 6.31.0
app_file: space_app.py
python_version: "3.12"
short_description: Asistente del catálogo de cursos de Infomaster
startup_duration_timeout: 30m
---

Backend del chat de https://dluisvaldivia.github.io/INFOMASTER/ : `POST /chat`,
`GET /health`. Código fuente y despliegue en `rag/` del repo de la web; este
Space se genera con `python space/build.py` y no se edita a mano.
