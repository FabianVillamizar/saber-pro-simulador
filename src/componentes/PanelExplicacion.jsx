import { ETIQUETAS_PATRON } from '../engine/reporte.js'
import { TextoConNegritas } from './TextoConNegritas.jsx'
import './PanelExplicacion.css'

// El "puente" entre el simulacro y el repaso de teoría (ver
// saber_pro_lectura_critica en memoria): `pregunta.tarjetasTeoriaRelacionada`
// trae ids de `modulo.tarjetasConcepto`. Hoy lo llenan Lectura Crítica y
// Competencias Ciudadanas; en cualquier módulo que aún no lo tenga el array
// llega vacío y esta sección no se renderiza — no es un campo específico de
// un módulo, así que no hace falta gatear por moduloId.
export function PanelExplicacion({ pregunta, seleccion, esCorrecta, tarjetasConcepto = [] }) {
  const distractorElegido = !esCorrecta ? pregunta.distractores?.[seleccion] : null
  const otrosDistractores = pregunta.distractores
    ? Object.entries(pregunta.distractores).filter(([letra]) => letra !== seleccion)
    : []
  const idsTeoria = pregunta.tarjetasTeoriaRelacionada ?? []
  const tarjetasTeoria = idsTeoria
    .map((id) => tarjetasConcepto.find((t) => t.id === id))
    .filter(Boolean)

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
            <p className="panel-explicacion-cuerpo">
              <TextoConNegritas texto={pregunta.explicacionCorrecta} />
            </p>
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
            <p className="panel-confusion-texto">
              <TextoConNegritas texto={distractorElegido.explicacion} />
            </p>
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
                  <p className="panel-otras-texto">
                    <TextoConNegritas texto={d.explicacion} />
                  </p>
                  {d.patron_trampa && (
                    <span className="panel-otras-badge">Trampa: {ETIQUETAS_PATRON[d.patron_trampa] ?? d.patron_trampa}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {tarjetasTeoria.length > 0 && (
        <details className="panel-otras panel-teoria">
          <summary>
            {tarjetasTeoria.length === 1 ? 'Repasar la tarjeta de teoría relacionada' : 'Repasar las tarjetas de teoría relacionadas'}
          </summary>
          <div className="panel-otras-lista">
            {tarjetasTeoria.map((tarjeta) => (
              <div key={tarjeta.id} className="panel-teoria-item">
                <p className="panel-teoria-pregunta">{tarjeta.pregunta}</p>
                <p className="panel-teoria-respuesta">{tarjeta.respuesta_breve}</p>
                <div className="panel-teoria-seccion-label">Explicación</div>
                <p className="panel-otras-texto">
                  <TextoConNegritas texto={tarjeta.explicacion} />
                </p>
                {tarjeta.ejemplo_aplicado && (
                  <>
                    <div className="panel-teoria-seccion-label panel-teoria-seccion-label--accent">Ejemplo</div>
                    <p className="panel-otras-texto">
                      <TextoConNegritas texto={tarjeta.ejemplo_aplicado} />
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
