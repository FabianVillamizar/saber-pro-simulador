// Perfiles locales (esta app la usan varias personas en el mismo
// navegador/dispositivo). No son cuentas ni requieren red: solo
// namespacing de localStorage por perfil (ver clavesPerfil.js).
import { leerJSON, escribirJSON } from './storage.js'

const CLAVE_PERFILES = 'perfiles'
const CLAVE_ACTIVO = 'perfil-activo'

// Dispositivo compartido entre pocas personas: 2 perfiles con PIN alcanza
// y evita que el selector crezca sin control. Quien necesite más, usa
// invitado (ver PERFIL_INVITADO) sin que eso cree un perfil nuevo.
export const MAX_PERFILES = 2

// Curados a partir de las mismas 4 opciones de accent del design handoff,
// para que el color de perfil siempre combine con la paleta de la app.
export const COLORES_PERFIL = ['#2563EB', '#0F766E', '#7C3AED', '#EA580C']

export const ID_INVITADO = 'invitado'

// No es un perfil real (no vive en CLAVE_PERFILES ni tiene PIN): es un
// modo de solo-lectura para cuando ya se ocuparon los 2 cupos. Cualquier
// escritura de progreso/SRS debe comprobar este id y no persistir.
export const PERFIL_INVITADO = { id: ID_INVITADO, nombre: 'Invitado', color: null, invitado: true }

// Hash simple (no criptográfico) solo para no guardar el PIN en texto
// plano en localStorage. No protege contra alguien que abra DevTools:
// el objetivo es disuadir a quien mire por encima del hombro, no cifrar.
function hashPin(pin) {
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    hash = (hash * 31 + pin.charCodeAt(i)) | 0
  }
  return hash.toString(36)
}

export function listarPerfiles() {
  return leerJSON(CLAVE_PERFILES, [])
}

export function crearPerfil({ nombre, color = null, pin }) {
  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) throw new Error('El perfil necesita un nombre.')
  if (!/^\d{4}$/.test(pin ?? '')) throw new Error('El PIN debe tener 4 dígitos.')
  if (listarPerfiles().length >= MAX_PERFILES) {
    throw new Error(`Solo se pueden crear ${MAX_PERFILES} perfiles.`)
  }

  const perfil = { id: crypto.randomUUID(), nombre: nombreLimpio, color, pinHash: hashPin(pin) }
  escribirJSON(CLAVE_PERFILES, [...listarPerfiles(), perfil])
  return perfil
}

export function verificarPin(perfil, pin) {
  return perfil.pinHash === hashPin(pin ?? '')
}

export function obtenerPerfilActivo() {
  const id = leerJSON(CLAVE_ACTIVO, null)
  if (!id) return null
  if (id === ID_INVITADO) return PERFIL_INVITADO
  return listarPerfiles().find((p) => p.id === id) ?? null
}

export function establecerPerfilActivo(id) {
  escribirJSON(CLAVE_ACTIVO, id)
}
