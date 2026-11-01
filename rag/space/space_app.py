"""Punto de entrada del HF Space (SDK gradio + ZeroGPU).

La cuenta gratuita solo puede alojar Spaces ZeroGPU, que exigen Gradio y al
menos una función con @spaces.GPU. Aquí no hay trabajo de GPU: e5-small corre
en CPU y el LLM es Groq. Gradio Server es un FastAPI, así que se le cuelgan
las mismas rutas /chat y /health de app.main y el frontend no cambia.
"""
import spaces  # ZeroGPU: antes que torch o cualquier import que toque CUDA

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from gradio import Server
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app import config, main


@spaces.GPU(duration=1)
def _noop() -> None:
    """ZeroGPU no arranca sin una función decorada. Nunca se llama."""


main.load_state()

server = Server(title="Infomaster RAG", docs_url=None, redoc_url=None)
server.state.limiter = main.limiter
server.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# Con un CORSMiddleware de Starlette en la app, el CORS propio de Gradio se aparta.
server.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_origin_regex=config.ALLOWED_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)
for route in main.app.router.routes:
    if getattr(route, "path", None) in ("/chat", "/health"):
        server.router.routes.append(route)


@server.get("/", response_class=HTMLResponse)
def home() -> str:
    return HOME_HTML


HOME_HTML = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Infomaster · Asistente de cursos</title>
<style>
  body{font:16px/1.5 system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem;color:#1a1a1a;background:#faf7f0}
  h1{font-size:1.4rem;margin:0 0 .25rem} p{color:#555;margin-top:0}
  form{display:flex;gap:.5rem;margin:1.5rem 0} input{flex:1;padding:.6rem;border:1px solid #999}
  button{padding:.6rem 1rem;border:0;background:#1a1a1a;color:#fff;cursor:pointer}
  #out{white-space:pre-wrap;border-top:1px solid #ccc;padding-top:1rem}
  small{color:#777}
</style></head><body>
<h1>Asistente del catálogo de Infomaster</h1>
<p>Backend del chat de la web. Prueba una pregunta sobre los cursos.</p>
<form id="f"><input id="q" placeholder="¿Tenéis cursos de Excel de menos de 30 horas?" required maxlength="500">
<button>Preguntar</button></form>
<div id="out"></div>
<script>
const f=document.getElementById('f'),q=document.getElementById('q'),out=document.getElementById('out');
f.onsubmit=async e=>{e.preventDefault();out.textContent='Buscando…';
  try{const r=await fetch('chat',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message:q.value,history:[]})});const d=await r.json();
    out.textContent=d.answer+(d.sources.length?'\\n\\nCursos: '+d.sources.map(s=>s.titulo+' ('+s.horas+' h)').join(' · '):'');}
  catch(err){out.textContent='Error: '+err;}};
</script></body></html>"""


demo = server  # el runtime de HF busca `demo`
if __name__ == "__main__":
    demo.launch(ssr_mode=False)
