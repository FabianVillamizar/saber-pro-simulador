const PREFIJO = 'saber-pro'

export function leerJSON(clave, porDefecto) {
  try {
    const crudo = localStorage.getItem(`${PREFIJO}:${clave}`)
    return crudo ? JSON.parse(crudo) : porDefecto
  } catch {
    return porDefecto
  }
}

export function escribirJSON(clave, valor) {
  localStorage.setItem(`${PREFIJO}:${clave}`, JSON.stringify(valor))
}
