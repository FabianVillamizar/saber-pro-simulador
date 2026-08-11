// Repetición espaciada simple, tipo SM-2 (intervalo + factor de facilidad),
// con autoevaluación de 4 botones en vez de la escala 0-5 original.
import { formatoFecha, sumarDias } from './fecha.js'

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

// `prereqs` (ids de otras tarjetas) existe en varios módulos (Inglés,
// Competencias Ciudadanas, Pensamiento Científico, Lectura Crítica,
// Razonamiento Cuantitativo, Comunicación Escrita, Diosgenina — no
// Français) pero hasta ahora ningún módulo del motor lo leía: quedaba en
// el dato fuente sin efecto. Repetición >= 1 en el estado SRS de un
// prerrequisito significa que ya se acertó esa tarjeta al menos una vez
// (calificación distinta de "otra_vez", que resetea repeticiones a 0) —
// no hace falta que esté "dominada" ni "fácil", solo vista y aprobada una
// vez. Sin prereqs (la mayoría de tarjetas, y el 100% de Français) esto es
// un no-op.
export function prerequisitosCumplidos(tarjeta, estadosSRS) {
  if (!tarjeta.prereqs?.length) return true
  return tarjeta.prereqs.every((id) => (estadosSRS[id]?.repeticiones ?? 0) >= 1)
}
