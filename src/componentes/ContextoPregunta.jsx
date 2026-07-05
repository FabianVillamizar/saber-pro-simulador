import { Formula } from './Formula.jsx'
import './ContextoPregunta.css'

function TextoConMarcadores({ texto, huecoActual }) {
  const partes = texto.split(/(\[\d+\])/g)
  return (
    <p className="contexto-texto">
      {partes.map((parte, i) => {
        const coincidencia = parte.match(/^\[(\d+)\]$/)
        if (!coincidencia) return <span key={i}>{parte}</span>
        const numero = Number(coincidencia[1])
        return (
          <mark key={i} className={numero === huecoActual ? 'marcador marcador--actual' : 'marcador'}>
            [{numero}]
          </mark>
        )
      })}
    </p>
  )
}

export function ContextoPregunta({ contexto, numEnGrupo }) {
  if (!contexto) return null

  if (contexto.tipo === 'banco_opciones') {
    return (
      <div className="contexto contexto--banco">
        {contexto.tema && <p className="contexto-tema">Tema: {contexto.tema}</p>}
      </div>
    )
  }

  if (contexto.tipo === 'texto_con_huecos') {
    return (
      <div className="contexto contexto--pasaje">
        {contexto.titulo && <h3 className="contexto-titulo">{contexto.titulo}</h3>}
        <TextoConMarcadores texto={contexto.texto} huecoActual={numEnGrupo} />
      </div>
    )
  }

  if (contexto.tipo === 'texto_base') {
    return (
      <div className="contexto contexto--pasaje">
        <p className="contexto-texto">{contexto.texto}</p>
      </div>
    )
  }

  // Razonamiento Cuantitativo / Pensamiento Científico (sin datos reales
  // todavía): tablas/gráficas ya renderizadas a SVG por separado, o
  // notación matemática renderizada del lado del cliente con KaTeX.
  if (contexto.tipo === 'imagen') {
    return (
      <div className="contexto contexto--imagen">
        <img src={contexto.imagen} alt={contexto.descripcion ?? ''} />
      </div>
    )
  }

  if (contexto.tipo === 'formula') {
    return (
      <div className="contexto contexto--formula">
        <Formula tex={contexto.tex} bloque />
      </div>
    )
  }

  return null
}
