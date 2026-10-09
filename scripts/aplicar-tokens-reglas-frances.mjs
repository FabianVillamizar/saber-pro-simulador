import fs from 'node:fs'

// Retrofit de tokens [[fr-r-...|frase]] sobre los ítems viejos del Quiz Rápido
// de Français (clase-loisirs, profesiones, petits boulots y 3 de gustos) que
// practican gramática ya cubierta por fr_reglas.json pero no tenían ningún
// token. Patrón de Diosgenina/Inglés, con una diferencia: aquí la asignación
// es una tabla explícita id -> regla, no un mapa mecánico, porque cada ítem
// viejo cubre un tema distinto (el vocabulario de petits boulots o los
// femeninos de las profesiones no tienen regla y se quedan sin token).
//
//  - ['envuelve', frase]: envuelve EN SITIO esa frase de la explicación.
//  - ['agrega', texto]:   la explicación era un renglón terso ("il / elle →
//    va."); se le suma " Ver [[regla|texto]]." al final.
// Un solo token por ítem, solo en `explicacion` (nunca en enunciado, opciones,
// fragmentos ni respuesta: el verificador lo rechaza y, además, el enunciado
// no debe delatar la regla antes de contestar).
// El archivo mezcla CRLF/LF y arreglos en línea, así que se edita el texto
// acotado al bloque de cada ítem en vez de reserializar.
// Uso: node scripts/aplicar-tokens-reglas-frances.mjs [--dry]

const DRY = process.argv.includes('--dry')
const RUTA = new URL('../src/data/frances/fr_quiz_rapido.json', import.meta.url)
const RUTA_REGLAS = new URL('../src/data/frances/fr_reglas.json', import.meta.url)

const TABLA = {
  // loisirs: jouer / faire / aller
  'FR-QR-001': ['fr-r-jouer-a', ['envuelve', 'contraer à+le en au']],
  'FR-QR-002': ['fr-r-jouer-de-instrumento', ['envuelve', 'preposición de instrumento']],
  'FR-QR-003': ['fr-r-conjug-jouer', ['envuelve', 'las 4 formas de jouer']],
  'FR-QR-004': ['fr-r-conjug-faire', ['envuelve', 'fais y fait']],
  'FR-QR-005': ['fr-r-conjug-aller', ['envuelve', 'aller no sigue un patrón único']],
  'FR-QR-006': ['fr-r-jouer-a', ['envuelve', 'la contracción aux']],
  'FR-QR-007': ['fr-r-jouer-a', ['envuelve', 'Deportes y juegos']],
  'FR-QR-008': ['fr-r-jouer-de-instrumento', ['envuelve', 'Instrumentos']],
  'FR-QR-009': ['fr-r-faire-quehaceres', ['envuelve', 'Cocinar es una tarea específica']],
  'FR-QR-010': ['fr-r-faire-de', ['envuelve', 'Actividad física']],
  'FR-QR-011': ['fr-r-gusto-infinitivo', ['envuelve', 'Después de aimer/adorer/détester + infinitivo']],
  'FR-QR-017': ['fr-r-pronominales', ['envuelve', 'pronombre reflexivo']],
  'FR-QR-018': ['fr-r-pronominales', ['envuelve', 'el pronombre reflexivo']],
  'FR-QR-019': ['fr-r-negacion-partitivo', ['envuelve', 'El partitivo du/de la/des colapsa']],
  'FR-QR-020': ['fr-r-negacion-partitivo', ['envuelve', 'el colapso de la negación del partitivo']],
  'FR-QR-021': ['fr-r-conjug-aller', ['agrega', 'aller en presente']],
  'FR-QR-022': ['fr-r-conjug-jouer', ['agrega', 'jouer en presente']],
  'FR-QR-023': ['fr-r-conjug-faire', ['agrega', 'faire en presente']],
  'FR-QR-024': ['fr-r-jouer-a', ['agrega', 'las contracciones de à']],
  'FR-QR-025': ['fr-r-jouer-de-instrumento', ['agrega', 'jouer de con instrumentos']],
  'FR-QR-026': ['fr-r-gusto-infinitivo', ['envuelve', 'sin preposición']],
  'FR-QR-027': ['fr-r-faire-de', ['agrega', 'faire de con deportes y disciplinas']],
  'FR-QR-029': ['fr-r-negacion-partitivo', ['envuelve', 'En negación']],
  // profesiones / restauration rapide
  'FR-QR-047': ['fr-r-pronominales', ['agrega', 'los verbos pronominales']],
  'FR-QR-048': ['fr-r-tercer-a', ['agrega', 'la familia de dormir y servir']],
  'FR-QR-055': ['fr-r-negacion-ne-pas', ['envuelve', 'Negación estándar']],
  // loisirs, segunda tanda
  'FR-QR-057': ['fr-r-preferer-acento', ['envuelve', 'préférer cambia é→è']],
  'FR-QR-058': ['fr-r-preferer-acento', ['envuelve', 'con é→è']],
  'FR-QR-059': ['fr-r-dire-boire-courir', ['envuelve', 'verbo irregular que no sigue el patrón -er']],
  'FR-QR-060': ['fr-r-prendre', ['envuelve', 'verbo irregular apprendre']],
  'FR-QR-067': ['fr-r-faire-quehaceres', ['envuelve', 'una tarea específica']],
  'FR-QR-068': ['fr-r-faire-de', ['envuelve', 'el partitivo de la se elide']],
  'FR-QR-073': ['fr-r-conjug-faire', ['agrega', 'faire en presente']],
  'FR-QR-074': ['fr-r-preferer-acento', ['agrega', 'el cambio de é a è en préférer']],
  'FR-QR-075': ['fr-r-gusto-infinitivo', ['envuelve', 'después de aimer']],
  'FR-QR-076': ['fr-r-gusto-infinitivo', ['envuelve', 'adorer + infinitivo va sin preposición']],
  // petits boulots (solo los de gramática, no los de vocabulario)
  'FR-QR-091': ['fr-r-pronominales', ['envuelve', 'El reflexivo lleva dos pronombres con nous']],
  'FR-QR-092': ['fr-r-tercer-a', ['envuelve', 'un verbo -ir irregular']],
  'FR-QR-096': ['fr-r-presente-er', ['envuelve', 'verbo -er regular']],
  'FR-QR-097': ['fr-r-pronominales', ['envuelve', 'El primer nous es el sujeto y el segundo el reflexivo']],
  'FR-QR-098': ['fr-r-presente-er', ['envuelve', 'Verbo -er regular']],
  // gustos y preposiciones: el único ítem de la clase que quedó sin token
  'FR-QR-123': ['fr-r-conjug-faire', ['agrega', 'faire en presente']],
}

let raw = fs.readFileSync(RUTA, 'utf8')
const items = JSON.parse(raw)
const reglas = new Set(JSON.parse(fs.readFileSync(RUTA_REGLAS, 'utf8')).map((r) => r.id))

let aplicados = 0
let saltados = 0
for (const [id, [regla, [modo, texto]]] of Object.entries(TABLA)) {
  if (!reglas.has(regla)) throw new Error(`${id}: la regla ${regla} no existe en fr_reglas.json`)
  const it = items.find((x) => x.id === id)
  if (!it) throw new Error(`${id}: no existe en el banco`)
  if (it.explicacion.includes('[[')) {
    saltados++
    continue // idempotente
  }
  let nueva
  if (modo === 'agrega') {
    nueva = `${it.explicacion} Ver [[${regla}|${texto}]].`
  } else {
    const n = it.explicacion.split(texto).length - 1
    if (n < 1) throw new Error(`${id}: la frase «${texto}» no está en la explicación`)
    if (texto.includes('|') || texto.includes('**')) throw new Error(`${id}: la frase tiene | o **`)
    const idx = it.explicacion.indexOf(texto)
    const antes = it.explicacion.slice(Math.max(0, idx - 2), idx)
    const despues = it.explicacion.slice(idx + texto.length, idx + texto.length + 2)
    if (antes.includes('*') || despues.includes('*')) throw new Error(`${id}: la frase «${texto}» toca una negrita`)
    nueva = it.explicacion.slice(0, idx) + `[[${regla}|${texto}]]` + it.explicacion.slice(idx + texto.length)
  }
  // edición de texto acotada al bloque del ítem
  const buscar = `"explicacion": ${JSON.stringify(it.explicacion)}`
  const poner = `"explicacion": ${JSON.stringify(nueva)}`
  const ini = raw.indexOf(`"id": "${id}"`)
  const fin = raw.indexOf('"id": "FR-QR-', ini + 10)
  const bloque = raw.slice(ini, fin < 0 ? raw.length : fin)
  if (bloque.split(buscar).length - 1 !== 1) throw new Error(`${id}: no encuentro la explicación exacta en el texto`)
  raw = raw.slice(0, ini) + bloque.replace(buscar, poner) + (fin < 0 ? '' : raw.slice(fin))
  aplicados++
  if (DRY) console.log(`${id}  ${regla}\n   ${nueva}`)
}

JSON.parse(raw) // falla si quedó mal formado
console.log(`\n${aplicados} ítems con token nuevo, ${saltados} ya tenían (${DRY ? 'simulación' : 'escrito'})`)
if (!DRY) fs.writeFileSync(RUTA, raw)
