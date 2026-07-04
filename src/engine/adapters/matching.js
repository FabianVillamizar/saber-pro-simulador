// Parte 1 (emparejamiento_definiciones) y Parte 2 (emparejamiento_avisos):
// un grupo con un banco de opciones compartido y varias entradas que cada
// una elige una letra de ese banco.
export function adaptMatching(item, { listKey, textKey }) {
  return item[listKey].map((entry) => ({
    id: `${item.id}-${entry.num}`,
    grupoId: item.id,
    parte: item.parte,
    tipoOriginal: item.tipo,
    nivelMcer: item.nivel_mcer,
    contexto: { tipo: 'banco_opciones', tema: item.tema ?? null },
    enunciado: entry[textKey],
    opciones: item.banco_opciones,
    respuestaCorrecta: entry.respuesta_correcta,
    numEnGrupo: entry.num,
  }))
}
