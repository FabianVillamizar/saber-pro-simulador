// Parte 5 (comprension_basica) y Parte 6 (comprension_compleja): un texto
// base con varias preguntas independientes sobre el mismo texto.
export function adaptComprehension(item) {
  return item.preguntas.map((pregunta) => ({
    id: `${item.id}-${pregunta.num}`,
    grupoId: item.id,
    parte: item.parte,
    tipoOriginal: item.tipo,
    nivelMcer: item.nivel_mcer,
    contexto: { tipo: 'texto_base', texto: item.texto_base },
    enunciado: pregunta.enunciado,
    opciones: pregunta.opciones,
    respuestaCorrecta: pregunta.respuesta_correcta,
    explicacionCorrecta: pregunta.explicacion_correcta,
    distractores: pregunta.distractores,
    habilidad: pregunta.habilidad,
    numEnGrupo: pregunta.num,
  }))
}
