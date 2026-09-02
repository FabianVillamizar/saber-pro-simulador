import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { Formula } from '../componentes/Formula.jsx'
import { TextoConFormulas } from '../componentes/TextoConFormulas.jsx'
import { IconoChevronIzquierdo, IconoCheck, IconoX, IconoFlechaDerecha } from '../componentes/iconos.jsx'
import './PracticarLapizPapel.css'

// Render inline seguro por módulo — ver `renderizaFormulas` en
// indiceModulos.js: RC usa "$" para montos de dinero en estos mismos
// campos (enunciado/porQue/respuesta/desarrollo), así que tratar
// cualquier "$...$" como LaTeX ahí rompería esos montos. Solo los módulos
// que declaran `renderizaFormulas` (hoy, Habilidades de Laboratorio)
// pasan por TextoConFormulas aquí; el resto conserva el texto plano de
// siempre.
function Texto({ texto, formulas }) {
  return formulas ? <TextoConFormulas texto={texto} /> : texto
}

function barajar(items) {
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

const LETRAS = ['A', 'B', 'C', 'D']

const AUTOEVAL = [
  { id: 'ni_idea', label: 'Ni idea', sub: 'No reconocí el enfoque' },
  { id: 'con_esfuerzo', label: 'Con esfuerzo', sub: 'Lo vi, pero tardé' },
  { id: 'lo_reconoci', label: 'Lo reconocí', sub: 'Supe qué usar de una' },
  { id: 'inmediato', label: 'Inmediato', sub: 'Enfoque y cuenta sin dudar' },
]

function IconoFormula({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M2 2 H10 M6 2 V10 M3.5 10 H8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function IconoTrampa({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M6 1 L11 10 H1 Z" fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

export function PracticarLapizPapel({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const [barajada, setBarajada] = useState(null)
  const { dark, toggle } = useTheme()

  const [indice, setIndice] = useState(0)
  const [fase, setFase] = useState(1)
  const [seleccion, setSeleccion] = useState(null)
  const [respuesta, setRespuesta] = useState('')
  const [solucionVisible, setSolucionVisible] = useState(false)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  if (barajada === null) {
    // Baraja tanto el orden de los ejercicios como el de las opciones de la
    // fase 1: los JSON traen la opción correcta siempre primera, y sin
    // barajar aquí "la correcta es la A" se vuelve un tell (ver
    // feedback_mcq_guessable_bias). `o.correcta` viaja en el objeto, así
    // que reordenar no rompe la detección; `seleccion` guarda el índice de
    // render, estable durante la vida del ejercicio.
    setBarajada(barajar(modulo.lapizPapel).map((e) => ({ ...e, opciones: barajar(e.opciones) })))
    return <div className="page estado-carga">Cargando…</div>
  }

  const ej = barajada[indice % barajada.length]
  const esFormula = ej.tipo === 'formula'
  const revelado = seleccion !== null

  function reiniciarEjercicio() {
    setFase(1)
    setSeleccion(null)
    setRespuesta('')
    setSolucionVisible(false)
  }

  function siguiente() {
    setIndice((i) => (i + 1) % barajada.length)
    reiniciarEjercicio()
  }

  return (
    <div className="page practicar-lp">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="practicar-lp-titulo">
          <div className="practicar-lp-titulo-modulo">{modulo.nombre}</div>
          <div className="practicar-lp-titulo-sub">Ejercicios de lápiz y papel</div>
        </div>
        <div style={{ flex: 1 }} />
        <span className="practicar-lp-contador">
          {(indice % barajada.length) + 1} de {barajada.length}
        </span>
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="practicar-lp-cuerpo">
        <div className="practicar-lp-nota">
          <svg width="16" height="16" viewBox="0 0 16 16" className="practicar-lp-nota-icono">
            <circle cx="8" cy="8" r="7" fill="none" stroke="var(--text-sub)" strokeWidth="1.4" />
            <line x1="8" y1="7" x2="8" y2="11.5" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="4.7" r="0.9" fill="var(--text-sub)" />
          </svg>
          <div>
            El ICFES advierte que no pedirá operaciones extenuantes. Aquí no se cronometra la cuenta: se practica{' '}
            <b>reconocer el enfoque</b> antes de calcular nada.
          </div>
        </div>

        <div className="practicar-lp-fases">
          <div className="practicar-lp-fase-item">
            <span className={`practicar-lp-fase-num${fase >= 1 ? ' practicar-lp-fase-num--activa' : ''}${fase > 1 ? ' practicar-lp-fase-num--hecha' : ''}`}>
              1
            </span>
            <span className="practicar-lp-fase-nombre">Reconoce el enfoque</span>
          </div>
          <div className={`practicar-lp-fase-rail${fase === 2 ? ' practicar-lp-fase-rail--activa' : ''}`} />
          <div className="practicar-lp-fase-item">
            <span className={`practicar-lp-fase-num${fase === 2 ? ' practicar-lp-fase-num--activa' : ''}`}>2</span>
            <span className={`practicar-lp-fase-nombre${fase === 1 ? ' practicar-lp-fase-nombre--tenue' : ''}`}>Resuélvelo a mano</span>
          </div>
        </div>

        <div className={`practicar-lp-tarjeta practicar-lp-tarjeta--${esFormula ? 'formula' : 'trampa'}`}>
          <div className="practicar-lp-badges">
            <div className={`practicar-lp-badge-tipo practicar-lp-badge-tipo--${esFormula ? 'formula' : 'trampa'}`}>
              {esFormula ? <IconoFormula color={esFormula ? 'var(--accent)' : 'var(--warning)'} /> : <IconoTrampa color="var(--warning)" />}
              {esFormula ? 'Fórmula' : 'Trampa de lectura'}
            </div>
            <div className="practicar-lp-badge-sub">{ej.subcategoria}</div>
          </div>

          <div className="practicar-lp-enunciado"><Texto texto={ej.enunciado} formulas={modulo.renderizaFormulas} /></div>

          {fase === 1 && (
            <div className="practicar-lp-fase1">
              <div className="practicar-lp-eyebrow"><Texto texto={ej.promptFase1} formulas={modulo.renderizaFormulas} /></div>
              <div className="practicar-lp-opciones">
                {ej.opciones.map((o, i) => {
                  const elegida = seleccion === i
                  let clase = 'practicar-lp-opcion'
                  if (revelado && o.correcta) clase += ' practicar-lp-opcion--correcta'
                  else if (revelado && elegida) clase += ' practicar-lp-opcion--incorrecta'
                  else if (elegida) clase += ' practicar-lp-opcion--elegida'
                  return (
                    <div
                      key={i}
                      role="button"
                      tabIndex={0}
                      className={clase}
                      onClick={() => !revelado && setSeleccion(i)}
                      onKeyDown={(e) => {
                        if (!revelado && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          setSeleccion(i)
                        }
                      }}
                    >
                      <span className="practicar-lp-opcion-letra">{LETRAS[i]}</span>
                      <span className="practicar-lp-opcion-texto"><Texto texto={o.texto} formulas={modulo.renderizaFormulas} /></span>
                      {revelado && o.correcta && <IconoCheck size={16} color="var(--exito)" />}
                      {revelado && elegida && !o.correcta && <IconoX size={15} color="var(--lp-error)" />}
                    </div>
                  )
                })}
              </div>

              {revelado && (
                <div className={`practicar-lp-revelado practicar-lp-revelado--${esFormula ? 'formula' : 'trampa'}`}>
                  <div className="practicar-lp-revelado-titulo"><Texto texto={ej.labelHerramienta} formulas={modulo.renderizaFormulas} /></div>
                  {ej.formula && (
                    <div className="practicar-lp-revelado-formula">
                      <Formula tex={ej.formula} />
                    </div>
                  )}
                  <div className="practicar-lp-revelado-texto"><Texto texto={ej.porQue} formulas={modulo.renderizaFormulas} /></div>
                </div>
              )}

              {revelado && (
                <button type="button" className="boton-primario practicar-lp-cta" onClick={() => setFase(2)}>
                  Ahora resuélvelo a mano
                  <IconoFlechaDerecha size={15} color="white" />
                </button>
              )}
            </div>
          )}

          {fase === 2 && (
            <div className="practicar-lp-fase2">
              <div className={`practicar-lp-enfoque practicar-lp-enfoque--${esFormula ? 'formula' : 'trampa'}`}>
                <IconoCheck size={14} color={esFormula ? 'var(--accent)' : 'var(--warning)'} />
                <div className="practicar-lp-enfoque-info">
                  <div className="practicar-lp-enfoque-eyebrow">Tu enfoque</div>
                  <div className="practicar-lp-enfoque-nombre"><Texto texto={ej.enfoqueCorto} formulas={modulo.renderizaFormulas} /></div>
                </div>
                {ej.formula && (
                  <div className="practicar-lp-enfoque-formula">
                    <Formula tex={ej.formula} />
                  </div>
                )}
              </div>

              <div className="practicar-lp-separador">
                <span className="practicar-lp-separador-linea" />
                <span className="practicar-lp-separador-texto">Resuélvelo en papel, luego vuelve</span>
                <span className="practicar-lp-separador-linea" />
              </div>

              <div className="practicar-lp-input-bloque">
                <div className="practicar-lp-eyebrow">Tu resultado (opcional)</div>
                <input
                  className="practicar-lp-input"
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Anota a qué llegaste…"
                />
              </div>

              {!solucionVisible && (
                <button type="button" className="practicar-lp-boton-secundario" onClick={() => setSolucionVisible(true)}>
                  Ver la respuesta
                </button>
              )}

              {solucionVisible && (
                <div className="practicar-lp-solucion">
                  <div className="practicar-lp-solucion-caja">
                    <div className="practicar-lp-eyebrow">Respuesta</div>
                    <div className="practicar-lp-solucion-respuesta"><Texto texto={ej.respuesta} formulas={modulo.renderizaFormulas} /></div>
                    <div className="practicar-lp-solucion-desarrollo"><Texto texto={ej.desarrollo} formulas={modulo.renderizaFormulas} /></div>
                  </div>

                  {/* La comparación "atajo vs a pulso" solo tiene sentido cuando el
                      ejercicio es de tipo cálculo con una fórmula-atajo (RC, Habilidades
                      de Laboratorio). Los "casos" de Teoría de Grupos son procedimientos
                      de razonamiento sin un número al final, así que omiten estos campos
                      y este bloque no se pinta. */}
                  {ej.atajoPct != null && (
                    <>
                      <div className="practicar-lp-atajo">
                        <div className={`practicar-lp-atajo-fila practicar-lp-atajo-fila--${esFormula ? 'formula' : 'trampa'}`}>
                          <div className="practicar-lp-atajo-etiqueta">Atajo</div>
                          <div className="practicar-lp-atajo-barra">
                            <div className="practicar-lp-atajo-relleno" style={{ width: `${ej.atajoPct}%` }} />
                          </div>
                          <div className="practicar-lp-atajo-costo">{ej.atajoCosto}</div>
                        </div>
                        <div className="practicar-lp-atajo-fila">
                          <div className="practicar-lp-atajo-etiqueta practicar-lp-atajo-etiqueta--tenue">A pulso</div>
                          <div className="practicar-lp-atajo-barra">
                            <div className="practicar-lp-atajo-relleno practicar-lp-atajo-relleno--tenue" style={{ width: '100%' }} />
                          </div>
                          <div className="practicar-lp-atajo-costo practicar-lp-atajo-costo--tenue">{ej.brutoCosto}</div>
                        </div>
                      </div>
                      {ej.notaAtajo && (
                        <p className="practicar-lp-nota-atajo"><Texto texto={ej.notaAtajo} formulas={modulo.renderizaFormulas} /></p>
                      )}
                    </>
                  )}

                  <div className="practicar-lp-autoeval">
                    <div className="practicar-lp-eyebrow">¿Cómo te fue?</div>
                    <div className="practicar-lp-autoeval-grid">
                      {AUTOEVAL.map((a) => (
                        <button key={a.id} type="button" className={`practicar-lp-autoeval-boton practicar-lp-autoeval-boton--${a.id}`} onClick={siguiente}>
                          <span className="practicar-lp-autoeval-label">{a.label}</span>
                          <span className="practicar-lp-autoeval-sub">{a.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="practicar-lp-pie">
          <button type="button" className="practicar-lp-boton-secundario" onClick={reiniciarEjercicio}>
            Reiniciar ejercicio
          </button>
          <button type="button" className="practicar-lp-boton-secundario" onClick={siguiente}>
            Siguiente ejercicio →
          </button>
        </div>
      </div>
    </div>
  )
}
