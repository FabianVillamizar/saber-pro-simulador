import katex from 'katex'
import 'katex/dist/katex.min.css'
import './Formula.css'

// Renderiza LaTeX del lado del cliente (KaTeX), no como imagen: así se
// adapta a modo claro/oscuro (hereda color de texto) y se ve nítido en
// cualquier pantalla/zoom. Usado por `formula_latex` de Pensamiento
// Científico (y, en el futuro, de Razonamiento Cuantitativo).
export function Formula({ tex, bloque = false }) {
  if (!tex) return null
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: bloque })
  return <span className="formula-latex" dangerouslySetInnerHTML={{ __html: html }} />
}
