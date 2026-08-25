// Verificación de compilación KaTeX de TODO span $...$/$$...$$ + campos
// formula/formula_latex crudos, en los tres archivos de datos de
// Habilidades de Laboratorio (conceptos, quiz rápido, lápiz y papel).
// Complementa a verificar-habilidades-laboratorio-lle.mjs (que solo
// cubre longitud/prereqs/ciclos de las tarjetas de concepto) cubriendo
// también los spans inline de prosa que TextoConFormulas renderiza en
// QuizRapido.jsx/PracticarLapizPapel.jsx.
import { readFileSync } from 'node:fs'
import katex from 'katex'

const MATH_SPAN = /\$\$[^$]+?\$\$|\$[^$]+?\$/g
let errores = 0

function compilar(tex, ctx) {
  try {
    katex.renderToString(tex, { throwOnError: true })
  } catch (e) {
    console.log(`FAIL ${ctx}: "${tex}" -> ${e.message}`)
    errores++
  }
}

function revisarSpans(texto, ctx) {
  if (typeof texto !== 'string') return
  const spans = texto.match(MATH_SPAN) ?? []
  for (const span of spans) {
    const tex = span.startsWith('$$') ? span.slice(2, -2) : span.slice(1, -1)
    compilar(tex, ctx)
  }
}

function revisarCampo(obj, campo, ctx) {
  const v = obj[campo]
  if (typeof v === 'string') revisarSpans(v, `${ctx}.${campo}`)
  else if (Array.isArray(v)) {
    v.forEach((x, i) => {
      if (typeof x === 'string') revisarSpans(x, `${ctx}.${campo}[${i}]`)
      else if (x && typeof x === 'object' && 'texto' in x) revisarSpans(x.texto, `${ctx}.${campo}[${i}].texto`)
    })
  }
}

const RUTA_CONCEPTOS = new URL('../src/data/habilidades-laboratorio/hl_lle_conceptos.json', import.meta.url)
const RUTA_QUIZ = new URL('../src/data/habilidades-laboratorio/hl_lle_quiz_rapido.json', import.meta.url)
const RUTA_LP = new URL('../src/data/habilidades-laboratorio/hl_lle_lapiz_papel.json', import.meta.url)

const conceptos = JSON.parse(readFileSync(RUTA_CONCEPTOS, 'utf-8'))
for (const t of conceptos) {
  for (const c of ['pregunta', 'respuesta', 'regla', 'ejemplo', 'error_comun', 'conexion_cotidiana']) revisarCampo(t, c, t.id)
  if (t.formula_latex) compilar(t.formula_latex, `${t.id}.formula_latex`)
}

const quiz = JSON.parse(readFileSync(RUTA_QUIZ, 'utf-8'))
for (const it of quiz) {
  for (const c of ['enunciado', 'explicacion', 'opciones', 'antes', 'despues', 'fragmentos', 'izq', 'der']) revisarCampo(it, c, it.id)
}

const lp = JSON.parse(readFileSync(RUTA_LP, 'utf-8'))
for (const ej of lp) {
  for (const c of ['enunciado', 'promptFase1', 'labelHerramienta', 'enfoqueCorto', 'porQue', 'respuesta', 'desarrollo', 'notaAtajo', 'opciones']) revisarCampo(ej, c, ej.id)
  if (ej.formula) compilar(ej.formula, `${ej.id}.formula`)
}

console.log(errores === 0 ? 'OK — 0 errores de KaTeX en los tres archivos' : `${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
