// Visibilidad y acceso de módulos restringidos (hoy solo "diosgenina").
// Dos capas independientes:
//   1. Visibilidad por perfil: la tarjeta del módulo ni siquiera existe en
//      el dashboard para otros perfiles/invitado (ver esVisibleParaPerfil).
//   2. Código de acceso: una vez visible, un código numérico separado del
//      PIN de perfil bloquea la entrada hasta escribirlo una vez por
//      perfil. Es fricción, no seguridad real (sitio estático en GitHub
//      Pages: el hash viaja en el bundle público) — mismo alcance que
//      hashPin en perfiles.js, del que se reusa el algoritmo.
import { hashPin } from './perfiles.js'
import { leerJSON, escribirJSON } from './storage.js'

// TODO: confirmar que este es el nombre exacto (con tilde/mayúscula) del
// perfil real, tal como quedó guardado al crearlo — si no coincide
// carácter por carácter, la tarjeta de diosgenina no aparecerá para nadie.
const NOMBRE_PERFIL_DIOSGENINA = 'Fabián'

const CODIGOS_ACCESO = {
  diosgenina: hashPin('2724'),
}

export function esVisibleParaPerfil(moduloId, perfil) {
  if (moduloId !== 'diosgenina') return true
  return perfil?.nombre === NOMBRE_PERFIL_DIOSGENINA
}

function claveAcceso(perfilId, moduloId) {
  return `acceso:${perfilId}:${moduloId}`
}

export function requiereAcceso(moduloId) {
  return moduloId in CODIGOS_ACCESO
}

export function moduloDesbloqueado(perfilId, moduloId) {
  if (!requiereAcceso(moduloId)) return true
  return leerJSON(claveAcceso(perfilId, moduloId), false)
}

export function desbloquearModulo(perfilId, moduloId, codigo) {
  if (hashPin(codigo ?? '') !== CODIGOS_ACCESO[moduloId]) return false
  escribirJSON(claveAcceso(perfilId, moduloId), true)
  return true
}
