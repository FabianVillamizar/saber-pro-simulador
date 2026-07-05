// Registra cuándo cae un perfil en cada patron_trampa entre sus respuestas
// falladas (práctica por parte + simulacro). Se guarda un timestamp por
// fallo, no un conteo acumulado, para que "tu error más frecuente" y la
// cola de refuerzo miren solo una ventana reciente (VENTANA_DIAS): un
// contador de por vida nunca bajaría aunque ya hayas corregido el error.
import { leerJSON, escribirJSON } from './storage.js'
import { ID_INVITADO } from './perfiles.js'

export const VENTANA_DIAS = 30
// Se retiene algo más que la ventana activa (3x) para poder ampliarla más
// adelante sin perder de inmediato historial que ya se había guardado.
const DIAS_RETENCION = VENTANA_DIAS * 3

function clavePatronesTrampa(perfilId) {
  return `${perfilId}:patrones-trampa`
}

function dentroDeVentana(isoFecha, ahora, dias) {
  const ms = ahora.getTime() - new Date(isoFecha).getTime()
  return ms >= 0 && ms <= dias * 24 * 60 * 60 * 1000
}

function leerEventosTrampa(perfilId) {
  return leerJSON(clavePatronesTrampa(perfilId), {})
}

export function registrarFalloTrampa(perfilId, patron, ahora = new Date()) {
  if (!patron || perfilId === ID_INVITADO) return
  const eventos = leerEventosTrampa(perfilId)
  // Si el patrón viene del formato antiguo (número, sin fecha) no hay forma
  // de saber cuándo pasó: se descarta en vez de arrastrarlo.
  const previos = Array.isArray(eventos[patron]) ? eventos[patron] : []
  const retenidos = previos.filter((f) => dentroDeVentana(f, ahora, DIAS_RETENCION))
  eventos[patron] = [...retenidos, ahora.toISOString()]
  escribirJSON(clavePatronesTrampa(perfilId), eventos)
}

// Conteo por patrón dentro de los últimos VENTANA_DIAS — la fuente que
// consumen tanto la cola de refuerzo como "tu error más frecuente" en
// Resultado.
export function leerPatronesTrampa(perfilId, { dias = VENTANA_DIAS, ahora = new Date() } = {}) {
  const eventos = leerEventosTrampa(perfilId)
  const conteo = {}
  for (const [patron, fechas] of Object.entries(eventos)) {
    if (!Array.isArray(fechas)) continue
    const enVentana = fechas.filter((f) => dentroDeVentana(f, ahora, dias)).length
    if (enVentana > 0) conteo[patron] = enVentana
  }
  return conteo
}

// Mayor conteo reciente (últimos VENTANA_DIAS) entre los patron_trampa de
// los distractores de una pregunta — 0 si no tiene distractores
// clasificados (partes 1/2) o si ninguno de sus patrones aparece todavía
// en la ventana reciente del perfil.
function pesoPregunta(pregunta, conteoPatrones) {
  if (!pregunta.distractores) return 0
  return Object.values(pregunta.distractores).reduce(
    (max, d) => Math.max(max, conteoPatrones[d.patron_trampa] ?? 0),
    0
  )
}

// Reordena grupos de preguntas ya barajados (mismo shuffle de
// barajarPorGrupo) para que los que tocan tus patron_trampa más frecuentes
// en los últimos VENTANA_DIAS aparezcan antes en la cola de práctica por
// parte. Es la única conexión entre ese historial y la cola de refuerzo:
// no cambia la selección aleatoria del simulacro, que debe seguir siendo
// una muestra representativa, no sesgada hacia tus errores recientes.
export function priorizarPorPatrones(preguntasBarajadasPorGrupo, conteoPatrones) {
  if (!conteoPatrones || Object.keys(conteoPatrones).length === 0) return preguntasBarajadasPorGrupo

  const grupos = new Map()
  for (const p of preguntasBarajadasPorGrupo) {
    if (!grupos.has(p.grupoId)) grupos.set(p.grupoId, [])
    grupos.get(p.grupoId).push(p)
  }

  const listaGrupos = [...grupos.values()]
  const pesoGrupo = (grupo) => grupo.reduce((max, p) => Math.max(max, pesoPregunta(p, conteoPatrones)), 0)
  // Array.prototype.sort es estable (ES2019+): los grupos con el mismo
  // peso conservan el orden aleatorio que ya traían.
  listaGrupos.sort((a, b) => pesoGrupo(b) - pesoGrupo(a))
  return listaGrupos.flat()
}
