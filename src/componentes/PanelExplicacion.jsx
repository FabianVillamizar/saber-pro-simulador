import './PanelExplicacion.css'

export function PanelExplicacion({ pregunta, seleccion, esCorrecta }) {
  const distractor = !esCorrecta ? pregunta.distractores?.[seleccion] : null

  return (
    <div className={`panel-explicacion ${esCorrecta ? 'panel-explicacion--correcta' : 'panel-explicacion--incorrecta'}`}>
      <p className="panel-explicacion-titulo">
        {esCorrecta
          ? 'Correcto'
          : `Incorrecto — la respuesta correcta era ${pregunta.respuestaCorrecta}: ${pregunta.opciones[pregunta.respuestaCorrecta]}`}
      </p>
      {pregunta.explicacionCorrecta && <p className="panel-explicacion-cuerpo">{pregunta.explicacionCorrecta}</p>}
      {distractor && (
        <p className="panel-explicacion-cuerpo">
          <strong>Por qué falla esta opción</strong>
          {distractor.patron_trampa ? ` (${distractor.patron_trampa})` : ''}: {distractor.explicacion}
        </p>
      )}
    </div>
  )
}
