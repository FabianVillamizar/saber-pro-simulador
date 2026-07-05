// Construcción centralizada de claves de localStorage namespaced por
// perfil, para que lectura y escritura nunca se desincronicen por un
// template repetido a mano en cada archivo.
export function claveProgreso(perfilId) {
  return `${perfilId}:progreso`
}

export function claveSRS(perfilId, moduloId) {
  return `${perfilId}:srs:${moduloId}`
}
