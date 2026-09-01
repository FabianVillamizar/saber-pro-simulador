// Verificación de la rúbrica mcq de Quiz Rápido (feedback_mcq_guessable_bias)
// para src/data/habilidades-laboratorio/hl_lle_quiz_rapido.json, más la
// misma rúbrica aplicada a las opciones de fase 1 de Lápiz y papel
// (hl_lle_lapiz_papel.json): el motor ahora baraja esas opciones al
// renderizar, pero un correcto-siempre-más-largo sigue siendo un tell aunque
// la posición esté aleatorizada.
import { readFileSync } from 'node:fs'

const RUTA = new URL('../src/data/habilidades-laboratorio/hl_lle_quiz_rapido.json', import.meta.url)
const items = JSON.parse(readFileSync(RUTA, 'utf-8'))
const RUTA_LP = new URL('../src/data/habilidades-laboratorio/hl_lle_lapiz_papel.json', import.meta.url)
const lapiz = JSON.parse(readFileSync(RUTA_LP, 'utf-8'))

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

// ---- Lápiz y papel: opciones de fase 1 ----
console.log(`\n${lapiz.length} ejercicios de lápiz y papel`)
let lpCorrectaMasLarga = 0
let lpParesFuera = 0
const lpPos = { 0: 0, 1: 0, 2: 0, 3: 0 }
for (const ej of lapiz) {
  const ci = ej.opciones.findIndex((o) => o.correcta)
  const nCorrectas = ej.opciones.filter((o) => o.correcta).length
  if (nCorrectas !== 1) {
    console.log(`FAIL ${ej.id}: ${nCorrectas} opciones marcadas como correctas (debe ser 1)`)
    errores++
  }
  lpPos[ci]++
  const lens = ej.opciones.map((o) => o.texto.length)
  const max = Math.max(...lens)
  if (lens[ci] === max) lpCorrectaMasLarga++
  for (let a = 0; a < lens.length; a++) {
    for (let b = a + 1; b < lens.length; b++) {
      const ratio = Math.max(lens[a], lens[b]) / Math.min(lens[a], lens[b])
      if (ratio > 1.35) {
        console.log(`AVISO ratio ${ratio.toFixed(2)} en ${ej.id} entre opciones ${a} y ${b}`)
        lpParesFuera++
      }
    }
  }
}
console.log('Posición de la correcta en el JSON crudo:', lpPos, '(el motor la baraja al renderizar)')
const lpPct = Math.round((100 * lpCorrectaMasLarga) / lapiz.length)
console.log(`Correcta es la más larga en ${lpCorrectaMasLarga}/${lapiz.length} ejercicios (${lpPct}%)`)
console.log(`Pares fuera de ratio 0.74-1.35: ${lpParesFuera}`)
if (lpPct > 55) {
  console.log(`FAIL: la correcta es la más larga en ${lpPct}% de los ejercicios de lápiz y papel (umbral 55%)`)
  errores++
}
if (lpParesFuera > 0) {
  console.log(`FAIL: ${lpParesFuera} par(es) de opciones de lápiz y papel fuera del ratio 0.74-1.35`)
  errores++
}

process.exit(errores === 0 ? 0 : 1)
