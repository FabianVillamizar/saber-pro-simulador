// Verificación de integridad y de la rúbrica mcq (feedback_mcq_guessable_bias)
// para src/data/frances/fr_quiz_rapido.json. El banco de francés no venía
// con ningún chequeo automático; con 100+ ítems y tres clases-tema ya hace
// falta uno que cuide el sesgo de posición / longitud de la correcta y que
// cada ítem tenga los campos que su `formato` necesita para renderizar en
// QuizRapido.jsx.
import { readFileSync } from 'node:fs'

const RUTA = new URL('../src/data/frances/fr_quiz_rapido.json', import.meta.url)
const items = JSON.parse(readFileSync(RUTA, 'utf-8'))

let errores = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => console.log('AVISO', msg)

// ---- 1. IDs: únicos y con el patrón FR-QR-NNN ----
const ids = new Set()
for (const it of items) {
  if (typeof it.id !== 'string' || !/^FR-QR-\d{3}$/.test(it.id)) fail(`id fuera de patrón: ${JSON.stringify(it.id)}`)
  if (ids.has(it.id)) fail(`id duplicado: ${it.id}`)
  ids.add(it.id)
}

// ---- 2. Campos obligatorios por formato ----
// `noVacio`: tiene que estar y traer contenido. `presente`: la clave debe
// existir pero puede ser "" (el hueco de un fill al final de la frase deja
// `despues` vacío) o [] (un fill sin variantes aceptadas).
const CAMPOS = {
  mcq: { noVacio: ['categoria', 'enunciado', 'explicacion'], presente: ['opciones', 'correcta'] },
  fill: { noVacio: ['categoria', 'enunciado', 'respuesta', 'explicacion'], presente: ['antes', 'despues', 'alternativas'] },
  build: { noVacio: ['categoria', 'enunciado', 'explicacion'], presente: ['fragmentos'] },
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
  if (it.formato === 'fill') {
    if (!Array.isArray(it.alternativas)) fail(`${it.id}: "alternativas" debe ser un arreglo`)
    if (typeof it.respuesta !== 'string' || it.respuesta.trim() === '') fail(`${it.id}: "respuesta" vacía`)
  }
  if (it.formato === 'build') {
    if (!Array.isArray(it.fragmentos) || it.fragmentos.length < 2) {
      fail(`${it.id}: build necesita al menos 2 fragmentos (tiene ${it.fragmentos?.length})`)
    }
  }
}

// ---- 3. Reparto por formato y por clase-tema ----
const cuenta = (fn) => items.reduce((m, it) => ((m[fn(it)] = (m[fn(it)] || 0) + 1), m), {})
const porFormato = cuenta((it) => it.formato)
const porCategoria = cuenta((it) => it.categoria)
console.log(`\n${items.length} ítems · ${Object.entries(porFormato).map(([k, v]) => `${v} ${k}`).join(', ')}`)
console.log('Por clase-tema:', porCategoria)

// ---- 4. Rúbrica mcq: sesgo de posición y de longitud de la correcta ----
const mcq = items.filter((i) => i.formato === 'mcq')

const posiciones = { 0: 0, 1: 0, 2: 0, 3: 0 }
mcq.forEach((i) => posiciones[i.correcta]++)
console.log('Posiciones de la correcta:', posiciones)
for (const [p, n] of Object.entries(posiciones)) {
  const pct = (100 * n) / mcq.length
  if (pct < 15 || pct > 35) aviso(`la correcta cae en la posición ${p} el ${pct.toFixed(0)}% de las veces (ideal ~25%)`)
}

// El ratio de longitud par-a-par no dice mucho en un quiz de vocabulario
// (una opción es "tiendas" y otra "una gran variedad de esas cosas" sin que
// eso sea un tell), así que se mide el sesgo agregado: con qué frecuencia
// la correcta es, a la vez, la más larga y la más corta del ítem.
let correctaMasLarga = 0
let correctaMasCorta = 0
for (const it of mcq) {
  const lens = it.opciones.map((o) => o.length)
  if (it.opciones[it.correcta].length === Math.max(...lens)) correctaMasLarga++
  if (it.opciones[it.correcta].length === Math.min(...lens)) correctaMasCorta++
}
const pctMasLarga = Math.round((100 * correctaMasLarga) / mcq.length)
const pctMasCorta = Math.round((100 * correctaMasCorta) / mcq.length)
console.log(`Correcta es la más larga en ${correctaMasLarga}/${mcq.length} ítems (${pctMasLarga}%), la más corta en ${correctaMasCorta}/${mcq.length} (${pctMasCorta}%)`)
if (pctMasLarga > 55) {
  fail(`la correcta es la más larga en ${pctMasLarga}% de los mcq (umbral 55%): es un tell aunque la posición esté repartida`)
}
if (pctMasCorta > 55) {
  fail(`la correcta es la más corta en ${pctMasCorta}% de los mcq (umbral 55%): también es un tell`)
}

console.log(errores === 0 ? '\nOK — 0 errores' : `\n${errores} error(es)`)
process.exit(errores === 0 ? 0 : 1)
