import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AuroraBackdrop } from './AuroraBackdrop'
import { ChatBubble, TypingIndicator } from './ChatBubble'
import { ASSISTANT_NAME, SUGGESTIONS, type ChatMessage } from './mockConversation'
import { CloseIcon, SendIcon, SparkIcon } from '../ui/Icon'

type Props = {
  messages: ChatMessage[]
  isTyping: boolean
  onSend: (text: string) => void
  onClose: () => void
}

export function ChatPanel({ messages, isTyping, onSend, onClose }: Props) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // mantener la conversación pegada abajo al llegar mensajes
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, isTyping])

  function submit(text: string) {
    const value = text.trim()
    if (!value) return
    onSend(value)
    setDraft('')
    inputRef.current?.focus()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit(draft)
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={ASSISTANT_NAME}
      className="ai-surface ai-panel-enter relative flex h-[min(34rem,calc(100svh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-white/55 shadow-2xl ring-1 ring-[var(--ai-panel-border)] backdrop-blur-xl"
    >
      <AuroraBackdrop />

      <header className="relative flex items-center gap-3 border-b border-[var(--ai-panel-border)] bg-[var(--ai-panel)] px-4 py-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ai-red)] to-[var(--ai-maroon)] text-white">
          <SparkIcon className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-heading text-sm font-semibold text-[var(--ai-ink)]">
            {ASSISTANT_NAME}
          </span>
          <span className="block text-[11px] text-[var(--ai-ink-muted)]">
            Respuestas generadas con IA
          </span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar el chat"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-[var(--ai-ink-muted)] transition-colors duration-200 hover:bg-black/5"
        >
          <CloseIcon className="size-4.5" />
        </button>
      </header>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Conversación"
        className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {!messages.some((message) => message.author === 'user') && (
        <div className="relative flex flex-wrap gap-2 px-4 pb-3">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => submit(suggestion)}
              className="cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs text-[var(--ai-ink-muted)] ring-1 ring-[var(--ai-panel-border)] transition-colors duration-200 hover:bg-white hover:text-[var(--ai-ink)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 border-t border-[var(--ai-panel-border)] bg-[var(--ai-panel)] px-3 py-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Escribe tu pregunta
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escribe tu pregunta…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-[var(--ai-ink)] ring-1 ring-[var(--ai-panel-border)] outline-none placeholder:text-[var(--ai-ink-muted)]/70 focus-visible:ring-2 focus-visible:ring-[var(--ai-red)]"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="Enviar mensaje"
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[var(--ai-red)] to-[var(--ai-maroon)] text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon className="size-4.5" />
        </button>
      </form>
    </div>
  )
}
