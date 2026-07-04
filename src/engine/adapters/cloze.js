// Parte 4 (cloze_gramatical) y Parte 7 (cloze_lexico): un texto con huecos
// numerados; cada hueco es su propia pregunta con opciones independientes.
export function adaptCloze(item, { categoriaKey }) {
  return item.huecos.map((hueco) => ({
    id: `${item.id}-${hueco.num}`,
    grupoId: item.id,
    parte: item.parte,
    tipoOriginal: item.tipo,
    nivelMcer: item.nivel_mcer,
    contexto: {
      tipo: 'texto_con_huecos',
      titulo: item.titulo,
      texto: item.texto_con_huecos,
    },
    enunciado: `Hueco [${hueco.num}]`,
    opciones: hueco.opciones,
    respuestaCorrecta: hueco.respuesta_correcta,
    explicacionCorrecta: hueco.explicacion_correcta,
    distractores: hueco.distractores,
    categoria: hueco[categoriaKey],
    numEnGrupo: hueco.num,
  }))
}
