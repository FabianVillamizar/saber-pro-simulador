import { ETIQUETAS_PATRON } from '../engine/reporte.js'
import './PanelExplicacion.css'

export function PanelExplicacion({ pregunta, seleccion, esCorrecta }) {
  const distractorElegido = !esCorrecta ? pregunta.distractores?.[seleccion] : null
  const otrosDistractores = pregunta.distractores
    ? Object.entries(pregunta.distractores).filter(([letra]) => letra !== seleccion)
    : []

  return (
    <div className="panel-explicacion-grupo">
      <div className={`panel-explicacion ${esCorrecta ? 'panel-explicacion--correcta' : 'panel-explicacion--incorrecta'}`}>
        <p className="panel-explicacion-titulo">
          {esCorrecta
            ? 'Correcto'
            : `Incorrecto — la respuesta correcta era ${pregunta.respuestaCorrecta}: ${pregunta.opciones[pregunta.respuestaCorrecta]}`}
        </p>
        {pregunta.explicacionCorrecta && (
          <>
            <p className="panel-explicacion-label">Por qué es correcta</p>
            <p className="panel-explicacion-cuerpo">{pregunta.explicacionCorrecta}</p>
          </>
        )}
      </div>

      {distractorElegido && (
        <div className="panel-confusion">
          <span className="panel-confusion-icono" />
          <div>
            <div className="panel-confusion-cabecera">
              <span className="panel-confusion-label">En qué te confundiste</span>
              {distractorElegido.patron_trampa && (
                <span className="panel-confusion-badge">
                  Trampa: {ETIQUETAS_PATRON[distractorElegido.patron_trampa] ?? distractorElegido.patron_trampa}
                </span>
              )}
            </div>
            <p className="panel-confusion-texto">{distractorElegido.explicacion}</p>
          </div>
        </div>
      )}

      {otrosDistractores.length > 0 && (
        <details className="panel-otras">
          <summary>Ver por qué las otras opciones tampoco son correctas</summary>
          <div className="panel-otras-lista">
            {otrosDistractores.map(([letra, d]) => (
              <div key={letra} className="panel-otras-item">
                <span className="panel-otras-letra">{letra}</span>
                <div>
                  <p className="panel-otras-texto">{d.explicacion}</p>
                  {d.patron_trampa && (
                    <span className="panel-otras-badge">Trampa: {ETIQUETAS_PATRON[d.patron_trampa] ?? d.patron_trampa}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
