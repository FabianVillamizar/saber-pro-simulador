import { normalizeBank } from './normalize.js'
import { indiceModulos } from './indiceModulos.js'

// Import perezoso: un solo glob cubre src/data/<cualquier-modulo>/*.json
// (agregar la carpeta de un módulo nuevo no requiere tocar este archivo),
// pero sin `eager: true` cada JSON queda como su propio chunk que solo se
// descarga cuando cargarModulo() lo pide. Así la pantalla de selección de
// módulos no descarga el contenido completo de los otros cinco.
const archivos = import.meta.glob('../data/*/*.json')

export function listarModulos() {
  return Object.values(indiceModulos)
}

export async function cargarModulo(moduloId) {
  const registro = indiceModulos[moduloId]
  if (!registro) {
    throw new Error(`Módulo "${moduloId}" no está registrado en indiceModulos.js`)
  }

  const prefijo = `../data/${moduloId}/`
  const rutas = Object.keys(archivos).filter((ruta) => ruta.startsWith(prefijo))
  const archivosCargados = await Promise.all(rutas.map((ruta) => archivos[ruta]()))

  const tarjetasConcepto = []
  const itemsCrudos = []

  // Mismo discriminador estructural que antes: las tarjetas de concepto
  // nunca tienen `parte` ni `preguntas`; los ítems/grupos de examen siempre
  // tienen una u otra (número de parte en Inglés, array de preguntas en
  // Competencias Ciudadanas).
  for (const modulo of archivosCargados) {
    const entradas = modulo.default ?? modulo
    for (const entrada of entradas) {
      if ('parte' in entrada || 'preguntas' in entrada) itemsCrudos.push(entrada)
      else tarjetasConcepto.push(entrada)
    }
  }

  return {
    ...registro,
    tarjetasConcepto,
    preguntas: normalizeBank(itemsCrudos, registro.adapters),
  }
}
