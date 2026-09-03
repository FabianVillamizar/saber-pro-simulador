// Verificación del banco de Quiz Rápido de Inglés y del rulebook de
// "Reglas en contexto" (ing_reglas.json). Espejo de verificar-frances-quiz.mjs
// con dos añadidos: valida el rulebook y que cada token [[ing-r-...]] de un
// enunciado / explicación resuelva a una regla existente.
// Correr: `node scripts/verificar-ingles-quiz.mjs`
import { readFileSync } from 'node:fs'

const base = new URL('../src/data/ingles/', import.meta.url)
const items = JSON.parse(readFileSync(new URL('ing_quiz_rapido.json', base), 'utf-8'))
const reglas = JSON.parse(readFileSync(new URL('ing_reglas.json', base), 'utf-8'))

let errores = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => console.log('AVISO', msg)

// ---- 1. rulebook ----
const TIPOS_OK = new Set(['regla', 'principio', 'norma', 'definicion', 'ley', 'corolario', 'teorema'])
const idsRegla = new Set()
for (const r of reglas) {
  if (typeof r.id !== 'string' || !/^ing-r-[a-z-]+$/.test(r.id)) fail(`regla con id fuera de patrón: ${JSON.stringify(r.id)}`)
  if (idsRegla.has(r.id)) fail(`regla con id duplicado: ${r.id}`)
  idsRegla.add(r.id)
  for (const c of ['tipo', 'titulo', 'variante', 'cuerpo']) {
    if (typeof r[c] !== 'string' || r[c].trim() === '') fail(`${r.id}: campo "${c}" vacío o ausente`)
  }
  if (!TIPOS_OK.has(r.tipo)) fail(`${r.id}: tipo desconocido ${JSON.stringify(r.tipo)}`)
  if (!['corta', 'desarrollo'].includes(r.variante)) fail(`${r.id}: variante debe ser corta|desarrollo`)
  for (const c of ['titulo', 'cuerpo', 'ejemplo']) {
    if (typeof r[c] === 'string' && r[c].includes('**')) {
      fail(`${r.id}: "${c}" tiene ** — el popover solo procesa $KaTeX$ en esos campos, no negrita`)
    }
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
  }
}
console.log(`Rulebook: ${reglas.length} reglas (${reglas.filter((r) => r.variante === 'desarrollo').length} con desarrollo)`)

// ---- 2. IDs de ítems ----
const ids = new Set()
for (const it of items) {
  if (typeof it.id !== 'string' || !/^ING-QR-\d{3}$/.test(it.id)) fail(`id fuera de patrón: ${JSON.stringify(it.id)}`)
  if (ids.has(it.id)) fail(`id duplicado: ${it.id}`)
  ids.add(it.id)
}

// ---- 3. Campos obligatorios por formato ----
const CAMPOS = {
  mcq: { noVacio: ['tarjetaId', 'categoria', 'enunciado', 'explicacion'], presente: ['opciones', 'correcta'] },
  fill: { noVacio: ['tarjetaId', 'categoria', 'enunciado', 'respuesta', 'explicacion'], presente: ['antes', 'despues'] },
}
for (const it of items) {
  const req = CAMPOS[it.formato]
  if (!req) {
    fail(`${it.id}: formato desconocido ${JSON.stringify(it.formato)}`)
    continue
  }
  for (const c of req.noVacio) {
    const v = it[c]
    if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
      fail(`${it.id}: el campo "${c}" que ${it.formato} necesita está vacío o ausente`)
    }
  }
  for (const c of req.presente) {
    if (!(c in it)) fail(`${it.id}: falta el campo "${c}" que ${it.formato} necesita`)
  }
  if (it.formato === 'mcq') {
    if (!Array.isArray(it.opciones) || it.opciones.length !== 4) {
      fail(`${it.id}: mcq debe tener exactamente 4 opciones (tiene ${it.opciones?.length})`)
    } else if (it.opciones.some((o) => typeof o !== 'string' || o.trim() === '')) {
      fail(`${it.id}: alguna opción está vacía o no es texto`)
    }
    if (!Number.isInteger(it.correcta) || it.correcta < 0 || it.correcta > 3) {
      fail(`${it.id}: "correcta" fuera de rango 0-3 (${it.correcta})`)
    }
  }
  if (it.formato === 'fill' && (typeof it.respuesta !== 'string' || it.respuesta.trim() === '')) {
    fail(`${it.id}: "respuesta" vacía`)
  }
}

// ---- 4. Tokens de regla: resuelven, y $ / ** en campos que no toca ----
const TOKEN = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g
let itemsConToken = 0
for (const it of items) {
  const campos = [it.enunciado, it.explicacion].filter(Boolean).join('\n')
  const refs = [...campos.matchAll(TOKEN)].map((m) => m[1].trim())
  if (refs.length) itemsConToken++
  for (const ref of refs) {
    if (!idsRegla.has(ref)) fail(`${it.id}: token [[${ref}]] no corresponde a ninguna regla de ing_reglas.json`)
  }
  // $ solo peligroso fuera de explicacion (explicacion sí puede llevar $ si algún día hiciera falta)
  for (const [k, v] of Object.entries(it)) {
    if (k === 'explicacion' || typeof v !== 'string') continue
    if (v.includes('$')) aviso(`${it.id}: "${k}" contiene "$" y ahora pasa por el render de fórmulas`)
  }
}
console.log(`${itemsConToken}/${items.length} ítems con al menos un token de regla`)

// ---- 5. Reparto ----
const cuenta = (fn) => items.reduce((m, it) => ((m[fn(it)] = (m[fn(it)] || 0) + 1), m), {})
console.log(`\n${items.length} ítems · ${Object.entries(cuenta((it) => it.formato)).map(([k, v]) => `${v} ${k}`).join(', ')}`)
console.log('Por categoría:', cuenta((it) => it.categoria))

// ---- 6. Rúbrica mcq ----
const mcq = items.filter((i) => i.formato === 'mcq')
if (mcq.length) {
  const pos = { 0: 0, 1: 0, 2: 0, 3: 0 }
  mcq.forEach((i) => pos[i.correcta]++)
  console.log('Posiciones de la correcta:', pos)
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

console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
