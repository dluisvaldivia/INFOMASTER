import type { ChatMessage } from './mockConversation'

/**
 * Burbujas del chat. IA a la izquierda, usuario a la derecha y visualmente
 * distintos. El fondo es opaco a propósito: el texto tiene que cumplir 4,5:1
 * sobre la aurora, y el blur por sí solo no lo garantiza.
 */
type Props = {
  message: ChatMessage
}

export function ChatBubble({ message }: Props) {
  const isAi = message.author === 'ai'

  return (
    <div className={isAi ? 'flex justify-start' : 'flex justify-end'}>
      <p
        className={
          isAi
            ? 'max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-[var(--ai-ink)] ring-1 ring-[var(--ai-panel-border)]'
            : 'max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--ai-red)] px-4 py-3 text-sm leading-relaxed text-white'
        }
      >
        {message.text}
      </p>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <p
        className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-4 py-3.5 ring-1 ring-[var(--ai-panel-border)]"
        aria-label="El asistente está escribiendo"
      >
        <span className="sr-only">El asistente está escribiendo</span>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden="true"
            className="ai-dot block size-1.5 rounded-full bg-[var(--ai-red)]"
          />
        ))}
      </p>
    </div>
  )
}
