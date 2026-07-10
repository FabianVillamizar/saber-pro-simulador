import { adaptContextoDiosgenina } from '../../engine/adapters/contextoDiosgenina.js'

// Un solo formato de ítem en diosgenina (contexto + preguntas), con
// `tipo: "item"` ya presente en los JSON fuente — a diferencia de
// Pensamiento Científico, no hace falta inyectarlo al copiar los datos.
export const adaptersDiosgenina = {
  item: adaptContextoDiosgenina,
}
