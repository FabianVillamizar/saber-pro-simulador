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

// ---- Rulebook "Reglas en contexto" — hl_reglas.json ----
// (feature transversal, piloto Inorgánica; ver TextoConReglas.jsx). Cada
// $...$/formula/celda compila en KaTeX, esquema consistente, y cada token
// [[HL-R-...]] del Quiz Rápido resuelve contra este archivo. Los
// disparadores solo pueden vivir en enunciado/explicacion/antes/despues,
// nunca en una opción, fragmento o respuesta (darían pista).
const RUTA_REGLAS = new URL('../src/data/habilidades-laboratorio/hl_reglas.json', import.meta.url)
const reglas = JSON.parse(readFileSync(RUTA_REGLAS, 'utf-8'))
const TIPOS_REGLA = new Set(['regla', 'ley', 'corolario', 'teorema', 'norma', 'principio', 'definicion'])
const VARIANTES_REGLA = new Set(['corta', 'desarrollo'])
const idsRegla = new Set()
for (const r of reglas) {
  if (idsRegla.has(r.id)) {
    console.log(`FAIL regla duplicada: ${r.id}`)
    errores++
  }
  idsRegla.add(r.id)
  if (!/^HL-R-[a-z0-9-]+$/.test(r.id)) {
    console.log(`FAIL id de regla mal formado (esperado HL-R-<slug>): ${r.id}`)
    errores++
  }
  if (!TIPOS_REGLA.has(r.tipo)) {
    console.log(`FAIL tipo de regla desconocido ("${r.tipo}") en ${r.id}`)
    errores++
  }
  if (!VARIANTES_REGLA.has(r.variante)) {
    console.log(`FAIL variante de regla desconocida ("${r.variante}") en ${r.id}`)
    errores++
  }
  if (!r.titulo || !r.cuerpo) {
    console.log(`FAIL regla sin titulo/cuerpo: ${r.id}`)
    errores++
  }
  if (r.variante === 'desarrollo' && !r.formula && !r.tabla) {
    console.log(`FAIL variante "desarrollo" sin formula ni tabla: ${r.id}`)
    errores++
  }
  for (const c of ['titulo', 'cuerpo', 'ejemplo']) if (r[c]) revisarSpans(r[c], `${r.id}.${c}`)
  if (r.formula) compilar(r.formula, `${r.id}.formula`)
  if (r.tabla) {
    ;(r.tabla.encabezados ?? []).forEach((c, i) => revisarSpans(String(c), `${r.id}.tabla.encabezados[${i}]`))
    ;(r.tabla.filas ?? []).forEach((fila, i) =>
      fila.forEach((c, j) => revisarSpans(String(c), `${r.id}.tabla.filas[${i}][${j}]`)),
    )
  }
}

// ---- Tokens [[HL-R-...]] en el Quiz Rápido ----
const TOKEN = /\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]/g
const CAMPOS_CON_TOKEN = ['enunciado', 'explicacion', 'antes', 'despues']
const CAMPOS_SIN_TOKEN = ['opciones', 'fragmentos', 'izq', 'der', 'respuesta', 'alternativas']
let refsResueltas = 0
for (const it of quiz) {
  for (const campo of CAMPOS_CON_TOKEN) {
    const v = it[campo]
    if (typeof v !== 'string') continue
    for (const m of v.matchAll(TOKEN)) {
      const id = m[1].trim()
      if (!idsRegla.has(id)) {
        console.log(`FAIL ${it.id}.${campo}: [[${id}]] no existe en hl_reglas.json`)
        errores++
      } else refsResueltas++
    }
  }
  for (const campo of CAMPOS_SIN_TOKEN) {
    const v = it[campo]
    const arr = Array.isArray(v) ? v : v == null ? [] : [v]
    arr.forEach((x, i) => {
      if (typeof x === 'string' && x.includes('[[')) {
        console.log(`FAIL ${it.id}.${campo}[${i}]: un disparador [[...]] aquí daría pista`)
        errores++
      }
    })
  }
}
console.log(`\n${reglas.length} reglas en el rulebook · ${refsResueltas} referencias [[HL-R-...]] resueltas en el Quiz Rápido`)

console.log(errores === 0 ? 'OK — 0 errores de KaTeX en los tres archivos' : `${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
