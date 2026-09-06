// Genera los ítems `fill` de Quiz Rápido para las tarjetas de concepto de
// Inglés que todavía no tienen uno. Un ítem `fill` es una derivación
// mecánica de la tarjeta: mismo `antes`/`despues`/`respuesta`, la
// `explicacion` es regla + ejemplo + error_comun, y el `enunciado` sale
// del `bloque` (gramática: "Completa la frase aplicando <tema>:";
// vocabulario/cultura: "Completa la frase en inglés sobre <tema>:").
// El token [[ing-r-...]] del enunciado de gramática lo pone después
// `aplicar-tokens-reglas-ingles.mjs`. Idempotente: solo añade lo que falta.
// Correr: `node scripts/generar-fills-ingles.mjs`
import { readFileSync, writeFileSync } from 'node:fs'

const DIR = new URL('../src/data/ingles/', import.meta.url)
const rd = (f) => JSON.parse(readFileSync(new URL(f, DIR), 'utf8'))
const wr = (f, data) => writeFileSync(new URL(f, DIR), JSON.stringify(data, null, 2) + '\n')

const cardFiles = ['ing_gramatica_tarjetas.json', 'ing_vocabulario_tarjetas.json', 'ing_cultura_general_tarjetas.json']
const cards = cardFiles.flatMap((f) => rd(f))
const quiz = rd('ing_quiz_rapido.json')

const conFill = new Set(quiz.filter((q) => q.formato === 'fill').map((q) => q.tarjetaId))
const maxNum = quiz.reduce((m, q) => Math.max(m, Number(q.id.match(/\d+$/)[0])), 0)

const legible = (bloque) => bloque.replace(/_/g, ' ')
const enunciadoDe = (card) =>
  card.tipo === 'gramatica'
    ? `Completa la frase aplicando ${legible(card.bloque)}:` // el token lo pone el otro script
    : `Completa la frase en inglés sobre ${legible(card.bloque)}:`

let n = maxNum
const nuevos = []
for (const card of cards) {
  if (conFill.has(card.id)) continue
  n += 1
  nuevos.push({
    id: `ING-QR-${String(n).padStart(3, '0')}`,
    tarjetaId: card.id,
    categoria: card.tipo,
    formato: 'fill',
    enunciado: enunciadoDe(card),
    antes: card.antes,
    despues: card.despues,
    respuesta: card.respuesta,
    explicacion: [card.regla, card.ejemplo, card.error_comun].filter(Boolean).join('\n\n'),
  })
}

// Los `fill` van antes de los `mcq` en el archivo (los mcq quedan al final).
const fills = quiz.filter((q) => q.formato === 'fill')
const mcqs = quiz.filter((q) => q.formato !== 'fill')
wr('ing_quiz_rapido.json', [...fills, ...nuevos, ...mcqs])

console.log(`${nuevos.length} ítems fill nuevos (${nuevos[0]?.id} … ${nuevos.at(-1)?.id})`)
console.log(`Quiz Rápido: ${fills.length + nuevos.length} fill + ${mcqs.length} mcq = ${fills.length + nuevos.length + mcqs.length}`)
