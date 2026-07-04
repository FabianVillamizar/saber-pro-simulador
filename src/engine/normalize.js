// Motor de normalización, compartido por todos los módulos. No conoce
// Inglés ni ningún otro módulo específico: recibe un mapa tipo -> adaptador
// (definido por cada módulo en src/modulos/<id>/adapters.js) y lo aplica.
//
// Un ítem crudo (grupo, conversación, cloze, comprensión, etc.) se expande
// a 1 o más preguntas normalizadas: la unidad atómica que el motor de
// examen realmente presenta y califica.
export function normalizeItem(rawItem, adapters) {
  const adapt = adapters[rawItem.tipo]
  if (!adapt) {
    throw new Error(
      `No hay adaptador registrado para tipo "${rawItem.tipo}" (modulo: ${rawItem.modulo}, id: ${rawItem.id})`
    )
  }
  return adapt(rawItem)
}

export function normalizeBank(rawItems, adapters) {
  return rawItems.flatMap((item) => normalizeItem(item, adapters))
}
