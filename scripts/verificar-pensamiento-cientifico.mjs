// Verificación de Pensamiento Científico: 3 bancos de tarjetas de concepto
// (pc_conceptos_*.json), 5 bancos de ítems de examen (pc_items_*.json,
// formato "grupo + preguntas" con opciones A-D, igual que Lectura Crítica /
// Razonamiento Cuantitativo) y el Quiz Rápido (pc_quiz_rapido.json, solo
// mcq con `correcta` 0-3).
//
// El módulo nació sin verificador. Una auditoría manual (2026-09-05)
// encontró que en el banco del Simulacro la opción correcta era la más
// larga en 87/100 preguntas (0/100 la más corta) — sesgo real y
// explotable, el mismo que ya se había corregido en el Quiz Rápido el
// 2026-08-20 pero nunca en los ítems. Este script deja el chequeo
// reproducible y lo vuelve una condición de fallo.
//
// Correr: `node scripts/verificar-pensamiento-cientifico.mjs`
import { readFileSync } from 'node:fs'

const base = new URL('../src/data/pensamiento-cientifico/', import.meta.url)
const BANCOS_CONCEPTO = ['pc_conceptos_razonamiento', 'pc_conceptos_estadistica_diseño', 'pc_conceptos_quimica']
const BANCOS_ITEMS = [
  'pc_items_adquirir_interpretar',
  'pc_items_analizar_concluir',
  'pc_items_comprender_modelos',
  'pc_items_establecer_estrategias',
  'pc_items_plantear_preguntas',
]
const AFIRMACIONES = new Set([
  'adquirir_interpretar',
  'analizar_concluir',
  'comprender_modelos',
  'establecer_estrategias',
  'plantear_preguntas',
])
const NUCLEOS = new Set(['comun', 'especifico_quimica'])

let errores = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => console.log('AVISO', msg)

const leer = (nombre) => JSON.parse(readFileSync(new URL(`${nombre}.json`, base), 'utf-8'))

// ---------- 1. Tarjetas de concepto ----------
const idsConcepto = new Set()
const conceptos = []
for (const banco of BANCOS_CONCEPTO) {
  const tarjetas = leer(banco)
  for (const t of tarjetas) {
    conceptos.push({ ...t, _banco: banco })
    if (typeof t.id !== 'string' || !/^PC-(RAZ|EST|QUI)-\d{3}$/.test(t.id)) fail(`concepto con id fuera de patrón: ${JSON.stringify(t.id)}`)
    if (idsConcepto.has(t.id)) fail(`concepto con id duplicado: ${t.id}`)
    idsConcepto.add(t.id)
    if (!['pregunta', 'cloze'].includes(t.modo)) fail(`${t.id}: modo debe ser pregunta|cloze (es ${JSON.stringify(t.modo)})`)
    if (t.afirmacion_asociada && !AFIRMACIONES.has(t.afirmacion_asociada)) fail(`${t.id}: afirmacion_asociada desconocida ${JSON.stringify(t.afirmacion_asociada)}`)
    if (t.nucleo && !NUCLEOS.has(t.nucleo)) fail(`${t.id}: nucleo desconocido ${JSON.stringify(t.nucleo)}`)
    const campos = t.modo === 'cloze' ? ['antes', 'despues', 'respuesta', 'regla'] : ['pregunta', 'respuesta', 'regla']
    for (const c of campos) {
      if (typeof t[c] !== 'string' || t[c].trim() === '') fail(`${t.id}: campo "${c}" vacío o ausente`)
    }
  }
}
// prereqs resuelven
for (const t of conceptos) {
  for (const p of t.prereqs ?? []) {
    if (!idsConcepto.has(p)) fail(`${t.id}: prereq "${p}" no corresponde a ninguna tarjeta`)
  }
}
// longitud de prosa (mismo criterio que Diosgenina / LC)
const longitudes = conceptos.map((t) => {
  const campos = ['pregunta', 'antes', 'despues', 'respuesta', 'regla', 'ejemplo', 'error_comun', 'conexion_cotidiana']
  return campos.map((c) => (typeof t[c] === 'string' ? t[c] : '')).join(' ').length
})
const media = Math.round(longitudes.reduce((a, b) => a + b, 0) / longitudes.length)
const maxLen = Math.max(...longitudes)
const sobre1600 = longitudes.filter((l) => l > 1600).length
console.log(`Tarjetas de concepto: ${conceptos.length} · longitud de prosa media ${media} · máx ${maxLen} · ${sobre1600} sobre 1600`)
if (media > 1300) aviso(`la longitud media de tarjeta (${media}) sigue alta — objetivo ~1000-1200 (ver feedback_flashcard_length)`)
if (sobre1600 > 15) aviso(`${sobre1600} tarjetas superan 1600 caracteres de prosa`)

// ---------- 2. Ítems de examen ----------
let totalItems = 0
let masLargaItems = 0
let masCortaItems = 0
const posItems = { A: 0, B: 0, C: 0, D: 0 }
const idsItem = new Set()
for (const banco of BANCOS_ITEMS) {
  const grupos = leer(banco)
  for (const g of grupos) {
    if (!Array.isArray(g.preguntas) || g.preguntas.length === 0) {
      fail(`${banco}/${g.id}: grupo sin preguntas`)
      continue
    }
    if (g.nucleo && !NUCLEOS.has(g.nucleo)) fail(`${g.id}: nucleo desconocido ${JSON.stringify(g.nucleo)}`)
    for (const q of g.preguntas) {
      totalItems++
      if (idsItem.has(q.id)) fail(`id de ítem duplicado: ${q.id}`)
      idsItem.add(q.id)
      if (!AFIRMACIONES.has(q.afirmacion)) fail(`${q.id}: afirmacion desconocida ${JSON.stringify(q.afirmacion)}`)
      const letras = Object.keys(q.opciones ?? {})
      if (letras.length !== 4 || !['A', 'B', 'C', 'D'].every((l) => letras.includes(l))) {
        fail(`${q.id}: opciones debe tener exactamente A-D (tiene ${letras.join(',')})`)
        continue
      }
      for (const [l, txt] of Object.entries(q.opciones)) {
        if (typeof txt !== 'string' || txt.trim() === '') fail(`${q.id}: opción ${l} vacía o no es texto`)
      }
      if (!letras.includes(q.respuesta_correcta)) {
        fail(`${q.id}: respuesta_correcta "${q.respuesta_correcta}" inválida`)
        continue
      }
      // distractores: letras válidas, nunca la correcta, patron_trampa presente
      for (const [l, d] of Object.entries(q.distractores ?? {})) {
        if (l === q.respuesta_correcta) fail(`${q.id}: distractores incluye la letra correcta ${l}`)
        if (!letras.includes(l)) fail(`${q.id}: distractores tiene una letra inexistente ${l}`)
        if (typeof d.explicacion !== 'string' || d.explicacion.trim() === '') fail(`${q.id}: distractor ${l} sin explicacion`)
        if (typeof d.patron_trampa !== 'string' || d.patron_trampa.trim() === '') fail(`${q.id}: distractor ${l} sin patron_trampa`)
      }
      if (typeof q.explicacion_correcta !== 'string' || q.explicacion_correcta.trim() === '') fail(`${q.id}: sin explicacion_correcta`)
      for (const ref of q.tarjetas_teoria_relacionada ?? []) {
        if (!idsConcepto.has(ref)) fail(`${q.id}: tarjeta_teoria_relacionada "${ref}" no existe`)
      }
      // sesgo
      posItems[q.respuesta_correcta]++
      const lens = Object.values(q.opciones).map((v) => v.length)
      const lc = q.opciones[q.respuesta_correcta].length
      if (lc === Math.max(...lens)) masLargaItems++
      if (lc === Math.min(...lens)) masCortaItems++
    }
  }
}
const pLI = Math.round((100 * masLargaItems) / totalItems)
const pCI = Math.round((100 * masCortaItems) / totalItems)
console.log(`\nÍtems de examen: ${totalItems} preguntas`)
console.log(`  posición de la correcta: ${JSON.stringify(posItems)}`)
console.log(`  correcta = más larga: ${masLargaItems}/${totalItems} (${pLI}%) · más corta: ${masCortaItems}/${totalItems} (${pCI}%)`)
if (pLI > 55) fail(`ítems: la correcta es la más larga en ${pLI}% (umbral 55%)`)
if (pCI > 55) fail(`ítems: la correcta es la más corta en ${pCI}% (umbral 55%)`)
if (pLI > 45) aviso(`ítems: la correcta-más-larga sigue por encima del 45% (${pLI}%)`)
const maxPos = Math.max(...Object.values(posItems))
if (maxPos / totalItems > 0.35) aviso(`ítems: la posición ${Object.entries(posItems).find(([, v]) => v === maxPos)[0]} concentra ${Math.round((100 * maxPos) / totalItems)}% de las correctas (esperado ~25%)`)

// ---------- 3. Quiz Rápido ----------
const quiz = leer('pc_quiz_rapido')
let masLargaQ = 0
let masCortaQ = 0
const posQ = { 0: 0, 1: 0, 2: 0, 3: 0 }
const idsQ = new Set()
for (const it of quiz) {
  if (typeof it.id !== 'string' || !/^PC-QR-\d{3}$/.test(it.id)) fail(`quiz: id fuera de patrón ${JSON.stringify(it.id)}`)
  if (idsQ.has(it.id)) fail(`quiz: id duplicado ${it.id}`)
  idsQ.add(it.id)
  if (it.formato !== 'mcq') {
    fail(`${it.id}: formato ${JSON.stringify(it.formato)} (Pensamiento Científico solo usa mcq en el Quiz)`)
    continue
  }
  if (!Array.isArray(it.opciones) || it.opciones.length !== 4) {
    fail(`${it.id}: mcq debe tener 4 opciones`)
    continue
  }
  if (!Number.isInteger(it.correcta) || it.correcta < 0 || it.correcta > 3) fail(`${it.id}: "correcta" fuera de 0-3`)
  if (it.tarjetaId && !idsConcepto.has(it.tarjetaId)) fail(`${it.id}: tarjetaId "${it.tarjetaId}" no existe`)
  if (!AFIRMACIONES.has(it.categoria)) fail(`${it.id}: categoria desconocida ${JSON.stringify(it.categoria)}`)
  posQ[it.correcta]++
  const lens = it.opciones.map((o) => o.length)
  if (it.opciones[it.correcta].length === Math.max(...lens)) masLargaQ++
  if (it.opciones[it.correcta].length === Math.min(...lens)) masCortaQ++
}
const pLQ = Math.round((100 * masLargaQ) / quiz.length)
const pCQ = Math.round((100 * masCortaQ) / quiz.length)
console.log(`\nQuiz Rápido: ${quiz.length} ítems · posición ${JSON.stringify(posQ)}`)
console.log(`  correcta = más larga: ${masLargaQ}/${quiz.length} (${pLQ}%) · más corta: ${masCortaQ}/${quiz.length} (${pCQ}%)`)
if (pLQ > 55) fail(`quiz: la correcta es la más larga en ${pLQ}% (umbral 55%)`)
if (pCQ > 55) fail(`quiz: la correcta es la más corta en ${pCQ}% (umbral 55%)`)
const cuentaCat = quiz.reduce((m, it) => ((m[it.categoria] = (m[it.categoria] || 0) + 1), m), {})
console.log(`  por categoría: ${JSON.stringify(cuentaCat)}`)
for (const af of AFIRMACIONES) {
  if ((cuentaCat[af] ?? 0) < 3) aviso(`quiz: la afirmación "${af}" tiene solo ${cuentaCat[af] ?? 0} ítems`)
}

// ---------- 4. Cobertura del puente ítem -> tarjeta ----------
const usadas = new Set()
for (const banco of BANCOS_ITEMS) {
  for (const g of leer(banco)) {
    for (const q of g.preguntas) for (const r of q.tarjetas_teoria_relacionada ?? []) usadas.add(r)
  }
}
console.log(`\nTarjetas citadas por algún ítem: ${usadas.size}/${idsConcepto.size}`)

console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
