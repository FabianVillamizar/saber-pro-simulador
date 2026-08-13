import { useState } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import { RAMAS, ESTRATOS, UNIDADES_POR_RAMA } from '../modulos/quimica-completa/mapa.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo } from '../componentes/iconos.jsx'
import './MapaConocimientoQuimica.css'

const totalUnidades = Object.values(UNIDADES_POR_RAMA).reduce((n, r) => n + r.unidades.length, 0)

export function MapaConocimientoQuimica({ perfil, onCambiarPerfil, onVolver }) {
  const { dark, toggle } = useTheme()
  const [vista, setVista] = useState('mapa')
  const [openEstrato, setOpenEstrato] = useState(3)
  const [ramaSel, setRamaSel] = useState('fisicoquimica')

  const colorPorRama = Object.fromEntries(
    RAMAS.map((r) => [r.key, dark ? `oklch(72% 0.12 ${r.hue})` : `oklch(52% 0.14 ${r.hue})`]),
  )
  const nombrePorRama = Object.fromEntries(RAMAS.map((r) => [r.key, r.nombre]))
  const uData = UNIDADES_POR_RAMA[ramaSel]
  const ramaSelInfo = RAMAS.find((r) => r.key === ramaSel)

  return (
    <div className="page mapa-quimica">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="mq-titulo">
          <div className="mq-titulo-modulo">Química · Red completa</div>
          <div className="mq-titulo-sub">Fuera del Saber Pro · 8 ramas · {totalUnidades} unidades planeadas</div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="mq-tabs">
          <button type="button" className={`mq-tab${vista === 'mapa' ? ' mq-tab--activo' : ''}`} onClick={() => setVista('mapa')}>
            Mapa causal
          </button>
          <button type="button" className={`mq-tab${vista === 'rama' ? ' mq-tab--activo' : ''}`} onClick={() => setVista('rama')}>
            Dentro de una rama
          </button>
        </div>
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="mq-cuerpo">
        <div className="mq-banner">
          <div className="mq-banner-titulo">Nada aquí se estudia por rama. Se estudia por qué explica qué.</div>
          <p className="mq-banner-texto">
            La química cuántica explica el enlace; el enlace explica la reactividad; la reactividad explica el
            mecanismo; el mecanismo explica lo que mide el instrumento. Ese es el orden real, y es el que ordena este
            mapa — las ramas son etiquetas de procedencia, no compartimentos.
          </p>
          <p className="mq-banner-nota">
            Esto es la hoja de ruta curricular, no un banco de tarjetas: ninguna de estas {totalUnidades} unidades
            tiene contenido real todavía. Se decidió la estructura primero para poder generar tarjetas después dentro
            de un orden ya pensado, en vez de al revés.
          </p>
        </div>

        {vista === 'mapa' && (
          <>
            <div className="mq-estratos">
              {ESTRATOS.map((e) => {
                const open = openEstrato === e.nivel
                return (
                  <div key={e.nivel} className={`mq-estrato${open ? ' mq-estrato--abierto' : ''}`}>
                    <button
                      type="button"
                      className="mq-estrato-cabecera"
                      aria-expanded={open}
                      onClick={() => setOpenEstrato(open ? null : e.nivel)}
                    >
                      <div className="mq-estrato-nivel">{e.nivel}</div>
                      <div className="mq-estrato-info">
                        <div className="mq-estrato-pregunta">{e.pregunta}</div>
                        <div className="mq-estrato-meta">{e.meta}</div>
                      </div>
                      <div className="mq-estrato-chips">
                        {e.ramas.map((k) => (
                          <span key={k} title={nombrePorRama[k]} className="mq-chip" style={{ background: colorPorRama[k] }} />
                        ))}
                      </div>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 11 11"
                        className="mq-chevron"
                        style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        <path d="M2 1 L9 5.5 L2 10" fill="none" stroke="var(--text-sub)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {open && (
                      <div className="mq-estrato-nodos">
                        {e.nodos.map((n) => (
                          <div key={n.nombre} className="mq-nodo">
                            <span className="mq-nodo-barra" style={{ background: colorPorRama[n.ramaKey] }} />
                            <div className="mq-nodo-info">
                              <div className="mq-nodo-nombre">{n.nombre}</div>
                              <div className="mq-nodo-rama">{nombrePorRama[n.ramaKey]}</div>
                            </div>
                            {n.explica && <div className="mq-nodo-explica">explica <b>{n.explica}</b></div>}
                            {n.requiere && <div className="mq-nodo-requiere">requiere <b>{n.requiere}</b></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="mq-nota">
              Los cinco estratos no son niveles de dificultad sino <b>niveles de explicación</b>: cada uno responde
              por qué ocurre lo del estrato de arriba. La barrita de color a la izquierda de cada nodo dice de qué
              rama viene.
            </p>

            <div className="mq-leyenda">
              {RAMAS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className="mq-leyenda-item"
                  onClick={() => {
                    setRamaSel(r.key)
                    setVista('rama')
                  }}
                >
                  <span className="mq-chip" style={{ background: colorPorRama[r.key] }} />
                  <span className="mq-leyenda-nombre">{r.nombre}</span>
                  <span className="mq-leyenda-n">{UNIDADES_POR_RAMA[r.key].unidades.length} unidades</span>
                </button>
              ))}
            </div>
          </>
        )}

        {vista === 'rama' && (
          <>
            <div className="mq-ramas-tabs">
              {RAMAS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`mq-rama-tab${ramaSel === r.key ? ' mq-rama-tab--activa' : ''}`}
                  aria-pressed={ramaSel === r.key}
                  onClick={() => setRamaSel(r.key)}
                >
                  <span className="mq-chip" style={{ background: colorPorRama[r.key] }} />
                  {r.nombre}
                </button>
              ))}
            </div>

            <div className="mq-rama-detalle" style={{ borderLeftColor: colorPorRama[ramaSel] }}>
              <div className="mq-rama-cabecera">
                <div className="mq-rama-nombre">{ramaSelInfo.nombre}</div>
                <div className="mq-rama-meta">{uData.unidades.length} unidades planeadas</div>
              </div>
              <p className="mq-rama-desc">{uData.descripcion}</p>

              <div className="mq-pregunta-rectora" style={{ background: `color-mix(in oklch, ${colorPorRama[ramaSel]} ${dark ? 12 : 6}%, var(--surface))`, borderLeftColor: colorPorRama[ramaSel] }}>
                <div className="mq-pregunta-rectora-etiqueta" style={{ color: colorPorRama[ramaSel] }}>Pregunta rectora</div>
                <div className="mq-pregunta-rectora-texto">{uData.preguntaRectora}</div>
              </div>

              <div className="mq-unidades">
                {uData.unidades.map((u) => (
                  <div key={u.nombre} className="mq-unidad">
                    <div className="mq-unidad-cabecera">
                      <div className="mq-unidad-info">
                        <div className="mq-unidad-nombre">{u.nombre}</div>
                        <div className="mq-unidad-explica">{u.explica}</div>
                      </div>
                      <div className="mq-unidad-estado">Sin construir</div>
                    </div>
                    <div className="mq-unidad-modos">
                      {u.modos.map((m) => (
                        <span key={m} className="mq-modo-chip">{m}</span>
                      ))}
                    </div>
                    {u.depUnidad && (
                      <div className="mq-unidad-dep" style={{ borderLeftColor: colorPorRama[u.depRamaKey] }}>
                        Descansa sobre <b>{u.depUnidad}</b> — {nombrePorRama[u.depRamaKey]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="mq-nota">
              Cada unidad se anuncia por <b>lo que explica</b>, no por lo que contiene, y sus tarjetas se contarán
              por modo de razonamiento —predecir, diagnosticar, evaluar, interpretar— en vez de por subtema, cuando
              exista contenido real.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
