// Markdown mínimo: solo **negrita** y párrafos separados por línea en
// blanco, tal como lo usan regla/ejemplo/error_comun en los datos de Inglés
// (una sola línea) y las respuestas de Diosgenina (varios párrafos, algunas
// con pasos numerados). Nada de parsers de markdown completos.
function renderizarNegritas(texto, prefijoKey) {
  const partes = texto.split(/\*\*(.+?)\*\*/g)
  return partes.map((parte, i) =>
    i % 2 === 1 ? <strong key={`${prefijoKey}-${i}`}>{parte}</strong> : <span key={`${prefijoKey}-${i}`}>{parte}</span>,
  )
}

export function TextoConNegritas({ texto }) {
  if (!texto) return null
  const parrafos = texto.split(/\n{2,}/)
  if (parrafos.length === 1) return renderizarNegritas(texto, 'p0')
  return parrafos.map((parrafo, i) => (
    <p key={i} style={{ margin: i === 0 ? 0 : '0.7em 0 0' }}>
      {renderizarNegritas(parrafo, `p${i}`)}
    </p>
  ))
}
