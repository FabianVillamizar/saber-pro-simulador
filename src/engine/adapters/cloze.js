// Parte 4 (cloze_gramatical) y Parte 7 (cloze_lexico): un texto con huecos
// numerados; cada hueco es su propia pregunta con opciones independientes.
// `tarjetas_teoria_relacionada` (curado a mano en el hueco fuente, igual
// que LC/CC/PC) llega vacío salvo donde alguien lo agregó explícitamente —
// Parte 4 lo recibe después, por regla automática, en
// modulos/ingles/adapters.js (enlazarTeoriaIngles), así que este campo del
// dato fuente es lo único que usa Parte 7 hoy.
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
    tarjetasTeoriaRelacionada: hueco.tarjetas_teoria_relacionada ?? [],
  }))
}
