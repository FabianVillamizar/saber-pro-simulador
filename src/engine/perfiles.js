// Perfiles locales (esta app la usan varias personas en el mismo
// navegador/dispositivo). No son cuentas ni requieren red: solo
// namespacing de localStorage por perfil (ver clavesPerfil.js).
import { leerJSON, escribirJSON } from './storage.js'

const CLAVE_PERFILES = 'perfiles'
const CLAVE_ACTIVO = 'perfil-activo'

// Curados a partir de las mismas 4 opciones de accent del design handoff,
// para que el color de perfil siempre combine con la paleta de la app.
export const COLORES_PERFIL = ['#2563EB', '#0F766E', '#7C3AED', '#EA580C']

export function listarPerfiles() {
  return leerJSON(CLAVE_PERFILES, [])
}

export function crearPerfil({ nombre, color = null }) {
  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) throw new Error('El perfil necesita un nombre.')

  const perfil = { id: crypto.randomUUID(), nombre: nombreLimpio, color }
  escribirJSON(CLAVE_PERFILES, [...listarPerfiles(), perfil])
  return perfil
}

export function obtenerPerfilActivo() {
  const id = leerJSON(CLAVE_ACTIVO, null)
  if (!id) return null
  return listarPerfiles().find((p) => p.id === id) ?? null
}

export function establecerPerfilActivo(id) {
  escribirJSON(CLAVE_ACTIVO, id)
}
