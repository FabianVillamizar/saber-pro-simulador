// Verificación de contenido para src/data/inorganica/iq_tg_conceptos.json,
// aplicando la rúbrica endurecida de la bitácora de Inorgánica: longitud
// por tarjeta, compilación KaTeX de cada fórmula, integridad de prereqs
// (sin ciclos, sin referencias rotas), y ningún símbolo prohibido (hats,
// subíndice "d") suelto en Unicode fuera de $...$.
import { readFileSync } from 'node:fs'
import katex from 'katex'

const RUTA = new URL('../src/data/inorganica/iq_tg_conceptos.json', import.meta.url)
const tarjetas = JSON.parse(readFileSync(RUTA, 'utf-8'))

const CAMPOS_TEXTO = ['pregunta', 'respuesta', 'regla', 'ejemplo', 'error_comun', 'conexion_cotidiana']
const PATRON_MATH = /\$\$[^$]+?\$\$|\$[^$]+?\$/g
// σd/Dₙd/Cₙd (subíndice "d" no existe en Unicode, salto de tamaño real) y
// cualquier letra con acento circunflejo combinante U+0302 (Ĉ, Ŝ, Ê, el
// "sombrero" de operador) — ambos casos deben ir siempre en LaTeX.
const PATRON_SIMBOLO_PROHIBIDO = /σd|Dₙd|Cₙd|̂/u

let errores = 0
const ids = new Set()
const longitudes = []

for (const t of tarjetas) {
  // 1. id duplicado
  if (ids.has(t.id)) {
    console.log('FAIL id duplicado:', t.id)
    errores++
  }
  ids.add(t.id)

  // 2. longitud total de campos de texto
  const textoCompleto = CAMPOS_TEXTO.map((c) => t[c] ?? '').join(' ')
  const longitud = textoCompleto.length
  longitudes.push({ id: t.id, longitud })
  if (longitud < 700 || longitud > 1700) {
    console.log(`FAIL longitud fuera de rango (${longitud} car.):`, t.id)
    errores++
  }

  // 3. símbolo prohibido en Unicode plano fuera de $...$ (se remueven los
  // spans de math antes de buscar, para no marcar falsos positivos dentro
  // de LaTeX legítimo)
  for (const campo of CAMPOS_TEXTO) {
    const valor = t[campo]
    if (!valor) continue
    const sinMath = valor.replace(PATRON_MATH, '')
    const hallazgo = sinMath.match(PATRON_SIMBOLO_PROHIBIDO)
    if (hallazgo) {
      console.log(`FAIL símbolo prohibido en Unicode plano ("${hallazgo[0]}") en ${t.id}.${campo}`)
      errores++
    }
  }

  // 4. cada $...$/$$...$$ de todos los campos + formula_latex compila en KaTeX
  const todosLosCampos = [...CAMPOS_TEXTO, 'formula_latex']
  for (const campo of todosLosCampos) {
    const valor = t[campo]
    if (!valor) continue
    const spans = campo === 'formula_latex' ? [`$${valor}$`] : (valor.match(PATRON_MATH) ?? [])
    for (const span of spans) {
      const tex = span.startsWith('$$') ? span.slice(2, -2) : span.slice(1, -1)
      try {
        katex.renderToString(tex, { throwOnError: true })
      } catch (e) {
        console.log(`FAIL KaTeX no compila en ${t.id}.${campo}: "${tex}" -> ${e.message}`)
        errores++
      }
    }
  }
}

// 5. prereqs: referencias existentes + sin ciclos (DFS)
const porId = Object.fromEntries(tarjetas.map((t) => [t.id, t]))
for (const t of tarjetas) {
  for (const p of t.prereqs ?? []) {
    if (!porId[p]) {
      console.log(`FAIL prereq roto: ${t.id} referencia "${p}", que no existe`)
      errores++
    }
  }
}
function tieneCiclo(id, visitados = new Set(), enPila = new Set()) {
  if (enPila.has(id)) return true
  if (visitados.has(id)) return false
  visitados.add(id)
  enPila.add(id)
  for (const p of porId[id]?.prereqs ?? []) {
    if (porId[p] && tieneCiclo(p, visitados, enPila)) return true
  }
  enPila.delete(id)
  return false
}
for (const t of tarjetas) {
  if (tieneCiclo(t.id)) {
    console.log('FAIL ciclo de prereqs detectado en:', t.id)
    errores++
  }
}

const promedio = Math.round(longitudes.reduce((s, l) => s + l.longitud, 0) / longitudes.length)
const max = Math.max(...longitudes.map((l) => l.longitud))
const min = Math.min(...longitudes.map((l) => l.longitud))

console.log(`\n${tarjetas.length} tarjetas, longitud promedio ${promedio} car. (min ${min}, max ${max})`)

// ===========================================================================
// Rulebook "Reglas en contexto" — src/data/inorganica/iq_reglas.json
// (feature transversal, piloto Inorgánica; ver BITACORA.md §"Reglas en
// contexto"). Cada fórmula/celda compila en KaTeX, ningún símbolo prohibido
// suelto, esquema consistente.
// ===========================================================================
const RUTA_REGLAS = new URL('../src/data/inorganica/iq_reglas.json', import.meta.url)
const reglas = JSON.parse(readFileSync(RUTA_REGLAS, 'utf-8'))
const TIPOS_REGLA = new Set(['regla', 'ley', 'corolario', 'teorema', 'norma', 'principio', 'definicion'])
const VARIANTES_REGLA = new Set(['corta', 'desarrollo'])
const idsRegla = new Set()
let erroresReglas = 0

function compilaKatex(tex, ctx) {
  try {
    katex.renderToString(tex, { throwOnError: true })
  } catch (e) {
    console.log(`FAIL KaTeX no compila en ${ctx}: "${tex}" -> ${e.message}`)
    return false
  }
  return true
}
function revisarSpansMath(valor, ctx) {
  for (const span of valor.match(PATRON_MATH) ?? []) {
    const tex = span.startsWith('$$') ? span.slice(2, -2) : span.slice(1, -1)
    if (!compilaKatex(tex, ctx)) erroresReglas++
  }
  const sinMath = valor.replace(PATRON_MATH, '')
  const prohibido = sinMath.match(PATRON_SIMBOLO_PROHIBIDO)
  if (prohibido) {
    console.log(`FAIL símbolo prohibido en Unicode plano ("${prohibido[0]}") en ${ctx}`)
    erroresReglas++
  }
}

for (const r of reglas) {
  if (idsRegla.has(r.id)) {
    console.log('FAIL id de regla duplicado:', r.id)
    erroresReglas++
  }
  idsRegla.add(r.id)
  if (!/^IQ-R-[a-z0-9-]+$/.test(r.id)) {
    console.log(`FAIL id de regla mal formado (esperado IQ-R-<slug>): ${r.id}`)
    erroresReglas++
  }
  if (!TIPOS_REGLA.has(r.tipo)) {
    console.log(`FAIL tipo de regla desconocido ("${r.tipo}") en ${r.id}`)
    erroresReglas++
  }
  if (!VARIANTES_REGLA.has(r.variante)) {
    console.log(`FAIL variante de regla desconocida ("${r.variante}") en ${r.id}`)
    erroresReglas++
  }
  if (!r.titulo || !r.cuerpo) {
    console.log(`FAIL regla sin titulo/cuerpo: ${r.id}`)
    erroresReglas++
  }
  if (r.variante === 'desarrollo' && !r.formula && !r.tabla) {
    console.log(`FAIL variante "desarrollo" sin formula ni tabla: ${r.id}`)
    erroresReglas++
  }
  for (const campo of ['titulo', 'cuerpo', 'ejemplo']) {
    if (r[campo]) revisarSpansMath(r[campo], `${r.id}.${campo}`)
  }
  if (r.formula && !compilaKatex(r.formula, `${r.id}.formula`)) erroresReglas++
  if (r.tabla) {
    for (const [i, celda] of (r.tabla.encabezados ?? []).entries()) {
      revisarSpansMath(String(celda), `${r.id}.tabla.encabezados[${i}]`)
    }
    for (const [i, fila] of (r.tabla.filas ?? []).entries()) {
      for (const [j, celda] of fila.entries()) {
        revisarSpansMath(String(celda), `${r.id}.tabla.filas[${i}][${j}]`)
      }
    }
  }
}
console.log(`\n${reglas.length} reglas en el rulebook`)

// Referencias [[id-regla]] dentro de las tarjetas de concepto: cada token
// tiene que resolver a una regla del rulebook. El texto visible del token
// puede traer `$...$` (TextoConReglas lo renderiza con KaTeX, igual que
// cualquier otro fragmento) y sus spans ya se validan en el bloque de
// KaTeX de arriba junto con el resto del campo.
const PATRON_TOKEN_TARJETA = /\[\[([^\]|]+?)(?:\|([^\]]*?))?\]\]/g
for (const t of tarjetas) {
  for (const campo of CAMPOS_TEXTO) {
    const valor = t[campo]
    if (!valor) continue
    for (const m of valor.matchAll(PATRON_TOKEN_TARJETA)) {
      const id = m[1].trim()
      if (!idsRegla.has(id)) {
        console.log(`FAIL ${t.id}.${campo}: [[${id}]] no existe en iq_reglas.json`)
        erroresReglas++
      }
    }
  }
}

// ===========================================================================
// Banco de Quiz Rápido — src/data/inorganica/iq_quiz_rapido.json
// Referencias [[id-regla]] resueltas, disparadores solo en enunciado/
// explicación (nunca en opciones), tarjetaId real, y rúbrica mcq
// (posición de la correcta variada, longitudes equilibradas por ítem,
// la correcta no es la más larga en más de la mitad del lote).
// ===========================================================================
const RUTA_QUIZ = new URL('../src/data/inorganica/iq_quiz_rapido.json', import.meta.url)
const quiz = JSON.parse(readFileSync(RUTA_QUIZ, 'utf-8'))
const PATRON_TOKEN = /\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]/g
let erroresQuiz = 0

function refsDeReglas(texto) {
  const ids = []
  for (const m of String(texto ?? '').matchAll(PATRON_TOKEN)) ids.push(m[1].trim())
  return ids
}
// aproxima el ancho visual: cada $...$ colapsa a ~4 caracteres, para que
// la comparación de longitud no la dominen los comandos LaTeX crudos
function anchoVisual(texto) {
  return String(texto).replace(PATRON_MATH, '____').length
}

const posiciones = []
let correctaMasLarga = 0
for (const it of quiz) {
  if (it.formato !== 'mcq') continue
  // referencias de reglas
  for (const campo of ['enunciado', 'explicacion']) {
    for (const id of refsDeReglas(it[campo])) {
      if (!idsRegla.has(id)) {
        console.log(`FAIL ${it.id}.${campo}: [[${id}]] no existe en iq_reglas.json`)
        erroresQuiz++
      }
    }
  }
  for (const [i, op] of it.opciones.entries()) {
    if (refsDeReglas(op).length || /\[\[/.test(op)) {
      console.log(`FAIL ${it.id}.opciones[${i}]: un disparador [[...]] en una opción daría pistas`)
      erroresQuiz++
    }
  }
  // tarjetaId real
  if (it.tarjetaId && !porId[it.tarjetaId]) {
    console.log(`FAIL ${it.id}: tarjetaId "${it.tarjetaId}" no existe en el mazo`)
    erroresQuiz++
  }
  // KaTeX de enunciado/opciones/explicación
  for (const campo of ['enunciado', 'explicacion']) revisarSpansMathQuiz(it[campo], `${it.id}.${campo}`)
  it.opciones.forEach((op, i) => revisarSpansMathQuiz(op, `${it.id}.opciones[${i}]`))
  // rúbrica mcq
  posiciones.push(it.correcta)
  const anchos = it.opciones.map(anchoVisual)
  const ratio = Math.min(...anchos) / Math.max(...anchos)
  if (ratio < 0.55) {
    console.log(`FAIL ${it.id}: opciones desbalanceadas (ratio ancho ${ratio.toFixed(2)} < 0.55)`)
    erroresQuiz++
  }
  if (anchos[it.correcta] === Math.max(...anchos)) correctaMasLarga++
}
function revisarSpansMathQuiz(valor, ctx) {
  for (const span of String(valor ?? '').match(PATRON_MATH) ?? []) {
    const tex = span.startsWith('$$') ? span.slice(2, -2) : span.slice(1, -1)
    if (!compilaKatex(tex, ctx)) erroresQuiz++
  }
}
const mcq = quiz.filter((q) => q.formato === 'mcq')
const conteoPos = posiciones.reduce((m, p) => ((m[p] = (m[p] ?? 0) + 1), m), {})
const posDistintas = Object.keys(conteoPos).length
const posMax = Math.max(...Object.values(conteoPos))
if (mcq.length >= 4 && (posDistintas < 3 || posMax > Math.ceil(mcq.length / 2))) {
  console.log(`FAIL posición de la correcta poco variada: ${JSON.stringify(conteoPos)}`)
  erroresQuiz++
}
if (correctaMasLarga > Math.ceil(mcq.length / 2)) {
  console.log(`FAIL la correcta es la opción más larga en ${correctaMasLarga}/${mcq.length} ítems (> mitad)`)
  erroresQuiz++
}
console.log(
  `\n${mcq.length} ítems mcq de Quiz Rápido · posiciones ${JSON.stringify(conteoPos)} · correcta-más-larga ${correctaMasLarga}/${mcq.length}`,
)

// ===========================================================================
// Casos de "Lápiz y papel" — src/data/inorganica/iq_tg_lapiz_papel.json
// (ver PracticarLapizPapel.jsx). Exactamente una opción correcta por caso,
// campos obligatorios presentes, cada $...$ compila en KaTeX, y las
// referencias [[IQ-R-...]] resuelven — solo en prosa post-revelado, nunca
// en las opciones de fase 1 (un disparador ahí daría pista del enfoque).
// ===========================================================================
const RUTA_LP = new URL('../src/data/inorganica/iq_tg_lapiz_papel.json', import.meta.url)
const casos = JSON.parse(readFileSync(RUTA_LP, 'utf-8'))
const CAMPOS_LP = ['enunciado', 'promptFase1', 'labelHerramienta', 'porQue', 'enfoqueCorto', 'respuesta', 'desarrollo']
let erroresLP = 0
let refsLP = 0
for (const c of casos) {
  for (const campo of CAMPOS_LP) {
    if (!c[campo]) {
      console.log(`FAIL ${c.id}: falta el campo obligatorio "${campo}"`)
      erroresLP++
      continue
    }
    revisarSpansMathQuiz(c[campo], `${c.id}.${campo}`)
    for (const id of refsDeReglas(c[campo])) {
      if (!idsRegla.has(id)) {
        console.log(`FAIL ${c.id}.${campo}: [[${id}]] no existe en iq_reglas.json`)
        erroresLP++
      } else refsLP++
    }
  }
  if (c.formula && !compilaKatex(c.formula, `${c.id}.formula`)) erroresLP++
  const correctas = (c.opciones ?? []).filter((o) => o.correcta).length
  if (correctas !== 1) {
    console.log(`FAIL ${c.id}: tiene ${correctas} opciones marcadas correcta (debe ser exactamente 1)`)
    erroresLP++
  }
  ;(c.opciones ?? []).forEach((o, i) => {
    revisarSpansMathQuiz(o.texto, `${c.id}.opciones[${i}]`)
    if (/\[\[/.test(o.texto ?? '')) {
      console.log(`FAIL ${c.id}.opciones[${i}]: un disparador [[...]] en una opción de fase 1 daría pista`)
      erroresLP++
    }
  })
  if (!c.promptFase1) {
    console.log(`FAIL ${c.id}: sin promptFase1, el loader no lo enruta a lapizPapel`)
    erroresLP++
  }
}
console.log(`\n${casos.length} casos de Lápiz y papel · ${refsLP} referencias [[IQ-R-...]] resueltas`)

errores += erroresReglas + erroresQuiz + erroresLP
console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es) encontrados`)
process.exit(errores === 0 ? 0 : 1)
