// Parte 3 (conversacion): ítem plano, una pregunta por registro.
export function adaptConversation(item) {
  return [
    {
      id: item.id,
      grupoId: item.id,
      parte: item.parte,
      tipoOriginal: item.tipo,
      nivelMcer: item.nivel_mcer,
      contexto: null,
      enunciado: item.enunciado,
      opciones: item.opciones,
      respuestaCorrecta: item.respuesta_correcta,
      explicacionCorrecta: item.explicacion_correcta,
      distractores: item.distractores,
    },
  ]
}
