// Markdown mínimo: solo **negrita**, tal como lo usan regla/ejemplo/
// error_comun en los datos de Inglés. Nada de parsers de markdown
// completos para un solo caso de uso.
export function TextoConNegritas({ texto }) {
  if (!texto) return null
  const partes = texto.split(/\*\*(.+?)\*\*/g)
  return partes.map((parte, i) => (i % 2 === 1 ? <strong key={i}>{parte}</strong> : <span key={i}>{parte}</span>))
}
