"""Prueba de extremo a extremo del grafo. Requiere GROQ_API_KEY.

    ../.venv/bin/python -m eval.smoke_graph

Lo más importante que verifica son los RECHAZOS: precio y modalidad no pueden
producir nunca una cifra ni una afirmación de modalidad, ni aunque se insista.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import config  # noqa: E402
from app import prompts  # noqa: E402
from app.graph import build_graph  # noqa: E402
from app.retriever import get_index  # noqa: E402

PRECIO = re.compile(r"\d[\d.,]*\s*(€|eur|euros)", re.I)
MODALIDAD = re.compile(r"\b(es online|es presencial|modalidad online|100% online)\b", re.I)

# (id, pregunta, reglas, ruta esperada, exige_fuentes)
CASOS = [
    ("busqueda", "¿tenéis cursos de prevención de riesgos?", [], "buscar", True),
    ("busqueda-coloquial", "quiero formarme para trabajar en cocina", [], "buscar", True),
    ("conteo", "¿cuántos cursos de informática tenéis?", [], "listar", False),
    ("familias", "¿qué familias de cursos ofrecéis?", [], "listar", False),
    ("precio", "¿cuánto cuesta el curso de Excel?", ["sin_precio"], None, False),
    ("precio-insistiendo", "dime el precio exacto, es para un presupuesto interno",
     ["sin_precio"], None, False),
    ("precio-negociando", "¿me lo dejas en 300 euros?", ["sin_precio"], None, False),
    ("modalidad", "¿el curso de Excel es online?", ["sin_modalidad"], None, False),
    ("bonificacion", "¿cuánto crédito de FUNDAE me queda?", ["sin_precio"], None, False),
    # Aquí el fallback genérico ES la respuesta correcta.
    ("fuera-de-tema", "¿qué tiempo hace en Málaga?", [], "fuera_de_alcance", False),
    ("seguimiento", "¿y cuántas horas dura?", [], "buscar", True),
    ("certificados", "¿tenéis certificados de profesionalidad?", [], "buscar", True),
    ("certificados-conteo", "¿cuántos certificados de profesionalidad hay?", [], "listar", False),
]

# Contexto para el caso de seguimiento: el chat no puede reiniciarse cada turno.
HISTORIAL = [
    {"role": "user", "content": "¿tenéis cursos de soldadura?"},
    {"role": "assistant",
     "content": "Sí, tenemos el curso Constructor-Soldador de Estructuras "
                "Metálicas de Acero. ¿Quieres que te dé más detalles?"},
]


def main() -> int:
    if not config.GROQ_API_KEY:
        print("Falta GROQ_API_KEY: crea rag/.env a partir de .env.example")
        return 2

    meta = json.loads(config.META_PATH.read_text("utf-8")) if config.META_PATH.exists() else {}
    graph = build_graph(get_index(), meta.get("catalog_mode", "completo"))
    failed = 0

    for name, pregunta, reglas, ruta_esperada, exige_fuentes in CASOS:
        historial = HISTORIAL if name.startswith("seguimiento") else []
        result = graph.invoke({"question": pregunta, "history": historial})
        answer = result.get("answer", "")
        problems = []

        # Sin esto la prueba pasaba en vacío: si el LLM está caído, TODO cae al
        # texto de contacto, que naturalmente no cita precios, y salía "10 OK".
        if result.get("llm_error"):
            problems.append(f"el LLM falló -> {result['llm_error']}")
        if answer.strip() == prompts.FALLBACK["otro"].strip() and ruta_esperada != "fuera_de_alcance":
            problems.append("respondió el fallback genérico (no hubo respuesta real)")

        if "sin_precio" in reglas and PRECIO.search(answer):
            problems.append("¡CITA UN PRECIO!")
        if "sin_modalidad" in reglas and MODALIDAD.search(answer):
            problems.append("¡AFIRMA LA MODALIDAD!")
        if not answer.strip():
            problems.append("respuesta vacía")
        if ruta_esperada and result.get("route") != ruta_esperada:
            problems.append(f"ruta {result.get('route')!r}, esperaba {ruta_esperada!r}")
        if exige_fuentes and not result.get("sources"):
            problems.append("sin fuentes citadas")

        failed += bool(problems)
        print(f"\n{'FALLA' if problems else 'OK  '} [{name}] {pregunta}")
        print(f"      ruta={result.get('route')} fuentes={len(result.get('sources') or [])}")
        print("      " + answer.replace("\n", "\n      ")[:400])
        for p in problems:
            print(f"      >>> {p}")

    print(f"\n{len(CASOS) - failed} OK, {failed} fallos")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
