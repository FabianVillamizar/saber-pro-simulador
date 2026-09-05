// Verificación del banco de práctica real de Lectura Crítica (Práctica por
// sub-categoría + Simulacro completo): los 4 archivos `lc_items_*.json`,
// formato "grupo + preguntas" con opciones A-D fijas (distinto del Quiz
// Rápido, que tiene su propio verificar-lectura-critica-quiz.mjs). Nació
// sin ningún chequeo de sesgo — un audit manual (2026-09-05) encontró que
// la opción correcta era la más larga en 135/150 preguntas (90%), corregido
// en esa misma sesión. Este script deja el chequeo reproducible.
// Correr: `node scripts/verificar-lectura-critica-items.mjs`
import { readFileSync } from 'node:fs'

const base = new URL('../src/data/lectura-critica/', import.meta.url)
const ARCHIVOS = ['lc_items_literarios', 'lc_items_informativos', 'lc_items_discontinuos', 'lc_items_uis_entrenamiento']

let errores = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => console.log('AVISO', msg)

let totalPreguntas = 0
let masLarga = 0
let masCorta = 0
const idsVistos = new Set()

for (const archivo of ARCHIVOS) {
  const grupos = JSON.parse(readFileSync(new URL(`${archivo}.json`, base), 'utf-8'))
  for (const g of grupos) {
    if (!Array.isArray(g.preguntas) || g.preguntas.length === 0) fail(`${archivo}/${g.id}: grupo sin preguntas`)
    for (const p of g.preguntas) {
      totalPreguntas++
      if (idsVistos.has(p.id)) fail(`id duplicado entre archivos: ${p.id}`)
      idsVistos.add(p.id)

      const letras = Object.keys(p.opciones ?? {})
      if (letras.length !== 4 || !['A', 'B', 'C', 'D'].every((l) => letras.includes(l))) {
        fail(`${p.id}: opciones debe tener exactamente las letras A-D (tiene ${letras.join(',')})`)
        continue
      }
      for (const [letra, texto] of Object.entries(p.opciones)) {
        if (typeof texto !== 'string' || texto.trim() === '') fail(`${p.id}: opción ${letra} vacía o no es texto`)
      }
      if (!letras.includes(p.respuesta_correcta)) fail(`${p.id}: respuesta_correcta "${p.respuesta_correcta}" no es una letra válida`)
      if (p.distractores) {
        for (const letra of Object.keys(p.distractores)) {
          if (letra === p.respuesta_correcta) fail(`${p.id}: distractores incluye la letra correcta ${letra}`)
          if (!letras.includes(letra)) fail(`${p.id}: distractores tiene una letra inexistente ${letra}`)
        }
      }

      const lens = Object.fromEntries(Object.entries(p.opciones).map(([k, v]) => [k, v.length]))
      const correctLen = lens[p.respuesta_correcta]
      const maxLen = Math.max(...Object.values(lens))
      const minLen = Math.min(...Object.values(lens))
      if (correctLen === maxLen) masLarga++
      if (correctLen === minLen) masCorta++
    }
  }
}

const pL = Math.round((100 * masLarga) / totalPreguntas)
const pC = Math.round((100 * masCorta) / totalPreguntas)
console.log(`${totalPreguntas} preguntas en ${ARCHIVOS.length} archivos`)
console.log(`Correcta es la más larga en ${masLarga}/${totalPreguntas} (${pL}%), la más corta en ${masCorta}/${totalPreguntas} (${pC}%)`)
if (pL > 55) fail(`la correcta es la más larga en ${pL}% de las preguntas (umbral 55%)`)
if (pC > 55) fail(`la correcta es la más corta en ${pC}% de las preguntas (umbral 55%)`)
if (pL > 45) aviso(`sigue por encima del 45% (${pL}%) — hay margen para seguir bajando el sesgo de longitud si se quiere`)

console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
