import { ContextoPregunta } from './ContextoPregunta.jsx'
import './PreguntaMultipleChoice.css'

export function PreguntaMultipleChoice({
  pregunta,
  seleccion,
  onSeleccionar,
  deshabilitado = false,
  mostrarCorreccion = false,
}) {
  return (
    <div className="pregunta">
      <ContextoPregunta contexto={pregunta.contexto} numEnGrupo={pregunta.numEnGrupo} />
      <p className="pregunta-enunciado">{pregunta.enunciado}</p>
      <div className="pregunta-opciones">
        {Object.entries(pregunta.opciones).map(([letra, texto]) => {
          const esSeleccionada = seleccion === letra
          const esCorrecta = letra === pregunta.respuestaCorrecta
          let clase = 'opcion'
          if (mostrarCorreccion && esCorrecta) clase += ' opcion--correcta'
          else if (mostrarCorreccion && esSeleccionada) clase += ' opcion--incorrecta'
          else if (esSeleccionada) clase += ' opcion--seleccionada'

          return (
            <button
              key={letra}
              type="button"
              className={clase}
              disabled={deshabilitado}
              onClick={() => onSeleccionar(letra)}
            >
              <span className="opcion-letra">{letra}</span>
              <span className="opcion-texto">{texto}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
