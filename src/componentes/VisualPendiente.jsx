import { IconoImagen } from './iconos.jsx'
import './VisualPendiente.css'

const ETIQUETAS_TIPO_VISUAL = {
  grafica_datos: 'Gráfica',
  tabla: 'Tabla',
  diagrama_esquematico: 'Diagrama',
  estructura_quimica: 'Estructura química',
}

// Marcador temporal para tarjetas/ítems de Pensamiento Científico cuyo
// gráfico/SVG real todavía no se ha generado: muestra `visual_descripcion`
// como referencia de lo que va a haber ahí. Cuando llegue el recurso real
// (SVG o datos estructurados), el punto de reemplazo es este componente —
// sigue leyendo `tipo`/`descripcion`, solo cambia qué renderiza por dentro.
export function VisualPendiente({ tipo, descripcion }) {
  if (!tipo || tipo === 'ninguno') return null
  return (
    <div className="visual-pendiente">
      <div className="visual-pendiente-icono" aria-hidden="true">
        <IconoImagen color="var(--text-faint)" />
      </div>
      <div className="visual-pendiente-cuerpo">
        <div className="visual-pendiente-etiqueta">{ETIQUETAS_TIPO_VISUAL[tipo] ?? 'Recurso visual'} en construcción</div>
        {descripcion && <p className="visual-pendiente-descripcion">{descripcion}</p>}
      </div>
    </div>
  )
}
