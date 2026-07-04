// localStorage no sincroniza entre dispositivos: esto empaqueta todo lo
// que la app guarda (progreso/racha + estado SRS de cada módulo) en un
// JSON descargable, y lo restaura desde ese mismo archivo.
const PREFIJO = 'saber-pro:'

export function exportarProgreso() {
  const datos = {}
  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i)
    if (clave && clave.startsWith(PREFIJO)) {
      datos[clave] = localStorage.getItem(clave)
    }
  }
  return { version: 1, exportadoEn: new Date().toISOString(), datos }
}

export function importarProgreso(json) {
  if (!json || typeof json !== 'object' || typeof json.datos !== 'object' || json.datos === null) {
    throw new Error('El archivo no tiene el formato esperado de un export de Saber Pro.')
  }
  for (const [clave, valor] of Object.entries(json.datos)) {
    if (!clave.startsWith(PREFIJO)) continue
    localStorage.setItem(clave, valor)
  }
}
