import { adaptSituacion } from '../../engine/adapters/situacion.js'

// Mapa tipo -> adaptador de Competencias Ciudadanas. Un solo formato de
// ítem (grupo de situación + preguntas), a diferencia de los 7 tipos de
// Inglés.
export const adaptersCompetenciasCiudadanas = {
  situacion_multiple: adaptSituacion,
}
