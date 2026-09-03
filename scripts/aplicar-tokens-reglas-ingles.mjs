// Inserta los tokens `[[ing-r-...|...]]` de "Reglas en contexto" en el
// Quiz Rápido de Inglés y en sus tarjetas de concepto, de forma mecánica a
// partir del `bloque` de cada tarjeta. Idempotente: si el token ya está,
// no lo duplica. Correr con `node scripts/aplicar-tokens-reglas-ingles.mjs`.
//
// - Ítems / tarjetas de GRAMÁTICA: el token va en el `enunciado` del ítem
//   (visible antes de responder) y en el `error_comun` de la tarjeta.
// - Ítems / tarjetas de los bloques de VOCABULARIO con regla de patrón
//   (falsos amigos, phrasal verbs, colocaciones): el token va en la
//   `explicacion` del ítem y en el `error_comun` de la tarjeta. El resto
//   del vocabulario (temáticos, esencial A1) y cultura general no llevan
//   token: son elección de palabra / hechos, no una regla.

import { readFileSync, writeFileSync } from 'node:fs'

const DIR = new URL('../src/data/ingles/', import.meta.url)
const rd = (f) => JSON.parse(readFileSync(new URL(f, DIR), 'utf8'))
const wr = (f, data) => writeFileSync(new URL(f, DIR), JSON.stringify(data, null, 2) + '\n')

const BLOQUE_A_REGLA = {
  tiempos_presente: 'ing-r-present-simple',
  tiempos_pasado: 'ing-r-past-tenses',
  tiempos_presente_perfecto: 'ing-r-present-perfect',
  futuro: 'ing-r-future',
  condicionales: 'ing-r-conditionals',
  voz_pasiva: 'ing-r-passive',
  discurso_indirecto: 'ing-r-reported-speech',
  modales_habilidad_permiso: 'ing-r-modals-ability',
  modales_obligacion: 'ing-r-modals-obligation',
  modales_consejo_posibilidad: 'ing-r-modals-deduction',
  clausulas_relativas: 'ing-r-relative-clauses',
  comparativos_superlativos: 'ing-r-comparatives',
  articulos: 'ing-r-articles',
  preposiciones: 'ing-r-prepositions',
  conectores_conjunciones: 'ing-r-connectors',
  cuantificadores: 'ing-r-quantifiers',
  gerundios_infinitivos: 'ing-r-gerund-infinitive',
  auxiliares_do_does_did: 'ing-r-auxiliaries',
  question_tags: 'ing-r-question-tags',
  preguntas_indirectas: 'ing-r-indirect-questions',
  falsos_amigos: 'ing-r-falsos-amigos',
  phrasal_verbs_alta_frecuencia: 'ing-r-phrasal-verbs',
  colocaciones_comunes: 'ing-r-colocaciones',
  colocaciones_formales_academicas: 'ing-r-registro-academico',
}

const LABEL = {
  'ing-r-present-simple': 'present simple',
  'ing-r-past-tenses': 'past simple y continuous',
  'ing-r-present-perfect': 'present perfect',
  'ing-r-future': 'formas de futuro',
  'ing-r-conditionals': 'los condicionales',
  'ing-r-passive': 'la voz pasiva',
  'ing-r-reported-speech': 'el discurso indirecto',
  'ing-r-modals-ability': 'can / could / be able to',
  'ing-r-modals-obligation': 'must / have to / should',
  'ing-r-modals-deduction': 'modales de deducción',
  'ing-r-relative-clauses': 'las cláusulas relativas',
  'ing-r-comparatives': 'comparativos y superlativos',
  'ing-r-articles': 'los artículos',
  'ing-r-prepositions': 'in / on / at',
  'ing-r-connectors': 'los conectores',
  'ing-r-quantifiers': 'los cuantificadores',
  'ing-r-gerund-infinitive': 'gerundio o infinitivo',
  'ing-r-auxiliaries': 'do / does / did',
  'ing-r-question-tags': 'las question tags',
  'ing-r-indirect-questions': 'las preguntas indirectas',
  'ing-r-falsos-amigos': 'falsos amigos',
  'ing-r-phrasal-verbs': 'los phrasal verbs',
  'ing-r-colocaciones': 'make / do / take / have',
  'ing-r-registro-academico': 'el registro académico',
}

const VOCAB_PATRON = new Set([
  'falsos_amigos',
  'phrasal_verbs_alta_frecuencia',
  'colocaciones_comunes',
  'colocaciones_formales_academicas',
])

const reglas = rd('ing_reglas.json')
const idsRegla = new Set(reglas.map((r) => r.id))
for (const id of Object.values(BLOQUE_A_REGLA)) {
  if (!idsRegla.has(id)) throw new Error(`BLOQUE_A_REGLA apunta a una regla inexistente: ${id}`)
}

const tok = (ruleId) => `[[${ruleId}|${LABEL[ruleId]}]]`
const yaTiene = (s, ruleId) => typeof s === 'string' && s.includes(`[[${ruleId}`)

// --- tarjetas: bloque + tipo por id ---
const cardFiles = ['ing_gramatica_tarjetas.json', 'ing_vocabulario_tarjetas.json', 'ing_cultura_general_tarjetas.json']
const cards = Object.fromEntries(cardFiles.map((f) => [f, rd(f)]))
const cardPorId = {}
for (const f of cardFiles) for (const c of cards[f]) cardPorId[c.id] = { ...c, _file: f }

// --- 1. Quiz Rápido ---
const quiz = rd('ing_quiz_rapido.json')
let qEnun = 0
let qExpl = 0
for (const it of quiz) {
  const card = cardPorId[it.tarjetaId]
  if (!card) continue
  const ruleId = BLOQUE_A_REGLA[card.bloque]
  if (!ruleId) continue

  if (card.tipo === 'gramatica') {
    if (!yaTiene(it.enunciado, ruleId)) {
      it.enunciado = `Completa la frase aplicando ${tok(ruleId)}:`
      qEnun++
    }
  } else if (VOCAB_PATRON.has(card.bloque)) {
    if (!yaTiene(it.explicacion, ruleId)) {
      it.explicacion = `${it.explicacion.trimEnd()}\n\nVer ${tok(ruleId)}.`
      qExpl++
    }
  }
}
wr('ing_quiz_rapido.json', quiz)

// --- 2. Tarjetas de concepto: token en `error_comun` ---
let cGra = 0
let cVoc = 0
for (const f of cardFiles) {
  let tocado = false
  for (const c of cards[f]) {
    const ruleId = BLOQUE_A_REGLA[c.bloque]
    if (!ruleId) continue
    const aplica = c.tipo === 'gramatica' || VOCAB_PATRON.has(c.bloque)
    if (!aplica) continue
    if (yaTiene(c.error_comun, ruleId)) continue
    c.error_comun = `${(c.error_comun || '').trimEnd()} Ver ${tok(ruleId)}.`.trimStart()
    tocado = true
    if (c.tipo === 'gramatica') cGra++
    else cVoc++
  }
  if (tocado) wr(f, cards[f])
}

console.log(`Quiz Rápido: ${qEnun} enunciados (gramática) + ${qExpl} explicaciones (vocab-patrón) tokenizados`)
console.log(`Tarjetas: ${cGra} de gramática + ${cVoc} de vocab-patrón con token en error_comun`)
