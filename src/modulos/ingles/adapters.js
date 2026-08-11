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

const MAX_TARJETAS_TEORIA = 2

// Puente pregunta -> teoría para Parte 4 (cloze gramatical): a diferencia de
// LC/CC/PC, donde `tarjetas_teoria_relacionada` viene curado a mano en el
// JSON fuente, en Inglés no hace falta curarlo porque el `categoria_gramatical`
// de cada hueco ya usa exactamente el mismo vocabulario que el `bloque` de
// las 100 tarjetas de gramática (mismos 17 valores en ambos lados, ver
// BITACORA.md) — alcanza con agrupar las tarjetas de tipo "gramatica" (de
// `tarjetasConcepto`, que ya llegó cargado con el resto del módulo, así que
// esto no vuelve a importar el JSON ni rompe el chunking perezoso de
// loadModulos.js) por bloque. No se intentó lo mismo para P1/P2/P7
// (emparejamiento y cloze léxico): sus categorías no coinciden con el
// `bloque` de vocabulario (temas como "falsos_amigos" o
// "phrasal_verbs_alta_frecuencia" vs. categorías genéricas como
// "coocurrencia"/"vocabulario"), y las palabras de esas preguntas casi no
// se repiten literalmente en el mazo de vocabulario — enlazarlas bien
// requeriría curar los ids a mano como en LC/CC/PC, no inferirlos.
export function enlazarTeoriaIngles(preguntas, tarjetasConcepto) {
  const gramaticaPorBloque = {}
  for (const t of tarjetasConcepto) {
    if (t.tipo !== 'gramatica') continue
    ;(gramaticaPorBloque[t.bloque] ??= []).push(t.id)
  }

  return preguntas.map((pregunta) =>
    pregunta.tipoOriginal === 'cloze_gramatical'
      ? {
          ...pregunta,
          tarjetasTeoriaRelacionada: (gramaticaPorBloque[pregunta.categoria] ?? []).slice(0, MAX_TARJETAS_TEORIA),
        }
      : pregunta
  )
}
