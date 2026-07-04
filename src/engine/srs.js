// Repetición espaciada simple, tipo SM-2 (intervalo + factor de facilidad),
// con autoevaluación de 4 botones en vez de la escala 0-5 original.
const EF_INICIAL = 2.5
const EF_MINIMO = 1.3

export const CALIFICACIONES = ['otra_vez', 'dificil', 'bien', 'facil']

export function estadoInicial() {
  return {
    repeticiones: 0,
    intervaloDias: 0,
    factorFacilidad: EF_INICIAL,
    ultimaRevision: null,
    proximaRevision: null,
  }
}

// yyyy-mm-dd en hora local, no UTC: toISOString() correría la fecha un día
// para usuarios en huso horario negativo (Colombia es UTC-5) cerca de la
// medianoche.
function formatoFecha(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function sumarDias(fecha, dias) {
  const resultado = new Date(fecha)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}

export function siguienteEstado(estado, calificacion, ahora = new Date()) {
  let { repeticiones, factorFacilidad } = estado
  let intervaloDias

  if (calificacion === 'otra_vez') {
    repeticiones = 0
    intervaloDias = 0
    factorFacilidad = Math.max(EF_MINIMO, factorFacilidad - 0.2)
  } else {
    const primeraVez = repeticiones === 0
    const segundaVez = repeticiones === 1
    const intervaloRegular = primeraVez
      ? 1
      : segundaVez
        ? 6
        : Math.round(estado.intervaloDias * factorFacilidad)

    if (calificacion === 'dificil') {
      intervaloDias = primeraVez ? 1 : Math.max(1, Math.round(estado.intervaloDias * 1.2))
      factorFacilidad = Math.max(EF_MINIMO, factorFacilidad - 0.15)
    } else if (calificacion === 'facil') {
      intervaloDias = Math.round(intervaloRegular * 1.3)
      factorFacilidad = factorFacilidad + 0.15
    } else {
      intervaloDias = intervaloRegular
    }
    repeticiones += 1
  }

  return {
    repeticiones,
    intervaloDias,
    factorFacilidad,
    ultimaRevision: formatoFecha(ahora),
    proximaRevision: formatoFecha(sumarDias(ahora, intervaloDias)),
  }
}

export function estaLista(estadoTarjeta, ahora = new Date()) {
  if (!estadoTarjeta || !estadoTarjeta.proximaRevision) return true
  return estadoTarjeta.proximaRevision <= formatoFecha(ahora)
}
