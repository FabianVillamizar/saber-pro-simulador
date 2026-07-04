import { useEffect, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { armarSimulacro, calificarSimulacro, DURACION_DEFECTO_MINUTOS } from '../engine/simulacro.js'
import { PreguntaMultipleChoice } from '../componentes/PreguntaMultipleChoice.jsx'
import { PanelExplicacion } from '../componentes/PanelExplicacion.jsx'
import './Simulacro.css'

function formatoTiempo(segundosTotales) {
  const m = Math.floor(segundosTotales / 60)
  const s = segundosTotales % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function Simulacro({ moduloId, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const [fase, setFase] = useState('config') // config | examen | resultados
  const [duracionMinutos, setDuracionMinutos] = useState(DURACION_DEFECTO_MINUTOS)
  const [examen, setExamen] = useState([])
  const [advertencias, setAdvertencias] = useState([])
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [tiempoRestante, setTiempoRestante] = useState(0)
  const [resultado, setResultado] = useState(null)

  // setTimeout encadenado en vez de setInterval: cada disparo recalcula
  // contra el estado más reciente, así que no se acumula drift ni queda
  // un closure con respuestas/examen desactualizados al terminar.
  useEffect(() => {
    if (fase !== 'examen') return
    if (tiempoRestante <= 0) {
      setResultado(calificarSimulacro(examen, respuestas))
      setFase('resultados')
      return
    }
    const id = setTimeout(() => setTiempoRestante((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [fase, tiempoRestante, examen, respuestas])

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  function comenzar() {
    const { preguntas: seleccionadas, advertencias: adv } = armarSimulacro(modulo.preguntas)
    setExamen(seleccionadas)
    setAdvertencias(adv)
    setRespuestas({})
    setIndice(0)
    setTiempoRestante(duracionMinutos * 60)
    setFase('examen')
  }

  function seleccionarOpcion(letra) {
    const pregunta = examen[indice]
    setRespuestas((r) => ({ ...r, [pregunta.id]: letra }))
  }

  function irA(i) {
    setIndice(Math.max(0, Math.min(examen.length - 1, i)))
  }

  function finalizarManualmente() {
    const sinResponder = examen.length - Object.keys(respuestas).length
    if (
      sinResponder > 0 &&
      !window.confirm(`Aún tienes ${sinResponder} pregunta(s) sin responder. ¿Terminar de todas formas?`)
    ) {
      return
    }
    setResultado(calificarSimulacro(examen, respuestas))
    setFase('resultados')
  }

  if (fase === 'config') {
    return (
      <div className="page">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={onVolver}>
            ← {modulo.nombre}
          </button>
        </div>
        <h1>Simulacro completo</h1>
        <p className="simulacro-info">
          45 preguntas (5/5/5/8/7/5/10 por parte 1-7), cronometrado. El ICFES no publica un
          tiempo oficial para Inglés por separado — solo el total combinado de los 5 módulos
          genéricos — así que esto es un estimado inicial configurable, no un valor oficial.
        </p>
        <label className="simulacro-duracion">
          Duración (minutos)
          <input
            type="number"
            min="5"
            max="180"
            value={duracionMinutos}
            onChange={(e) => setDuracionMinutos(Number(e.target.value))}
          />
        </label>
        <button type="button" className="boton-primario" onClick={comenzar}>
          Comenzar simulacro
        </button>
      </div>
    )
  }

  if (fase === 'examen') {
    const pregunta = examen[indice]
    return (
      <div className="page">
        <div className="barra-superior simulacro-barra">
          <span className="simulacro-tiempo">⏱ {formatoTiempo(tiempoRestante)}</span>
          <span className="simulacro-indice">
            Pregunta {indice + 1} de {examen.length} · Parte {pregunta.parte}
          </span>
          <button type="button" className="boton-secundario" onClick={finalizarManualmente}>
            Terminar
          </button>
        </div>

        {advertencias.length > 0 && (
          <div className="simulacro-advertencia">
            {advertencias.map((a) => (
              <p key={a}>{a}</p>
            ))}
          </div>
        )}

        <PreguntaMultipleChoice
          pregunta={pregunta}
          seleccion={respuestas[pregunta.id] ?? null}
          onSeleccionar={seleccionarOpcion}
          deshabilitado={false}
          mostrarCorreccion={false}
        />

        <div className="simulacro-navegacion">
          <button type="button" className="boton-secundario" disabled={indice === 0} onClick={() => irA(indice - 1)}>
            Anterior
          </button>
          <button
            type="button"
            className="boton-primario"
            disabled={indice === examen.length - 1}
            onClick={() => irA(indice + 1)}
          >
            Siguiente
          </button>
        </div>

        <div className="simulacro-mapa">
          {examen.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`simulacro-mapa-item${i === indice ? ' simulacro-mapa-item--actual' : ''}${
                respuestas[p.id] ? ' simulacro-mapa-item--respondida' : ''
              }`}
              onClick={() => irA(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // fase === 'resultados'
  return (
    <div className="page">
      <div className="barra-superior">
        <button type="button" className="boton-volver" onClick={onVolver}>
          ← {modulo.nombre}
        </button>
      </div>
      <h1>Resultado del simulacro</h1>
      <p className="simulacro-puntaje">
        {resultado.correctas} / {resultado.total} correctas ({Math.round((resultado.correctas / resultado.total) * 100)}
        %)
      </p>

      <div className="simulacro-detalle">
        {resultado.detalle.map(({ pregunta, elegida, esCorrecta }, i) => (
          <div key={pregunta.id} className="simulacro-detalle-item">
            <p className="simulacro-detalle-numero">
              Pregunta {i + 1} · Parte {pregunta.parte}
            </p>
            <PreguntaMultipleChoice
              pregunta={pregunta}
              seleccion={elegida ?? null}
              onSeleccionar={() => {}}
              deshabilitado
              mostrarCorreccion
            />
            {elegida ? (
              <PanelExplicacion pregunta={pregunta} seleccion={elegida} esCorrecta={esCorrecta} />
            ) : (
              <p className="simulacro-no-respondida">No respondida.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
