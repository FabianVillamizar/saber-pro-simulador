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

// `fuente` es opcional: una foto/figura real tomada de un artículo trae
// `{ texto, doi }` (cita corta + DOI, sin "https://doi.org/") y se muestra
// como pie visible con enlace — a diferencia de `descripcion`, que solo
// llega al alt-text. Un diagrama propio (sin `fuente`) no muestra pie.
export function VisualRaster({ archivo, descripcion, fuente }) {
  if (!archivo) return null
  const url = urlPorArchivo[archivo]
  if (!url) return null
  return (
    <figure className="visual-raster">
      <img src={url} alt={descripcion ?? ''} loading="lazy" />
      {fuente?.texto && (
        <figcaption className="visual-raster-fuente">
          {fuente.texto}
          {fuente.doi && (
            <>
              {' · '}
              <a href={`https://doi.org/${fuente.doi}`} target="_blank" rel="noopener noreferrer">
                DOI
              </a>
            </>
          )}
        </figcaption>
      )}
    </figure>
  )
}
