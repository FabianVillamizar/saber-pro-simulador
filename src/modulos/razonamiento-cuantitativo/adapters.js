import { adaptContextoRC } from '../../engine/adapters/contextoRC.js'

// Mapa tipo -> adaptador de Razonamiento Cuantitativo. Un solo formato de
// ítem (grupo de contexto + varias preguntas), igual que Competencias
// Ciudadanas. Los JSON fuente no traen `tipo`: se le inyectó
// "contexto_rc" a cada grupo al copiarlos a src/data/.
export const adaptersRazonamientoCuantitativo = {
  contexto_rc: adaptContextoRC,
}
