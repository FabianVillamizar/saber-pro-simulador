import { GraficaDatos } from './GraficaDatos.jsx'
import { TablaDatos } from './TablaDatos.jsx'
import { VisualSvg } from './VisualSvg.jsx'
import { VisualPendiente } from './VisualPendiente.jsx'

// Reemplaza las llamadas directas a VisualPendiente para tarjetas/ítems de
// Pensamiento Científico: elige el renderer según qué campo migrado trae el
// ítem (grafica_datos_estructurados / tabla_filas / imagen), y solo cae de
// vuelta al marcador "en construcción" si ninguno de los tres llegó aún.
export function VisualCientifico({ tipo, descripcion, graficaDatos, tablaDatos, imagen }) {
  if (!tipo || tipo === 'ninguno') return null
  if (graficaDatos) return <GraficaDatos datos={graficaDatos} />
  if (tablaDatos) return <TablaDatos datos={tablaDatos} />
  if (imagen) return <VisualSvg archivo={imagen} descripcion={descripcion} />
  return <VisualPendiente tipo={tipo} descripcion={descripcion} />
}
