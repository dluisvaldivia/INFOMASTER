"""Ingesta del catálogo: JSONL limpio -> parquet + índice Chroma.

El catálogo llega ya limpio y en dos ficheros con los mismos ids:
  - catalog_public.jsonl: nombre, horas, embed_text (enriquecido con tema,
    sector y público), familias, temas y tipo de formación.
  - catalog_private.jsonl: por cada fila de origen del Excel, código del
    proveedor, código oficial (SEPE, UF, MF), PVP y familia/subsección.

Del privado solo se toman los códigos (para que BM25 encuentre un curso por
su código, sin enseñarlo nunca) y el precio (metadato, jamás al LLM). Y el
tipo: la etiqueta "Certificado de profesionalidad" del público la llevan
también las ~2.900 unidades y módulos sueltos de esos certificados, y solo el
código distingue un certificado completo de uno de sus trozos.

Uso:
    python -m app.ingest --sample 200    # muestra estratificada, segundos
    python -m app.ingest                 # catálogo completo (13.327 cursos)
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping

import pandas as pd

from . import config

# Orden importante: el certificado completo manda sobre sus unidades si un
# curso fusionado trae varios códigos.
#
# Un certificado es HOTR0108 / SSCE0110: número dentro de la familia (01, 02…)
# más el año del real decreto. Las especialidades del SEPE comparten forma pero
# empiezan por 00 (HOTR0004 "Identificación de Alérgenos…", 10 h): sin esa
# distinción el chat llamaba certificado de profesionalidad a un curso de 10 h.
TIPO_POR_CODIGO: list[tuple[str, re.Pattern[str]]] = [
    ("certificado_profesionalidad", re.compile(r"^[A-Z]{4}(?!00)\d{4}$")),
    ("especialidad", re.compile(r"^[A-Z]{4}00\d{2}$")),
    ("modulo_formativo", re.compile(r"^MF\d{4}_\d+$")),
    ("unidad_formativa", re.compile(r"^UF\d{4}$")),
]

# Sin código que lo respalde, "Certificado de profesionalidad" solo dice en
# qué bloque del Excel estaba la fila, no qué es el curso: no se afirma.
TIPO_POR_COURSE_TYPE = {
    "Especialidad formativa": "especialidad",
}

TIPO_ETIQUETA = {
    "certificado_profesionalidad": "Certificado de profesionalidad",
    "especialidad": "Especialidad formativa",
    "unidad_formativa": "Unidad formativa de un certificado de profesionalidad",
    "modulo_formativo": "Módulo formativo de un certificado de profesionalidad",
}


def document_text(row: Mapping[str, Any]) -> str:
    """Texto que se embebe: el embed_text que ya prepara la limpieza.

    Vive aquí, y no en retriever.py, porque el índice denso se construye en la
    ingesta y el BM25 al arrancar la API: si las dos copias se separan, se
    busca sobre un texto distinto del que se embebió y nadie se entera.

    Sin precio ni códigos, deliberadamente. Un código es un token opaco, justo
    donde el vector denso no aporta nada y BM25 acierta siempre; meterlo aquí
    solo mueve a los vecinos. Todo lo léxico vive en sparse_text().
    """
    return row["embed_text"]


def sparse_text(row: Mapping[str, Any]) -> str:
    """Lo que indexa BM25: el documento denso más las facetas léxicas.

    Aquí entran los códigos, los temas y el tipo. "CT0229", "certificado de
    profesionalidad" e "inglés" son cosas que el usuario escribe literalmente.
    """
    parts = [document_text(row)]
    for codigo in row.get("codigos") or []:
        parts.append(f"Código: {codigo}.")
    temas = list(row.get("temas") or [])
    if temas:
        parts.append(f"Temas: {', '.join(temas)}.")
    etiqueta = TIPO_ETIQUETA.get(row.get("tipo", ""))
    if etiqueta:
        parts.append(f"Tipo: {etiqueta}.")
    return " ".join(parts)


def _tipo(codigos_oficiales: list[str], course_types: list[str]) -> str:
    for tipo, pattern in TIPO_POR_CODIGO:
        if any(pattern.match(c) for c in codigos_oficiales):
            return tipo
    for course_type in course_types:
        if course_type in TIPO_POR_COURSE_TYPE:
            return TIPO_POR_COURSE_TYPE[course_type]
    return "curso"


def _read_jsonl(path: Path) -> dict[str, dict]:
    rows: dict[str, dict] = {}
    with path.open(encoding="utf-8") as fh:
        for n, line in enumerate(fh, 1):
            if not line.strip():
                continue
            row = json.loads(line)
            if row["id"] in rows:
                raise SystemExit(f"{path.name}:{n}: id repetido {row['id']}")
            rows[row["id"]] = row
    return rows


def load_catalog(catalog_dir: Path) -> pd.DataFrame:
    """Une público y privado por id en una fila por curso."""
    public = _read_jsonl(catalog_dir / config.PUBLIC_JSONL)
    private = _read_jsonl(catalog_dir / config.PRIVATE_JSONL)
    if public.keys() != private.keys():
        solo_pub = len(public.keys() - private.keys())
        solo_priv = len(private.keys() - public.keys())
        raise SystemExit(
            f"public y private no tienen los mismos ids "
            f"({solo_pub} solo en public, {solo_priv} solo en private)"
        )

    cursos = []
    for curso_id, pub in public.items():
        sources = private[curso_id]["sources"]
        oficiales = [s["official_code"] for s in sources if s.get("official_code")]
        # El código del proveedor es un id interno cuando es solo numérico.
        proveedor = [s["code"] for s in sources if s.get("code") and not str(s["code"]).isdigit()]
        precios = [s["price"] for s in sources if s.get("price") is not None]
        familias = pub["filters"]["families"]
        cursos.append({
            "id": curso_id,
            "titulo": pub["name"],
            "horas": int(pub["hours"]),
            "embed_text": pub["embed_text"],
            # La primera familia es la que se enseña; todas cuentan para el
            # impulso de categoría y los conteos.
            "categoria": familias[0] if familias else "",
            "familias": familias,
            "temas": pub["filters"]["topics"],
            "tipo": _tipo(oficiales, pub["filters"]["course_types"]),
            "codigos": list(dict.fromkeys(oficiales + proveedor)),
            "precio_eur": min(precios) if precios else None,
            "pending_upload": bool(private[curso_id].get("pending_upload")),
        })
    return pd.DataFrame(cursos)


def validate(df: pd.DataFrame, strict: bool) -> None:
    """La carga se valida SIEMPRE sobre el catálogo completo, aun si luego se
    indexa una muestra."""
    problems: list[str] = []
    n = len(df)
    cats = df["familias"].explode().nunique()

    if n != config.EXPECTED_COURSES:
        problems.append(f"cursos={n}, esperados {config.EXPECTED_COURSES}")
    if cats != config.EXPECTED_CATEGORIES:
        problems.append(f"familias={cats}, esperadas {config.EXPECTED_CATEGORIES}")
    if (df["categoria"].str.strip() == "").any():
        problems.append("hay cursos sin familia")
    if (df["titulo"].str.strip() == "").any():
        problems.append("hay cursos sin nombre")
    if (df["embed_text"].str.strip() == "").any():
        problems.append("hay cursos sin embed_text")
    if (df["horas"] <= 0).any():
        problems.append("horas <= 0")

    if not problems:
        tipos = df["tipo"].value_counts().to_dict()
        print(f"  validación: OK ({n} cursos, {cats} familias, tipos {tipos})")
        return

    message = "El catálogo no cuadra con el perfil esperado:\n  - " + "\n  - ".join(problems)
    if strict:
        raise SystemExit(
            f"{message}\n\nSi el catálogo ha cambiado a propósito, revisa los valores "
            f"EXPECTED_* en app/config.py y vuelve a ejecutar."
        )
    print(f"  AVISO: {message}", file=sys.stderr)


# --- Muestreo -------------------------------------------------------------
def _tiene_codigo(codigo: str):
    return lambda d: d["codigos"].apply(lambda cs: codigo in cs)


# Casos borde forzados: el set dorado de eval/preguntas.yaml apunta a ellos,
# así que deben estar en la muestra o las pruebas no valdrían en modo test.
FORCED_CASES: list[tuple[str, object]] = [
    ("codigo SEPE", _tiene_codigo("AFDA001PO")),
    # Código que solo es del proveedor, no del SEPE (Academia Integral).
    ("codigo de proveedor", _tiene_codigo("AF0514-N")),
    ("certificado completo", _tiene_codigo("SSCE0110")),
    ("unidad formativa", lambda d: d["tipo"] == "unidad_formativa"),
    ("modulo formativo", lambda d: d["tipo"] == "modulo_formativo"),
    ("certificado de profesionalidad", lambda d: d["tipo"] == "certificado_profesionalidad"),
    ("sigla PRL", lambda d: d["titulo"].str.contains("Prevención de Riesgos", case=False, regex=False)),
    ("mando intermedio", lambda d: d["titulo"].str.contains("mando intermedio", case=False, regex=False)),
    ("marca Excel", lambda d: d["titulo"].str.contains("Excel", case=False, regex=False)),
    ("soldadura", lambda d: d["titulo"].str.contains("soldadura", case=False, regex=False)),
    ("cocina", lambda d: d["titulo"].str.contains("cocina", case=False, regex=False)),
    ("idiomas/inglés", lambda d: d["titulo"].str.contains("inglés", case=False, regex=False)),
    ("ciberseguridad", lambda d: d["titulo"].str.contains("ciberseguridad", case=False, regex=False)),
]


def build_sample(df: pd.DataFrame, per_category: int) -> pd.DataFrame:
    """Estratificada por familia + casos borde forzados.

    Un head(200) daría solo ACTIVIDAD FÍSICA Y DEL DEPORTE y no probaría nada.
    """
    # Bucle explícito en vez de groupby.apply: pandas 3.0 cambió su semántica.
    stratified = pd.concat([
        grupo.sample(min(per_category, len(grupo)), random_state=0)
        for _, grupo in df.groupby("categoria", sort=True)
    ])
    chosen_ids = set(stratified["id"])
    forced_rows, forced_log = [], []

    for label, predicate in FORCED_CASES:
        matches = df[predicate(df)]
        if matches.empty:
            print(f"  aviso: caso forzado '{label}' sin coincidencias", file=sys.stderr)
            continue
        if matches["id"].isin(chosen_ids).any():
            forced_log.append(f"{label} (ya en muestra)")
            continue
        pick = matches.iloc[[0]]
        forced_rows.append(pick)
        chosen_ids.add(pick.iloc[0]["id"])
        forced_log.append(label)

    # Un nombre repetido con horas distintas, con todas sus copias, para
    # probar que se enseñan las dos duraciones y no se deduplican.
    dup_titles = df[df["titulo"].duplicated(keep=False)]
    if not dup_titles.empty:
        first = dup_titles.iloc[0]["titulo"]
        group = dup_titles[(dup_titles["titulo"] == first) & ~dup_titles["id"].isin(chosen_ids)]
        if not group.empty:
            forced_rows.append(group)
            chosen_ids.update(group["id"])
            forced_log.append("nombre repetido")

    sample = pd.concat([stratified, *forced_rows]) if forced_rows else stratified
    sample = sample.drop_duplicates(subset="id").reset_index(drop=True)
    print(f"  muestra: {len(sample)} cursos, {sample['categoria'].nunique()} familias")
    print(f"  casos forzados: {', '.join(forced_log)}")
    return sample


# --- Índice ---------------------------------------------------------------
def build_index(df: pd.DataFrame) -> None:
    import chromadb
    from sentence_transformers import SentenceTransformer

    records = df.to_dict("records")
    documents = [document_text(row) for row in records]

    print(f"  cargando {config.EMBED_MODEL}…")
    model = SentenceTransformer(config.EMBED_MODEL)
    print(f"  embebiendo {len(documents)} documentos…")
    embeddings = model.encode(
        [config.PASSAGE_PREFIX + d for d in documents],
        batch_size=config.EMBED_BATCH,
        normalize_embeddings=True,
        show_progress_bar=True,
    )

    metadatas = []
    for row in records:
        meta = {
            "titulo": row["titulo"],
            "categoria": row["categoria"],
            "horas": int(row["horas"]),
            "tipo": row["tipo"],
        }
        # Chroma no admite None: se omite la clave si no hay precio.
        if row["precio_eur"] is not None and not pd.isna(row["precio_eur"]):
            meta["precio_eur"] = float(row["precio_eur"])
        metadatas.append(meta)

    config.CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(config.CHROMA_DIR))
    # Recrear: si no, cambiar de --sample a completo dejaría documentos viejos.
    try:
        client.delete_collection(config.COLLECTION_NAME)
    except Exception:                                # noqa: BLE001
        pass
    collection = client.create_collection(
        config.COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
    )
    # Chroma limita el tamaño de cada add; el catálogo completo lo supera.
    step = 5000
    for start in range(0, len(records), step):
        collection.add(
            ids=df["id"].iloc[start:start + step].tolist(),
            embeddings=embeddings[start:start + step].tolist(),
            documents=documents[start:start + step],
            metadatas=metadatas[start:start + step],
        )
    print(f"  Chroma: {collection.count()} documentos en {config.CHROMA_DIR}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingesta del catálogo de cursos")
    parser.add_argument("--sample", type=int, metavar="N",
                        help="indexar solo ~N cursos (muestra estratificada por familia)")
    parser.add_argument("--catalog-dir", type=Path, default=config.CATALOG_DIR,
                        help="carpeta con catalog_public.jsonl y catalog_private.jsonl")
    parser.add_argument("--no-embed", action="store_true",
                        help="solo cargar y escribir parquet (sin Chroma ni modelo)")
    parser.add_argument("--no-strict", action="store_true",
                        help="avisar en vez de abortar si el catálogo no cuadra")
    args = parser.parse_args()

    public_path = args.catalog_dir / config.PUBLIC_JSONL
    print(f"Leyendo {args.catalog_dir}")
    df = load_catalog(args.catalog_dir)
    validate(df, strict=not args.no_strict)

    if args.sample:
        per_category = max(1, round(args.sample / df["categoria"].nunique()))
        indexed = build_sample(df, per_category)
        mode = "muestra"
    else:
        indexed = df
        mode = "completo"

    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    indexed.to_parquet(config.PARQUET_PATH, index=False)
    meta = {
        "catalog_mode": mode,
        "n_courses_indexed": int(len(indexed)),
        "n_courses_total": int(len(df)),
        "n_categories": int(indexed["familias"].explode().nunique()),
        "source_file": public_path.name,
        "catalog_version": datetime.fromtimestamp(
            public_path.stat().st_mtime, timezone.utc
        ).date().isoformat(),
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    config.META_PATH.write_text(json.dumps(meta, indent=2, ensure_ascii=False), "utf-8")
    print(f"  parquet: {config.PARQUET_PATH} ({len(indexed)} filas, modo {mode})")

    if args.no_embed:
        print("  --no-embed: índice Chroma no construido")
        return
    build_index(indexed)
    print("Listo.")


if __name__ == "__main__":
    main()
