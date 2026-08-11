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

function repeticiones(estadosSRS, id) {
  return estadosSRS[id]?.repeticiones ?? 0
}

// Helpers genéricos para vistas de exploración por categoría (ver
// modulos/competencias-ciudadanas/exploracion.js y
// modulos/lectura-critica/exploracion.js): ninguno sabe qué campo agrupa
// las tarjetas de un módulo (`bloque`, `subtema`, `categoria`...) — reciben
// ya el grupo armado, o una función para leer la clave de agrupación.
export function porcentajeDominio(tarjetas, estadosSRS) {
  if (tarjetas.length === 0) return 0
  const dominadas = tarjetas.filter((t) => repeticiones(estadosSRS, t.id) >= 1).length
  return Math.round((dominadas / tarjetas.length) * 100)
}

// Estado agregado de un grupo de tarjetas (un bloque, una capa, un
// subtema...): "bloqueado" si ninguna tarjeta del grupo tiene sus
// prerrequisitos cumplidos todavía; "dominado" si todas las disponibles ya
// se acertaron al menos una vez; "activo" si algunas sí y otras no;
// "nuevo" si hay disponibles pero ninguna se ha intentado.
export function estadoDeGrupo(tarjetas, estadosSRS) {
  const disponibles = tarjetas.filter((t) => prerequisitosCumplidos(t, estadosSRS))
  if (disponibles.length === 0) return 'bloqueado'
  const vistas = disponibles.filter((t) => repeticiones(estadosSRS, t.id) >= 1)
  if (vistas.length === disponibles.length) return 'dominado'
  if (vistas.length > 0) return 'activo'
  return 'nuevo'
}

// Para un grupo bloqueado, qué otro grupo hay que resolver primero — mira
// los prerrequisitos sin cumplir de sus tarjetas y prioriza uno distinto al
// propio (más informativo que "te falta una tarjeta tuya").
// `obtenerClave(tarjeta)` es la función que decide qué campo agrupa (ej.
// `t => t.bloque` en Competencias Ciudadanas, `t => t.subtema` en Lectura
// Crítica) — así este helper no necesita conocer el esquema del módulo.
export function grupoRequerido(tarjetas, estadosSRS, tarjetasPorId, clavePropia, obtenerClave) {
  for (const t of tarjetas) {
    if (prerequisitosCumplidos(t, estadosSRS)) continue
    for (const id of t.prereqs ?? []) {
      if (repeticiones(estadosSRS, id) >= 1) continue
      const previa = tarjetasPorId.get(id)
      if (previa && obtenerClave(previa) !== clavePropia) return obtenerClave(previa)
    }
  }
  return null
}
