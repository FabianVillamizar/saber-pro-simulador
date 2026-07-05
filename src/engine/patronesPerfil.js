// Cuenta cuántas veces cae un perfil en cada patron_trampa entre sus
// respuestas falladas, acumulado entre práctica por parte y simulacro.
// Namespaced por perfil como el resto de progreso.js — sobrevive a cerrar
// la pestaña, a diferencia de un conteo por-intento que se perdería al
// salir de la pantalla de resultado.
import { leerJSON, escribirJSON } from './storage.js'
import { ID_INVITADO } from './perfiles.js'

function clavePatronesTrampa(perfilId) {
  return `${perfilId}:patrones-trampa`
}

export function leerPatronesTrampa(perfilId) {
  return leerJSON(clavePatronesTrampa(perfilId), {})
}

export function registrarFalloTrampa(perfilId, patron) {
  if (!patron || perfilId === ID_INVITADO) return
  const conteo = leerPatronesTrampa(perfilId)
  conteo[patron] = (conteo[patron] ?? 0) + 1
  escribirJSON(clavePatronesTrampa(perfilId), conteo)
}

// Mayor conteo histórico entre los patron_trampa de los distractores de
// una pregunta — 0 si no tiene distractores clasificados (partes 1/2) o
// si ninguno de sus patrones aparece todavía en el historial del perfil.
function pesoPregunta(pregunta, conteoPatrones) {
  if (!pregunta.distractores) return 0
  return Object.values(pregunta.distractores).reduce(
    (max, d) => Math.max(max, conteoPatrones[d.patron_trampa] ?? 0),
    0
  )
}

// Reordena grupos de preguntas ya barajados (mismo shuffle de
// barajarPorGrupo) para que los que tocan tus patron_trampa históricamente
// más frecuentes aparezcan antes en la cola de práctica por parte. Es la
// única conexión entre el historial persistido y la cola de refuerzo: no
// cambia la selección aleatoria del simulacro, que debe seguir siendo una
// muestra representativa, no sesgada hacia tus errores conocidos.
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
