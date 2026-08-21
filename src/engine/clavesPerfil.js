// Construcción centralizada de claves de localStorage namespaced por
// perfil, para que lectura y escritura nunca se desincronicen por un
// template repetido a mano en cada archivo.
export function claveProgreso(perfilId) {
  return `${perfilId}:progreso`
}

export function claveSRS(perfilId, moduloId) {
  return `${perfilId}:srs:${moduloId}`
}

export function claveEnsayos(perfilId) {
  return `${perfilId}:comunicacion-escrita:ensayos`
}

export function claveEjercicios(perfilId) {
  return `${perfilId}:comunicacion-escrita:ejercicios`
}

export function claveQuizRapido(perfilId, moduloId) {
  return `${perfilId}:quiz-rapido:${moduloId}`
}
