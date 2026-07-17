import { Formula } from './Formula.jsx'
import { VisualCientifico } from './VisualCientifico.jsx'
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
        {contexto.pills?.length > 0 && (
          <div className="contexto-pills">
            {contexto.pills.map((pill) => (
              <span key={pill} className="contexto-pill">
                {pill}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Pensamiento Científico: contexto de texto + fórmula opcional (ya
  // renderizada con KaTeX) + visual opcional (gráfica/tabla/diagrama/
  // estructura, ver VisualCientifico.jsx para qué renderer elige cada uno).
  if (contexto.tipo === 'contexto_cientifico') {
    return (
      <div className="contexto contexto--pasaje">
        <p className="contexto-texto">{contexto.texto}</p>
        {contexto.formulaLatex && (
          <div className="contexto-formula-inline">
            <Formula tex={contexto.formulaLatex} bloque />
          </div>
        )}
        {contexto.tipoVisual && contexto.tipoVisual !== 'ninguno' && (
          <div className="contexto-visual">
            <VisualCientifico
              tipo={contexto.tipoVisual}
              descripcion={contexto.visualDescripcion}
              graficaDatos={contexto.graficaDatosEstructurados}
              tablaDatos={contexto.tablaFilas}
              imagen={contexto.imagen}
            />
          </div>
        )}
      </div>
    )
  }

  // Lectura Crítica — texto continuo literario: extracto real de dominio
  // público. La fuente se muestra siempre visible debajo del texto (no se
  // oculta como si fuera contenido genérico del banco de estudio); si el
  // material trae una nota de fuente (derechos de autor, aclaración de
  // atribución), se muestra debajo en un tono más discreto.
  if (contexto.tipo === 'texto_base_literario') {
    return (
      <div className="contexto contexto--pasaje">
        {contexto.generoTexto && (
          <div className="contexto-pills">
            <span className="contexto-pill">{contexto.generoTexto}</span>
          </div>
        )}
        <p className="contexto-texto">{contexto.texto}</p>
        {contexto.fuente && <p className="contexto-fuente">— {contexto.fuente}</p>}
        {contexto.fuenteNota && <p className="contexto-fuente-nota">{contexto.fuenteNota}</p>}
      </div>
    )
  }

  // Lectura Crítica — texto discontinuo: infografía/tabla/gráfico/cómic/
  // anuncio descrito en texto (no hay arte real todavía) y construido con
  // datos ficticios a propósito. La etiqueta de "datos ficticios" es
  // obligatoria y siempre visible para que nunca se confunda con una
  // estadística real.
  if (contexto.tipo === 'discontinuo_lc') {
    return (
      <div className="contexto contexto--pasaje contexto--discontinuo">
        <div className="contexto-pills">
          {contexto.generoTexto && <span className="contexto-pill">{contexto.generoTexto}</span>}
          <span className="contexto-badge-ficticio">Ejercicio de práctica — datos ficticios</span>
        </div>
        <p className="contexto-texto contexto-texto--discontinuo">{contexto.texto}</p>
      </div>
    )
  }

  // Razonamiento Cuantitativo (sin datos reales todavía): tablas/gráficas
  // ya renderizadas a SVG por separado, o notación matemática renderizada
  // del lado del cliente con KaTeX.
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
