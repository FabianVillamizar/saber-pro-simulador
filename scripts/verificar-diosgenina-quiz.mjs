// Verificación de contenido para el módulo Diosgenina:
//   - rulebook "Reglas en contexto" (src/data/diosgenina/dio_reglas.json):
//     esquema, KaTeX de cada $...$/formula/celda con throwOnError, sin
//     raya larga (—) en la prosa, ids únicos y bien formados.
//   - Quiz Rápido (dio_quiz_rapido.json): cada [[id]] de enunciado/
//     explicación/antes/despues resuelve contra el rulebook, CERO [[...]]
//     en opciones/fragmentos/respuesta/alternativas (un disparador ahí da
//     pistas), tarjetaId real, KaTeX de los campos de texto, y la rúbrica
//     de guessability sobre TODO el lote mcq (posición de la correcta
//     repartida, ancho de opciones equilibrado, la correcta no es la más
//     larga en más de la mitad de los ítems) — ver feedback_mcq_guessable_bias.
//   - Referencias [[id]] en las tarjetas de concepto de los 9 mazos.
//   - Casos de Lápiz y papel (dio_lapiz_papel.json), si el archivo existe.
import { readFileSync, existsSync } from 'node:fs'
import katex from 'katex'

const D = new URL('../src/data/diosgenina/', import.meta.url)
const leer = (nombre) => JSON.parse(readFileSync(new URL(nombre, D), 'utf-8'))

const MATH = /\$\$[^$]+?\$\$|\$[^$]+?\$/g
const TOKEN = /\[\[([^\]|]+?)(?:\|[^\]]*?)?\]\]/g
let errores = 0

function compilaKatex(tex, ctx) {
  try {
    katex.renderToString(tex, { throwOnError: true })
    return true
  } catch (e) {
    console.log(`FAIL KaTeX no compila en ${ctx}: "${tex}" -> ${e.message.split('\n')[0]}`)
    return false
  }
}
function revisarMath(valor, ctx) {
  for (const span of String(valor ?? '').match(MATH) ?? []) {
    const tex = span.startsWith('$$') ? span.slice(2, -2) : span.slice(1, -1)
    if (!compilaKatex(tex, ctx)) errores++
  }
}
function refs(texto) {
  const out = []
  for (const m of String(texto ?? '').matchAll(TOKEN)) out.push(m[1].trim())
  return out
}
// ancho visual aproximado: cada $...$ colapsa a ~4 caracteres para que el
// LaTeX crudo no domine la comparación de longitud entre opciones.
const anchoVisual = (t) => String(t).replace(MATH, '____').length

// ===========================================================================
// 1. Rulebook — dio_reglas.json
// ===========================================================================
const reglas = leer('dio_reglas.json')
const TIPOS = new Set(['regla', 'ley', 'corolario', 'teorema', 'norma', 'principio', 'definicion'])
const VARIANTES = new Set(['corta', 'desarrollo'])
const idsRegla = new Set()

for (const r of reglas) {
  if (idsRegla.has(r.id)) {
    console.log('FAIL id de regla duplicado:', r.id)
    errores++
  }
  idsRegla.add(r.id)
  if (!/^DG-R-[a-z0-9-]+$/.test(r.id)) {
    console.log(`FAIL id de regla mal formado (esperado DG-R-<slug>): ${r.id}`)
    errores++
  }
  if (!TIPOS.has(r.tipo)) {
    console.log(`FAIL tipo de regla desconocido ("${r.tipo}") en ${r.id}`)
    errores++
  }
  if (!VARIANTES.has(r.variante)) {
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
  for (const campo of ['titulo', 'cuerpo', 'ejemplo']) {
    if (r[campo]) revisarMath(r[campo], `${r.id}.${campo}`)
    if (r[campo] && String(r[campo]).includes('—')) {
      console.log(`FAIL raya larga (—) en ${r.id}.${campo} — usar coma o punto (feedback_writing_style_dashes_parens)`)
      errores++
    }
  }
  if (r.formula && !compilaKatex(r.formula, `${r.id}.formula`)) errores++
  if (r.tabla) {
    for (const [i, celda] of (r.tabla.encabezados ?? []).entries()) revisarMath(String(celda), `${r.id}.tabla.encabezados[${i}]`)
    for (const [i, fila] of (r.tabla.filas ?? []).entries())
      for (const [j, celda] of fila.entries()) revisarMath(String(celda), `${r.id}.tabla.filas[${i}][${j}]`)
  }
}
console.log(`${reglas.length} reglas en el rulebook · tipos ${JSON.stringify(
  reglas.reduce((m, r) => ((m[r.tipo] = (m[r.tipo] ?? 0) + 1), m), {}),
)}`)

// ===========================================================================
// 2. Tarjetas de concepto — referencias [[id]] resueltas
// ===========================================================================
const MAZOS = ['fqt', 'hid', 'ell', 'ser', 'tlc', 'esp', 'hpl', 'pft', 'est']
const CAMPOS_TARJETA = ['pregunta', 'respuesta', 'regla', 'ejemplo', 'error_comun', 'conexion_cotidiana']
const idsTarjeta = new Set()
let refsTarjeta = 0
for (const m of MAZOS) {
  for (const t of leer(`dio_${m}.json`)) {
    idsTarjeta.add(t.id)
    for (const campo of CAMPOS_TARJETA) {
      for (const id of refs(t[campo])) {
        if (!idsRegla.has(id)) {
          console.log(`FAIL ${t.id}.${campo}: [[${id}]] no existe en dio_reglas.json`)
          errores++
        } else refsTarjeta++
      }
    }
  }
}
console.log(`${idsTarjeta.size} tarjetas de concepto · ${refsTarjeta} referencias [[DG-R-...]] resueltas`)

// ===========================================================================
// 3. Quiz Rápido — dio_quiz_rapido.json
// ===========================================================================
const quiz = leer('dio_quiz_rapido.json')
const CAMPOS_CONTEXTO = ['enunciado', 'explicacion', 'antes', 'despues']
const CAMPOS_SIN_TOKEN = ['opciones', 'fragmentos', 'respuesta', 'alternativas', 'izq', 'der']
const posiciones = []
let correctaMasLarga = 0
let correctaMasCorta = 0
let rankLongitudSuma = 0
let refsQuiz = 0

for (const it of quiz) {
  // referencias de reglas solo en campos de contexto
  for (const campo of CAMPOS_CONTEXTO) {
    for (const id of refs(it[campo])) {
      if (!idsRegla.has(id)) {
        console.log(`FAIL ${it.id}.${campo}: [[${id}]] no existe en dio_reglas.json`)
        errores++
      } else refsQuiz++
    }
    revisarMath(it[campo], `${it.id}.${campo}`)
  }
  // ningún disparador en campos de opción/respuesta
  for (const campo of CAMPOS_SIN_TOKEN) {
    const v = it[campo]
    if (v == null) continue
    const partes = Array.isArray(v) ? v : [v]
    partes.forEach((p, i) => {
      if (/\[\[/.test(String(p))) {
        console.log(`FAIL ${it.id}.${campo}[${i}]: un disparador [[...]] aquí daría pistas antes de responder`)
        errores++
      }
      revisarMath(p, `${it.id}.${campo}[${i}]`)
    })
  }
  // tarjetaId real
  if (it.tarjetaId && !idsTarjeta.has(it.tarjetaId)) {
    console.log(`FAIL ${it.id}: tarjetaId "${it.tarjetaId}" no existe en ningún mazo`)
    errores++
  }
  // estructura de `match`: izq/der del mismo largo, `pares` mapea cada índice de izq a un índice válido de der
  if (it.formato === 'match') {
    const nI = Array.isArray(it.izq) ? it.izq.length : 0
    const nD = Array.isArray(it.der) ? it.der.length : 0
    if (nI < 2 || nI !== nD) {
      console.log(`FAIL ${it.id}: match mal formado (izq ${nI}, der ${nD})`)
      errores++
    }
    const claves = Object.keys(it.pares ?? {})
    if (claves.length !== nI) {
      console.log(`FAIL ${it.id}: match.pares cubre ${claves.length} de ${nI} filas`)
      errores++
    }
    for (const [k, v] of Object.entries(it.pares ?? {})) {
      if (+k < 0 || +k >= nI || +v < 0 || +v >= nD) {
        console.log(`FAIL ${it.id}: match.pares["${k}"] = ${v} fuera de rango`)
        errores++
      }
    }
    // el motor baraja `der` al render, pero la fuente no debe escribirse con
    // el mapeo identidad {0:0,1:1,...}: obliga a pensar el emparejamiento y
    // deja el JSON legible sin que parezca ya resuelto en orden.
    if (nI >= 2 && Object.entries(it.pares ?? {}).every(([k, v]) => +k === +v)) {
      console.log(`FAIL ${it.id}: match.pares es el mapeo identidad — baraja la columna der en la fuente`)
      errores++
    }
  }
  // rúbrica mcq
  if (it.formato === 'mcq') {
    if (!Array.isArray(it.opciones) || it.opciones.length < 2 || typeof it.correcta !== 'number') {
      console.log(`FAIL ${it.id}: mcq mal formado (opciones/correcta)`)
      errores++
      continue
    }
    posiciones.push(it.correcta)
    const anchos = it.opciones.map(anchoVisual)
    const ratio = Math.min(...anchos) / Math.max(...anchos)
    if (ratio < 0.55) {
      console.log(`FAIL ${it.id}: opciones desbalanceadas (ratio ancho ${ratio.toFixed(2)} < 0.55)`)
      errores++
    }
    const maxAncho = Math.max(...anchos)
    const minAncho = Math.min(...anchos)
    const segundo = [...anchos].sort((a, b) => b - a)[1]
    // tope de margen por ítem: la correcta no puede sacarle más de 8 car.
    // visuales a la siguiente opción — un margen mayor la delata sola aunque
    // el lote completo salga equilibrado.
    if (anchos[it.correcta] === maxAncho && anchos[it.correcta] - segundo > 8) {
      console.log(
        `FAIL ${it.id}: la correcta es la más larga por ${anchos[it.correcta] - segundo} car. (> 8) — recórtala o alarga un distractor`,
      )
      errores++
    }
    if (anchos[it.correcta] === maxAncho) correctaMasLarga++
    if (anchos[it.correcta] === minAncho) correctaMasCorta++
    rankLongitudSuma += anchos.filter((a) => a < anchos[it.correcta]).length
  }
}

const mcq = quiz.filter((q) => q.formato === 'mcq')
const conteoPos = posiciones.reduce((m, p) => ((m[p] = (m[p] ?? 0) + 1), m), {})
const posDistintas = Object.keys(conteoPos).length
const posMax = Math.max(...Object.values(conteoPos))
if (mcq.length >= 4 && (posDistintas < 3 || posMax > Math.ceil(mcq.length / 2))) {
  console.log(`FAIL posición de la correcta poco variada: ${JSON.stringify(conteoPos)}`)
  errores++
}
if (correctaMasLarga > Math.ceil(mcq.length / 2)) {
  console.log(`FAIL la correcta es la opción más larga en ${correctaMasLarga}/${mcq.length} ítems (> mitad)`)
  errores++
}
// asimetría corta/larga: si la correcta casi nunca es la más corta, eliminar
// la opción más corta la delata aunque "más larga ≤ mitad" pase. Se exige un
// piso de ~1/8 del lote (y, por simetría, que tampoco sea corta en exceso).
const pisoCorta = Math.floor(mcq.length / 8)
if (mcq.length >= 16 && correctaMasCorta < pisoCorta) {
  console.log(
    `FAIL la correcta es la más corta en solo ${correctaMasCorta}/${mcq.length} ítems (< ${pisoCorta}) — eliminar la más corta la delata`,
  )
  errores++
}
if (correctaMasCorta > Math.ceil(mcq.length / 2)) {
  console.log(`FAIL la correcta es la opción más corta en ${correctaMasCorta}/${mcq.length} ítems (> mitad)`)
  errores++
}
// rank de longitud promedio de la correcta (0 = siempre la más corta,
// 3 = siempre la más larga en un ítem de 4). Neutro ≈ 1.5; fuera de
// [1.15, 1.85] hay un sesgo sistemático de longitud en el lote.
const rankProm = rankLongitudSuma / Math.max(mcq.length, 1)
if (mcq.length >= 16 && (rankProm < 1.15 || rankProm > 1.85)) {
  console.log(`FAIL rank de longitud promedio de la correcta ${rankProm.toFixed(2)} (fuera de 1.15-1.85)`)
  errores++
}
console.log(
  `${quiz.length} ítems de Quiz Rápido (${mcq.length} mcq) · ${refsQuiz} refs [[DG-R-...]] · ` +
    `posiciones ${JSON.stringify(conteoPos)} · correcta-más-larga ${correctaMasLarga}/${mcq.length} · ` +
    `correcta-más-corta ${correctaMasCorta}/${mcq.length} · rank-long ${rankProm.toFixed(2)}`,
)

// ===========================================================================
// 4. Lápiz y papel — dio_lapiz_papel.json (opcional, aún no existe)
// ===========================================================================
const rutaLP = new URL('dio_lapiz_papel.json', D)
if (existsSync(rutaLP)) {
  const casos = JSON.parse(readFileSync(rutaLP, 'utf-8'))
  const CAMPOS_LP_PROSA = ['labelHerramienta', 'porQue', 'enfoqueCorto', 'respuesta', 'desarrollo', 'notaAtajo']
  const CAMPOS_LP_FASE1 = ['enunciado', 'promptFase1']
  let refsLP = 0
  for (const c of casos) {
    for (const campo of [...CAMPOS_LP_PROSA, ...CAMPOS_LP_FASE1]) {
      if (!c[campo]) continue
      revisarMath(c[campo], `${c.id}.${campo}`)
      for (const id of refs(c[campo])) {
        if (!idsRegla.has(id)) {
          console.log(`FAIL ${c.id}.${campo}: [[${id}]] no existe en dio_reglas.json`)
          errores++
        } else refsLP++
      }
    }
    for (const campo of CAMPOS_LP_FASE1) {
      if (c[campo] && /\[\[/.test(String(c[campo]))) {
        console.log(`FAIL ${c.id}.${campo}: un disparador [[...]] en fase 1 daría pista del enfoque`)
        errores++
      }
    }
    const correctas = (c.opciones ?? []).filter((o) => o.correcta).length
    if (correctas !== 1) {
      console.log(`FAIL ${c.id}: ${correctas} opciones marcadas correcta (debe ser exactamente 1)`)
      errores++
    }
    ;(c.opciones ?? []).forEach((o, i) => {
      revisarMath(o.texto, `${c.id}.opciones[${i}]`)
      if (/\[\[/.test(o.texto ?? '')) {
        console.log(`FAIL ${c.id}.opciones[${i}]: un disparador [[...]] en una opción de fase 1 daría pista`)
        errores++
      }
    })
    if (c.formula && !compilaKatex(c.formula, `${c.id}.formula`)) errores++
  }
  console.log(`${casos.length} casos de Lápiz y papel · ${refsLP} referencias [[DG-R-...]] resueltas`)
}

console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es) encontrados`)
process.exit(errores === 0 ? 0 : 1)
