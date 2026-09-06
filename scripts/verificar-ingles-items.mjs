// Verificación del banco de práctica real de Inglés (Práctica por
// sub-categoría + Simulacro): los archivos de las partes 3-7. Distinto del
// Quiz Rápido, que tiene su propio verificar-ingles-quiz.mjs y que hasta
// ahora era lo único con chequeo de sesgo en este módulo.
//
// La auditoría del 2026-09-06 encontró sesgo de longitud fuerte en las
// partes con opciones de frase completa: P6 (comprensión compleja) 93%,
// P5 (comprensión básica) 75%, P3 (conversaciones) 72%. Las partes de
// cloze de palabra suelta (P4 gramatical, P7 léxico) no tienen sesgo real
// medible porque sus opciones son palabras de 2-8 letras — se reportan
// pero no cuentan para el umbral.
//
// Estructura por parte:
//   P3  array plano de ítems      → item.opciones {A,B,C}
//   P4  grupos con .huecos[]      → hueco.opciones {A,B,C}   (cloze corto)
//   P5  grupos con .preguntas[]   → pregunta.opciones {A,B,C}
//   P6  grupos con .preguntas[]   → pregunta.opciones {A,B,C}
//   P7  grupos con .huecos[]      → hueco.opciones {A,B,C}   (cloze corto)
//   P1/P2 emparejamiento, sin MCQ → se ignoran
//
// Correr:  node scripts/verificar-ingles-items.mjs [--detalle]
import { readFileSync } from 'node:fs'

const base = new URL('../src/data/ingles/', import.meta.url)
const DETALLE = process.argv.includes('--detalle')

// parte -> { archivo, clozeCorto } — clozeCorto no cuenta para el umbral
const PARTES = [
  { parte: 3, archivo: 'ing_p3_conversaciones', clozeCorto: false },
  { parte: 4, archivo: 'ing_p4_cloze_gramatical', clozeCorto: true },
  { parte: 5, archivo: 'ing_p5_comprension_basica', clozeCorto: false },
  { parte: 6, archivo: 'ing_p6_comprension_compleja', clozeCorto: false },
  { parte: 7, archivo: 'ing_p7_cloze_lexico', clozeCorto: true },
]

let errores = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => console.log('AVISO', msg)

// devuelve la lista de preguntas MCQ {id, opciones, respuesta_correcta} de un archivo
function extraerMCQ(data) {
  const out = []
  for (const el of data) {
    if (Array.isArray(el.preguntas)) out.push(...el.preguntas)
    else if (Array.isArray(el.huecos)) out.push(...el.huecos.map((h) => ({ ...h, id: `${el.id}#${h.num}` })))
    else out.push(el)
  }
  return out.filter((p) => p.opciones && typeof p.opciones === 'object' && !Array.isArray(p.opciones))
}

const idsVistos = new Set()
let totalContables = 0
let largaContables = 0
let cortaContables = 0

for (const { parte, archivo, clozeCorto } of PARTES) {
  const data = JSON.parse(readFileSync(new URL(`${archivo}.json`, base), 'utf-8'))
  const mcq = extraerMCQ(data)
  let masLarga = 0
  let masCorta = 0
  const flageados = []

  for (const p of mcq) {
    const id = p.id ?? '(sin id)'
    if (p.id) {
      if (idsVistos.has(p.id)) fail(`id duplicado: ${p.id}`)
      idsVistos.add(p.id)
    }
    const letras = Object.keys(p.opciones)
    if (letras.length < 2) {
      fail(`${id}: menos de 2 opciones`)
      continue
    }
    if (!letras.includes(p.respuesta_correcta)) {
      fail(`${id}: respuesta_correcta "${p.respuesta_correcta}" no está entre las opciones`)
      continue
    }
    for (const [letra, texto] of Object.entries(p.opciones)) {
      if (typeof texto !== 'string' || texto.trim() === '') fail(`${id}: opción ${letra} vacía`)
    }

    const lens = Object.fromEntries(Object.entries(p.opciones).map(([k, v]) => [k, v.length]))
    const correctLen = lens[p.respuesta_correcta]
    const orden = Object.values(lens).sort((a, b) => b - a)
    if (correctLen === orden[0]) {
      masLarga++
      flageados.push(`${id}  correcta=${p.respuesta_correcta} len=${correctLen}  2ª=${orden[1]}  vector=${JSON.stringify(lens)}`)
    }
    if (correctLen === orden[orden.length - 1]) masCorta++
  }

  const pL = mcq.length ? Math.round((100 * masLarga) / mcq.length) : 0
  const pC = mcq.length ? Math.round((100 * masCorta) / mcq.length) : 0
  const marca = clozeCorto ? '  (cloze corto — no cuenta para el umbral)' : ''
  console.log(`P${parte} ${archivo.padEnd(30)} n=${String(mcq.length).padStart(3)}  ·  más larga ${String(pL).padStart(3)}%  ·  más corta ${String(pC).padStart(3)}%${marca}`)
  if (DETALLE && !clozeCorto && flageados.length) {
    for (const f of flageados) console.log('   ' + f)
  }

  if (!clozeCorto) {
    totalContables += mcq.length
    largaContables += masLarga
    cortaContables += masCorta
  }
}

const pL = Math.round((100 * largaContables) / totalContables)
const pC = Math.round((100 * cortaContables) / totalContables)
console.log(`\nContables (P3+P5+P6)  n=${totalContables}  ·  correcta = más larga ${largaContables}/${totalContables} (${pL}%)  ·  más corta ${cortaContables}/${totalContables} (${pC}%)`)
if (pL > 55) fail(`la correcta es la más larga en ${pL}% de las preguntas de frase completa (umbral 55%)`)
if (pC > 55) fail(`la correcta es la más corta en ${pC}% (umbral 55%)`)
if (pL > 45 && pL <= 55) aviso(`la correcta es la más larga en ${pL}% — por encima del 45%, hay margen para seguir bajando`)

console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
