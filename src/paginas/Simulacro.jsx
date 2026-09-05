import { useEffect, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import {
  armarSimulacro,
  calificarSimulacro,
  barajarOpcionesPregunta,
  DISTRIBUCION_DEFECTO,
  DURACION_DEFECTO_MINUTOS,
  DISTRIBUCION_RC,
  DURACION_RC_MINUTOS,
  DISTRIBUCION_LC,
  DURACION_LC_MINUTOS,
} from '../engine/simulacro.js'
import { registrarSimulacro } from '../engine/progreso.js'
import { registrarFalloTrampa } from '../engine/patronesPerfil.js'
import { reproducirSonido } from '../engine/sonido.js'
import { PreguntaMultipleChoice } from '../componentes/PreguntaMultipleChoice.jsx'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { Marca } from '../componentes/Marca.jsx'
import { IconoReloj } from '../componentes/iconos.jsx'
import { Resultado } from './Resultado.jsx'
import './Simulacro.css'

function formatoTiempo(segundosTotales) {
  const m = Math.floor(segundosTotales / 60)
  const s = segundosTotales % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Sin `categorias` (Inglés): "Parte N · tipoOriginal" (el tipo original sí
// es información útil ahí, ej. "cloze_lexico"). Con `categorias` (RC y
// cualquier módulo futuro con simulacro): la etiqueta real de la
// competencia sola — `tipoOriginal` ahí es solo el discriminador interno
// del adapter (siempre "contexto_rc"), no aporta nada al usuario.
function etiquetaParteActual(pregunta, categorias) {
  if (categorias) return categorias[pregunta.parte] ?? `Parte ${pregunta.parte}`
  return `Parte ${pregunta.parte} · ${pregunta.tipoOriginal.replaceAll('_', ' ')}`
}

// Distribución/duración por defecto son propias de cada módulo (ver
// engine/simulacro.js) — ninguna es un valor oficial publicado por el
// ICFES, ambas lo dicen explícitamente en el texto de la pantalla de
// configuración de abajo.
function configSimulacro(moduloId) {
  if (moduloId === 'razonamiento-cuantitativo') {
    return { distribucion: DISTRIBUCION_RC, duracion: DURACION_RC_MINUTOS }
  }
  if (moduloId === 'lectura-critica') {
    return { distribucion: DISTRIBUCION_LC, duracion: DURACION_LC_MINUTOS }
  }
  return { distribucion: DISTRIBUCION_DEFECTO, duracion: DURACION_DEFECTO_MINUTOS }
}

export function Simulacro({ moduloId, perfil, onCambiarPerfil, onVolver, onIrARepaso }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const { distribucion, duracion } = configSimulacro(moduloId)
  const [fase, setFase] = useState('config') // config | examen | resultados
  const [duracionMinutos, setDuracionMinutos] = useState(duracion)
  const [examen, setExamen] = useState([])
  const [advertencias, setAdvertencias] = useState([])
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [tiempoRestante, setTiempoRestante] = useState(0)
  const [resultado, setResultado] = useState(null)

  function terminar(tiempoRestanteFinal) {
    const calificado = calificarSimulacro(examen, respuestas)
    for (const { pregunta, elegida, esCorrecta } of calificado.detalle) {
      if (!esCorrecta && elegida) registrarFalloTrampa(perfil.id, pregunta.distractores?.[elegida]?.patron_trampa)
    }
    registrarSimulacro(perfil.id)
    reproducirSonido(perfil.id, 'simulacro')
    setResultado({ ...calificado, tiempoUsadoSegundos: duracionMinutos * 60 - tiempoRestanteFinal })
    setFase('resultados')
  }

  // setTimeout encadenado en vez de setInterval: cada disparo recalcula
  // contra el estado más reciente, así que no se acumula drift ni queda
  // un closure con respuestas/examen desactualizados al terminar.
  useEffect(() => {
    if (fase !== 'examen') return
    if (tiempoRestante <= 0) {
      terminar(0)
      return
    }
    const id = setTimeout(() => setTiempoRestante((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [fase, tiempoRestante, examen, respuestas, duracionMinutos])

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  function comenzar() {
    const { preguntas: seleccionadas, advertencias: adv } = armarSimulacro(modulo.preguntas, distribucion)
    setExamen(seleccionadas.map(barajarOpcionesPregunta))
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

  function siguiente() {
    if (indice >= examen.length - 1) {
      terminar(tiempoRestante)
      return
    }
    irA(indice + 1)
  }

  function finalizarManualmente() {
    const sinResponder = examen.length - Object.keys(respuestas).length
    if (
      sinResponder > 0 &&
      !window.confirm(`Aún tienes ${sinResponder} pregunta(s) sin responder. ¿Terminar de todas formas?`)
    ) {
      return
    }
    terminar(tiempoRestante)
  }

  if (fase === 'config') {
    const total = Object.values(distribucion).reduce((a, b) => a + b, 0)
    // Inglés conserva su texto original ("5/5/5/8/7/5/10 por parte 1-7");
    // cualquier módulo con `categorias` (RC, y el próximo que active
    // soportaSimulacro) arma el desglose con las etiquetas reales de sus
    // competencias en vez de "parte N".
    const desglose = modulo.categorias
      ? Object.entries(distribucion)
          .map(([clave, n]) => `${n} de ${modulo.categorias[clave]}`)
          .join(' · ')
      : `${Object.values(distribucion).join('/')} por parte 1-${Object.keys(distribucion).length}`

    return (
      <div className="page">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={onVolver}>
            ← {modulo.nombre}
          </button>
          <div style={{ flex: 1 }} />
          <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>
        <div className="simulacro-config">
          <h1>Simulacro completo</h1>
          <p className="simulacro-info">
            {total} preguntas ({desglose}), cronometrado. El ICFES no publica un tiempo oficial para
            este módulo por separado — solo el total combinado de los 5 módulos genéricos — así que
            esto es un estimado inicial configurable, no un valor oficial.
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
      </div>
    )
  }

  if (fase === 'examen') {
    const pregunta = examen[indice]
    const seleccion = respuestas[pregunta.id] ?? null
    const esUltima = indice === examen.length - 1
    const esAdvertencia = tiempoRestante < 300
    const grupoTotal = examen.filter((p) => p.grupoId === pregunta.grupoId).length

    return (
      <div className="simulacro">
        <div className="simulacro-topbar">
          <div className="simulacro-topbar-fila">
            <Marca texto="Simulacro completo" />
            <div className="simulacro-topbar-derecha">
              <div className={`simulacro-timer${esAdvertencia ? ' simulacro-timer--advertencia' : ''}`}>
                <IconoReloj color={esAdvertencia ? 'var(--warning)' : 'var(--accent)'} />
                <span>{formatoTiempo(tiempoRestante)}</span>
              </div>
              <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
              <ThemeToggle dark={dark} onToggle={toggle} />
            </div>
          </div>
          <div className="simulacro-progreso-fila">
            <span className="simulacro-progreso-texto">
              Pregunta {indice + 1} de {examen.length}
            </span>
            <div className="simulacro-progreso-barra">
              <div
                className="simulacro-progreso-relleno"
                style={{ width: `${Math.round((indice / examen.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="simulacro-cuerpo">
          <div className="simulacro-eyebrow">{etiquetaParteActual(pregunta, modulo.categorias)}</div>

          {grupoTotal > 1 && (
            <p className="simulacro-grupo-nota">
              Estas preguntas se basan en el mismo texto · {pregunta.numEnGrupo} de {grupoTotal}
            </p>
          )}

          {advertencias.length > 0 && (
            <div className="simulacro-advertencia">
              {advertencias.map((a) => (
                <p key={a}>{a}</p>
              ))}
            </div>
          )}

          <PreguntaMultipleChoice
            pregunta={pregunta}
            seleccion={seleccion}
            onSeleccionar={seleccionarOpcion}
            deshabilitado={false}
            mostrarCorreccion={false}
          />

          <div className="simulacro-siguiente-fila">
            <button type="button" className="simulacro-siguiente" disabled={!seleccion} onClick={siguiente}>
              {esUltima ? 'Finalizar simulacro' : 'Siguiente pregunta'}
              <svg width="15" height="15" viewBox="0 0 15 15">
                <line x1="2" y1="7.5" x2="12" y2="7.5" stroke={seleccion ? '#fff' : 'var(--text-faint)'} strokeWidth="1.6" />
                <line x1="8" y1="3.5" x2="12" y2="7.5" stroke={seleccion ? '#fff' : 'var(--text-faint)'} strokeWidth="1.6" />
                <line x1="8" y1="11.5" x2="12" y2="7.5" stroke={seleccion ? '#fff' : 'var(--text-faint)'} strokeWidth="1.6" />
              </svg>
            </button>
          </div>

          <details className="simulacro-utilidad">
            <summary>Saltar o revisar otra pregunta</summary>
            <div className="simulacro-navegacion">
              <button type="button" className="boton-secundario" disabled={indice === 0} onClick={() => irA(indice - 1)}>
                Anterior
              </button>
              <button type="button" className="boton-secundario" onClick={finalizarManualmente}>
                Terminar ahora
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
          </details>
        </div>
      </div>
    )
  }

  // fase === 'resultados'
  return (
    <Resultado
      resultado={resultado}
      modulo={modulo}
      perfil={perfil}
      onCambiarPerfil={onCambiarPerfil}
      onVolver={onVolver}
      onReintentar={() => setFase('config')}
      onIrARepaso={onIrARepaso}
    />
  )
}
