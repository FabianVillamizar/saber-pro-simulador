// Proporción real por parte del módulo de Inglés (45 preguntas: 1-7).
// El ICFES solo publica el tiempo combinado de los 5 módulos genéricos,
// no el de Inglés por separado, así que 50 min es un estimado inicial
// configurable por quien arma el simulacro, no un valor fijo del ICFES.
export const DISTRIBUCION_DEFECTO = { 1: 5, 2: 5, 3: 5, 4: 8, 5: 7, 6: 5, 7: 10 }
export const DURACION_DEFECTO_MINUTOS = 50

function barajar(items) {
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function agruparPorGrupo(preguntas) {
  const grupos = new Map()
  for (const p of preguntas) {
    if (!grupos.has(p.grupoId)) grupos.set(p.grupoId, [])
    grupos.get(p.grupoId).push(p)
  }
  return [...grupos.values()]
}

// Baraja preguntas manteniendo juntas las que comparten grupoId (mismo
// texto/banco de opciones): se barajan los grupos completos, no cada
// pregunta suelta, para no separar preguntas que "se basan en el mismo
// texto". Usado tanto para armar el simulacro como la cola de práctica
// por parte.
export function barajarPorGrupo(preguntas) {
  return barajar(agruparPorGrupo(preguntas)).flat()
}

// Selecciona `cantidad` preguntas de una parte barajando grupos completos
// y cortando al total exacto. Funciona igual para partes con grupos de 1
// pregunta (conversación) que con grupos de varias (emparejamiento,
// cloze, comprensión).
function seleccionarPreguntasParte(preguntasParte, cantidad) {
  const gruposBarajados = barajar(agruparPorGrupo(preguntasParte))
  const seleccionadas = []
  for (const grupo of gruposBarajados) {
    if (seleccionadas.length >= cantidad) break
    seleccionadas.push(...grupo)
  }
  return seleccionadas.slice(0, cantidad)
}

export function armarSimulacro(preguntas, distribucion = DISTRIBUCION_DEFECTO) {
  const porParte = {}
  for (const p of preguntas) {
    ;(porParte[p.parte] ??= []).push(p)
  }

  const seleccionadas = []
  const advertencias = []

  for (const parte of Object.keys(distribucion).map(Number).sort((a, b) => a - b)) {
    const cantidad = distribucion[parte]
    const disponibles = porParte[parte] ?? []
    if (disponibles.length < cantidad) {
      advertencias.push(
        `Parte ${parte}: se pidieron ${cantidad} preguntas pero solo hay ${disponibles.length} disponibles.`
      )
    }
    seleccionadas.push(...seleccionarPreguntasParte(disponibles, cantidad))
  }

  return { preguntas: seleccionadas, advertencias }
}

export function calificarSimulacro(preguntas, respuestas) {
  let correctas = 0
  const detalle = preguntas.map((pregunta) => {
    const elegida = respuestas[pregunta.id]
    const esCorrecta = elegida === pregunta.respuestaCorrecta
    if (esCorrecta) correctas++
    return { pregunta, elegida, esCorrecta }
  })
  return { correctas, total: preguntas.length, detalle }
}
