"""Ingesta del catálogo: Excel -> parquet + índice Chroma.

La hoja no es una tabla plana. Es un listado paginado con:
  - filas "banner" con el nombre de la familia profesional (la categoría NO es
    una columna: hay que arrastrarla hacia abajo),
  - la fila de cabecera CODIGO|<sección>|HORAS|PVP repetida una vez por bloque
    de impresión (210 veces). Su segunda celda NO es un rótulo fijo: lleva la
    subsección (INGLÉS, ENFERMERÍA, CERTIFICADOS DE PROFESIONALIDAD...), que
    tampoco es una columna y hay que arrastrar igual que la familia,
  - y las filas de curso propiamente dichas.

Uso:
    python -m app.ingest --sample 200    # muestra estratificada, segundos
    python -m app.ingest                 # catálogo completo (13.690 cursos)
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping

import pandas as pd

from . import config

HEADER_TOKEN = "CODIGO"

# Orden importante: UF y MF antes que el patrón SEPE genérico.
CODE_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("unidad_formativa", re.compile(r"^(UF\d{4})\s+(.*)$", re.S)),
    ("modulo_formativo", re.compile(r"^(MF\d{4}_\d+)\s+(.*)$", re.S)),
    ("especialidad", re.compile(r"^([A-Z]{4}\d{3,4}[A-Z]{2})\s+(.*)$", re.S)),
    ("otro_codigo", re.compile(r"^([A-Z]{2,6}[\d_]{2,}[A-Z0-9_]*)\s+(.*)$", re.S)),
]

NO_RECOMENDABLE = {"unidad_formativa", "modulo_formativo"}

# Dos subsecciones no son un tema, son el tipo de formación del bloque. Es el
# único sitio del Excel donde consta que un curso es certificado de
# profesionalidad: el título no lo dice y el código tampoco.
BLOQUE_TIPO = {
    "CERTIFICADOS DE PROFESIONALIDAD": "certificado_profesionalidad",
    "ESPECIALIDADES FORMATIVAS": "especialidad",
}

TIPO_ETIQUETA = {
    "certificado_profesionalidad": "Certificado de profesionalidad",
    "especialidad": "Especialidad formativa",
    "unidad_formativa": "Unidad formativa",
    "modulo_formativo": "Módulo formativo",
}


def document_text(row: Mapping[str, Any]) -> str:
    """Texto que se embebe. Sin precio, deliberadamente.

    Vive aquí, y no en retriever.py, porque el índice denso se construye en la
    ingesta y el BM25 al arrancar la API: si las dos copias se separan, se
    busca sobre un texto distinto del que se embebió y nadie se entera.

    Deliberadamente NO lleva subsección, tipo, ni el código de la columna
    CODIGO: este texto es idéntico al de antes de existir esas facetas, y esa
    igualdad es el punto. El set dorado lo demostró dos veces. Sobre un título
    de 54 caracteres de mediana, "Área: GESTIÓN DE LA INFORMACIÓN Y
    COMUNICACIÓN." ahoga a "EXCEL AVANZADO" y "hojas de cálculo" deja de
    recuperarlo. Y con los códigos pasa lo mismo de forma menos evidente: al
    tocar el texto de unos documentos se mueven los vecinos de otros, y se
    perdieron casos que no mencionaban ningún código. Un código es un token
    opaco, justo donde el vector denso no aporta nada y BM25 acierta siempre.
    Todo lo añadido vive en sparse_text().
    """
    parts = [
        f"{row['titulo']}.",
        f"Familia profesional: {row['categoria']}.",
        f"Duración: {int(row['horas'])} horas.",
    ]
    if row.get("codigo_oficial"):
        parts.append(f"Código oficial: {row['codigo_oficial']}.")
    return " ".join(parts)


def codigo_indexable(row: Mapping[str, Any]) -> str:
    """El código por el que se puede buscar el curso, si no es un id interno.

    VÉRTICE antepone el código al título; Academia Integral lo deja en la
    columna CODIGO con el título limpio. Se indexa, pero NO se enseña: son
    referencias de catálogo del proveedor ("CT0229", "SIP-INGLÉS A2*",
    "AF0341 (Ed.2)-N"), no códigos oficiales del SEPE, y presentarlas como
    tales a un alumno sería exactamente la clase de imprecisión que el resto
    del sistema evita. Lo que se muestra sigue siendo codigo_oficial, que solo
    se rellena desde el título.
    """
    codigo_oficial = row.get("codigo_oficial") or ""
    if codigo_oficial:
        return codigo_oficial
    codigo = row.get("codigo") or ""
    return "" if codigo.isdigit() else codigo


def sparse_text(row: Mapping[str, Any]) -> str:
    """Lo que indexa BM25: el documento denso más las facetas léxicas.

    Aquí entran el código del proveedor, la subsección y el tipo. "CT0229",
    "certificado de profesionalidad" e "inglés" son cosas que el usuario
    escribe literalmente, y las dos últimas solo constan en la cabecera del
    bloque del Excel.
    """
    parts = [document_text(row)]
    codigo = codigo_indexable(row)
    if codigo and codigo != row.get("codigo_oficial"):
        parts.append(f"Código oficial: {codigo}.")
    subseccion = row.get("subseccion") or ""
    # Varias familias repiten su nombre como subsección: no aporta nada.
    if subseccion and subseccion not in BLOQUE_TIPO and subseccion != row.get("categoria"):
        parts.append(f"Área: {subseccion}.")
    etiqueta = TIPO_ETIQUETA.get(row.get("tipo", ""))
    if etiqueta:
        parts.append(f"Tipo: {etiqueta}.")
    return " ".join(parts)


@dataclass
class Curso:
    id: str
    codigo: str
    codigo_oficial: str          # "" si el título no traía código
    titulo: str
    titulo_raw: str
    categoria: str
    subseccion: str
    horas: int
    precio_eur: float | None
    tipo: str
    recomendable: bool

    def to_document(self) -> str:
        return document_text(asdict(self))


def slugify(text: str) -> str:
    norm = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", norm.lower()).strip("-")


def split_code(titulo_raw: str) -> tuple[str, str, str]:
    """(titulo_limpio, codigo_oficial, tipo)."""
    text = " ".join(titulo_raw.split())
    for tipo, pattern in CODE_PATTERNS:
        match = pattern.match(text)
        if match:
            code, rest = match.group(1), match.group(2).strip()
            if rest:                       # nunca dejar el título vacío
                return rest, code, tipo
    return text, "", "curso"


def _cell(value) -> str:
    if value is None:
        return ""
    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass
    return str(value).strip()


def parse_excel(path: Path) -> pd.DataFrame:
    """Recorre la hoja arrastrando la categoría desde las filas banner."""
    raw = pd.read_excel(path, sheet_name=config.SHEET_NAME, header=None, dtype=str)

    cursos: list[Curso] = []
    categoria: str | None = None
    subseccion: str | None = None
    seen_ids: dict[str, int] = {}
    stats = {"banners": 0, "headers": 0, "blank": 0, "skipped": 0}

    for _, row in raw.iterrows():
        cols = [_cell(row[i]) if i in row.index else "" for i in range(4)]
        codigo, titulo_raw, horas_raw, precio_raw = cols

        if not any(cols):
            stats["blank"] += 1
            continue
        if codigo.upper() == HEADER_TOKEN:
            # La cabecera es también el separador de subsección: su celda B
            # trae el rótulo del bloque que empieza aquí.
            subseccion = " ".join(titulo_raw.split()) or subseccion
            stats["headers"] += 1
            continue
        if codigo and not any(cols[1:]):
            categoria = " ".join(codigo.split())
            subseccion = None          # cada familia reabre sus subsecciones
            stats["banners"] += 1
            continue
        if not titulo_raw or not horas_raw:
            stats["skipped"] += 1
            continue
        if categoria is None:
            raise ValueError(f"Curso antes del primer banner de familia: {cols!r}")
        if subseccion is None:
            raise ValueError(f"Curso antes de la primera cabecera de bloque: {cols!r}")

        try:
            horas = int(float(horas_raw.replace(",", ".")))
        except ValueError:
            stats["skipped"] += 1
            continue

        try:
            precio: float | None = float(precio_raw.replace(",", "."))
        except ValueError:
            precio = None          # '#REF!': fórmula rota en el Excel de origen

        titulo, codigo_oficial, tipo = split_code(titulo_raw)
        # El bloque manda sobre el regex, salvo en UF y MF: dentro de un
        # certificado siguen siendo unidades sueltas y no se recomiendan.
        bloque_tipo = BLOQUE_TIPO.get(subseccion)
        if bloque_tipo and tipo not in NO_RECOMENDABLE:
            tipo = bloque_tipo

        base_id = f"{codigo}-{slugify(titulo)[:40]}".strip("-")
        seen_ids[base_id] = seen_ids.get(base_id, 0) + 1
        curso_id = base_id if seen_ids[base_id] == 1 else f"{base_id}-{seen_ids[base_id]}"

        cursos.append(
            Curso(
                id=curso_id,
                codigo=codigo,
                codigo_oficial=codigo_oficial,
                titulo=titulo,
                titulo_raw=" ".join(titulo_raw.split()),
                categoria=categoria,
                subseccion=subseccion,
                horas=horas,
                precio_eur=precio,
                tipo=tipo,
                recomendable=tipo not in NO_RECOMENDABLE,
            )
        )

    df = pd.DataFrame([asdict(c) for c in cursos])
    df.attrs["stats"] = stats
    return df


def validate(df: pd.DataFrame, strict: bool) -> None:
    """El parseo se valida SIEMPRE sobre el fichero completo, aun si luego se
    indexa una muestra: lo frágil es el parseo, no el muestreo."""
    problems: list[str] = []
    n, cats = len(df), df["categoria"].nunique()
    subs = df["subseccion"].nunique()
    missing_price = int(df["precio_eur"].isna().sum())

    if n != config.EXPECTED_COURSES:
        problems.append(f"cursos={n}, esperados {config.EXPECTED_COURSES}")
    if cats != config.EXPECTED_CATEGORIES:
        problems.append(f"categorías={cats}, esperadas {config.EXPECTED_CATEGORIES}")
    if subs != config.EXPECTED_SUBSECTIONS:
        problems.append(f"subsecciones={subs}, esperadas {config.EXPECTED_SUBSECTIONS}")
    if missing_price != config.EXPECTED_MISSING_PRICE:
        problems.append(
            f"precios rotos (#REF!)={missing_price}, esperados {config.EXPECTED_MISSING_PRICE}"
        )
    if (df["categoria"].str.strip() == "").any():
        problems.append("hay cursos sin categoría")
    if (df["subseccion"].str.strip() == "").any():
        problems.append("hay cursos sin subsección")
    if (df["codigo"].str.upper() == HEADER_TOKEN).any():
        problems.append("se han colado filas de cabecera")
    if df["horas"].isna().any() or (df["horas"] <= 0).any():
        problems.append("horas no numéricas o <= 0")
    if df["id"].duplicated().any():
        problems.append("ids duplicados")

    if not problems:
        print(
            f"  validación: OK ({n} cursos, {cats} familias, {subs} subsecciones, "
            f"{missing_price} precios rotos)"
        )
        return

    message = "El catálogo no cuadra con el perfil esperado:\n  - " + "\n  - ".join(problems)
    if strict:
        raise SystemExit(
            f"{message}\n\nSi el Excel ha cambiado a propósito, revisa los valores "
            f"EXPECTED_* en app/config.py y vuelve a ejecutar."
        )
    print(f"  AVISO: {message}", file=sys.stderr)


# --- Muestreo -------------------------------------------------------------
# Casos borde forzados: el set dorado de eval/preguntas.yaml apunta a ellos,
# así que deben estar en la muestra o las pruebas no valdrían en modo test.
FORCED_CASES: list[tuple[str, object]] = [
    ("codigo SEPE", lambda d: d["codigo_oficial"] == "AFDA001PO"),
    ("unidad formativa", lambda d: d["tipo"] == "unidad_formativa"),
    ("modulo formativo", lambda d: d["tipo"] == "modulo_formativo"),
    ("precio roto (#REF!)", lambda d: d["precio_eur"].isna()),
    ("certificado de profesionalidad", lambda d: d["tipo"] == "certificado_profesionalidad"),
    # Código que solo está en la columna CODIGO, no en el título (Academia
    # Integral). Se fija uno concreto, como con AFDA001PO, porque el set dorado
    # pregunta por él literalmente.
    ("codigo en columna", lambda d: d["codigo"] == "AF0514-N"),
    ("sigla PRL", lambda d: d["titulo"].str.contains("Prevención de Riesgos", case=False, regex=False)),
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
    recomendables = df[df["recomendable"]]
    # Bucle explícito en vez de groupby.apply: pandas 3.0 cambió su semántica.
    stratified = pd.concat([
        grupo.sample(min(per_category, len(grupo)), random_state=0)
        for _, grupo in recomendables.groupby("categoria", sort=True)
    ])
    chosen_ids = set(stratified["id"])
    forced_rows, forced_log = [], []

    for label, predicate in FORCED_CASES:
        matches = df[predicate(df)]
        if matches.empty:
            print(f"  aviso: caso forzado '{label}' sin coincidencias", file=sys.stderr)
            continue
        already = matches[matches["id"].isin(chosen_ids)]
        if not already.empty:
            forced_log.append(f"{label} (ya en muestra)")
            continue
        pick = matches.iloc[[0]]
        forced_rows.append(pick)
        chosen_ids.add(pick.iloc[0]["id"])
        forced_log.append(label)

    # Un título duplicado, con sus dos copias, para probar la deduplicación.
    dup_titles = df[df["titulo"].duplicated(keep=False)]
    if not dup_titles.empty:
        first = dup_titles.iloc[0]["titulo"]
        pair = dup_titles[dup_titles["titulo"] == first]
        pair = pair[~pair["id"].isin(chosen_ids)]
        if not pair.empty:
            forced_rows.append(pair)
            chosen_ids.update(pair["id"])
            forced_log.append("título duplicado")

    sample = pd.concat([stratified, *forced_rows]) if forced_rows else stratified
    sample = sample.drop_duplicates(subset="id").reset_index(drop=True)
    print(f"  muestra: {len(sample)} cursos, {sample['categoria'].nunique()} familias")
    print(f"  casos forzados: {', '.join(forced_log)}")
    return sample


# --- Índice ---------------------------------------------------------------
def build_index(df: pd.DataFrame) -> None:
    import chromadb
    from sentence_transformers import SentenceTransformer

    documents = [
        Curso(**row).to_document()
        for row in df.to_dict("records")
    ]

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
    for row in df.to_dict("records"):
        meta = {
            "codigo": row["codigo"],
            "titulo": row["titulo"],
            "categoria": row["categoria"],
            "subseccion": row["subseccion"],
            "horas": int(row["horas"]),
            "tipo": row["tipo"],
            "recomendable": bool(row["recomendable"]),
        }
        if row["codigo_oficial"]:      # "" = el título no traía código
            meta["codigo_oficial"] = row["codigo_oficial"]
        # Chroma no admite None: se omite la clave si el PVP venía roto.
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
    collection.add(
        ids=df["id"].tolist(),
        embeddings=embeddings.tolist(),
        documents=documents,
        metadatas=metadatas,
    )
    print(f"  Chroma: {collection.count()} documentos en {config.CHROMA_DIR}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingesta del catálogo de cursos")
    parser.add_argument("--sample", type=int, metavar="N",
                        help="indexar solo ~N cursos (muestra estratificada por familia)")
    parser.add_argument("--excel", type=Path, help="ruta alternativa al .xlsx")
    parser.add_argument("--no-embed", action="store_true",
                        help="solo parsear y escribir parquet (sin Chroma ni modelo)")
    parser.add_argument("--no-strict", action="store_true",
                        help="avisar en vez de abortar si el catálogo no cuadra")
    args = parser.parse_args()

    path = args.excel or config.excel_path()
    print(f"Leyendo {path}")
    df = parse_excel(path)
    print(f"  filas: {df.attrs['stats']}")
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
        "n_categories": int(indexed["categoria"].nunique()),
        "sheet": config.SHEET_NAME,
        "source_file": path.name,
        "catalog_version": datetime.fromtimestamp(
            path.stat().st_mtime, timezone.utc
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
