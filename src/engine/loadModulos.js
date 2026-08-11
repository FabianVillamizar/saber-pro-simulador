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
  const ensayosModelo = []
  const temasEnsayo = []
  const ejercicios = []

  // Mismo discriminador estructural que antes, ampliado para Comunicación
  // Escrita (que no tiene ítems de opción múltiple, solo tarjetas de
  // concepto + entidades propias de sus pantallas de ensayo/ejercicios):
  // las tarjetas de concepto nunca tienen `parte`, `preguntas`,
  // `anotaciones`, `dominio` ni `ejercicio`; los ítems/grupos de examen
  // siempre tienen `parte` o `preguntas`; un ensayo modelo siempre tiene
  // `anotaciones`; un tema de ensayo siempre tiene `dominio`; un
  // micro-ejercicio (Ejercicios rápidos) siempre tiene `ejercicio` (su
  // propio discriminador de forma: `'cloze'`/`'eleccion'`). Cada chequeo es
  // mutuamente excluyente con los anteriores, así que el orden no importa
  // salvo por legibilidad. Para cualquier otro módulo estas listas quedan
  // vacías y no las consume nadie.
  for (const modulo of archivosCargados) {
    const entradas = modulo.default ?? modulo
    for (const entrada of entradas) {
      if ('parte' in entrada || 'preguntas' in entrada) itemsCrudos.push(entrada)
      else if ('anotaciones' in entrada) ensayosModelo.push(entrada)
      else if ('dominio' in entrada) temasEnsayo.push(entrada)
      else if ('ejercicio' in entrada) ejercicios.push(entrada)
      else tarjetasConcepto.push(entrada)
    }
  }

  return {
    ...registro,
    tarjetasConcepto,
    preguntas: normalizeBank(itemsCrudos, registro.adapters),
    ensayosModelo,
    temasEnsayo,
    ejercicios,
  }
}
