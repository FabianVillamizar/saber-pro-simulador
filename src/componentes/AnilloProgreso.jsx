import './AnilloProgreso.css'

// Anillo circular conic-gradient con círculo interior recortado mostrando
// el %, tal como las tarjetas de módulo del Dashboard.
export function AnilloProgreso({ porcentaje }) {
  const pct = Math.max(0, Math.min(100, porcentaje))
  return (
    <div
      className="anillo-progreso"
      style={{ background: `conic-gradient(var(--accent) 0deg ${pct * 3.6}deg, var(--border) ${pct * 3.6}deg 360deg)` }}
    >
      <div className="anillo-progreso-centro">{pct}%</div>
    </div>
  )
}
