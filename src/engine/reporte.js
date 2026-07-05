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

// Cuenta el patrón de trampa de las opciones incorrectas elegidas, no el
// número de fallos en sí: agrupa por el *tipo* de error recurrente
// (fuera_de_contexto, tiempo_verbal_incorrecto, etc.), no por pregunta.
// Las partes 1/2 (emparejamiento) no tienen distractores clasificados en
// los datos, así que sus fallos no entran en este conteo.
// Frase humana por patrón de trampa, para el callout de "error más
// frecuente" del Resultado. Cubre los patron_trampa reales presentes en
// los datos de Inglés (ver src/data/ingles/*.json).
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

export function patronesTrampaFrecuentes(detalle) {
  const conteo = new Map()
  for (const { pregunta, elegida, esCorrecta } of detalle) {
    if (esCorrecta || !elegida) continue
    const patron = pregunta.distractores?.[elegida]?.patron_trampa
    if (!patron) continue
    conteo.set(patron, (conteo.get(patron) ?? 0) + 1)
  }
  return [...conteo.entries()]
    .map(([patron, cantidad]) => ({ patron, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
}
