// Formato de ítems de Pensamiento Científico: un grupo con un contexto
// científico compartido (texto + posible visual/fórmula) y una sola
// pregunta ya resuelta — a diferencia de Competencias Ciudadanas, cada
// grupo trae exactamente una `preguntas[0]`, pero se mapea igual (array)
// para reutilizar el mismo shape de adaptador. La sub-categoría es la
// afirmación evaluada (adquirir_interpretar, analizar_concluir, …) y se
// reutiliza el campo `parte`, igual que `competencia` en CC. `nucleo`
// (comun / especifico_quimica) es un eje ortogonal a la afirmación — se
// añade como campo propio, no se mezcla con `parte`, para que la práctica
// por sub-categoría pueda filtrar por ambos ejes por separado.
export function adaptContextoCientifico(item) {
  return item.preguntas.map((pregunta, indice) => ({
    id: pregunta.id,
    grupoId: item.id,
    parte: pregunta.afirmacion,
    nucleo: item.nucleo,
    tipoOriginal: item.tipo,
    contexto: {
      tipo: 'contexto_cientifico',
      texto: item.contexto_cientifico,
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
    evidencia: pregunta.evidencia,
    tarjetasTeoriaRelacionada: pregunta.tarjetas_teoria_relacionada ?? [],
    numEnGrupo: indice + 1,
  }))
}
