// Formato de ítems de diosgenina: un grupo con un contexto compartido
// (texto plano, sin visual) y varias preguntas ya resueltas — misma forma
// que Competencias Ciudadanas (ver situacion.js), con dos diferencias:
// las preguntas no traen `id` propio (se sintetiza a partir del grupo) y
// la sub-categoría (`afirmacion`) vive en el grupo, no repetida por
// pregunta. `bloques_relacionados` es metadata informativa (qué bloques
// BQ/FQ/QO/QA se relacionan con el ítem) — se expone en el contexto para
// un posible pill, pero no se usa para agrupar ni filtrar.
export function adaptContextoDiosgenina(item) {
  return item.preguntas.map((pregunta, indice) => ({
    id: `${item.id}-${indice + 1}`,
    grupoId: item.id,
    parte: item.afirmacion,
    tipoOriginal: item.tipo,
    contexto: { tipo: 'texto_base', texto: item.contexto, pills: item.bloques_relacionados },
    enunciado: pregunta.enunciado,
    opciones: pregunta.opciones,
    respuestaCorrecta: pregunta.respuesta_correcta,
    explicacionCorrecta: pregunta.explicacion_correcta,
    distractores: pregunta.distractores,
    dificultad: item.dificultad,
    numEnGrupo: indice + 1,
  }))
}
