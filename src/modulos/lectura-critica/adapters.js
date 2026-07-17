import {
  adaptTextoLiterario,
  adaptTextoInformativo,
  adaptTextoDiscontinuo,
} from '../../engine/adapters/lecturaCritica.js'

// Mapa tipo -> adaptador de Lectura Crítica. Tres formatos de ítem, uno por
// tipo_texto (ver lecturaCritica.js para el detalle de cada contexto).
export const adaptersLecturaCritica = {
  continuo_literario: adaptTextoLiterario,
  continuo_informativo: adaptTextoInformativo,
  discontinuo: adaptTextoDiscontinuo,
}
