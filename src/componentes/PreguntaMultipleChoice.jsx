import { ContextoPregunta } from './ContextoPregunta.jsx'
import { VisualRaster } from './VisualRaster.jsx'
import { IconoCheck, IconoX } from './iconos.jsx'
import './PreguntaMultipleChoice.css'

// Puro renderizador: `pregunta.opciones`/`respuestaCorrecta`/`distractores`
// ya llegan con las letras A-D barajadas por `barajarOpcionesPregunta()` en
// engine/simulacro.js — hacerlo aquí (un solo lugar de render) desincroniza
// la letra que ve el usuario de la que muestra PanelExplicacion.jsx (que
// lee `pregunta.respuestaCorrecta`/`distractores` por su cuenta), así que
// el barajado vive una sola vez, antes de que cualquier componente reciba
// la pregunta. Ver la bitácora del módulo de Lectura Crítica (2026-09-05)
// para el bug real que esto corrigió.
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
