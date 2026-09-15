"""Configuración central del servicio RAG de Infomaster."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# El .env se carga AQUÍ, antes de leer nada del entorno. Si lo hiciera cada
# punto de entrada por su cuenta, bastaría con importar config antes de esa
# llamada para que las claves quedaran vacías: es justo lo que pasaba en
# main.py, y solo se veía por HTTP, no invocando el grafo directamente.
load_dotenv(BASE_DIR / ".env")
DATA_DIR = BASE_DIR / "data"
CHROMA_DIR = BASE_DIR / "chroma"
EVAL_DIR = BASE_DIR / "eval"

# --- Fuente ---------------------------------------------------------------
# El Excel vive hoy dentro de la app de React; data/ tiene prioridad si existe
# una copia (es lo que usa el Dockerfile, que no copia infomaster/).
EXCEL_CANDIDATES = [
    DATA_DIR / "CATALOGO.xlsx",
    BASE_DIR.parent / "infomaster" / "CATALOGO.xlsx",
]
SHEET_NAME = "RESUMEN CURSOS 2025"
PARQUET_PATH = DATA_DIR / "cursos.parquet"
META_PATH = DATA_DIR / "catalog_meta.json"


def excel_path() -> Path:
    for candidate in EXCEL_CANDIDATES:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        "No se encuentra CATALOGO.xlsx. Buscado en: "
        + ", ".join(str(c) for c in EXCEL_CANDIDATES)
    )


# --- Aserciones de parseo -------------------------------------------------
# Perfilado del catálogo 2025. Si un Excel nuevo no cuadra, la ingesta falla
# ruidosamente en vez de indexar a medias.
EXPECTED_COURSES = 13690
EXPECTED_CATEGORIES = 26
EXPECTED_SUBSECTIONS = 173
EXPECTED_MISSING_PRICE = 3968

# --- Índice ---------------------------------------------------------------
EMBED_MODEL = "intfloat/multilingual-e5-small"
COLLECTION_NAME = "cursos"
EMBED_BATCH = 64

# e5 exige estos prefijos; sin ellos la calidad de recuperación cae mucho.
PASSAGE_PREFIX = "passage: "
QUERY_PREFIX = "query: "

# --- Recuperación ---------------------------------------------------------
DENSE_TOP_K = 25
SPARSE_TOP_K = 25
RRF_K = 60          # constante estándar de Reciprocal Rank Fusion
FINAL_TOP_K = 6
# Impulso aditivo para la categoría propuesta por el clasificador. Medio puesto
# de RRF: reordena entre iguales, no rescata irrelevantes.
CATEGORY_BOOST = 0.5 / RRF_K

# --- LLM ------------------------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
# Groq retiró los Llama 3.3. gpt-oss-120b es el mayor disponible y está
# anunciado como multilingüe. Es un modelo de razonamiento: con reasoning_effort
# alto y pocos max_tokens, el presupuesto se lo come el razonamiento y `content`
# vuelve VACÍO. De ahí "low" y el guardarraíl de respuesta vacía en graph.py.
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_REASONING_EFFORT = os.getenv("GROQ_REASONING_EFFORT", "low")
# Capa gratuita: 8.000 tokens/minuto. Los 429 se reintentan con backoff.
GROQ_MAX_RETRIES = int(os.getenv("GROQ_MAX_RETRIES", "4"))
CLASSIFIER_TEMPERATURE = 0.0
ANSWER_TEMPERATURE = 0.2
ANSWER_MAX_TOKENS = 600

# --- Negocio --------------------------------------------------------------
CONTACT_EMAIL = "info@infomasterformacion.es"
CONTACT_PHONE = "+34 951 333 677"

# El chat nunca cita precios: el 29% del PVP del Excel está roto (#REF!) y las
# tarifas son B2B. precio_eur se guarda en metadatos para la futura página de
# catálogo, pero no entra jamás en el contexto del LLM.
EXPOSE_PRICES = False

# --- API ------------------------------------------------------------------
ALLOWED_ORIGINS = [
    "https://www.infomasterformacion.es",
    "https://infomasterformacion.es",
]
# Vite cambia de puerto solo cuando el 5173 está ocupado (y entonces el chat
# fallaba por CORS sin decir por qué). Solo localhost: producción sigue en la
# lista explícita de arriba.
ALLOWED_ORIGIN_REGEX = r"http://(localhost|127\.0\.0\.1):\d+"
RATE_LIMIT = os.getenv("RATE_LIMIT", "20/minute")
MAX_MESSAGE_CHARS = 500
MAX_HISTORY_TURNS = 6
