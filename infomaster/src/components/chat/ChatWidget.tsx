import { useEffect, useRef, useState } from 'react'
import { ChatPanel } from './ChatPanel'
import {
  CANNED_REPLY,
  INITIAL_MESSAGES,
  type ChatMessage,
} from './mockConversation'
import { askCatalog, type ChatTurn } from '../../lib/rag'
import { CloseIcon, SparkIcon } from '../ui/Icon'
import '../../styles/ai.css'

/**
 * Widget de chat presente en todas las rutas (montado desde Layout).
 *
 * `send` llama al servicio RAG (carpeta `rag/`), que busca en el catálogo y
 * responde con Groq. Si el backend falla o está dormido, cae al CANNED_REPLY.
 * ChatPanel y las burbujas reciben todo por props y no se tocan.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [isTyping, setIsTyping] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const abortRef = useRef<AbortController>(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  function close() {
    setOpen(false)
    launcherRef.current?.focus()
  }

  async function send(text: string) {
    // El historial se toma antes de añadir el turno actual: la pregunta viaja
    // aparte, en `message`.
    const history: ChatTurn[] = messages.map((message) => ({
      role: message.author === 'ai' ? 'assistant' : 'user',
      content: message.text,
    }))

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, author: 'user', text },
    ])
    setIsTyping(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let reply = CANNED_REPLY
    try {
      const data = await askCatalog(text, history, controller.signal)
      reply = data.answer
    } catch (error) {
      if (controller.signal.aborted) return
      console.error('Fallo al consultar el asistente', error)
    }

    setIsTyping(false)
    setMessages((current) => [
      ...current,
      { id: `ai-${Date.now()}`, author: 'ai', text: reply },
    ])
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open && (
        <ChatPanel
          messages={messages}
          isTyping={isTyping}
          onSend={send}
          onClose={close}
        />
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-label={open ? 'Cerrar el asistente de IA' : 'Abrir el asistente de IA'}
        className="ai-surface relative inline-flex size-14 cursor-pointer items-center justify-center rounded-full"
      >
        <span className="ai-launcher-glow" aria-hidden="true" />
        <span className="ai-launcher-ring" aria-hidden="true" />
        <span className="relative inline-flex size-full items-center justify-center rounded-full bg-white text-[var(--ai-red)] shadow-lg">
          {open ? <CloseIcon className="size-6" /> : <SparkIcon className="size-6" />}
        </span>
      </button>
    </div>
  )
}
