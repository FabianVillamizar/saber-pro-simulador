// Cuenta cuántas veces cae un perfil en cada patron_trampa entre sus
// respuestas falladas, acumulado entre práctica por parte y simulacro.
// Namespaced por perfil como el resto de progreso.js — sobrevive a cerrar
// la pestaña, a diferencia del conteo por-intento que ya hace
// patronesTrampaFrecuentes() en reporte.js.
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
