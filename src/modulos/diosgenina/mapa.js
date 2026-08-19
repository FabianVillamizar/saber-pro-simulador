// Estructura estática de la "Ruta del protocolo" de Diosgenina: los 9
// bloques del banco (`bloque` en cada tarjeta de `src/data/diosgenina/`),
// agrupados en 6 etapas que reflejan el orden real del protocolo de
// laboratorio del semillero, no un orden alfabético ni de dificultad. Igual
// que `quimica-completa/mapa.js`, es la única fuente de verdad del grafo —
// el estado real (dominado/bloqueado/etc.) se calcula en vivo en
// ExploracionDiosgenina.jsx a partir del SRS del perfil, nunca aquí.
//
// `entradas`/`salidas` vienen literalmente de `prerequisites_de_bloque` /
// `bloques_futuros_que_dependen_de_este` de los 9 JSON fuente (ver
// Downloads/Simulador estudio/Diosgenina/BITACORA.md) — no son una
// simplificación, cada tarjeta individual declara sus propios `prereqs`
// hacia tarjetas concretas de otros bloques, así que el bloqueo real que
// calcula `estadoDeGrupo` (engine/srs.js) es más preciso que esta vista de
// bloque-a-bloque; esta estructura es solo para agrupar y ordenar la
// pantalla.
export const BLOQUES = [
  { codigo: 'FQT', etapa: 0, entradas: [], salidas: ['HID', 'ELL', 'TLC', 'SER', 'ESP', 'HPL', 'PFT', 'EST'] },
  { codigo: 'HID', etapa: 1, entradas: ['FQT'], salidas: ['ELL', 'SER', 'ESP', 'HPL', 'EST'] },
  { codigo: 'ELL', etapa: 1, entradas: ['FQT'], salidas: ['SER', 'PFT', 'TLC', 'HPL'] },
  { codigo: 'TLC', etapa: 1, entradas: ['FQT'], salidas: ['ESP', 'HPL'] },
  { codigo: 'SER', etapa: 2, entradas: ['FQT', 'ELL'], salidas: ['ESP', 'HPL', 'PFT', 'EST'] },
  { codigo: 'ESP', etapa: 2, entradas: ['FQT', 'TLC'], salidas: ['HPL', 'PFT', 'EST'] },
  { codigo: 'HPL', etapa: 3, entradas: ['FQT', 'TLC', 'ESP'], salidas: ['PFT', 'EST'] },
  { codigo: 'PFT', etapa: 4, entradas: ['ESP', 'ELL'], salidas: ['EST'] },
  { codigo: 'EST', etapa: 5, entradas: ['HID', 'SER', 'ESP', 'HPL'], salidas: [] },
]

export const ETIQUETA_ETAPA = [
  'Raíz · sin prerrequisitos',
  'Preparación de la muestra',
  'Acondicionamiento y lectura',
  'Instrumentación integrada',
  'Síntesis experimental',
  'Interpretación · cierre',
]
