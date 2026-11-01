"""Grafo LangGraph del asistente.

Existe una razón concreta para que esto sea un grafo y no una cadena lineal:
hay preguntas que NO se deben responder recuperando. "¿Cuántos cursos de
informática tenéis?" por búsqueda vectorial devuelve 6 filas y el modelo
contesta "6" — con total seguridad y totalmente mal. Esa pregunta va por una
rama que cuenta sobre el parquet.

    START ─► clasificar ─┬─► listar ──────────────► responder ─► END
                         ├─► buscar ─► evaluar ─┬─► responder
                         │                      └─► fuera_de_alcance ─► END
                         └─► fuera_de_alcance ──────────────────────► END
"""
from __future__ import annotations

import json
from functools import lru_cache
from typing import Any, Literal, TypedDict

from langgraph.graph import END, START, StateGraph

from . import config, prompts
from .retriever import CatalogIndex, Hit


# Tipos que el usuario puede pedir explícitamente como faceta.
TIPOS_FILTRABLES = {"certificado_profesionalidad"}


class ChatState(TypedDict, total=False):
    question: str
    history: list[dict[str, str]]
    route: Literal["buscar", "listar", "fuera_de_alcance"]
    motivo: str
    consulta: str
    llm_error: str
    filters: dict[str, Any]
    hits: list[Hit]
    aggregate: dict[str, Any]
    answer: str
    sources: list[dict[str, Any]]


@lru_cache(maxsize=1)
def _groq():
    """Cliente único y con reintentos.

    La capa gratuita de Groq son 8.000 tokens/minuto: un par de visitantes a la
    vez ya provocan 429. El SDK reintenta con backoff (el propio error dice
    "try again in 352.5ms"), así que un pico se absorbe en vez de convertirse
    en un mensaje de error para el usuario.
    """
    from groq import Groq

    if not config.GROQ_API_KEY:
        raise RuntimeError("Falta GROQ_API_KEY (ponla en rag/.env o como secret del Space).")
    return Groq(api_key=config.GROQ_API_KEY, max_retries=config.GROQ_MAX_RETRIES)


def _extra_args() -> dict[str, Any]:
    """reasoning_effort solo lo aceptan los gpt-oss."""
    if "gpt-oss" in config.GROQ_MODEL:
        return {"reasoning_effort": config.GROQ_REASONING_EFFORT}
    return {}


def build_graph(index: CatalogIndex, catalog_mode: str = "completo"):
    system_answer = prompts.ANSWER_SYSTEM
    if catalog_mode == "muestra":
        system_answer += prompts.SAMPLE_WARNING

    def clasificar(state: ChatState) -> ChatState:
        """Una llamada barata: ruta + filtros, en JSON.

        Recibe el historial reciente: sin él, un seguimiento como "¿y cuántas
        horas dura el primero?" no tiene nada a lo que referirse y acaba en
        fuera_de_alcance, que es como el chat se reiniciaba en cada turno.
        """
        contexto = [
            {"role": turn["role"], "content": turn["content"]}
            for turn in (state.get("history") or [])[-4:]
            if turn.get("role") in {"user", "assistant"} and turn.get("content")
        ]
        try:
            response = _groq().chat.completions.create(
                model=config.GROQ_MODEL,
                temperature=config.CLASSIFIER_TEMPERATURE,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": prompts.classifier_system(index.categorias)},
                    *contexto,
                    {"role": "user", "content": state["question"]},
                ],
                **_extra_args(),
            )
            data = json.loads(response.choices[0].message.content)
            error = ""
        except Exception as exc:                            # noqa: BLE001
            # Si el clasificador falla, buscar es la opción segura: el prompt
            # de respuesta sigue prohibiendo precios y modalidad.
            data = {}
            error = f"clasificar: {type(exc).__name__}: {exc}"

        route = data.get("route")
        if route not in {"buscar", "listar", "fuera_de_alcance"}:
            route = "buscar"

        categoria = data.get("categoria")
        if categoria not in index.categorias:
            categoria = None

        tipo = data.get("tipo")
        if tipo not in TIPOS_FILTRABLES:
            tipo = None

        return {
            "route": route,
            "llm_error": error,
            "motivo": data.get("motivo") or "otro",
            "filters": {
                "categoria": categoria,
                "tipo": tipo,
                "horas_min": data.get("horas_min"),
                "horas_max": data.get("horas_max"),
            },
            "consulta": data.get("consulta") or state["question"],
        }

    def buscar(state: ChatState) -> ChatState:
        query = state.get("consulta") or state["question"]
        hits = index.search(query, state.get("filters"))
        return {"hits": hits}

    def evaluar(state: ChatState) -> ChatState:
        """Si lo recuperado no tiene nada que ver, mejor decirlo que improvisar."""
        hits = state.get("hits") or []
        if not hits:
            return {"route": "fuera_de_alcance", "motivo": "sin_resultados"}
        return {}

    def listar(state: ChatState) -> ChatState:
        return {"aggregate": index.aggregate(state.get("filters"))}

    def responder(state: ChatState) -> ChatState:
        hits = state.get("hits") or []
        aggregate = state.get("aggregate")

        if aggregate is not None:
            context = _aggregate_context(aggregate, state.get("filters") or {})
            sources = []
        else:
            context = prompts.format_context(hits)
            sources = [h.as_source() for h in hits]

        messages = [{"role": "system", "content": system_answer}]
        for turn in (state.get("history") or [])[-config.MAX_HISTORY_TURNS:]:
            if turn.get("role") in {"user", "assistant"} and turn.get("content"):
                messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({
            "role": "user",
            "content": prompts.ANSWER_USER.format(question=state["question"], context=context),
        })

        try:
            completion = _groq().chat.completions.create(
                model=config.GROQ_MODEL,
                temperature=config.ANSWER_TEMPERATURE,
                max_tokens=config.ANSWER_MAX_TOKENS,
                messages=messages,
                **_extra_args(),
            )
            answer = prompts.limpiar_formato(completion.choices[0].message.content or "")
            # Un modelo de razonamiento puede gastar todo el presupuesto pensando
            # y devolver content vacío: eso es un fallo, no una respuesta.
            if not answer:
                raise RuntimeError("respuesta vacía del modelo (¿max_tokens agotado razonando?)")
        except Exception as exc:                            # noqa: BLE001
            return {
                "answer": prompts.FALLBACK["error"],
                "sources": [],
                "llm_error": f"responder: {type(exc).__name__}: {exc}",
            }

        return {"answer": answer, "sources": sources, "llm_error": state.get("llm_error", "")}

    def fuera_de_alcance(state: ChatState) -> ChatState:
        """Plantilla fija, sin LLM: es la respuesta que no puede salir mal."""
        motivo = state.get("motivo") or "otro"
        return {"answer": prompts.FALLBACK.get(motivo, prompts.FALLBACK["otro"]), "sources": []}

    def _ruta_inicial(state: ChatState) -> str:
        return state["route"]

    def _tras_evaluar(state: ChatState) -> str:
        return "fuera_de_alcance" if state.get("route") == "fuera_de_alcance" else "responder"

    graph = StateGraph(ChatState)
    graph.add_node("clasificar", clasificar)
    graph.add_node("buscar", buscar)
    graph.add_node("evaluar", evaluar)
    graph.add_node("listar", listar)
    graph.add_node("responder", responder)
    graph.add_node("fuera_de_alcance", fuera_de_alcance)

    graph.add_edge(START, "clasificar")
    graph.add_conditional_edges("clasificar", _ruta_inicial, {
        "buscar": "buscar",
        "listar": "listar",
        "fuera_de_alcance": "fuera_de_alcance",
    })
    graph.add_edge("buscar", "evaluar")
    graph.add_conditional_edges("evaluar", _tras_evaluar, {
        "responder": "responder",
        "fuera_de_alcance": "fuera_de_alcance",
    })
    graph.add_edge("listar", "responder")
    graph.add_edge("responder", END)
    graph.add_edge("fuera_de_alcance", END)
    return graph.compile()


def _aggregate_context(aggregate: dict[str, Any], filters: dict[str, Any]) -> str:
    # Sin decir QUÉ se ha contado, el modelo recibe "426" y contesta que no
    # sabe cuántos certificados hay.
    criterio = []
    if filters.get("tipo"):
        criterio.append(prompts.TIPO_PLURAL.get(filters["tipo"], filters["tipo"]))
    if filters.get("categoria"):
        criterio.append(f"de la familia {prompts.legible(filters['categoria'], siempre=True)}")
    if filters.get("horas_min") is not None:
        criterio.append(f"de {filters['horas_min']} horas o más")
    if filters.get("horas_max") is not None:
        criterio.append(f"de {filters['horas_max']} horas o menos")
    que = f" ({', '.join(criterio)})" if criterio else ""
    total = f"{aggregate['total']:,}".replace(",", ".")   # 13327 -> 13.327
    lines = [f"Total de cursos que cumplen la consulta{que}: {total}."]
    if not filters.get("categoria"):
        # Las 26 con su número producían una respuesta de 26 líneas, y aun así
        # el modelo las contaba mal ("25 familias"). Se le da el número hecho y
        # solo las principales con detalle.
        reparto = sorted(aggregate["por_categoria"].items(), key=lambda kv: -kv[1])
        lines.append(f"Número de familias profesionales: {len(reparto)}.")
        lines.append("Las principales: " + "; ".join(
            f"{prompts.legible(c, siempre=True)} ({n})" for c, n in reparto[:5]
        ) + ".")
        lines.append("Resto: " + ", ".join(prompts.legible(c, siempre=True) for c, _ in reparto[5:]) + ".")
    if aggregate["ejemplos"]:
        lines.append("Algunos ejemplos:")
        for e in aggregate["ejemplos"][:5]:
            lines.append(
                f"  - {prompts.legible(e['titulo'])} ({prompts.legible(e['categoria'], siempre=True)}, {e['horas']} h)"
            )
    return "\n".join(lines)
