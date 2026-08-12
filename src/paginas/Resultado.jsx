import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import {
  calcularPuntajeSimulado,
  clasificarNivel,
  aciertosPorParte,
  TABLA_NIVELES,
  DESCRIPCIONES_PATRON,
} from '../engine/reporte.js'
import { leerPatronesTrampa, VENTANA_DIAS } from '../engine/patronesPerfil.js'
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

// Sin `categorias` (Inglés): cae al mapa numérico de arriba. Con
// `categorias` (RC y cualquier módulo futuro con simulacro): la etiqueta
// real de la competencia — mismo fallback que ya usan
// PracticaPorParte.jsx/Simulacro.jsx.
function etiquetaParte(parte, categorias) {
  return categorias?.[parte] ?? PARTE_NOMBRE[parte] ?? `Parte ${parte}`
}

// Para filas donde antes se mostraba "Parte N · Nombre" (Inglés): sin
// `categorias`, conserva ese formato exacto; con `categorias` (RC), el
// nombre de la competencia ya es autoexplicativo, sin numerarla.
function tituloParte(parte, categorias) {
  const etiqueta = etiquetaParte(parte, categorias)
  return categorias ? etiqueta : `Parte ${parte} · ${etiqueta}`
}

// Umbrales de un descriptor de desempeño NO oficial — a diferencia de
// TABLA_NIVELES (el CEFR real de Inglés), ningún módulo de competencias
// genéricas del Saber Pro tiene un marco de niveles publicado por el
// ICFES, así que este texto se muestra siempre como autoevaluación, nunca
// como "clasificación oficial" (ver saber_pro_resultado_scope en memoria:
// no fabricar bandas oficiales que no existen).
const DESEMPENO_APROXIMADO = [
  { max: 50, texto: 'Necesita repasar' },
  { max: 70, texto: 'Vas en camino' },
  { max: 85, texto: 'Buen desempeño' },
  { max: 101, texto: 'Dominas el módulo' },
]

function descriptorDesempeno(puntaje) {
  const pct = (puntaje / 300) * 100
  return DESEMPENO_APROXIMADO.find((d) => pct < d.max)?.texto ?? DESEMPENO_APROXIMADO.at(-1).texto
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

  // TABLA_NIVELES es el CEFR real de Inglés (A1-B2), un marco externo
  // publicado que ningún otro módulo de competencias genéricas tiene —
  // así que el bloque de "nivel" solo se muestra para Inglés; los demás
  // módulos con simulacro (RC, y los que vengan después) usan el
  // descriptor de desempeño no-oficial de abajo.
  const esIngles = modulo.id === 'ingles'
  const puntaje = calcularPuntajeSimulado(resultado.correctas, resultado.total)
  const displayScore = useConteoAscendente(puntaje)
  const nivel = esIngles ? clasificarNivel(puntaje) : null
  const nivelTier = nivel ? TABLA_NIVELES.findIndex((n) => n.nivel === nivel.nivel) + 1 : null

  const porParte = aciertosPorParte(resultado.detalle)
  const filasDesglose = Object.keys(porParte)
    .map((parte) => ({
      parte,
      pct: Math.round((porParte[parte].correctas / porParte[parte].total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)

  // Últimos VENTANA_DIAS del perfil (práctica por parte + simulacros),
  // no solo las respuestas de este intento — este intento ya quedó
  // incluido antes de llegar aquí (Simulacro.terminar() registra los
  // fallos antes de mostrar el resultado). Es una ventana, no un conteo de
  // por vida: un error ya corregido deja de dominar este panel con el
  // tiempo en vez de quedarse pegado para siempre.
  const patronesHistorial = Object.entries(leerPatronesTrampa(perfil.id))
    .map(([patron, cantidad]) => ({ patron, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
  const patronTop = patronesHistorial[0]
  const partesConPatronEnEsteIntento = patronTop
    ? [
        ...new Set(
          resultado.detalle
            .filter((d) => !d.esCorrecta && d.pregunta.distractores?.[d.elegida]?.patron_trampa === patronTop.patron)
            .map((d) => etiquetaParte(d.pregunta.parte, modulo.categorias))
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
          {esIngles ? (
            <>
              {nivel && <div className="resultado-hero-nivel">Nivel {nivel.nivel}</div>}
              <div className="resultado-hero-sub">
                Clasificación oficial ICFES · Inglés{nivelTier ? ` · Nivel ${nivelTier} de 4` : ''}
              </div>
            </>
          ) : (
            <>
              <div className="resultado-hero-nivel">{descriptorDesempeno(puntaje)}</div>
              <div className="resultado-hero-sub">
                Estimación propia · {modulo.nombre} · no es una escala oficial del ICFES
              </div>
            </>
          )}
        </div>

        <div className="resultado-tarjeta">
          <div className="resultado-tarjeta-titulo">Desglose por parte</div>
          <div className="resultado-desglose">
            {filasDesglose.map(({ parte, pct }) => (
              <div key={parte}>
                <div className="resultado-desglose-fila">
                  <span className="resultado-desglose-nombre">{tituloParte(parte, modulo.categorias)}</span>
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
              Has caído en este patrón {patronTop.cantidad} {patronTop.cantidad === 1 ? 'vez' : 'veces'} en los
              últimos {VENTANA_DIAS} días, entre simulacros y práctica por parte
              {partesConPatronEnEsteIntento.length > 0
                ? `; en este intento apareció en ${partesConPatronEnEsteIntento.join(' y ')}`
                : ''}
              {esIngles ? '. No incluye las partes 1 y 2 (emparejamiento), que no tienen distractor clasificado.' : '.'}
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
                    <div className="resultado-recomendacion-titulo">{etiquetaParte(r.parte, modulo.categorias)}</div>
                    <div className="resultado-recomendacion-meta">
                      {modulo.nombre} · {r.pct}% de aciertos
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
                  Pregunta {i + 1} · {tituloParte(pregunta.parte, modulo.categorias)}
                </p>
                <PreguntaMultipleChoice
                  pregunta={pregunta}
                  seleccion={elegida ?? null}
                  onSeleccionar={() => {}}
                  deshabilitado
                  mostrarCorreccion
                />
                {elegida ? (
                  <PanelExplicacion
                    pregunta={pregunta}
                    seleccion={elegida}
                    esCorrecta={esCorrecta}
                    tarjetasConcepto={modulo.tarjetasConcepto}
                  />
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
