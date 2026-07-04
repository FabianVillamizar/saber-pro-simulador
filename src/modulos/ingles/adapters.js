import { adaptMatching } from '../../engine/adapters/matching.js'
import { adaptConversation } from '../../engine/adapters/conversation.js'
import { adaptCloze } from '../../engine/adapters/cloze.js'
import { adaptComprehension } from '../../engine/adapters/comprehension.js'

// Mapa tipo -> adaptador específico de Inglés. Un módulo nuevo define el
// suyo (reusando los adaptadores genéricos de engine/adapters cuando su
// forma coincide, o agregando uno propio si no) sin tocar este archivo
// ni el motor de normalización.
export const adaptersIngles = {
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
