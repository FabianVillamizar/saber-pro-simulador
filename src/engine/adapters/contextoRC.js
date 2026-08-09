// Formato de ítems de Razonamiento Cuantitativo: un grupo con un contexto
// compartido (texto + posible visual/fórmula) y varias preguntas
// independientes ya resueltas — mismo shape que Competencias Ciudadanas
// (situacion.js), no el de Pensamiento Científico (1 pregunta por grupo).
// Dos ejes de sub-categoría, igual que Pensamiento Científico:
//   - `parte` = la competencia oficial ICFES evaluada (argumentacion,
//     formulacion_ejecucion, interpretacion_representacion) — vive en la
//     pregunta, no en el grupo, porque el examen real mezcla competencias
//     dentro de un mismo contexto.
//   - `nucleo` = el área de contenido matemático (algebra_calculo,
//     contexto_aplicado, estadistica, geometria) — mismo campo `contenido`
//     que usan las tarjetas de concepto, así que no hace falta traducirlo.
// Los grupos fuente no traen visuales ya construidos (grafica_datos_
// estructurados / tabla_filas / imagen): tipo_visual + visual_descripcion
// muestran el placeholder "en construcción" hasta que se generen, igual
// que Pensamiento Científico antes de su pase de visuales.
export function adaptContextoRC(item) {
  return item.preguntas.map((pregunta, indice) => ({
    id: pregunta.id,
    grupoId: item.id,
    parte: pregunta.competencia,
    nucleo: pregunta.contenido,
    tipoOriginal: item.tipo,
    tipoContexto: pregunta.tipo_contexto,
    contexto: {
      // Reutiliza el renderer de ContextoPregunta.jsx (texto + fórmula
      // KaTeX opcional + VisualCientifico), que ya es genérico pese al
      // nombre — no hace falta una rama nueva para este módulo.
      tipo: 'contexto_cientifico',
      texto: item.contexto_compartido,
      tipoVisual: item.tipo_visual,
      visualDescripcion: item.visual_descripcion,
      graficaDatosEstructurados: item.grafica_datos_estructurados,
      tablaFilas: item.tabla_filas,
      imagen: item.imagen,
      formulaLatex: item.formula_latex,
    },
    enunciado: pregunta.enunciado,
    opciones: pregunta.opciones,
    respuestaCorrecta: pregunta.respuesta_correcta,
    explicacionCorrecta: pregunta.explicacion_correcta,
    distractores: pregunta.distractores,
    dificultad: pregunta.dificultad,
    tarjetasTeoriaRelacionada: pregunta.tarjetas_relacionadas ?? [],
    numEnGrupo: indice + 1,
  }))
}
