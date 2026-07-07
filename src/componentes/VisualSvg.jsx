import './VisualSvg.css'

// SVGs generados a mano en src/assets/visuals/pensamiento-cientifico/, uno
// por ítem (diagrama_esquematico / estructura_quimica). Se inyectan como
// markup en el DOM (no <img src>) para que sus `fill`/`stroke` en
// var(--text)/var(--accent)/etc. resuelvan contra el tema activo de la
// página — un SVG cargado vía <img> es un documento aparte y no heredaría
// esas custom properties.
const svgsCrudos = import.meta.glob('../assets/visuals/pensamiento-cientifico/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const svgPorArchivo = Object.fromEntries(Object.entries(svgsCrudos).map(([ruta, contenido]) => [ruta.split('/').pop(), contenido]))

export function VisualSvg({ archivo, descripcion }) {
  if (!archivo) return null
  const contenido = svgPorArchivo[archivo]
  if (!contenido) return null
  return (
    <div
      className="visual-svg"
      role="img"
      aria-label={descripcion ?? ''}
      dangerouslySetInnerHTML={{ __html: contenido }}
    />
  )
}
