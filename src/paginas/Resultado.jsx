import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import {
  calcularPuntajeSimulado,
  clasificarNivel,
  aciertosPorParte,
  patronesTrampaFrecuentes,
  TABLA_NIVELES,
  DESCRIPCIONES_PATRON,
} from '../engine/reporte.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { Marca } from '../componentes/Marca.jsx'
import { IconoAdvertencia } from '../componentes/iconos.jsx'
import { PreguntaMultipleChoice } from '../componentes/PreguntaMultipleChoice.jsx'
import { PanelExplicacion } from '../componentes/PanelExplicacion.jsx'
import './Resultado.css'

const PARTE_NOMBRE = {
  1: 'Emparejamiento de definiciones',
  2: 'Emparejamiento de avisos',
  3: 'Conversaciones',
  4: 'Cloze gramatical',
  5: 'Comprensión básica',
  6: 'Comprensión compleja',
  7: 'Cloze léxico',
}

function useConteoAscendente(objetivo) {
  const [valor, setValor] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const inicio = performance.now()
    const duracion = 1100
    const ease = (x) => 1 - Math.pow(1 - x, 3)
    const tick = (ahora) => {
      const p = Math.min(1, (ahora - inicio) / duracion)
      setValor(Math.round(objetivo * ease(p)))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [objetivo])

  return valor
}

export function Resultado({ resultado, modulo, perfil, onCambiarPerfil, onVolver, onReintentar, onIrARepaso }) {
  const { dark, toggle } = useTheme()
  const [mostrarDetalle, setMostrarDetalle] = useState(false)

  const puntaje = calcularPuntajeSimulado(resultado.correctas, resultado.total)
  const displayScore = useConteoAscendente(puntaje)
  const nivel = clasificarNivel(puntaje)
  const nivelTier = nivel ? TABLA_NIVELES.findIndex((n) => n.nivel === nivel.nivel) + 1 : null

  const porParte = aciertosPorParte(resultado.detalle)
  const filasDesglose = Object.keys(porParte)
    .map(Number)
    .map((parte) => ({
      parte,
      pct: Math.round((porParte[parte].correctas / porParte[parte].total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)

  const patrones = patronesTrampaFrecuentes(resultado.detalle)
  const totalFallos = resultado.detalle.filter((d) => !d.esCorrecta).length
  const patronTop = patrones[0]
  const partesConPatron = patronTop
    ? [
        ...new Set(
          resultado.detalle
            .filter((d) => !d.esCorrecta && d.pregunta.distractores?.[d.elegida]?.patron_trampa === patronTop.patron)
            .map((d) => `Parte ${d.pregunta.parte}`)
        ),
      ]
    : []

  const recomendaciones = filasDesglose
    .filter((f) => f.pct < 100)
    .slice(-3)
    .reverse()

  return (
    <div className="resultado">
      <div className="resultado-header">
        <Marca texto="Resultado del simulacro" />
        <div className="resultado-header-derecha">
          <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>
      </div>

      <div className="resultado-contenido">
        <div className="resultado-hero">
          <div className="resultado-hero-eyebrow">Puntaje estimado</div>
          <div className="resultado-hero-cifra">
            {displayScore}
            <span className="resultado-hero-total">/300</span>
          </div>
          {nivel && <div className="resultado-hero-nivel">Nivel {nivel.nivel}</div>}
          <div className="resultado-hero-sub">
            Clasificación oficial ICFES · Inglés{nivelTier ? ` · Nivel ${nivelTier} de 4` : ''}
          </div>
        </div>

        <div className="resultado-tarjeta">
          <div className="resultado-tarjeta-titulo">Desglose por parte</div>
          <div className="resultado-desglose">
            {filasDesglose.map(({ parte, pct }) => (
              <div key={parte}>
                <div className="resultado-desglose-fila">
                  <span className="resultado-desglose-nombre">
                    Parte {parte} · {PARTE_NOMBRE[parte]}
                  </span>
                  <span className="resultado-desglose-pct">{pct}%</span>
                </div>
                <div className="resultado-desglose-barra">
                  <div className="resultado-desglose-relleno" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {patronTop && (
          <div className="resultado-error">
            <div className="resultado-error-cabecera">
              <IconoAdvertencia color="var(--warning)" />
              <div className="resultado-error-label">Tu error más frecuente</div>
            </div>
            <div className="resultado-error-titulo">{DESCRIPCIONES_PATRON[patronTop.patron] ?? patronTop.patron}</div>
            <div className="resultado-error-cuerpo">
              Este patrón se repitió en {patronTop.cantidad} de las {totalFallos} preguntas que fallaste
              {partesConPatron.length > 0 ? `, principalmente en ${partesConPatron.join(' y ')}` : ''}. No incluye
              las partes 1 y 2 (emparejamiento), que no tienen distractor clasificado.
            </div>
          </div>
        )}

        {recomendaciones.length > 0 && (
          <div className="resultado-recomendaciones">
            <div className="resultado-tarjeta-titulo">Qué estudiar a continuación</div>
            <div className="resultado-recomendaciones-lista">
              {recomendaciones.map((r, i) => (
                <div key={r.parte} className="resultado-recomendacion">
                  <div className="resultado-recomendacion-badge">{i + 1}</div>
                  <div className="resultado-recomendacion-info">
                    <div className="resultado-recomendacion-titulo">{PARTE_NOMBRE[r.parte]}</div>
                    <div className="resultado-recomendacion-meta">
                      {modulo.nombre} · Parte {r.parte} · {r.pct}% de aciertos
                    </div>
                  </div>
                  <button type="button" className="resultado-recomendacion-boton" onClick={onIrARepaso}>
                    Practicar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="resultado-acciones">
          <button type="button" className="boton-secundario" onClick={onReintentar}>
            Repetir simulacro
          </button>
          <button type="button" className="boton-secundario" onClick={() => setMostrarDetalle((v) => !v)}>
            {mostrarDetalle ? 'Ocultar' : 'Ver'} detalle de cada pregunta
          </button>
          <button type="button" className="boton-volver" onClick={onVolver}>
            ← {modulo.nombre}
          </button>
        </div>

        {mostrarDetalle && (
          <div className="resultado-detalle">
            {resultado.detalle.map(({ pregunta, elegida, esCorrecta }, i) => (
              <div key={pregunta.id} className="resultado-detalle-item">
                <p className="resultado-detalle-numero">
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
                  <p className="resultado-no-respondida">No respondida.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
