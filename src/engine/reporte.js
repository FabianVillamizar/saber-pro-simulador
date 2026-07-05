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
}
