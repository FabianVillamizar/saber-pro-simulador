import katex from 'katex'
import 'katex/dist/katex.min.css'
import './Formula.css'

// Fragmentos de markdown mínimo compartidos por TextoConFormulas y su
// superset TextoConReglas: `$...$` (inline), `$$...$$` (bloque) y
// `**negrita**`. Vive en su propio archivo (sin exportar componentes) para
// no romper el fast-refresh de los componentes que lo consumen.

export const PATRON = /(\$\$[^$]+?\$\$|\$[^$]+?\$|\*\*.+?\*\*)/g

function renderizarFormula(tex, bloque, key) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: bloque })
  return (
    <span
      key={key}
      className={bloque ? 'formula-latex formula-latex-bloque' : 'formula-latex'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function renderizarFragmento(fragmento, key) {
  if (fragmento.startsWith('$$') && fragmento.endsWith('$$')) {
    return renderizarFormula(fragmento.slice(2, -2), true, key)
  }
  if (fragmento.startsWith('$') && fragmento.endsWith('$')) {
    return renderizarFormula(fragmento.slice(1, -1), false, key)
  }
  if (fragmento.startsWith('**') && fragmento.endsWith('**')) {
    return <strong key={key}>{fragmento.slice(2, -2)}</strong>
  }
  return <span key={key}>{fragmento}</span>
}

// Renderiza una cadena suelta con los mismos fragmentos inline (`$...$`,
// `**negrita**`) — para contextos donde el texto no pasa por el split
// principal de un párrafo, como el texto visible de un disparador de
// regla en TextoConReglas. Sin ningún fragmento especial devuelve el
// texto tal cual, así que es seguro usarlo en cualquier etiqueta.
export function renderizarTextoInline(texto, prefijo = 't') {
  if (texto == null || texto === '') return null
  return String(texto)
    .split(PATRON)
    .filter((parte) => parte !== '')
    .map((frag, i) => renderizarFragmento(frag, `${prefijo}-${i}`))
}
