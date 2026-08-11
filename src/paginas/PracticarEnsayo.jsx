import { useEffect, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { claveEnsayos } from '../engine/clavesPerfil.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo, IconoReloj } from '../componentes/iconos.jsx'
import './PracticarEnsayo.css'

const PLANIFICACION_SEGUNDOS = 600
const ESCRITURA_SEGUNDOS = 1800
const UMBRAL_ADVERTENCIA_SEGUNDOS = 120

const PLANTILLA_EVALUACION = `Eres un evaluador experto del módulo de Comunicación Escrita de Saber Pro (ICFES, Colombia). Evalúas el ensayo que te voy a pegar siguiendo EXACTAMENTE los criterios oficiales del ICFES, no criterios genéricos de "buena escritura".

PASO 1 — FILTRO DE PERTINENCIA (aplícalo primero, sin excepción):
Un texto es "impertinente" (nota mínima automática) si: no es un texto argumentativo, no trata el tema de la pregunta, o se desvía hacia otro asunto sin responder lo que se pregunta. Si es impertinente, dilo y detén ahí la evaluación.

PASO 2 — EVALUACIÓN POR 3 EJES:
1. FORMA DE EXPRESIÓN: ortografía, gramática y sintaxis que permitan comprender sin ambigüedad. Cita la frase exacta con el error (máx. 15 palabras) y cómo corregirla.
2. PLANTEAMIENTO DEFINIDO: ¿responde EXACTAMENTE la pregunta (no evade con "depende")? ¿postura clara y sostenida con razones?
3. ORGANIZACIÓN: ¿introducción, desarrollo y conclusión reconocibles? ¿un solo eje temático? ¿argumentos desarrollados (premisa+razón+ejemplo)?

PASO 3 — CLASIFICACIÓN POR NIVEL (evalúa holísticamente):
- Nivel 1 (0-115): ideas desarticuladas, sin planteamiento real, y/o errores de convención que impiden comprender.
- Nivel 2 (116-149): planteamiento reconocible, pero con fallas de unidad, contradicciones/digresiones/repeticiones, o errores que distraen.
- Nivel 3 (150-183): estructura clara, un eje temático, argumentos desarrollados, buen lenguaje con errores menores.
- Nivel 4 (184-300): además, complejiza el planteamiento reconociendo y respondiendo una perspectiva contraria, usa recursos estilísticos, cohesión fluida.

PASO 4 — RETROALIMENTACIÓN ACCIONABLE: máximo 3 acciones concretas y priorizadas, cada una con ejemplo de cómo aplicarla en ESTE ensayo.

FORMATO DE TU RESPUESTA:
1. Filtro de pertinencia: [pasa/no pasa, por qué]
2. Los 3 ejes: [análisis breve, citando el texto]
3. Nivel estimado: [1-4], rango de puntaje
4. 3 acciones para mejorar, priorizadas, con ejemplo

PREGUNTA A LA QUE DEBÍA RESPONDER:
{PEGA_AQUI_LA_PREGUNTA_DEL_TEMA}

TEXTO A EVALUAR:
{PEGA_AQUI_TU_ENSAYO}`

function formatoTiempo(segundosTotales) {
  const m = Math.floor(segundosTotales / 60)
  const s = segundosTotales % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function contarPalabras(texto) {
  const limpio = texto.trim()
  return limpio.length ? limpio.split(/\s+/).length : 0
}

const NIVELES = [1, 2, 3, 4]
const EJES = ['forma', 'planteamiento', 'organizacion']
const EJES_LABELS = {
  forma: 'Forma de expresión',
  planteamiento: 'Planteamiento definido',
  organizacion: 'Organización',
}
const OPCIONES_EJE = [
  { valor: 'bien', label: 'Bien' },
  { valor: 'regular', label: 'Regular' },
  { valor: 'mal', label: 'Mal' },
]
// Sugerencia estática de qué bloques de Repaso de conceptos tocan cada eje
// — más simple y menos frágil que derivarlo del mapa `categorias` de
// indiceModulos.js (que puede reordenarse sin que este texto necesite
// cambiar). No es un enlace funcional a un repaso filtrado (RepasoConceptos
// no soporta filtrar por eje todavía), solo la pista de qué repasar.
const SUGERENCIA_EJE = {
  forma: 'conectores, ortografía, puntuación y registro formal',
  planteamiento: 'planteamiento directo desde la introducción y posturas válidas',
  organizacion: 'estructura de introducción/desarrollo/conclusión y unidad temática sin digresiones',
}

// Agrega el historial estructurado (ejes bien/regular/mal + ¿complejizó?)
// para la señal de "tu eje más débil" en la pantalla de selección — mismo
// espíritu que el SRS del resto de la app, pero derivado de auto-reporte
// en vez de aciertos/fallos automáticos, porque la evaluación ocurre fuera
// de la app (ver PLANTILLA_EVALUACION).
function calcularProgreso(historial) {
  const conteo = Object.fromEntries(EJES.map((e) => [e, { bien: 0, regular: 0, mal: 0 }]))
  let totalConDatos = 0
  let conObjecionRegistrada = 0
  let conObjecionLograda = 0

  for (const h of historial) {
    const tieneEjes = EJES.some((e) => h.ejes?.[e])
    if (!tieneEjes && h.complejizo == null) continue
    totalConDatos++
    for (const e of EJES) {
      const v = h.ejes?.[e]
      if (v) conteo[e][v]++
    }
    if (h.complejizo != null) {
      conObjecionRegistrada++
      if (h.complejizo) conObjecionLograda++
    }
  }

  if (totalConDatos === 0) return null

  const ranking = EJES.map((e) => ({ eje: e, puntaje: conteo[e].mal * 2 + conteo[e].regular })).sort(
    (a, b) => b.puntaje - a.puntaje
  )
  const ejeMasDebil = ranking[0].puntaje > 0 ? ranking[0].eje : null

  return { totalConDatos, conteo, ejeMasDebil, conObjecionRegistrada, conObjecionLograda }
}

function construirPrompt(pregunta, ensayo) {
  return PLANTILLA_EVALUACION.replace('{PEGA_AQUI_LA_PREGUNTA_DEL_TEMA}', pregunta).replace(
    '{PEGA_AQUI_TU_ENSAYO}',
    ensayo
  )
}

export function PracticarEnsayo({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [fase, setFase] = useState('select') // select | planning | writing
  const [temaId, setTemaId] = useState(null)
  const [segundosRestantes, setSegundosRestantes] = useState(PLANIFICACION_SEGUNDOS)
  const [notas, setNotas] = useState('')
  const [ensayo, setEnsayo] = useState('')
  const [copiadoVisible, setCopiadoVisible] = useState(false)
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const [historial, setHistorial] = useState(() => leerJSON(claveEnsayos(perfil.id), []))

  // setTimeout encadenado (no setInterval): cada disparo recalcula contra
  // el estado más reciente, así que no acumula drift ni queda un closure
  // desactualizado — mismo patrón que Simulacro.jsx.
  useEffect(() => {
    if (fase !== 'planning' && fase !== 'writing') return
    if (segundosRestantes <= 0) {
      if (fase === 'planning') {
        setFase('writing')
        setSegundosRestantes(ESCRITURA_SEGUNDOS)
      }
      return
    }
    const id = setTimeout(() => setSegundosRestantes((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [fase, segundosRestantes])

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const tema = modulo.temasEnsayo.find((t) => t.id === temaId) ?? null
  const dominioOrden = [...new Set(modulo.temasEnsayo.map((t) => t.dominio))]
  const grupos = dominioOrden.map((dominio) => ({
    dominio,
    etiqueta: modulo.dominios?.[dominio] ?? dominio,
    temas: modulo.temasEnsayo.filter((t) => t.dominio === dominio),
  }))

  function elegirTema(id) {
    setTemaId(id)
    setNotas('')
    setEnsayo('')
    setSegundosRestantes(PLANIFICACION_SEGUNDOS)
    setFase('planning')
  }

  function empezarAEscribir() {
    setSegundosRestantes(ESCRITURA_SEGUNDOS)
    setFase('writing')
  }

  function guardarEnHistorial() {
    const entrada = {
      id: `h-${Date.now()}`,
      fecha: new Date().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }),
      temaId: tema.id,
      pregunta: tema.pregunta,
      ensayo,
      nivel: null,
      ejes: { forma: null, planteamiento: null, organizacion: null },
      complejizo: null,
    }
    const nuevoHistorial = [entrada, ...historial]
    setHistorial(nuevoHistorial)
    escribirJSON(claveEnsayos(perfil.id), nuevoHistorial)
  }

  function actualizarResultado(id, cambios) {
    const nuevoHistorial = historial.map((h) => (h.id === id ? { ...h, ...cambios } : h))
    setHistorial(nuevoHistorial)
    escribirJSON(claveEnsayos(perfil.id), nuevoHistorial)
  }

  function copiarYAbrirWeb() {
    const promptFinal = construirPrompt(tema.pregunta, ensayo)
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(promptFinal).catch(() => {})
    window.open('https://claude.ai/new', '_blank')
    guardarEnHistorial()
    setCopiadoVisible(true)
    setTimeout(() => setCopiadoVisible(false), 3000)
  }

  function abrirDesktop() {
    const promptFinal = construirPrompt(tema.pregunta, ensayo)
    window.open(`claude://claude.ai/new?q=${encodeURIComponent(promptFinal)}`, '_blank')
    guardarEnHistorial()
  }

  const esAdvertencia = segundosRestantes < UMBRAL_ADVERTENCIA_SEGUNDOS && (fase === 'planning' || fase === 'writing')
  const tiempoAgotado = fase === 'writing' && segundosRestantes <= 0
  const palabras = contarPalabras(ensayo)
  const progreso = calcularProgreso(historial)

  return (
    <div className="page practicar-ensayo">
      <div className="barra-superior">
        <button
          type="button"
          className="boton-icono"
          onClick={() => (fase === 'select' ? onVolver() : setFase('select'))}
        >
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="practicar-ensayo-titulo">
          <div className="practicar-ensayo-titulo-modulo">{modulo.nombre}</div>
          <div className="practicar-ensayo-titulo-sub">Practicar ensayo</div>
        </div>
        <div style={{ flex: 1 }} />
        {(fase === 'planning' || fase === 'writing') && (
          <div className={`practicar-ensayo-timer${esAdvertencia ? ' practicar-ensayo-timer--advertencia' : ''}`}>
            <IconoReloj color={esAdvertencia ? 'var(--warning)' : 'var(--accent)'} />
            <span>{formatoTiempo(segundosRestantes)}</span>
            <span className="practicar-ensayo-timer-fase">· {fase === 'planning' ? 'Planificación' : 'Escritura'}</span>
          </div>
        )}
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      {fase === 'select' && (
        <div className="practicar-ensayo-select">
          <p className="practicar-ensayo-info">
            Elige un tema para iniciar una sesión cronometrada: 10 min de planificación + 30 min de escritura.
          </p>

          {progreso && (
            <div className="practicar-ensayo-progreso">
              <div className="practicar-ensayo-progreso-titulo">Tu progreso</div>
              <div className="practicar-ensayo-progreso-texto">
                Basado en {progreso.totalConDatos} {progreso.totalConDatos === 1 ? 'ensayo' : 'ensayos'} con
                resultado registrado.
              </div>
              {progreso.ejeMasDebil && (
                <div className="practicar-ensayo-progreso-texto">
                  Tu eje más débil: <strong>{EJES_LABELS[progreso.ejeMasDebil]}</strong> (
                  {progreso.conteo[progreso.ejeMasDebil].mal} "mal" · {progreso.conteo[progreso.ejeMasDebil].regular}{' '}
                  "regular"). Repasa las tarjetas sobre {SUGERENCIA_EJE[progreso.ejeMasDebil]}.
                </div>
              )}
              {progreso.conObjecionRegistrada > 0 && (
                <div className="practicar-ensayo-progreso-texto">
                  Reconociste y respondiste la objeción contraria en {progreso.conObjecionLograda} de{' '}
                  {progreso.conObjecionRegistrada} ensayos donde registraste ese dato.
                </div>
              )}
            </div>
          )}

          <div className="practicar-ensayo-grupos">
            {grupos.map((grupo) => (
              <div key={grupo.dominio}>
                <div className="practicar-ensayo-grupo-label">{grupo.etiqueta}</div>
                <div className="practicar-ensayo-grupo-lista">
                  {grupo.temas.map((t) => {
                    const vecesPracticado = historial.filter((h) => h.temaId === t.id).length
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className="practicar-ensayo-tema"
                        onClick={() => elegirTema(t.id)}
                      >
                        {t.pregunta}
                        {vecesPracticado > 0 && (
                          <div className="practicar-ensayo-tema-practicado">
                            Practicado {vecesPracticado} {vecesPracticado === 1 ? 'vez' : 'veces'}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fase === 'planning' && tema && (
        <div className="practicar-ensayo-planning">
          <div className="practicar-ensayo-eyebrow">Planificación</div>
          <div className="practicar-ensayo-contexto">
            <p className="practicar-ensayo-contexto-texto">{tema.contexto}</p>
            <p className="practicar-ensayo-contexto-pregunta">{tema.pregunta}</p>
          </div>
          <div className="practicar-ensayo-notas-label">
            Notas — solo para organizar tus ideas, no se envían a ningún lado
          </div>
          <textarea
            className="practicar-ensayo-notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Postura, 2-3 argumentos, un posible contraargumento…"
          />
          <button type="button" className="boton-primario" onClick={empezarAEscribir}>
            Empezar a escribir →
          </button>
        </div>
      )}

      {fase === 'writing' && tema && (
        <>
          <div className="practicar-ensayo-writing-header">
            <div className="practicar-ensayo-writing-pregunta">{tema.pregunta}</div>
          </div>

          <div className="practicar-ensayo-writing">
            {tiempoAgotado && (
              <div className="practicar-ensayo-aviso">
                Se acabó el tiempo oficial (40 min). Puedes seguir puliendo antes de evaluar.
              </div>
            )}

            <textarea
              className="practicar-ensayo-textarea"
              value={ensayo}
              onChange={(e) => setEnsayo(e.target.value)}
              placeholder="Escribe tu ensayo aquí…"
            />
            <div className="practicar-ensayo-conteo">{palabras} palabras</div>

            <div className="practicar-ensayo-evaluar">
              <div className="practicar-ensayo-evaluar-titulo">Evaluar con Claude</div>
              <div className="practicar-ensayo-evaluar-sub">
                La evaluación ocurre fuera de la app — copia el prompt armado o ábrelo directamente.
              </div>
              <div className="practicar-ensayo-evaluar-botones">
                <button type="button" className="boton-primario" onClick={copiarYAbrirWeb}>
                  Copiar y abrir claude.ai
                </button>
                <button type="button" className="boton-secundario" onClick={abrirDesktop}>
                  Abrir en Claude Desktop
                </button>
                {copiadoVisible && <span className="practicar-ensayo-copiado">Copiado — pega con Ctrl+V</span>}
              </div>
              <div className="practicar-ensayo-evaluar-nota">
                "Abrir en Claude Desktop" requiere la app instalada — si no la tienes, no pasará nada.
              </div>
            </div>

            <div className="practicar-ensayo-historial">
              <button
                type="button"
                className="practicar-ensayo-historial-toggle"
                onClick={() => setHistorialAbierto((a) => !a)}
              >
                <span className={`practicar-ensayo-chevron${historialAbierto ? ' practicar-ensayo-chevron--abierto' : ''}`}>
                  <IconoChevronIzquierdo size={11} />
                </span>
                Historial ({historial.length})
              </button>

              {historialAbierto && (
                <div className="practicar-ensayo-historial-lista">
                  {historial.length === 0 && (
                    <p className="practicar-ensayo-historial-vacio">Aún no hay ensayos guardados.</p>
                  )}
                  {historial.map((h) => (
                    <div key={h.id} className="practicar-ensayo-historial-item">
                      <div className="practicar-ensayo-historial-fila">
                        <span className="practicar-ensayo-historial-fecha">{h.fecha}</span>
                        <span className="practicar-ensayo-historial-palabras">{contarPalabras(h.ensayo)} palabras</span>
                      </div>
                      <div className="practicar-ensayo-historial-pregunta">
                        {h.pregunta.length > 70 ? `${h.pregunta.slice(0, 70)}…` : h.pregunta}
                      </div>
                      <div className="practicar-ensayo-resultado">
                        <div className="practicar-ensayo-resultado-fila">
                          <span className="practicar-ensayo-resultado-label">Nivel</span>
                          <div className="practicar-ensayo-pills">
                            {NIVELES.map((n) => (
                              <button
                                key={n}
                                type="button"
                                className={`practicar-ensayo-pill${h.nivel === n ? ' practicar-ensayo-pill--activo' : ''}`}
                                onClick={() => actualizarResultado(h.id, { nivel: h.nivel === n ? null : n })}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        {EJES.map((eje) => (
                          <div key={eje} className="practicar-ensayo-resultado-fila">
                            <span className="practicar-ensayo-resultado-label">{EJES_LABELS[eje]}</span>
                            <div className="practicar-ensayo-pills">
                              {OPCIONES_EJE.map((op) => (
                                <button
                                  key={op.valor}
                                  type="button"
                                  className={`practicar-ensayo-pill practicar-ensayo-pill--${op.valor}${
                                    h.ejes?.[eje] === op.valor ? ' practicar-ensayo-pill--activo' : ''
                                  }`}
                                  onClick={() =>
                                    actualizarResultado(h.id, {
                                      ejes: { ...h.ejes, [eje]: h.ejes?.[eje] === op.valor ? null : op.valor },
                                    })
                                  }
                                >
                                  {op.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="practicar-ensayo-resultado-fila">
                          <span className="practicar-ensayo-resultado-label">¿Complejizó (objeción respondida)?</span>
                          <div className="practicar-ensayo-pills">
                            <button
                              type="button"
                              className={`practicar-ensayo-pill practicar-ensayo-pill--bien${
                                h.complejizo === true ? ' practicar-ensayo-pill--activo' : ''
                              }`}
                              onClick={() => actualizarResultado(h.id, { complejizo: h.complejizo === true ? null : true })}
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              className={`practicar-ensayo-pill practicar-ensayo-pill--mal${
                                h.complejizo === false ? ' practicar-ensayo-pill--activo' : ''
                              }`}
                              onClick={() =>
                                actualizarResultado(h.id, { complejizo: h.complejizo === false ? null : false })
                              }
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
