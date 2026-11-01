# HF Space (SDK: docker). El índice se construye EN BUILD: así el arranque en
# frío no tiene que reindexar ni descargar el modelo.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    HF_HOME=/app/.cache/huggingface \
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/huggingface

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Pesos del modelo horneados en la imagen.
RUN python -c "from sentence_transformers import SentenceTransformer; \
    SentenceTransformer('intfloat/multilingual-e5-small')"

COPY app ./app
COPY eval ./eval
COPY data/Catalogue/catalog_public.jsonl data/Catalogue/catalog_private.jsonl ./data/Catalogue/

# Catálogo completo (13.327 cursos). Para un Space de pruebas: --sample 200.
RUN python -m app.ingest

EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
