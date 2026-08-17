import { ContextoPregunta } from './ContextoPregunta.jsx'
import { VisualRaster } from './VisualRaster.jsx'
import { IconoCheck, IconoX } from './iconos.jsx'
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

          const mostrarCheck = mostrarCorreccion && esCorrecta
          const mostrarX = mostrarCorreccion && esSeleccionada && !esCorrecta

          const archivoImagen = pregunta.opcionesImagen?.[letra]

          return (
            <button
              key={letra}
              type="button"
              className={clase + (archivoImagen ? ' opcion--con-imagen' : '')}
              disabled={deshabilitado}
              onClick={() => onSeleccionar(letra)}
            >
              <span className="opcion-letra">
                {mostrarCheck ? <IconoCheck color="#fff" /> : mostrarX ? <IconoX color="#fff" /> : letra}
              </span>
              {archivoImagen && <VisualRaster archivo={archivoImagen} descripcion={texto} />}
              <span className="opcion-texto">{texto}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
