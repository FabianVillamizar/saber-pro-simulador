import './VisualRaster.css'

// Fotos/capturas reales (a diferencia de VisualSvg, que son diagramas
// dibujados a mano): se importan como <img> normal, con la URL ya resuelta
// por Vite (incluye el prefijo base de GitHub Pages automáticamente). Viven
// en src/assets/raster/<modulo>/, un archivo por imagen. Los IDs de ítem
// son únicos entre módulos, así que indexar solo por nombre de archivo (sin
// la carpeta) no genera colisiones — mismo criterio que VisualSvg.
const imagenesCrudas = import.meta.glob('../assets/raster/*/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})
const urlPorArchivo = Object.fromEntries(Object.entries(imagenesCrudas).map(([ruta, url]) => [ruta.split('/').pop(), url]))

export function VisualRaster({ archivo, descripcion }) {
  if (!archivo) return null
  const url = urlPorArchivo[archivo]
  if (!url) return null
  return (
    <div className="visual-raster">
      <img src={url} alt={descripcion ?? ''} loading="lazy" />
    </div>
  )
}
