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
COPY data/CATALOGO.xlsx ./data/CATALOGO.xlsx

# Cambia a `python -m app.ingest` para el catálogo completo (13.690 cursos).
RUN python -m app.ingest --sample 200

EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
