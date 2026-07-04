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

  return null
}
