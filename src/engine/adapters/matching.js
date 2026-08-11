// Parte 1 (emparejamiento_definiciones) y Parte 2 (emparejamiento_avisos):
// un grupo con un banco de opciones compartido y varias entradas que cada
// una elige una letra de ese banco. `tarjetas_teoria_relacionada` es
// curado a mano por entrada (no por grupo): la mayoría de palabras de P1/P2
// no tienen tarjeta de vocabulario propia (bancos de dominios distintos:
// lugares/objetos/profesiones vs. las colocaciones de la vida diaria del
// mazo), así que solo se linkeó donde de verdad hay una tarjeta que enseña
// exactamente esa palabra — ver BITACORA.md.
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
    tarjetasTeoriaRelacionada: entry.tarjetas_teoria_relacionada ?? [],
  }))
}
