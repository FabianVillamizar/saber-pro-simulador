// Formato uniforme de ítems de Competencias Ciudadanas: un grupo con una
// "situación" compartida y varias preguntas independientes, cada una ya
// resuelta (opciones + respuesta_correcta + distractores por letra). A
// diferencia de Inglés, la sub-categoría de cada pregunta no es un número
// de "parte" sino el nombre de la competencia evaluada — se reutiliza el
// mismo campo `parte` para que el resto del motor (selección por
// sub-categoría, cola de refuerzo, agrupación por grupoId) no necesite
// distinguir entre los dos módulos.
export function adaptSituacion(item) {
  return item.preguntas.map((pregunta, indice) => ({
    id: pregunta.id,
    grupoId: item.id,
    parte: pregunta.competencia,
    tipoOriginal: item.tipo,
    contexto: { tipo: 'texto_base', texto: item.situacion },
    enunciado: pregunta.enunciado,
    opciones: pregunta.opciones,
    respuestaCorrecta: pregunta.respuesta_correcta,
    explicacionCorrecta: pregunta.explicacion_correcta,
    distractores: pregunta.distractores,
    bloque: pregunta.bloque,
    numEnGrupo: indice + 1,
  }))
}
