// Proporción real por parte del módulo de Inglés (45 preguntas: 1-7).
// El ICFES solo publica el tiempo combinado de los 5 módulos genéricos,
// no el de Inglés por separado, así que 50 min es un estimado inicial
// configurable por quien arma el simulacro, no un valor fijo del ICFES.
export const DISTRIBUCION_DEFECTO = { 1: 5, 2: 5, 3: 5, 4: 8, 5: 7, 6: 5, 7: 10 }
export const DURACION_DEFECTO_MINUTOS = 50

// Razonamiento Cuantitativo: las 3 competencias oficiales ICFES (`parte` =
// `pregunta.competencia`, ver adapters/contextoRC.js) están casi parejas
// en el banco real (30/32/33 de 95 preguntas) — la distribución de abajo
// escala esa misma proporción a un simulacro de 30 preguntas (9/10/11),
// dejando el resto del banco de 95 disponible para variar entre intentos.
// El ICFES tampoco publica un tamaño ni tiempo oficial por módulo genérico
// por separado, así que 30 preguntas / 35 min es un estimado propio, igual
// de explícito que el de Inglés arriba — no un valor oficial.
export const DISTRIBUCION_RC = {
  interpretacion_representacion: 11,
  formulacion_ejecucion: 10,
  argumentacion: 9,
}
export const DURACION_RC_MINUTOS = 35

// Lectura Crítica: las 3 competencias oficiales ICFES (`parte` =
// `pregunta.competencia`, ver engine/adapters/lecturaCritica.js) están casi
// parejas en el banco real (48/49/53 de 150 preguntas, incluido el lote UIS
// del 2026-08-17) — la distribución de abajo escala esa misma proporción a
// un simulacro de 30 preguntas, igual que RC. Mismo criterio de estimado
// propio explícito: el ICFES no publica tamaño ni tiempo oficial por módulo
// genérico por separado; 40 min (vs. 35 de RC) porque leer textos completos
// toma más tiempo que resolver ítems numéricos.
export const DISTRIBUCION_LC = {
  identificacion_local: 10,
  comprension_global: 10,
  reflexion_evaluacion: 10,
}
export const DURACION_LC_MINUTOS = 40

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

const LETRAS = ['A', 'B', 'C', 'D']

// Los ítems de opción múltiple de CC/PC/RC/LC (formato "grupo + preguntas",
// opciones A-D fijas en el JSON fuente) comparten PreguntaMultipleChoice.jsx
// y PanelExplicacion.jsx para render y feedback. Un audit de los ~150 ítems
// reales de Lectura Crítica encontró que la opción correcta es la más larga
// en el 90% de los casos (ver bitácora del módulo, 2026-09-05) — adivinable
// sin leer, igual que el sesgo que ya se corrigió en el Quiz Rápido de
// Competencias Ciudadanas. Esta función baraja el orden A-D UNA VEZ por
// pregunta (se llama al armar la cola/examen, no en cada render) y
// re-etiqueta `opciones`/`respuestaCorrecta`/`distractores`/`opcionesImagen`
// a las letras nuevas — así toda la pregunta queda consistente en cualquier
// componente que la use después (PreguntaMultipleChoice, PanelExplicacion,
// el registro de patrón_trampa por letra), en vez de barajar solo la vista
// y dejar que otro componente siga leyendo la letra original de los datos.
export function barajarOpcionesPregunta(pregunta) {
  if (!pregunta.opciones) return pregunta
  const original = Object.keys(pregunta.opciones)
  // nuevoOrden[i] = letra original que va a ocupar la posición visual i
  // (LETRAS[i]). Construir el objeto remapeado RECORRIENDO nuevoOrden (no
  // las claves originales) es lo que garantiza que Object.keys() salga
  // A,B,C,D en ese orden — recorrer las claves originales y solo traducir
  // cada una con `mapa` deja el objeto insertado en un orden dependiente
  // del azar (ej. C,A,D,B), que Object.entries()/PreguntaMultipleChoice.jsx
  // renderizaría tal cual, mostrando las opciones fuera de orden en pantalla.
  const nuevoOrden = barajar(original)
  const mapa = Object.fromEntries(nuevoOrden.map((letraOriginal, i) => [letraOriginal, LETRAS[i]]))
  const remapear = (obj) => {
    if (!obj) return obj
    const resultado = {}
    for (const [i, letraOriginal] of nuevoOrden.entries()) {
      if (letraOriginal in obj) resultado[LETRAS[i]] = obj[letraOriginal]
    }
    return resultado
  }
  return {
    ...pregunta,
    opciones: remapear(pregunta.opciones),
    respuestaCorrecta: mapa[pregunta.respuestaCorrecta],
    distractores: remapear(pregunta.distractores),
    opcionesImagen: remapear(pregunta.opcionesImagen),
  }
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

  // `Object.keys()` ya entrega las claves numéricas de Inglés (1-7) en
  // orden ascendente por especificación de JS, y las claves de texto de
  // RC (competencias ICFES) en el orden de inserción del objeto — no hace
  // falta forzar `Number()` (que rompía las claves no numéricas, dejando
  // `porParte[NaN]` sin preguntas).
  for (const parte of Object.keys(distribucion)) {
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
