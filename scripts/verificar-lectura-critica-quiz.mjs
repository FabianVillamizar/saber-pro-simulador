// Verificación del banco de Quiz Rápido de Lectura Crítica, de los 5 bancos
// de tarjetas de concepto y del rulebook de "Reglas en contexto"
// (lc_reglas.json). Espejo de verificar-competencias-quiz.mjs: mismos
// chequeos de rulebook/tokens/longitud/sesgo, adaptado a que Lectura
// Crítica solo usa el formato mcq (a diferencia de CC, que tiene 4).
// Correr: `node scripts/verificar-lectura-critica-quiz.mjs`
import { readFileSync } from 'node:fs'

const base = new URL('../src/data/lectura-critica/', import.meta.url)
const items = JSON.parse(readFileSync(new URL('lc_quiz_rapido.json', base), 'utf-8'))
const reglas = JSON.parse(readFileSync(new URL('lc_reglas.json', base), 'utf-8'))
const bancosConceptos = {
  figuras_retoricas: JSON.parse(readFileSync(new URL('lc_fig_figuras_retoricas.json', base), 'utf-8')),
  estrategias_fundamentales: JSON.parse(readFileSync(new URL('lc_fun_estrategias_fundamentales.json', base), 'utf-8')),
  estrategias_discursivas: JSON.parse(readFileSync(new URL('lc_glo_estrategias_discursivas.json', base), 'utf-8')),
  herramientas_evaluacion_critica: JSON.parse(readFileSync(new URL('lc_ref_herramientas_evaluacion_critica.json', base), 'utf-8')),
  cultura_general: JSON.parse(readFileSync(new URL('lc_cul_cultura_general.json', base), 'utf-8')),
}

// Réplica exacta de PATRON_REGLAS en TextoConReglas.jsx: un span de negrita
// se resuelve con match no-codicioso hasta el próximo "**", así que un
// token que caiga DENTRO de ese span queda tragado entero como negrita y
// su `[[...]]` nunca se interpreta.
function tieneTokenAtrapadoEnNegrita(texto) {
  const spans = texto.match(/\*\*.+?\*\*/g) || []
  return spans.some((s) => s.includes('[['))
}

let errores = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => console.log('AVISO', msg)

// ---- 1. rulebook ----
const TIPOS_OK = new Set(['regla', 'definicion'])
const idsRegla = new Set()
for (const r of reglas) {
  if (typeof r.id !== 'string' || !/^LC-R-[a-z0-9-]+$/.test(r.id)) fail(`regla con id fuera de patrón: ${JSON.stringify(r.id)}`)
  if (idsRegla.has(r.id)) fail(`regla con id duplicado: ${r.id}`)
  idsRegla.add(r.id)
  for (const c of ['tipo', 'titulo', 'variante', 'cuerpo']) {
    if (typeof r[c] !== 'string' || r[c].trim() === '') fail(`${r.id}: campo "${c}" vacío o ausente`)
  }
  if (!TIPOS_OK.has(r.tipo)) fail(`${r.id}: tipo desconocido ${JSON.stringify(r.tipo)}`)
  if (!['corta', 'desarrollo'].includes(r.variante)) fail(`${r.id}: variante debe ser corta|desarrollo`)
  for (const c of ['titulo', 'cuerpo', 'ejemplo']) {
    if (typeof r[c] === 'string' && r[c].includes('(')) fail(`${r.id}: "${c}" tiene paréntesis, va contra el estilo de prosa directa del módulo`)
  }
  if (r.tabla) {
    const t = r.tabla
    if (!Array.isArray(t.encabezados) || !Array.isArray(t.filas)) fail(`${r.id}: tabla mal formada`)
    else {
      const cols = t.encabezados.length
      t.filas.forEach((f, i) => {
        if (!Array.isArray(f) || f.length !== cols) fail(`${r.id}: fila ${i} de la tabla no tiene ${cols} celdas`)
      })
    }
  } else if (r.variante === 'desarrollo') {
    fail(`${r.id}: variante "desarrollo" sin tabla (el módulo no usa fórmulas, así que le falta la tabla)`)
  }
}
console.log(`Rulebook: ${reglas.length} reglas (${reglas.filter((r) => r.variante === 'desarrollo').length} con desarrollo)`)

// ---- 2. IDs de ítems del quiz ----
const ids = new Set()
for (const it of items) {
  if (typeof it.id !== 'string' || !/^LC-QR-\d{3}$/.test(it.id)) fail(`id fuera de patrón: ${JSON.stringify(it.id)}`)
  if (ids.has(it.id)) fail(`id duplicado: ${it.id}`)
  ids.add(it.id)
}

// ---- 3. Campos obligatorios (solo mcq en este módulo) ----
for (const it of items) {
  if (it.formato !== 'mcq') {
    fail(`${it.id}: formato desconocido ${JSON.stringify(it.formato)} (Lectura Crítica solo usa mcq)`)
    continue
  }
  for (const c of ['tarjetaId', 'categoria', 'enunciado', 'explicacion']) {
    const v = it[c]
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      fail(`${it.id}: el campo "${c}" está vacío o ausente`)
    }
  }
  if (!Array.isArray(it.opciones) || it.opciones.length !== 4) {
    fail(`${it.id}: mcq debe tener exactamente 4 opciones (tiene ${it.opciones?.length})`)
  } else if (it.opciones.some((o) => typeof o !== 'string' || o.trim() === '')) {
    fail(`${it.id}: alguna opción está vacía o no es texto`)
  }
  if (!Number.isInteger(it.correcta) || it.correcta < 0 || it.correcta > 3) {
    fail(`${it.id}: "correcta" fuera de rango 0-3 (${it.correcta})`)
  }
}

// ---- 4. Tokens de regla: resuelven, y nunca dentro de "opciones" ----
const TOKEN = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g
let itemsConToken = 0
for (const it of items) {
  if (Array.isArray(it.opciones) && it.opciones.some((o) => o.includes('[['))) {
    fail(`${it.id}: hay un token de regla dentro de "opciones" — nunca deben llevar disparador antes de revelar`)
  }
  const campos = [it.enunciado, it.explicacion].filter(Boolean).join('\n')
  const refs = [...campos.matchAll(TOKEN)].map((m) => m[1].trim())
  if (refs.length) itemsConToken++
  for (const ref of refs) {
    if (!idsRegla.has(ref)) fail(`${it.id}: token [[${ref}]] no corresponde a ninguna regla de lc_reglas.json`)
  }
  if (typeof it.explicacion === 'string' && tieneTokenAtrapadoEnNegrita(it.explicacion)) {
    fail(`${it.id}: "explicacion" tiene un token de regla atrapado dentro de un span "**...**" — PATRON_REGLAS lo traga entero como negrita y el token nunca se resuelve`)
  }
}
console.log(`${itemsConToken}/${items.length} ítems de quiz con al menos un token de regla`)

// ---- 5. Tarjetas de concepto: tokens y longitud ----
let totalTarjetas = 0
let tarjetasConToken = 0
const longitudes = []
for (const [banco, tarjetas] of Object.entries(bancosConceptos)) {
  for (const t of tarjetas) {
    totalTarjetas++
    const campos = ['pregunta', 'respuesta_breve', 'explicacion', 'ejemplo_aplicado', 'error_comun']
    const textoCompleto = campos.map((c) => t[c] ?? '').join(' ')
    longitudes.push(textoCompleto.length)
    const refs = [...textoCompleto.matchAll(TOKEN)].map((m) => m[1].trim())
    if (refs.length) tarjetasConToken++
    for (const ref of refs) {
      if (!idsRegla.has(ref)) fail(`${t.id} (${banco}): token [[${ref}]] no corresponde a ninguna regla de lc_reglas.json`)
    }
    for (const c of ['explicacion', 'ejemplo_aplicado', 'error_comun']) {
      if (typeof t[c] === 'string' && tieneTokenAtrapadoEnNegrita(t[c])) {
        fail(`${t.id}: "${c}" tiene un token de regla atrapado dentro de un span "**...**" — PATRON_REGLAS lo traga entero como negrita, ver TextoConReglas.jsx`)
      }
    }
    for (const c of ['pregunta', 'respuesta_breve']) {
      if (typeof t[c] === 'string' && t[c].includes('[[')) {
        fail(`${t.id}: "${c}" lleva un token de regla — solo explicacion/ejemplo_aplicado/error_comun deberían tenerlo`)
      }
    }
  }
}
const idsRuleUsadas = new Set()
for (const tarjetas of Object.values(bancosConceptos)) {
  for (const t of tarjetas) {
    const textoCompleto = ['explicacion', 'ejemplo_aplicado', 'error_comun'].map((c) => t[c] ?? '').join(' ')
    for (const m of textoCompleto.matchAll(TOKEN)) idsRuleUsadas.add(m[1].trim())
  }
}
for (const m of items.map((i) => i.explicacion ?? '').join(' ').matchAll(TOKEN)) idsRuleUsadas.add(m[1].trim())
const sinUsar = reglas.map((r) => r.id).filter((id) => !idsRuleUsadas.has(id))
console.log(`${tarjetasConToken}/${totalTarjetas} tarjetas de concepto con al menos un token de regla`)
if (sinUsar.length) aviso(`reglas sin ningún token que las referencie: ${sinUsar.join(', ')}`)
const media = Math.round(longitudes.reduce((a, b) => a + b, 0) / longitudes.length)
const max = Math.max(...longitudes)
console.log(`Longitud de tarjeta (5 campos de prosa): media ${media} · máx ${max}`)
if (max > 1800) aviso(`hay tarjetas por encima de 1800 caracteres totales (máx ${max})`)

// ---- 6. Prosa directa: paréntesis/rayas en tarjetas y reglas ----
let conParentesis = 0
for (const tarjetas of Object.values(bancosConceptos)) {
  for (const t of tarjetas) {
    const campos = ['explicacion', 'ejemplo_aplicado', 'error_comun'].map((c) => t[c] ?? '').join(' ')
    if (campos.includes('(') || /—/.test(campos)) conParentesis++
  }
}
console.log(`${conParentesis}/${totalTarjetas} tarjetas con paréntesis o raya en explicacion/ejemplo_aplicado/error_comun`)
if (conParentesis / totalTarjetas > 0.2) aviso(`más del 20% de las tarjetas todavía usan paréntesis o raya (${conParentesis}/${totalTarjetas}) — revisar prosa directa`)

// ---- 7. Rúbrica mcq: reparto de posición y sesgo de longitud ----
const mcq = items.filter((i) => i.formato === 'mcq')
if (mcq.length) {
  const pos = { 0: 0, 1: 0, 2: 0, 3: 0 }
  mcq.forEach((i) => pos[i.correcta]++)
  console.log('Posiciones de la correcta (antes del barajado en vivo de QuizRapido.jsx):', pos)
  let masLarga = 0
  let masCorta = 0
  for (const it of mcq) {
    const lens = it.opciones.map((o) => o.length)
    if (it.opciones[it.correcta].length === Math.max(...lens)) masLarga++
    if (it.opciones[it.correcta].length === Math.min(...lens)) masCorta++
  }
  const pL = Math.round((100 * masLarga) / mcq.length)
  const pC = Math.round((100 * masCorta) / mcq.length)
  console.log(`Correcta es la más larga en ${masLarga}/${mcq.length} (${pL}%), la más corta en ${masCorta}/${mcq.length} (${pC}%)`)
  if (pL > 55) fail(`la correcta es la más larga en ${pL}% de los mcq (umbral 55%)`)
  if (pC > 55) fail(`la correcta es la más corta en ${pC}% de los mcq (umbral 55%)`)
}

// ---- 8. Reparto por categoría y formato ----
const cuenta = (fn) => items.reduce((m, it) => ((m[fn(it)] = (m[fn(it)] || 0) + 1), m), {})
console.log(`\n${items.length} ítems · ${Object.entries(cuenta((it) => it.formato)).map(([k, v]) => `${v} ${k}`).join(', ')}`)
console.log('Por categoría:', cuenta((it) => it.categoria))

console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
