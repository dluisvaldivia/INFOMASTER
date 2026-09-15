/**
 * Fondo aurora del panel de chat. Decorativo: aria-hidden y sin eventos.
 * Ver src/styles/ai.css — este look está reservado a superficies de IA.
 */
export function AuroraBackdrop() {
  return (
    <div className="ai-aurora" aria-hidden="true">
      <span className="ai-aurora-blob" />
      <span className="ai-aurora-blob" />
      <span className="ai-aurora-blob" />
      <span className="ai-aurora-blob" />
    </div>
  )
}
