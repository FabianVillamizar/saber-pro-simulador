// Visibilidad y acceso de módulos restringidos (hoy "diosgenina" y
// "frances"). Dos capas independientes:
//   1. Visibilidad por perfil: la tarjeta del módulo ni siquiera existe en
//      el dashboard para otros perfiles/invitado (ver esVisibleParaPerfil).
//   2. Código de acceso (opcional, por módulo): una vez visible, un código
//      numérico separado del PIN de perfil bloquea la entrada hasta
//      escribirlo una vez por perfil. Es fricción, no seguridad real
//      (sitio estático en GitHub Pages: el hash viaja en el bundle
//      público) — mismo alcance que hashPin en perfiles.js, del que se
//      reusa el algoritmo. Un módulo sin entrada en CODIGOS_ACCESO
//      (frances) queda visible-pero-sin-código: solo lo protege la capa 1.
import { hashPin } from './perfiles.js'
import { leerJSON, escribirJSON } from './storage.js'

// Nombre del perfil real, sin tilde ("Fabian", no "Fabián") — el perfil se
// creó sin acento y la comparación ignora acentos de todos modos (ver
// normalizarNombre) para no depender de si alguien lo vuelve a escribir con
// tilde en el futuro.
const PERFIL_REQUERIDO_POR_MODULO = {
  diosgenina: 'Fabian',
  frances: 'Fabian',
}

const CODIGOS_ACCESO = {
  diosgenina: hashPin('2724'),
}

// Quita acentos/diacríticos (á→a, é→e, etc.) pero conserva mayúsculas y
// minúsculas — la comparación de perfil es insensible a tildes, no a caja.
function normalizarNombre(nombre) {
  return nombre?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? ''
}

export function esVisibleParaPerfil(moduloId, perfil) {
  const nombreRequerido = PERFIL_REQUERIDO_POR_MODULO[moduloId]
  if (!nombreRequerido) return true
  return normalizarNombre(perfil?.nombre) === normalizarNombre(nombreRequerido)
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
