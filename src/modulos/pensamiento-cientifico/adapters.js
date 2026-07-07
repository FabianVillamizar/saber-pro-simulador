import { adaptContextoCientifico } from '../../engine/adapters/contextoCientifico.js'

// Mapa tipo -> adaptador de Pensamiento Científico. Un solo formato de
// ítem (grupo de contexto científico + 1 pregunta), igual que Competencias
// Ciudadanas. Los JSON fuente no traen `tipo` (a diferencia de CC): se le
// inyectó "contexto_cientifico" a cada grupo al copiarlos a src/data/.
export const adaptersPensamientoCientifico = {
  contexto_cientifico: adaptContextoCientifico,
}
