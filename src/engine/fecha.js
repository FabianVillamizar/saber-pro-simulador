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

// yyyy-mm-dd -> Date local, evitando el corrimiento de un día que da
// parsear el string directo con `new Date(...)` (se interpreta en UTC).
export function fechaDesdeClave(clave) {
  const [y, m, d] = clave.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Fecha oficial del examen Saber Pro que se está preparando.
export const FECHA_EXAMEN = new Date('2026-09-06')

// Días de calendario completos entre dos fechas (ignora la hora del día,
// para que "hoy" y "el día del examen" no den un decimal según la hora
// en que se abra la app).
export function diferenciaDias(desde, hasta) {
  const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate())
  const fin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate())
  return Math.round((fin - inicio) / (1000 * 60 * 60 * 24))
}
