// Dominio de tarjetas de concepto para el grid de módulos del Dashboard.
// "Dominada" = ya pasó del corto plazo del SRS (intervaloDias >= 6, el
// intervalo que hoy corresponde a calificar "Fácil" la primera vez) — una
// proxy simple y defendible de "ya la sabes lo bastante bien".
const INTERVALO_DOMINIO_DIAS = 6

export function calcularDominio(tarjetasConcepto, estadosSRS) {
  const total = tarjetasConcepto.length
  if (total === 0) return { pct: 0, hechas: 0, total: 0 }

  let hechas = 0
  let dominadas = 0
  for (const tarjeta of tarjetasConcepto) {
    const estado = estadosSRS[tarjeta.id]
    if (!estado) continue
    hechas++
    if (estado.intervaloDias >= INTERVALO_DOMINIO_DIAS) dominadas++
  }

  return { pct: Math.round((dominadas / total) * 100), hechas, total }
}
