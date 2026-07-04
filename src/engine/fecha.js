// yyyy-mm-dd en hora local, no UTC: toISOString() correría la fecha un día
// para usuarios en huso horario negativo (Colombia es UTC-5) cerca de la
// medianoche.
export function formatoFecha(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function sumarDias(fecha, dias) {
  const resultado = new Date(fecha)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}
