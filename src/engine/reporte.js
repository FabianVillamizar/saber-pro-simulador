// Reporte post-simulacro. El puntaje "simulado" es una escala proporcional
// simple (aciertos/total × 300): el ICFES real usa Teoría de Respuesta al
// Ítem (TRI), con parámetros de dificultad y discriminación por pregunta
// que no tenemos, así que esto es solo una aproximación — hay que dejarlo
// explícito en la UI, no solo acá.
export const TABLA_NIVELES = [
  { nivel: 'A1', min: 0, max: 120 },
  { nivel: 'A2', min: 121, max: 164 },
  { nivel: 'B1', min: 165, max: 195 },
  { nivel: 'B2', min: 196, max: 300 },
]

export function calcularPuntajeSimulado(correctas, total) {
  return Math.round((correctas / total) * 300)
}

export function clasificarNivel(puntaje) {
  return TABLA_NIVELES.find((n) => puntaje >= n.min && puntaje <= n.max) ?? null
}

export function aciertosPorParte(detalle) {
  const porParte = {}
  for (const { pregunta, esCorrecta } of detalle) {
    const entrada = (porParte[pregunta.parte] ??= { correctas: 0, total: 0 })
    entrada.total += 1
    if (esCorrecta) entrada.correctas += 1
  }
  return porParte
}

// Frase humana por patrón de trampa, para el callout de "error más
// frecuente" del Resultado (que lee el historial acumulado por perfil de
// engine/patronesPerfil.js, no solo este intento). Cubre los patron_trampa
// reales presentes en los datos de Inglés (ver src/data/ingles/*.json).
// Las partes 1/2 (emparejamiento) no tienen distractores clasificados, así
// que sus fallos nunca entran en este conteo.
export const DESCRIPCIONES_PATRON = {
  concordancia_incorrecta: 'Fallas en la concordancia entre sujeto y verbo, o entre sustantivo y sus modificadores.',
  estructura_gramatical_invalida: 'Eliges estructuras gramaticales que no son válidas en inglés, aunque suenen parecidas al español.',
  falso_amigo: 'Caes en falsos amigos: palabras que se parecen al español pero significan algo distinto en inglés.',
  fuera_de_contexto: 'Eliges respuestas que no encajan con el contexto real de la conversación o el texto.',
  logica_conversacional_rota: 'Respondes de una forma que rompe la lógica natural de una conversación en inglés.',
  preposicion_incorrecta: 'Usas la preposición incorrecta en construcciones que en español no requieren una equivalente.',
  referencia_incorrecta: 'Pierdes el hilo de a qué o quién se refiere un pronombre o conector dentro del texto.',
  registro_inadecuado: 'Usas un registro (formal/informal) que no corresponde a la situación planteada.',
  significado_cercano: 'Confundes palabras de significado cercano pero no intercambiable en el contexto dado.',
  tiempo_verbal_incorrecto: 'Confundes tiempos verbales: usas uno distinto al que exige el contexto de la oración.',

  // Lectura Crítica (ver src/data/lectura-critica/*.json).
  informacion_no_presente: 'Marcas como correcta información que el texto nunca menciona, en vez de basarte solo en lo que realmente dice.',
  sobreinterpretacion: 'Vas más allá de lo que el texto permite concluir, leyendo matices o intenciones que no están respaldados por el contenido.',
  generalizacion_indebida: 'Conviertes una afirmación puntual o parcial del texto en una conclusión absoluta que el texto no sostiene.',
  confusion_tesis_antitesis: 'Confundes la postura que el autor defiende con la posición contraria que está refutando o matizando.',
  inversion_causal: 'Inviertes una relación de causa-efecto, o afirmas lo contrario de lo que el texto realmente concluye.',
  enfoque_parcial: 'Te quedas con un detalle aislado del texto en vez de considerar su función dentro del sentido global.',
  fuera_de_alcance_pregunta: 'Traes a la respuesta una idea externa, cierta o no, que el texto no aborda ni la pregunta pide evaluar.',
  confusion_figura_retorica: 'Confundes un recurso retórico o discursivo con otro parecido, sin verificar el criterio exacto que los distingue.',

  // Competencias Ciudadanas (ver src/data/competencias-ciudadanas/*.json).
  alcance_incorrecto_derecho: 'Le atribuyes a un derecho un alcance absoluto o inexistente, sin ponderarlo frente a otros derechos o límites legítimos.',
  causa_efecto_invertida: 'Inviertes la relación de causa y efecto, o interpretas al revés la dirección real de un acuerdo, desacuerdo o consecuencia.',
  confusion_dimension: 'Confundes la dimensión del problema que realmente está en juego (por ejemplo, lógica vs. presupuestal, disciplinaria vs. fiscal) con otra que no es la que la pregunta indaga.',
  derecho_incompleto_identificado: 'Identificas solo una de varias afectaciones o derechos en juego, dejando por fuera otra dimensión igual de relevante del mismo caso.',
  falacia_ad_hominem: 'Confundes un ataque a la persona que argumenta con una crítica válida al argumento mismo.',
  falacia_apelacion_autoridad: 'Aceptas una conclusión solo por el prestigio de quien la dice, sin evaluar si esa persona tiene competencia real en el tema.',
  falacia_apelacion_emocion: 'Confundes una respuesta emocional generada por el argumento con evidencia real que lo sostenga.',
  falacia_circularidad: 'No detectas cuando la conclusión ya estaba contenida, con otras palabras, en la premisa que supuestamente la sostiene.',
  falacia_falsa_dicotomia: 'Aceptas que solo existen dos opciones posibles cuando en realidad hay alternativas intermedias no consideradas.',
  falacia_generalizacion_apresurada: 'Generalizas una conclusión a partir de muy pocos casos o de una muestra que no representa a la población completa.',
  falacia_hombre_de_paja: 'Confundes la versión distorsionada y simplificada de una postura con la postura real que se quiere refutar.',
  falacia_pendiente_resbaladiza: 'Aceptas que una acción moderada llevará inevitablemente a una cadena de consecuencias extremas, sin evidencia de que ese encadenamiento sea necesario.',
  fuente_no_evaluada: 'Aceptas o descartas una afirmación sin evaluar si la fuente que la respalda es pertinente o creíble para el tema específico.',
  generalizacion_invalida: 'Extiendes una conclusión más allá de lo que la evidencia disponible realmente permite sostener.',
  informacion_insuficiente_ignorada: 'Pasas por alto que la información disponible no alcanza para sostener la conclusión, y la aceptas como si fuera suficiente.',
  interes_mal_atribuido: 'Le atribuyes a una persona o institución un interés que la situación no respalda realmente.',
  jerarquia_normativa_incorrecta: 'Confundes el nivel jerárquico de una norma o el tipo de trámite legislativo que le corresponde.',
  organo_elector_confundido: 'Confundes qué órgano o autoridad tiene realmente la competencia para elegir, nombrar o controlar un cargo específico.',
  solucion_parcial: 'Aceptas una solución que atiende solo una parte del problema como si resolviera el problema completo.',
  vulneracion_disfrazada: 'No reconoces cuando una conducta formalmente correcta produce, en la práctica, el mismo efecto que una vulneración directa y abierta.',
}

// Etiqueta corta por patrón, para la insignia "Trampa: …" en el panel de
// confusión (distinta de DESCRIPCIONES_PATRON, que es la frase larga del
// callout de "error más frecuente").
export const ETIQUETAS_PATRON = {
  concordancia_incorrecta: 'Concordancia incorrecta',
  estructura_gramatical_invalida: 'Estructura gramatical inválida',
  falso_amigo: 'Falso amigo',
  fuera_de_contexto: 'Fuera de contexto',
  logica_conversacional_rota: 'Lógica conversacional rota',
  preposicion_incorrecta: 'Preposición incorrecta',
  referencia_incorrecta: 'Referencia incorrecta',
  registro_inadecuado: 'Registro inadecuado',
  significado_cercano: 'Significado cercano',
  tiempo_verbal_incorrecto: 'Tiempo verbal incorrecto',

  // Lectura Crítica (ver src/data/lectura-critica/*.json).
  informacion_no_presente: 'Información no presente',
  sobreinterpretacion: 'Sobreinterpretación',
  generalizacion_indebida: 'Generalización indebida',
  confusion_tesis_antitesis: 'Confusión tesis/antítesis',
  inversion_causal: 'Inversión causal',
  enfoque_parcial: 'Enfoque parcial',
  fuera_de_alcance_pregunta: 'Fuera de alcance',
  confusion_figura_retorica: 'Confusión de figura retórica',

  // Competencias Ciudadanas (ver src/data/competencias-ciudadanas/*.json).
  alcance_incorrecto_derecho: 'Alcance incorrecto del derecho',
  causa_efecto_invertida: 'Causa-efecto invertida',
  confusion_dimension: 'Confusión de dimensión',
  derecho_incompleto_identificado: 'Derecho identificado de forma incompleta',
  falacia_ad_hominem: 'Falacia ad hominem',
  falacia_apelacion_autoridad: 'Falacia de apelación a la autoridad',
  falacia_apelacion_emocion: 'Falacia de apelación a la emoción',
  falacia_circularidad: 'Falacia de circularidad',
  falacia_falsa_dicotomia: 'Falacia de falsa dicotomía',
  falacia_generalizacion_apresurada: 'Falacia de generalización apresurada',
  falacia_hombre_de_paja: 'Falacia del hombre de paja',
  falacia_pendiente_resbaladiza: 'Falacia de la pendiente resbaladiza',
  fuente_no_evaluada: 'Fuente no evaluada',
  generalizacion_invalida: 'Generalización inválida',
  informacion_insuficiente_ignorada: 'Información insuficiente ignorada',
  interes_mal_atribuido: 'Interés mal atribuido',
  jerarquia_normativa_incorrecta: 'Jerarquía normativa incorrecta',
  organo_elector_confundido: 'Órgano elector confundido',
  solucion_parcial: 'Solución parcial',
  vulneracion_disfrazada: 'Vulneración disfrazada',
}
