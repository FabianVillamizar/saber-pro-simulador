// Verificación de integridad y de la rúbrica mcq (feedback_mcq_guessable_bias)
// para src/data/frances/fr_quiz_rapido.json, más el rulebook de "Reglas en
// contexto" (fr_reglas.json) que sus tokens [[fr-r-...|texto]] citan. El banco
// ya pasa de 390 ítems en once clases-tema, así que hace falta algo que cuide
// el sesgo de posición / longitud de la correcta, que cada ítem tenga los
// campos que su `formato` necesita para renderizar en QuizRapido.jsx, y que
// ningún token apunte a una regla que no existe.
// Correr: `node scripts/verificar-frances-quiz.mjs`
import { readFileSync } from 'node:fs'

const base = new URL('../src/data/frances/', import.meta.url)
const items = JSON.parse(readFileSync(new URL('fr_quiz_rapido.json', base), 'utf-8'))
const reglas = JSON.parse(readFileSync(new URL('fr_reglas.json', base), 'utf-8'))

let errores = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => console.log('AVISO', msg)

// ---- 0. Rulebook ----
const TIPOS_OK = new Set(['regla', 'principio', 'norma', 'definicion', 'ley', 'corolario', 'teorema'])
const idsRegla = new Set()
for (const r of reglas) {
  if (typeof r.id !== 'string' || !/^fr-r-[a-z0-9-]+$/.test(r.id)) fail(`regla con id fuera de patrón: ${JSON.stringify(r.id)}`)
  if (idsRegla.has(r.id)) fail(`regla con id duplicado: ${r.id}`)
  idsRegla.add(r.id)
  for (const c of ['tipo', 'titulo', 'variante', 'cuerpo']) {
    if (typeof r[c] !== 'string' || r[c].trim() === '') fail(`${r.id}: campo "${c}" vacío o ausente`)
  }
  if (!TIPOS_OK.has(r.tipo)) fail(`${r.id}: tipo desconocido ${JSON.stringify(r.tipo)}`)
  if (!['corta', 'desarrollo'].includes(r.variante)) fail(`${r.id}: variante debe ser corta|desarrollo`)
  for (const c of ['titulo', 'cuerpo', 'ejemplo']) {
    const v = r[c]
    if (typeof v !== 'string') continue
    // El popover pasa estos campos por katexInline(): solo procesa $KaTeX$,
    // no **negrita**, y un $ suelto lo tomaría por una fórmula.
    if (v.includes('**')) fail(`${r.id}: "${c}" tiene ** y el popover no procesa negrita ahí`)
    if (v.includes('$')) fail(`${r.id}: "${c}" tiene $ y el popover lo leería como fórmula`)
    if (/[()—]/.test(v)) fail(`${r.id}: "${c}" tiene paréntesis o raya larga (estilo del proyecto)`)
    // el título sí puede llevar dos puntos ("Verbos en -ger: nous lleva -geons"); el cuerpo y el ejemplo no
    if (c !== 'titulo' && v.includes(':')) fail(`${r.id}: "${c}" tiene dos puntos (estilo del proyecto)`)
  }
  if (r.tabla) {
    const t = r.tabla
    if (!Array.isArray(t.encabezados) || !Array.isArray(t.filas)) fail(`${r.id}: tabla mal formada`)
    else {
      // Con 3 o más columnas el popover (~290 px) hace scroll horizontal.
      if (t.encabezados.length !== 2) fail(`${r.id}: la tabla debe tener 2 columnas (tiene ${t.encabezados.length})`)
      t.filas.forEach((f, i) => {
        if (!Array.isArray(f) || f.length !== t.encabezados.length) fail(`${r.id}: fila ${i} de la tabla no tiene ${t.encabezados.length} celdas`)
      })
    }
  }
  if (r.variante === 'desarrollo' && !r.tabla) aviso(`${r.id}: variante desarrollo sin tabla`)
}
console.log(`Rulebook: ${reglas.length} reglas (${reglas.filter((r) => r.variante === 'desarrollo').length} con desarrollo)`)

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
  match: { noVacio: ['categoria', 'enunciado', 'explicacion'], presente: ['izq', 'der', 'pares'] },
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
    } else if (new Set(it.opciones).size !== 4) {
      fail(`${it.id}: hay opciones repetidas`)
    }
    if (!Number.isInteger(it.correcta) || it.correcta < 0 || it.correcta > 3) {
      fail(`${it.id}: "correcta" fuera de rango 0-3 (${it.correcta})`)
    }
  }
  if (it.formato === 'fill') {
    if (!Array.isArray(it.alternativas)) fail(`${it.id}: "alternativas" debe ser un arreglo`)
    if (typeof it.respuesta !== 'string' || it.respuesta.trim() === '') fail(`${it.id}: "respuesta" vacía`)
    // El motor compara con normalizar() o, si el ítem trae `acento: true`,
    // con los acentos puestos. Un apóstrofo en la respuesta es frágil porque
    // el teclado del celular escribe ’ en vez de '.
    if (/['’]/.test(it.respuesta ?? '')) aviso(`${it.id}: la respuesta tiene apóstrofo y el teclado del celular escribe otro`)
    if ('acento' in it && it.acento !== true) fail(`${it.id}: "acento" solo puede ser true`)
  }
  if (it.formato === 'build') {
    if (!Array.isArray(it.fragmentos) || it.fragmentos.length < 2) {
      fail(`${it.id}: build necesita al menos 2 fragmentos (tiene ${it.fragmentos?.length})`)
    } else if (new Set(it.fragmentos).size !== it.fragmentos.length) {
      // El motor compara por índice: dos fragmentos iguales se pueden
      // intercambiar a la vista y contar como error.
      fail(`${it.id}: build con fragmentos repetidos`)
    }
  }
  // estructura de `match`: izq/der del mismo largo, `pares` mapea cada índice
  // de izq a un índice válido de der y no es el mapeo identidad
  if (it.formato === 'match') {
    const nI = Array.isArray(it.izq) ? it.izq.length : 0
    const nD = Array.isArray(it.der) ? it.der.length : 0
    if (nI < 2 || nI !== nD) fail(`${it.id}: match mal formado (izq ${nI}, der ${nD})`)
    else {
      const claves = Object.keys(it.pares ?? {})
      if (claves.length !== nI) fail(`${it.id}: match.pares cubre ${claves.length} de ${nI} filas`)
      const usados = new Set()
      for (const [k, v] of Object.entries(it.pares ?? {})) {
        if (!(+k >= 0 && +k < nI) || !(v >= 0 && v < nD)) fail(`${it.id}: match.pares["${k}"] = ${v} fuera de rango`)
        usados.add(v)
      }
      if (usados.size !== nI) fail(`${it.id}: match.pares repite o deja sin usar alguna fila de der`)
      if (Object.entries(it.pares ?? {}).every(([k, v]) => +k === +v)) {
        fail(`${it.id}: match.pares es el mapeo identidad, baraja la columna der en la fuente`)
      }
    }
  }
}

// ---- 3. Tokens de regla: resuelven, y no van donde el motor no los procesa ----
const TOKEN = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g
const CAMPOS_SIN_TOKEN = ['opciones', 'fragmentos', 'respuesta', 'alternativas', 'izq', 'der']
const usos = {}
let itemsConToken = 0
for (const it of items) {
  const texto = [it.enunciado, it.antes, it.despues, it.explicacion].filter((x) => typeof x === 'string').join('\n')
  const refs = [...texto.matchAll(TOKEN)].map((m) => m[1].trim())
  if (refs.length) itemsConToken++
  for (const ref of refs) {
    usos[ref] = (usos[ref] ?? 0) + 1
    if (!idsRegla.has(ref)) fail(`${it.id}: token [[${ref}]] no corresponde a ninguna regla de fr_reglas.json`)
  }
  for (const c of CAMPOS_SIN_TOKEN) {
    if (it[c] !== undefined && JSON.stringify(it[c]).includes('[[')) fail(`${it.id}: hay un token en "${c}", que el motor no procesa`)
  }
  // $ y ** : el módulo activa renderizaFormulas, así que un $ suelto armaría
  // una fórmula; ** solo se procesa en explicacion.
  for (const c of ['enunciado', 'antes', 'despues']) {
    if (typeof it[c] === 'string' && it[c].includes('$')) fail(`${it.id}: "${c}" tiene $ y pasa por el render de fórmulas`)
  }
  if (typeof it.explicacion === 'string') {
    if (it.explicacion.includes('$')) fail(`${it.id}: la explicación tiene $ y pasa por el render de fórmulas`)
    if ((it.explicacion.match(/\*\*/g) ?? []).length % 2) fail(`${it.id}: ** sin pareja en la explicación`)
  }
}
const sinUso = reglas.filter((r) => !usos[r.id]).map((r) => r.id)
console.log(`${itemsConToken}/${items.length} ítems con al menos un token de regla`)
if (sinUso.length) aviso(`reglas que ningún ítem cita: ${sinUso.join(', ')}`)

// ---- 4. Estilo del proyecto: sin paréntesis, raya larga ni dos puntos ----
// Se revisan todos los textos que el usuario lee: enunciado, explicación, el texto
// del hueco, las opciones, los fragmentos y los pares. La
// convención "Ordena para formar: «...»" con dos puntos es histórica y se deja.
for (const it of items) {
  const campos = [it.enunciado, it.explicacion, it.antes, it.despues, ...(it.opciones ?? []), ...(it.fragmentos ?? []), ...(it.izq ?? []), ...(it.der ?? [])]
  for (const c of campos) {
    if (typeof c === 'string' && /[()—]/.test(c)) {
      fail(`${it.id}: paréntesis o raya larga en «${c.slice(0, 60)}»`)
      break
    }
  }
  if (/’/.test(JSON.stringify(it))) fail(`${it.id}: apóstrofo curvo, el banco usa el recto`)
  // dos puntos: ni en la explicación ni en el enunciado, salvo la convención "Ordena para formar: «...»"
  if (typeof it.explicacion === 'string' && it.explicacion.includes(':')) fail(`${it.id}: dos puntos en la explicación`)
  if (typeof it.enunciado === 'string' && it.enunciado.replace(/^Ordena para formar[^:]*:/, '').includes(':')) fail(`${it.id}: dos puntos en el enunciado`)
}

// ---- 5. Reparto por formato y por clase-tema ----
const cuenta = (fn) => items.reduce((m, it) => ((m[fn(it)] = (m[fn(it)] || 0) + 1), m), {})
const porFormato = cuenta((it) => it.formato)
const porCategoria = cuenta((it) => it.categoria)
console.log(`\n${items.length} ítems · ${Object.entries(porFormato).map(([k, v]) => `${v} ${k}`).join(', ')}`)
console.log('Por clase-tema:', porCategoria)

// ---- 6. Rúbrica mcq: sesgo de posición y de longitud de la correcta ----
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
