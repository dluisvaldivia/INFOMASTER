/**
 * Cliente del servicio RAG (carpeta `rag/` en la raíz del repo).
 *
 * VITE_RAG_URL es una URL, nunca una clave: todo lo que pasa por
 * `import.meta.env` acaba en el bundle que descarga el navegador. La API key
 * de Groq vive solo en el backend.
 */
export type ChatSource = {
  titulo: string
  categoria: string
  horas: number
}

export type ChatReply = {
  answer: string
  sources: ChatSource[]
  catalog_mode: string
}

export type ChatTurn = {
  role: 'user' | 'assistant'
  content: string
}

const RAG_URL = import.meta.env.VITE_RAG_URL as string | undefined

/** Turnos que se mandan como contexto; el backend recorta a 6 de todos modos. */
const MAX_HISTORY = 6
const TIMEOUT_MS = 30_000

export function isRagConfigured() {
  return Boolean(RAG_URL)
}

export async function askCatalog(
  message: string,
  history: ChatTurn[],
  signal?: AbortSignal,
): Promise<ChatReply> {
  if (!RAG_URL) throw new Error('VITE_RAG_URL no está configurada')

  // El Space gratuito duerme: sin timeout, el usuario se queda mirando puntos.
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  const response = await fetch(`${RAG_URL.replace(/\/$/, '')}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: history.slice(-MAX_HISTORY) }),
    signal: combined,
  })

  if (!response.ok) {
    throw new Error(`El asistente respondió ${response.status}`)
  }
  return (await response.json()) as ChatReply
}
