"""API del asistente. El modelo, Chroma y BM25 se cargan una sola vez."""
from __future__ import annotations

import json
from contextlib import asynccontextmanager
from typing import Any, Literal

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from . import config, prompts
from .graph import build_graph
from .retriever import get_index

limiter = Limiter(key_func=get_remote_address)
STATE: dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    meta = {}
    if config.META_PATH.exists():
        meta = json.loads(config.META_PATH.read_text("utf-8"))
    index = get_index()
    STATE["meta"] = meta
    STATE["index"] = index
    STATE["graph"] = build_graph(index, meta.get("catalog_mode", "completo"))
    print(
        f"Catálogo listo: {len(index.df)} cursos, {len(index.categorias)} familias, "
        f"modo {meta.get('catalog_mode', '?')}"
    )
    yield
    STATE.clear()


app = FastAPI(title="Infomaster RAG", version="0.1.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_origin_regex=config.ALLOWED_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


class Turn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=config.MAX_MESSAGE_CHARS)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=config.MAX_MESSAGE_CHARS)
    history: list[Turn] = Field(default_factory=list)


class Source(BaseModel):
    titulo: str
    categoria: str
    horas: int
    codigo_oficial: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    catalog_mode: str


@app.get("/health")
def health() -> dict[str, Any]:
    index = STATE.get("index")
    return {
        "status": "ok" if index else "cargando",
        "cursos": len(index.df) if index else 0,
        "familias": len(index.categorias) if index else 0,
        **STATE.get("meta", {}),
    }


@app.post("/chat", response_model=ChatResponse)
@limiter.limit(config.RATE_LIMIT)
def chat(request: Request, payload: ChatRequest) -> ChatResponse:
    graph = STATE.get("graph")
    if graph is None:
        return ChatResponse(answer=prompts.FALLBACK["otro"], sources=[], catalog_mode="?")

    result = graph.invoke({
        "question": payload.message.strip(),
        "history": [t.model_dump() for t in payload.history],
    })
    return ChatResponse(
        answer=result.get("answer") or prompts.FALLBACK["otro"],
        sources=[Source(**s) for s in result.get("sources", [])],
        catalog_mode=STATE.get("meta", {}).get("catalog_mode", "completo"),
    )
