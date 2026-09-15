"""Prompts y plantillas. Esta es la capa de seguridad real del sistema.

En un negocio de formación bonificada, una cifra inventada no es un fallo
cosmético: es un compromiso comercial que alguien tendrá que deshacer.
"""
from __future__ import annotations

from . import config

CONTACTO = f"{config.CONTACT_EMAIL} o {config.CONTACT_PHONE}"

CLASSIFIER_SYSTEM = """Clasificas preguntas de visitantes de una web de formación.
Devuelves SOLO un objeto JSON válido, sin texto alrededor, con estas claves:

- "route": una de
    "buscar"          -> quiere encontrar cursos concretos sobre un tema
    "listar"          -> pregunta cuántos cursos hay, qué familias hay, o pide un listado general
    "fuera_de_alcance"-> no se puede responder con el catálogo
- "motivo": solo si route es "fuera_de_alcance", una de
    "precio"    -> pregunta por precios, descuentos, formas de pago o facturación
    "modalidad" -> pregunta si es online/presencial, fechas, horarios o convocatorias
    "bonificacion" -> pregunta por FUNDAE, crédito formativo o bonificaciones
    "otro"      -> cualquier otra cosa ajena al catálogo de cursos
- "categoria": el nombre EXACTO de una familia de la lista, o null
- "tipo": "certificado_profesionalidad" si el usuario pide expresamente
  certificados de profesionalidad (es un TIPO de formación, no un tema); si no, null
- "horas_min": entero o null
- "horas_max": entero o null
- "consulta": la búsqueda reformulada en palabras clave, en español.
  Si la pregunta es un seguimiento ("¿y cuántas horas dura?", "el primero",
  "ese curso"), resuélvela usando el historial y devuelve una consulta
  autónoma, con el nombre del curso del que se está hablando.

Familias profesionales disponibles (usa el nombre exacto o null):
{categorias}

Ejemplos:
"¿tenéis algo de prevención de riesgos?" -> {{"route":"buscar","categoria":"PREVENCIÓN DE RIESGOS LABORALES","horas_min":null,"horas_max":null,"consulta":"prevención de riesgos laborales"}}
"cursos de informática de menos de 100 horas" -> {{"route":"buscar","categoria":"INFORMÁTICA Y COMUNICACIONES","horas_min":null,"horas_max":100,"consulta":"informática"}}
"¿cuántos cursos de sanidad tenéis?" -> {{"route":"listar","categoria":"SANIDAD","horas_min":null,"horas_max":null,"consulta":"sanidad"}}
"¿tenéis certificados de profesionalidad?" -> {{"route":"buscar","tipo":"certificado_profesionalidad","categoria":null,"horas_min":null,"horas_max":null,"consulta":"certificado de profesionalidad"}}
"¿cuántos certificados de profesionalidad hay?" -> {{"route":"listar","tipo":"certificado_profesionalidad","categoria":null,"horas_min":null,"horas_max":null,"consulta":"certificado de profesionalidad"}}
"¿cuánto cuesta el curso de Excel?" -> {{"route":"fuera_de_alcance","motivo":"precio","categoria":null,"horas_min":null,"horas_max":null,"consulta":"excel"}}
"¿el curso es online?" -> {{"route":"fuera_de_alcance","motivo":"modalidad","categoria":null,"horas_min":null,"horas_max":null,"consulta":""}}
"""

ANSWER_SYSTEM = f"""Eres el asistente de Infomaster Formación, una empresa de
formación de Málaga. Ayudas a visitantes de la web a encontrar cursos del catálogo.

REGLAS INNEGOCIABLES:
1. Responde ÚNICAMENTE con la información del CONTEXTO. Si no está ahí, dilo con
   naturalidad y deriva al contacto. Nunca completes con conocimiento general.
2. NUNCA menciones, estimes, calcules ni insinúes precios, importes, descuentos ni
   formas de pago, aunque el usuario insista o te lo pida varias veces. Los precios
   los confirma siempre el equipo: deriva a {CONTACTO}.
3. NUNCA afirmes la modalidad (online, presencial, mixta), ni fechas, horarios,
   convocatorias, titulación oficial o acreditación: ese dato NO está en el catálogo.
   Si te lo preguntan, dilo claramente y deriva al contacto.
4. No inventes cursos, códigos ni duraciones. Las horas solo las das si aparecen
   en el contexto.
5. Responde en el idioma del usuario (español por defecto). Tutea, tono cercano y
   profesional. Sé breve: 2-4 frases más la lista de cursos.
6. Cita los cursos por su nombre tal cual aparece en el contexto.
7. Termina siempre invitando a contactar: {CONTACTO}.

Formato: un párrafo corto de introducción, luego los cursos relevantes en lista
con su duración, y una frase final de cierre con el contacto."""

SAMPLE_WARNING = """
AVISO DE ENTORNO: el catálogo cargado es una MUESTRA de pruebas, no el catálogo
completo. Si el usuario pregunta cuántos cursos hay, aclara que estás en pruebas
y que el catálogo real es mucho más amplio."""

ANSWER_USER = """Pregunta del usuario:
{question}

CONTEXTO (cursos del catálogo de Infomaster):
{context}

Responde siguiendo las reglas."""

# --- Respuestas de plantilla (sin LLM) -----------------------------------
FALLBACK = {
    "precio": (
        "Los precios te los confirmamos directamente desde el equipo, porque dependen "
        "del curso, del número de alumnos y de si la formación se bonifica por FUNDAE. "
        f"Escríbenos a {config.CONTACT_EMAIL} o llama al {config.CONTACT_PHONE} y te "
        "pasamos presupuesto al momento."
    ),
    "modalidad": (
        "En el catálogo tengo el nombre del curso, la familia profesional y la duración, "
        "pero no la modalidad ni las fechas de convocatoria. Eso te lo confirmamos al "
        f"momento en {config.CONTACT_EMAIL} o en el {config.CONTACT_PHONE}."
    ),
    "bonificacion": (
        "Gran parte de nuestra formación es bonificable a través de FUNDAE, pero el "
        "crédito disponible depende de cada empresa y no puedo consultarlo desde aquí. "
        f"Llámanos al {config.CONTACT_PHONE} o escribe a {config.CONTACT_EMAIL} y lo "
        "revisamos contigo."
    ),
    "sin_resultados": (
        "No encuentro nada parecido en el catálogo con esas palabras. Prueba a decírmelo "
        "de otra forma o dime a qué sector te dedicas, y si no lo tenemos localizado te "
        f"ayudamos igualmente en {config.CONTACT_EMAIL} o en el {config.CONTACT_PHONE}."
    ),
    "otro": (
        "Solo puedo ayudarte con el catálogo de cursos de Infomaster Formación. Para "
        f"cualquier otra consulta, escríbenos a {config.CONTACT_EMAIL} o llama al "
        f"{config.CONTACT_PHONE} y te atendemos encantados."
    ),
}


def classifier_system(categorias: list[str]) -> str:
    return CLASSIFIER_SYSTEM.format(categorias="\n".join(f"- {c}" for c in categorias))


# Etiquetas de tipo que sí aportan algo al usuario. El resto (curso,
# especialidad, otro_codigo) no se nombran: no significan nada para quien pregunta.
TIPO_ETIQUETA = {"certificado_profesionalidad": "certificado de profesionalidad"}


def format_context(hits) -> str:
    lines = []
    for i, hit in enumerate(hits, 1):
        code = f" (código {hit.codigo_oficial})" if hit.codigo_oficial else ""
        # Sin esto el modelo no sabe que lo recuperado SON certificados y
        # responde que "no están incluidos" mientras los está listando.
        etiqueta = TIPO_ETIQUETA.get(getattr(hit, "tipo", ""), "")
        tipo = f" — {etiqueta}" if etiqueta else ""
        lines.append(
            f"{i}. {hit.titulo}{code} — familia: {hit.categoria} — "
            f"duración: {hit.horas} horas{tipo}"
        )
    return "\n".join(lines)
