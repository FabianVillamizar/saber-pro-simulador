import { adaptMatching } from './adapters/matching.js'
import { adaptConversation } from './adapters/conversation.js'
import { adaptCloze } from './adapters/cloze.js'
import { adaptComprehension } from './adapters/comprehension.js'

// Registro tipo -> adaptador. Agregar una parte nueva es agregar una
// entrada aquí, no una rama más en un if/else.
const ADAPTERS = {
  emparejamiento_definiciones: (item) =>
    adaptMatching(item, { listKey: 'descripciones', textKey: 'texto' }),
  emparejamiento_avisos: (item) =>
    adaptMatching(item, { listKey: 'avisos', textKey: 'texto_aviso' }),
  conversacion: adaptConversation,
  cloze_gramatical: (item) => adaptCloze(item, { categoriaKey: 'categoria_gramatical' }),
  cloze_lexico: (item) => adaptCloze(item, { categoriaKey: 'categoria' }),
  comprension_basica: adaptComprehension,
  comprension_compleja: adaptComprehension,
}

// Un ítem crudo (grupo, conversación, cloze o comprensión) se expande a 1
// o más preguntas normalizadas: la unidad atómica que el motor de examen
// realmente presenta y califica.
export function normalizeItem(rawItem) {
  const adapt = ADAPTERS[rawItem.tipo]
  if (!adapt) {
    throw new Error(`No hay adaptador registrado para tipo "${rawItem.tipo}" (id: ${rawItem.id})`)
  }
  return adapt(rawItem)
}

export function normalizeBank(rawItems) {
  return rawItems.flatMap(normalizeItem)
}
