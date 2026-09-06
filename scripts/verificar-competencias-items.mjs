// Verificación del banco de práctica real de Competencias Ciudadanas
// (Práctica por sub-categoría + Simulacro): los archivos `cc_items_*.json`,
// formato "grupo + preguntas" con opciones A-D fijas (distinto del Quiz
// Rápido, que tiene su propio verificar-competencias-quiz.mjs).
//
// Nació sin ningún chequeo de sesgo. La auditoría del 2026-09-06 encontró
// que la opción correcta era la más larga en el 70-97% de las preguntas de
// los 4 bancos escritos a mano (argumentacion 96%, multiperspectivismo
// 97%, conocimientos 78%, pensamiento_sistemico 70%); solo el banco
// derivado de examen real (uis_entrenamiento) estaba limpio (17%). Este
// script deja el chequeo reproducible, con el mismo umbral que
// verificar-lectura-critica-items.mjs (55% error, 45% aviso).
//
// Correr:  node scripts/verificar-competencias-items.mjs [--detalle]
import { readFileSync } from 'node:fs'

const base = new URL('../src/data/competencias-ciudadanas/', import.meta.url)
const ARCHIVOS = [
  'cc_items_argumentacion',
  'cc_items_conocimientos',
  'cc_items_multiperspectivismo',
  'cc_items_pensamiento_sistemico',
  'cc_items_uis_entrenamiento',
]
const DETALLE = process.argv.includes('--detalle')

let errores = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => console.log('AVISO', msg)

const idsVistos = new Set()
let totalGlobal = 0
let largaGlobal = 0
let cortaGlobal = 0

for (const archivo of ARCHIVOS) {
  const grupos = JSON.parse(readFileSync(new URL(`${archivo}.json`, base), 'utf-8'))
  let total = 0
  let masLarga = 0
  let masCorta = 0
  const flageados = []

  for (const g of grupos) {
    if (!Array.isArray(g.preguntas) || g.preguntas.length === 0) {
      fail(`${archivo}/${g.id}: grupo sin preguntas`)
      continue
    }
    for (const p of g.preguntas) {
      total++
      if (idsVistos.has(p.id)) fail(`id duplicado entre archivos: ${p.id}`)
      idsVistos.add(p.id)

      const letras = Object.keys(p.opciones ?? {})
      if (letras.length !== 4 || !['A', 'B', 'C', 'D'].every((l) => letras.includes(l))) {
        fail(`${p.id}: opciones debe tener exactamente A-D (tiene ${letras.join(',') || 'nada'})`)
        continue
      }
      for (const [letra, texto] of Object.entries(p.opciones)) {
        if (typeof texto !== 'string' || texto.trim() === '') fail(`${p.id}: opción ${letra} vacía`)
      }
      if (!letras.includes(p.respuesta_correcta)) {
        fail(`${p.id}: respuesta_correcta "${p.respuesta_correcta}" inválida`)
        continue
      }
      if (p.distractores) {
        for (const letra of Object.keys(p.distractores)) {
          if (letra === p.respuesta_correcta) fail(`${p.id}: distractores incluye la letra correcta ${letra}`)
          if (!letras.includes(letra)) fail(`${p.id}: distractores tiene letra inexistente ${letra}`)
        }
      }

      const lens = Object.fromEntries(Object.entries(p.opciones).map(([k, v]) => [k, v.length]))
      const correctLen = lens[p.respuesta_correcta]
      const orden = Object.values(lens).sort((a, b) => b - a)
      const maxLen = orden[0]
      const minLen = orden[orden.length - 1]
      if (correctLen === maxLen) {
        masLarga++
        flageados.push(`${p.id}  correcta=${p.respuesta_correcta} len=${correctLen}  2ª=${orden[1]}  vector=${JSON.stringify(lens)}`)
      }
      if (correctLen === minLen) masCorta++
    }
  }

  totalGlobal += total
  largaGlobal += masLarga
  cortaGlobal += masCorta
  const pL = Math.round((100 * masLarga) / total)
  const pC = Math.round((100 * masCorta) / total)
  console.log(`${archivo.padEnd(34)} n=${String(total).padStart(3)}  ·  más larga ${String(pL).padStart(3)}%  ·  más corta ${String(pC).padStart(3)}%`)
  if (DETALLE && flageados.length) {
    for (const f of flageados) console.log('   ' + f)
  }
}

const pL = Math.round((100 * largaGlobal) / totalGlobal)
const pC = Math.round((100 * cortaGlobal) / totalGlobal)
console.log(`\nTOTAL  n=${totalGlobal}  ·  correcta = más larga ${largaGlobal}/${totalGlobal} (${pL}%)  ·  más corta ${cortaGlobal}/${totalGlobal} (${pC}%)`)
if (pL > 55) fail(`la correcta es la más larga en ${pL}% de las preguntas (umbral 55%)`)
if (pC > 55) fail(`la correcta es la más corta en ${pC}% de las preguntas (umbral 55%)`)
if (pL > 45 && pL <= 55) aviso(`la correcta es la más larga en ${pL}% — por encima del 45%, hay margen para seguir bajando`)

console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
