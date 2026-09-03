// Verificación de compilación KaTeX de TODO span $...$/$$...$$ + campos
// formula/formula_latex crudos, en los archivos de datos de Habilidades de
// Laboratorio, para las dos técnicas del módulo (LLE y Constantes Físicas).
// Complementa a los verificadores por técnica (que cubren
// longitud/prereqs/ciclos de las tarjetas de concepto) revisando también
// los spans inline de prosa que TextoConFormulas/TextoConReglas renderizan
// en QuizRapido.jsx / PracticarLapizPapel.jsx / RepasoConceptos.jsx, más el
// rulebook "Reglas en contexto" y la resolución de cada token [[HL-R-...]].
import { readFileSync } from 'node:fs'
import katex from 'katex'

const MATH_SPAN = /\$\$[^$]+?\$\$|\$[^$]+?\$/g
const TOKEN = /\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]/g
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
  for (const span of texto.match(MATH_SPAN) ?? []) {
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

const cargar = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf-8'))

// ---- Rulebook combinado (el loader fusiona todos los *_reglas.json en modulo.reglas) ----
const TIPOS_REGLA = new Set(['regla', 'ley', 'corolario', 'teorema', 'norma', 'principio', 'definicion'])
const VARIANTES_REGLA = new Set(['corta', 'desarrollo'])
const idsRegla = new Set()
const refsPorRegla = {}
for (const archivoReglas of ['../src/data/habilidades-laboratorio/hl_reglas.json', '../src/data/habilidades-laboratorio/hl_cf_reglas.json']) {
  const reglas = cargar(archivoReglas)
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
      ;(r.tabla.filas ?? []).forEach((fila, i) => fila.forEach((c, j) => revisarSpans(String(c), `${r.id}.tabla.filas[${i}][${j}]`)))
    }
  }
}

// ---- Por técnica: KaTeX de prosa + resolución de tokens ----
const CAMPOS_CONCEPTO = ['pregunta', 'respuesta', 'regla', 'ejemplo', 'error_comun', 'conexion_cotidiana']
const CAMPOS_QUIZ = ['enunciado', 'explicacion', 'opciones', 'antes', 'despues', 'fragmentos', 'izq', 'der']
const CAMPOS_LP = ['enunciado', 'promptFase1', 'labelHerramienta', 'enfoqueCorto', 'porQue', 'respuesta', 'desarrollo', 'notaAtajo', 'opciones']
const QUIZ_CON_TOKEN = ['enunciado', 'explicacion', 'antes', 'despues']
const QUIZ_SIN_TOKEN = ['opciones', 'fragmentos', 'izq', 'der', 'respuesta', 'alternativas']
const LP_CON_TOKEN = ['enunciado', 'promptFase1', 'labelHerramienta', 'enfoqueCorto', 'porQue', 'respuesta', 'desarrollo', 'notaAtajo']

const TECNICAS = [
  {
    nombre: 'LLE',
    conceptos: '../src/data/habilidades-laboratorio/hl_lle_conceptos.json',
    quiz: '../src/data/habilidades-laboratorio/hl_lle_quiz_rapido.json',
    lapiz: '../src/data/habilidades-laboratorio/hl_lle_lapiz_papel.json',
  },
  {
    nombre: 'CF',
    conceptos: '../src/data/habilidades-laboratorio/hl_cf_conceptos.json',
    quiz: '../src/data/habilidades-laboratorio/hl_cf_quiz_rapido.json',
    lapiz: '../src/data/habilidades-laboratorio/hl_cf_lapiz_papel.json',
  },
]

function contarTokens(texto, ctx) {
  if (typeof texto !== 'string') return
  for (const m of texto.matchAll(TOKEN)) {
    const id = m[1].trim()
    if (!idsRegla.has(id)) {
      console.log(`FAIL ${ctx}: [[${id}]] no existe en ningún *_reglas.json`)
      errores++
    } else refsPorRegla[id] = (refsPorRegla[id] ?? 0) + 1
  }
}

let refsQuiz = 0
let refsTarjetas = 0
let refsLp = 0

for (const t of TECNICAS) {
  const conceptos = cargar(t.conceptos)
  const quiz = cargar(t.quiz)
  const lp = cargar(t.lapiz)

  for (const c of conceptos) {
    for (const campo of CAMPOS_CONCEPTO) revisarCampo(c, campo, c.id)
    if (c.formula_latex) compilar(c.formula_latex, `${c.id}.formula_latex`)
    for (const campo of CAMPOS_CONCEPTO) {
      const before = Object.values(refsPorRegla).reduce((a, b) => a + b, 0)
      contarTokens(c[campo], `${c.id}.${campo}`)
      refsTarjetas += Object.values(refsPorRegla).reduce((a, b) => a + b, 0) - before
    }
  }

  for (const it of quiz) {
    for (const campo of CAMPOS_QUIZ) revisarCampo(it, campo, it.id)
    for (const campo of QUIZ_CON_TOKEN) {
      const before = Object.values(refsPorRegla).reduce((a, b) => a + b, 0)
      contarTokens(it[campo], `${it.id}.${campo}`)
      refsQuiz += Object.values(refsPorRegla).reduce((a, b) => a + b, 0) - before
    }
    for (const campo of QUIZ_SIN_TOKEN) {
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

  for (const ej of lp) {
    for (const campo of CAMPOS_LP) revisarCampo(ej, campo, ej.id)
    if (ej.formula) compilar(ej.formula, `${ej.id}.formula`)
    for (const campo of LP_CON_TOKEN) {
      const before = Object.values(refsPorRegla).reduce((a, b) => a + b, 0)
      contarTokens(ej[campo], `${ej.id}.${campo}`)
      refsLp += Object.values(refsPorRegla).reduce((a, b) => a + b, 0) - before
    }
    ;(ej.opciones ?? []).forEach((o, i) => {
      if (typeof o?.texto === 'string' && o.texto.includes('[[')) {
        console.log(`FAIL ${ej.id}.opciones[${i}]: un disparador [[...]] en una opción de fase 1 daría pista`)
        errores++
      }
    })
  }
}

console.log(`\n${idsRegla.size} reglas en el rulebook combinado`)
console.log(`${refsQuiz} referencias [[HL-R-...]] resueltas en Quiz Rápido · ${refsTarjetas} en tarjetas de concepto · ${refsLp} en Lápiz y papel`)
const reglasSinUso = [...idsRegla].filter((id) => !refsPorRegla[id])
if (reglasSinUso.length) console.log(`AVISO reglas sin ninguna referencia: ${reglasSinUso.join(', ')}`)

console.log(errores === 0 ? 'OK — 0 errores de KaTeX / tokens en los archivos del módulo' : `${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
