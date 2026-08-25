// Verificación de la rúbrica mcq de Quiz Rápido (feedback_mcq_guessable_bias)
// para src/data/habilidades-laboratorio/hl_lle_quiz_rapido.json.
import { readFileSync } from 'node:fs'

const RUTA = new URL('../src/data/habilidades-laboratorio/hl_lle_quiz_rapido.json', import.meta.url)
const items = JSON.parse(readFileSync(RUTA, 'utf-8'))

const ids = new Set()
let errores = 0
for (const it of items) {
  if (ids.has(it.id)) {
    console.log('FAIL id duplicado:', it.id)
    errores++
  }
  ids.add(it.id)
}

const mcq = items.filter((i) => i.formato === 'mcq')
console.log(`\n${items.length} ítems totales (${mcq.length} mcq, ${items.filter((i) => i.formato === 'fill').length} fill, ${items.filter((i) => i.formato === 'build').length} build, ${items.filter((i) => i.formato === 'match').length} match)`)

// 1. Posición de la correcta
const posiciones = { 0: 0, 1: 0, 2: 0, 3: 0 }
mcq.forEach((i) => posiciones[i.correcta]++)
console.log('Posiciones de la correcta:', posiciones)

// 2. Ratio de longitud por par dentro de cada ítem
let paresFueraDeRango = 0
for (const it of mcq) {
  const lens = it.opciones.map((o) => o.length)
  for (let a = 0; a < lens.length; a++) {
    for (let b = a + 1; b < lens.length; b++) {
      const ratio = Math.max(lens[a], lens[b]) / Math.min(lens[a], lens[b])
      if (ratio > 1.3) {
        console.log(`AVISO ratio ${ratio.toFixed(2)} en ${it.id} entre opciones ${a} y ${b}`)
        paresFueraDeRango++
      }
    }
  }
}

// 3. Correcta-es-la-más-larga a nivel de lote
let correctaEsLaMasLarga = 0
for (const it of mcq) {
  const lens = it.opciones.map((o) => o.length)
  const max = Math.max(...lens)
  if (it.opciones[it.correcta].length === max) correctaEsLaMasLarga++
}
console.log(`Correcta es la más larga en ${correctaEsLaMasLarga}/${mcq.length} ítems (${Math.round((100 * correctaEsLaMasLarga) / mcq.length)}%)`)
console.log(`Pares fuera de ratio 0.7-1.3: ${paresFueraDeRango}`)

process.exit(errores === 0 ? 0 : 1)
