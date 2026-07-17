// Formato de ítems de Lectura Crítica: un grupo con un contexto de lectura
// compartido (texto continuo o descripción de un elemento discontinuo) y
// varias preguntas independientes, cada una ya resuelta — mismo shape de
// grupo+preguntas que Competencias Ciudadanas (ver situacion.js), pero con
// tres variantes de contexto según `tipo_texto`:
//   - continuo_literario: extracto real de dominio público (fuente visible).
//   - continuo_informativo: texto original del banco (sin fuente real).
//   - discontinuo: infografía/tabla/gráfico/cómic/anuncio descrito en texto,
//     con datos ficticios (se marca así en la UI, ver ContextoPregunta.jsx).
// La sub-categoría de cada pregunta es la competencia (identificacion_local
// / comprension_global / reflexion_evaluacion), igual que `competencia` en
// CC. El tipo de texto se expone como `nucleo`, reutilizando el mismo eje
// ortogonal que ya usa Pensamiento Científico (núcleo común/específico) —
// aquí no separa núcleos temáticos del examen, separa experiencias de
// lectura distintas, pero el mecanismo de filtro es idéntico.
const ETIQUETAS_GENERO = {
  poesia: 'Poesía',
  fabula: 'Fábula',
  cuento: 'Cuento',
  novela: 'Novela',
  columna_opinion: 'Columna de opinión',
  ensayo: 'Ensayo',
  cronica: 'Crónica',
  noticia: 'Noticia',
  infografia: 'Infografía',
  tabla: 'Tabla',
  grafico: 'Gráfico',
  comic: 'Cómic',
  anuncio: 'Anuncio',
}

function etiquetaGenero(generoTexto) {
  return ETIQUETAS_GENERO[generoTexto] ?? generoTexto
}

function preguntaBase(item, pregunta, indice, contexto) {
  return {
    id: pregunta.id,
    grupoId: item.id,
    parte: pregunta.competencia,
    nucleo: item.tipo_texto,
    tipoOriginal: item.tipo,
    contexto,
    enunciado: pregunta.enunciado,
    opciones: pregunta.opciones,
    respuestaCorrecta: pregunta.respuesta_correcta,
    explicacionCorrecta: pregunta.explicacion_correcta,
    distractores: pregunta.distractores,
    dificultad: pregunta.dificultad,
    habilidad: pregunta.habilidad,
    tarjetasTeoriaRelacionada: pregunta.tarjetas_teoria_relacionada ?? [],
    numEnGrupo: indice + 1,
  }
}

export function adaptTextoLiterario(item) {
  const contexto = {
    tipo: 'texto_base_literario',
    texto: item.texto_base,
    fuente: item.fuente,
    fuenteNota: item.fuente_nota,
    generoTexto: etiquetaGenero(item.genero_texto),
  }
  return item.preguntas.map((pregunta, indice) => preguntaBase(item, pregunta, indice, contexto))
}

export function adaptTextoInformativo(item) {
  const contexto = {
    tipo: 'texto_base',
    texto: item.texto_base,
    pills: item.genero_texto ? [etiquetaGenero(item.genero_texto)] : [],
  }
  return item.preguntas.map((pregunta, indice) => preguntaBase(item, pregunta, indice, contexto))
}

export function adaptTextoDiscontinuo(item) {
  const contexto = {
    tipo: 'discontinuo_lc',
    texto: item.visual_descripcion,
    generoTexto: etiquetaGenero(item.genero_texto),
  }
  return item.preguntas.map((pregunta, indice) => preguntaBase(item, pregunta, indice, contexto))
}
