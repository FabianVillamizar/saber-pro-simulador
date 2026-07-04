import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { crearCola, reencolarTrasFallo, retirarTrasAcierto } from '../engine/colaRefuerzo.js'
import { PreguntaMultipleChoice } from '../componentes/PreguntaMultipleChoice.jsx'
import { PanelExplicacion } from '../componentes/PanelExplicacion.jsx'
import './PracticaPorParte.css'

function etiquetaParte(preguntasDeParte) {
  const tipos = [...new Set(preguntasDeParte.map((p) => p.tipoOriginal))]
  return tipos.map((t) => t.replaceAll('_', ' ')).join(' / ')
}

export function PracticaPorParte({ moduloId, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const [parteSeleccionada, setParteSeleccionada] = useState(null)
  const [cola, setCola] = useState(null)
  const [seleccion, setSeleccion] = useState(null)
  const [respondida, setRespondida] = useState(false)
  const [totalInicial, setTotalInicial] = useState(0)
  const [aciertosPrimerIntento, setAciertosPrimerIntento] = useState(0)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  function elegirParte(parte, preguntasParte) {
    const colaInicial = crearCola(preguntasParte)
    setParteSeleccionada(parte)
    setCola(colaInicial)
    setTotalInicial(colaInicial.length)
    setAciertosPrimerIntento(0)
    setSeleccion(null)
    setRespondida(false)
  }

  function seleccionarOpcion(letra) {
    if (respondida) return
    const entrada = cola[0]
    if (letra === entrada.valor.respuestaCorrecta && entrada.fallos === 0) {
      setAciertosPrimerIntento((n) => n + 1)
    }
    setSeleccion(letra)
    setRespondida(true)
  }

  function siguiente() {
    const entrada = cola[0]
    const esCorrecta = seleccion === entrada.valor.respuestaCorrecta
    setCola(esCorrecta ? retirarTrasAcierto(cola, entrada) : reencolarTrasFallo(cola, entrada))
    setSeleccion(null)
    setRespondida(false)
  }

  // Pantalla 1: elegir parte
  if (parteSeleccionada === null) {
    const porParte = {}
    for (const p of modulo.preguntas) (porParte[p.parte] ??= []).push(p)
    const partes = Object.keys(porParte)
      .map(Number)
      .sort((a, b) => a - b)

    return (
      <div className="page">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={onVolver}>
            ← {modulo.nombre}
          </button>
        </div>
        <h1>Práctica por parte</h1>
        <p className="practica-subtitulo">Elige una parte para practicar sus ítems en orden aleatorio.</p>
        <div className="partes-grid">
          {partes.map((parte) => (
            <button
              key={parte}
              type="button"
              className="parte-tarjeta"
              onClick={() => elegirParte(parte, porParte[parte])}
            >
              <span className="parte-numero">Parte {parte}</span>
              <span className="parte-etiqueta">{etiquetaParte(porParte[parte])}</span>
              <span className="parte-conteo">{porParte[parte].length} preguntas</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Pantalla 3: sesión terminada
  if (cola.length === 0) {
    return (
      <div className="page">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={() => setParteSeleccionada(null)}>
            ← Elegir otra parte
          </button>
        </div>
        <div className="practica-fin">
          <h2>Completaste la Parte {parteSeleccionada}</h2>
          <p>
            {aciertosPrimerIntento} de {totalInicial} correctas al primer intento.
          </p>
        </div>
      </div>
    )
  }

  // Pantalla 2: practicando
  const entrada = cola[0]
  const pregunta = entrada.valor
  const esCorrecta = respondida && seleccion === pregunta.respuestaCorrecta
  const dominadas = totalInicial - cola.length

  return (
    <div className="page">
      <div className="barra-superior">
        <button type="button" className="boton-volver" onClick={() => setParteSeleccionada(null)}>
          ← Elegir otra parte
        </button>
        <span className="practica-progreso">
          {dominadas}/{totalInicial} dominadas · {cola.length} en cola
        </span>
      </div>

      <PreguntaMultipleChoice
        pregunta={pregunta}
        seleccion={seleccion}
        onSeleccionar={seleccionarOpcion}
        deshabilitado={respondida}
        mostrarCorreccion={respondida}
      />

      {respondida && <PanelExplicacion pregunta={pregunta} seleccion={seleccion} esCorrecta={esCorrecta} />}

      {respondida && (
        <button type="button" className="boton-primario practica-siguiente" onClick={siguiente}>
          Siguiente
        </button>
      )}
    </div>
  )
}
