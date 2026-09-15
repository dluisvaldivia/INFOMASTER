"""Recuperación híbrida: BM25 + embeddings densos, fusionados con RRF.

El único texto indexable de este catálogo es un título corto (mediana 54
caracteres) lleno de siglas y códigos: UF2361, MF0013_2, PRL, Excel, AFDA001PO.
Los embeddings densos fallan justo ahí, y BM25 falla con sinónimos y lenguaje
coloquial ("quiero trabajar de cocinero"). Ninguno de los dos basta solo.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import pandas as pd

from . import config
from .ingest import sparse_text


def normalize(text: str) -> str:
    norm = unicodedata.normalize("NFKD", str(text)).encode("ascii", "ignore").decode()
    return norm.lower()


def tokenize(text: str) -> list[str]:
    return [t for t in re.split(r"[^a-z0-9]+", normalize(text)) if len(t) > 1]


@dataclass
class Hit:
    id: str
    titulo: str
    categoria: str
    subseccion: str
    horas: int
    tipo: str
    codigo: str
    codigo_oficial: str | None
    score: float

    def as_source(self) -> dict[str, Any]:
        # Nunca se expone precio_eur: el chat no cita precios.
        return {
            "titulo": self.titulo,
            "categoria": self.categoria,
            "horas": self.horas,
            "codigo_oficial": self.codigo_oficial,
        }


class CatalogIndex:
    """Se carga una sola vez (lifespan de FastAPI), nunca por petición."""

    def __init__(self) -> None:
        import chromadb
        from rank_bm25 import BM25Okapi
        from sentence_transformers import SentenceTransformer

        self.df = pd.read_parquet(config.PARQUET_PATH)
        self.df["horas"] = self.df["horas"].astype(int)
        self.by_id = {row["id"]: row for row in self.df.to_dict("records")}

        self.ids = self.df["id"].tolist()
        # BM25 indexa el texto enriquecido; Chroma, el denso. Ver ingest.py.
        self.bm25 = BM25Okapi(
            [tokenize(sparse_text(row)) for row in self.df.to_dict("records")]
        )

        self.model = SentenceTransformer(config.EMBED_MODEL)
        client = chromadb.PersistentClient(path=str(config.CHROMA_DIR))
        self.collection = client.get_collection(config.COLLECTION_NAME)

        if self.collection.count() != len(self.df):
            raise RuntimeError(
                f"Chroma ({self.collection.count()}) y parquet ({len(self.df)}) no cuadran. "
                "Vuelve a ejecutar `python -m app.ingest`."
            )

    # --- filtros ---------------------------------------------------------
    @property
    def categorias(self) -> list[str]:
        return sorted(self.df["categoria"].unique().tolist())

    def _mask(self, filters: dict[str, Any]) -> pd.Series:
        mask = pd.Series(True, index=self.df.index)
        # OJO: 'categoria' NO filtra aquí. El clasificador la ADIVINA a partir
        # del tema, y adivinar mal excluye la respuesta correcta: para "Excel"
        # proponía INFORMÁTICA Y COMUNICACIONES, pero EXCEL AVANZADO está en
        # ADMINISTRACIÓN Y GESTIÓN, así que el único acierto se caía de la
        # lista. Se aplica como impulso de ranking en search(). 'tipo' y
        # 'horas' sí filtran: esos los dice el usuario, no se deducen.
        if filters.get("tipo"):
            # "certificado de profesionalidad" es un TIPO de formación, no un
            # tema: buscarlo como texto devuelve cursos sobre incendios y
            # formación de formadores. Filtra, no busca.
            mask &= self.df["tipo"] == filters["tipo"]
        if filters.get("horas_min") is not None:
            mask &= self.df["horas"] >= int(filters["horas_min"])
        if filters.get("horas_max") is not None:
            mask &= self.df["horas"] <= int(filters["horas_max"])
        if filters.get("recomendable", True):
            mask &= self.df["recomendable"]
        return mask

    def _where(self, filters: dict[str, Any]) -> dict | None:
        """El mismo filtro, en la sintaxis de Chroma.

        Se aplica a las DOS ramas: filtrar solo Chroma dejaría que BM25 colase
        resultados que el filtro debía excluir.
        """
        clauses: list[dict] = []
        if filters.get("tipo"):
            clauses.append({"tipo": {"$eq": filters["tipo"]}})
        if filters.get("horas_min") is not None:
            clauses.append({"horas": {"$gte": int(filters["horas_min"])}})
        if filters.get("horas_max") is not None:
            clauses.append({"horas": {"$lte": int(filters["horas_max"])}})
        if filters.get("recomendable", True):
            clauses.append({"recomendable": {"$eq": True}})
        if not clauses:
            return None
        return clauses[0] if len(clauses) == 1 else {"$and": clauses}

    # --- búsqueda --------------------------------------------------------
    def search(self, query: str, filters: dict[str, Any] | None = None,
               top_k: int = config.FINAL_TOP_K) -> list[Hit]:
        filters = dict(filters or {})
        # Si el usuario nombra un código explícito, se levanta el filtro de
        # recomendables: UF/MF no se sugieren, pero sí se localizan.
        if re.search(r"\b(UF\d{4}|MF\d{4}_\d|[A-Z]{4}\d{3,4}[A-Z]{2})\b", query.upper()):
            filters["recomendable"] = False

        allowed = set(self.df.loc[self._mask(filters), "id"])
        if not allowed:
            return []

        dense_rank = self._dense(query, filters)
        sparse_rank = self._sparse(query, allowed)

        fused: dict[str, float] = {}
        for ranking in (dense_rank, sparse_rank):
            for rank, doc_id in enumerate(ranking):
                if doc_id in allowed:
                    fused[doc_id] = fused.get(doc_id, 0.0) + 1.0 / (config.RRF_K + rank + 1)

        # Impulso, no exclusión: reordena entre candidatos parecidos pero no
        # puede rescatar a uno irrelevante ni hundir una coincidencia exacta.
        categoria = filters.get("categoria")
        if categoria:
            for doc_id in fused:
                row = self.by_id.get(doc_id)
                if row is not None and row["categoria"] == categoria:
                    fused[doc_id] += config.CATEGORY_BOOST

        ordered = sorted(fused.items(), key=lambda kv: kv[1], reverse=True)
        # El primero de cada rama entra sí o sí. RRF suma, así que un documento
        # que aparece en las DOS listas siempre gana a uno que solo aparece en
        # una, por bien colocado que esté: con seis coincidencias parciales, el
        # mejor resultado semántico ("Función del mando intermedio…" para
        # "cursos de PRL para mandos intermedios", denso nº1) se cae del top-6
        # y en su lugar entra un "Curso de Decorador de Interiores".
        lideres = [r[0] for r in (dense_rank, sparse_rank) if r and r[0] in allowed]
        return self._dedupe(ordered, top_k, lideres)

    def _dense(self, query: str, filters: dict[str, Any]) -> list[str]:
        vector = self.model.encode(
            [config.QUERY_PREFIX + query], normalize_embeddings=True
        ).tolist()
        result = self.collection.query(
            query_embeddings=vector,
            n_results=min(config.DENSE_TOP_K, self.collection.count()),
            where=self._where(filters),
        )
        return result["ids"][0] if result["ids"] else []

    def _sparse(self, query: str, allowed: set[str]) -> list[str]:
        tokens = tokenize(query)
        if not tokens:
            return []
        scores = self.bm25.get_scores(tokens)
        candidates = [
            (doc_id, score)
            for doc_id, score in zip(self.ids, scores)
            if score > 0 and doc_id in allowed
        ]
        candidates.sort(key=lambda kv: kv[1], reverse=True)
        return [doc_id for doc_id, _ in candidates[: config.SPARSE_TOP_K]]

    def _dedupe(self, ordered: list[tuple[str, float]], top_k: int,
                garantizados: list[str] | None = None) -> list[Hit]:
        """52 títulos del catálogo están repetidos; no se muestran dos veces.

        `garantizados` son ids que deben aparecer aunque la fusión los deje
        fuera: ocupan las últimas plazas, para no alterar el orden de arriba.
        """
        hits: list[Hit] = []
        seen: set[str] = set()
        pendientes = [g for g in (garantizados or []) if g in self.by_id]
        # Se les reserva sitio de antemano; los que ya salgan por su cuenta lo
        # liberan al recorrer la lista fusionada.
        for doc_id, score in ordered:
            row = self.by_id.get(doc_id)
            if row is None:
                continue
            key = normalize(row["titulo"])
            if key in seen:
                continue
            if doc_id in pendientes:
                pendientes.remove(doc_id)
            elif len(hits) + len(pendientes) >= top_k:
                continue          # el hueco que queda es de un garantizado
            seen.add(key)
            hits.append(
                Hit(
                    id=doc_id,
                    titulo=row["titulo"],
                    categoria=row["categoria"],
                    subseccion=row.get("subseccion", ""),
                    horas=int(row["horas"]),
                    tipo=row["tipo"],
                    codigo=row["codigo"],
                    codigo_oficial=row.get("codigo_oficial") or None,
                    score=score,
                )
            )
            if len(hits) + len(pendientes) >= top_k:
                break

        for doc_id in pendientes:
            row = self.by_id[doc_id]
            key = normalize(row["titulo"])
            if key in seen:                     # ya está, con otro id
                continue
            seen.add(key)
            hits.append(
                Hit(
                    id=doc_id,
                    titulo=row["titulo"],
                    categoria=row["categoria"],
                    subseccion=row.get("subseccion", ""),
                    horas=int(row["horas"]),
                    tipo=row["tipo"],
                    codigo=row["codigo"],
                    codigo_oficial=row.get("codigo_oficial") or None,
                    score=dict(ordered).get(doc_id, 0.0),
                )
            )
        return hits[:top_k]

    # --- agregación ------------------------------------------------------
    def aggregate(self, filters: dict[str, Any] | None = None) -> dict[str, Any]:
        """Conteos reales sobre el parquet.

        La búsqueda vectorial devuelve 6 filas y el modelo contesta "6" a
        "¿cuántos cursos de informática tenéis?", con total seguridad y
        totalmente mal. Esta ruta cuenta de verdad.
        """
        filters = dict(filters or {})
        subset = self.df.loc[self._mask(filters)]
        counts = subset["categoria"].value_counts().to_dict()
        return {
            "total": int(len(subset)),
            "por_categoria": {k: int(v) for k, v in counts.items()},
            "categorias": self.categorias,
            "ejemplos": [
                {"titulo": r["titulo"], "categoria": r["categoria"], "horas": int(r["horas"])}
                for r in subset.head(8).to_dict("records")
            ],
        }


@lru_cache(maxsize=1)
def get_index() -> CatalogIndex:
    return CatalogIndex()
