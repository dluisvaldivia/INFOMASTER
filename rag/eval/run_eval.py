"""Evaluación de recuperación. Sin LLM: determinista, gratis, repetible.

    ../.venv/bin/python -m eval.run_eval
"""
from __future__ import annotations

import sys
import unicodedata
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.retriever import get_index  # noqa: E402


def norm(text: str) -> str:
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()


def main() -> int:
    spec = yaml.safe_load((Path(__file__).parent / "preguntas.yaml").read_text("utf-8"))
    index = get_index()
    passed = failed = 0

    for case in spec.get("recuperacion", []):
        hits = index.search(case["pregunta"])
        titles = [norm(h.titulo) for h in hits]
        ok = any(norm(case["espera"]) in t for t in titles) if case.get("espera") else True
        if ok and case.get("espera_tipo"):
            ok = any(h.tipo == case["espera_tipo"] for h in hits)
        passed, failed = (passed + 1, failed) if ok else (passed, failed + 1)
        print(f"  {'OK  ' if ok else 'FALLA'} {case['id']:24} {case['pregunta']!r}")
        if not ok:
            esperado = case.get("espera") or f"tipo={case.get('espera_tipo')}"
            print(f"        esperaba '{esperado}' en el top-6, obtuve:")
            for h in hits[:3]:
                print(f"          - {h.titulo} [{h.tipo}]")

    for case in spec.get("categoria_blanda", []):
        hits = index.search(case["pregunta"], case["filtros"])
        ok = any(norm(case["espera"]) in norm(h.titulo) for h in hits)
        passed, failed = (passed + 1, failed) if ok else (passed, failed + 1)
        print(f"  {'OK  ' if ok else 'FALLA'} {case['id']:24} '{case['espera']}' sobrevive al filtro")
        if not ok:
            for h in hits[:3]:
                print(f"          - {h.titulo}")

    for case in spec.get("filtros", []):
        hits = index.search(case["pregunta"], case["filtros"])
        ok = bool(hits)
        if ok and "max_horas" in case:
            ok = all(h.horas <= case["max_horas"] for h in hits)
        if ok and "categoria" in case:
            ok = all(h.categoria == case["categoria"] for h in hits)
        if ok and "tipo" in case:
            ok = all(h.tipo == case["tipo"] for h in hits)
        passed, failed = (passed + 1, failed) if ok else (passed, failed + 1)
        print(f"  {'OK  ' if ok else 'FALLA'} {case['id']:24} filtro respetado en {len(hits)} hits")

    for case in spec.get("recomendables", []):
        hits = index.search(case["pregunta"])
        bad = [h.titulo for h in hits if h.tipo in case["prohibe_tipos"]]
        ok = not bad
        passed, failed = (passed + 1, failed) if ok else (passed, failed + 1)
        print(f"  {'OK  ' if ok else 'FALLA'} {case['id']:24} sin UF/MF entre los sugeridos")
        if bad:
            print(f"        se colaron: {bad}")

    print(f"\n{passed} OK, {failed} fallos")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
