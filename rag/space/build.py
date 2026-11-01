"""Monta la carpeta que se sube al HF Space.

El Space es público (la visibilidad "protected" exige PRO), así que todo lo
que se sube se puede descargar. Por eso no viajan los JSONL de data/Catalogue/
y se quita precio_eur del parquet y de los metadatos de Chroma: en ejecución no
se usa. Los embeddings se copian tal cual, sin recalcular.

    .venv/bin/python -m app.ingest      # si el índice local no está al día
    .venv/bin/python space/build.py
    hf upload dannyvaldivia/infomaster-rag .space-build . --repo-type space
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import chromadb
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from app import config  # noqa: E402

OUT = ROOT / ".space-build"
PRIVATE_FIELDS = ("precio_eur",)
BATCH = 1000


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "data").mkdir(parents=True)

    shutil.copytree(ROOT / "app", OUT / "app",
                    ignore=shutil.ignore_patterns("__pycache__"))
    for name in ("space_app.py", "README.md", "requirements.txt"):
        shutil.copy(ROOT / "space" / name, OUT / name)
    shutil.copy(config.META_PATH, OUT / "data" / config.META_PATH.name)

    df = pd.read_parquet(config.PARQUET_PATH).drop(columns=list(PRIVATE_FIELDS))
    df.to_parquet(OUT / "data" / config.PARQUET_PATH.name, index=False)

    src = chromadb.PersistentClient(path=str(config.CHROMA_DIR)).get_collection(
        config.COLLECTION_NAME)
    dst = chromadb.PersistentClient(path=str(OUT / "chroma")).create_collection(
        config.COLLECTION_NAME, metadata=src.metadata)
    total = src.count()
    for offset in range(0, total, BATCH):
        rows = src.get(limit=BATCH, offset=offset,
                       include=["embeddings", "documents", "metadatas"])
        metas = [{k: v for k, v in m.items() if k not in PRIVATE_FIELDS}
                 for m in rows["metadatas"]]
        dst.add(ids=rows["ids"], embeddings=rows["embeddings"],
                documents=rows["documents"], metadatas=metas)

    if dst.count() != len(df) or len(df) != total:
        raise SystemExit(f"No cuadra: chroma {dst.count()}, parquet {len(df)}, origen {total}")
    print(f"{OUT}: {total} cursos, sin {', '.join(PRIVATE_FIELDS)}")


if __name__ == "__main__":
    main()
