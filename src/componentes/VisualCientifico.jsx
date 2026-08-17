import { GraficaDatos } from './GraficaDatos.jsx'
import { TablaDatos } from './TablaDatos.jsx'
import { VisualSvg } from './VisualSvg.jsx'
import { VisualRaster } from './VisualRaster.jsx'
import { VisualPendiente } from './VisualPendiente.jsx'

// Reemplaza las llamadas directas a VisualPendiente para tarjetas/ítems de
// Pensamiento Científico: elige el renderer según qué campo migrado trae el
// ítem (grafica_datos_estructurados / tabla_filas / imagen), y solo cae de
// vuelta al marcador "en construcción" si ninguno de los tres llegó aún.
// `imagen` puede ser un SVG dibujado a mano (VisualSvg, temable) o una
// foto/captura real (VisualRaster, <img> normal) — se distingue por la
// extensión del archivo, sin agregar un campo nuevo al esquema.
export function VisualCientifico({ tipo, descripcion, graficaDatos, tablaDatos, imagen }) {
  if (!tipo || tipo === 'ninguno') return null
  if (graficaDatos) return <GraficaDatos datos={graficaDatos} />
  if (tablaDatos) return <TablaDatos datos={tablaDatos} />
  if (imagen?.endsWith('.svg')) return <VisualSvg archivo={imagen} descripcion={descripcion} />
  if (imagen) return <VisualRaster archivo={imagen} descripcion={descripcion} />
  return <VisualPendiente tipo={tipo} descripcion={descripcion} />
}
