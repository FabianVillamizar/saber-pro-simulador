import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { estadoDeGrupo, porcentajeDominio } from '../engine/srs.js'
import {
  NOMBRES_BLOQUE_COMUN,
  NOMBRES_BLOQUE_QUIMICA,
  ORDEN_CASILLAS_QUIMICA,
  METODO_QUIMICA,
  HERRAMIENTAS,
  gradoDeBloque,
} from '../modulos/pensamiento-cientifico/exploracion.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo, IconoCandado } from '../componentes/iconos.jsx'
import './ExploracionPensamientoCientifico.css'

const GRADO_LABEL = { 1: 'Grado 1', 2: 'Grado 2', 3: 'Grado 3' }

export function ExploracionPensamientoCientifico({ moduloId, perfil, onCambiarPerfil, onVolver, onRepasar }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [estadosSRS] = useState(() => leerJSON(claveSRS(perfil.id, moduloId), {}))
  const [superficie, setSuperficie] = useState('comun')
  const [openHerramienta, setOpenHerramienta] = useState(HERRAMIENTAS[0].key)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const porNucleo = { comun: [], especifico_quimica: [] }
  for (const t of modulo.tarjetasConcepto) (porNucleo[t.nucleo] ??= []).push(t)
  const comun = porNucleo.comun
  const quimica = porNucleo.especifico_quimica
  const totalTarjetas = modulo.tarjetasConcepto.length

  const comunPct = porcentajeDominio(comun, estadosSRS)
  const quimPct = porcentajeDominio(quimica, estadosSRS)

  const herramientas = HERRAMIENTAS.map((h) => {
    const cards = comun.filter((t) => h.bloques.includes(t.bloque))
    const pct = porcentajeDominio(cards, estadosSRS)
    const done = Math.round((pct / 100) * cards.length)
    const porGrado = { 1: [], 2: [], 3: [] }
    for (const bloque of h.bloques) {
      const cardsBloque = comun.filter((t) => t.bloque === bloque)
      if (cardsBloque.length === 0) continue
      const grado = gradoDeBloque(cardsBloque)
      porGrado[grado].push({
        bloque,
        nombre: NOMBRES_BLOQUE_COMUN[bloque] ?? bloque,
        n: cardsBloque.length,
        estado: estadoDeGrupo(cardsBloque, estadosSRS),
      })
    }
    return { ...h, cards, n: cards.length, pct, done, porGrado }
  })

  const casillasQuimica = ORDEN_CASILLAS_QUIMICA.map((bloque) => {
    const cards = quimica.filter((t) => t.bloque === bloque)
    const estado = estadoDeGrupo(cards, estadosSRS)
    const hechas = cards.filter((c) => (estadosSRS[c.id]?.repeticiones ?? 0) >= 1).length
    return { bloque, nombre: NOMBRES_BLOQUE_QUIMICA[bloque] ?? bloque, cards, estado, hechas }
  })

  const metodoQuimica = METODO_QUIMICA.map((bloque) => {
    const cards = quimica.filter((t) => t.bloque === bloque)
    const estado = estadoDeGrupo(cards, estadosSRS)
    return { bloque, nombre: NOMBRES_BLOQUE_COMUN[bloque] ?? bloque, n: cards.length, estado }
  })

  function repasarComun() {
    onRepasar(null, herramientas.flatMap((h) => h.bloques))
  }
  function repasarQuimica() {
    onRepasar(null, [...ORDEN_CASILLAS_QUIMICA, ...METODO_QUIMICA])
  }
  function repasarTodo() {
    onRepasar(null, null)
  }

  return (
    <div className="page explorar-pc">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="explorar-pc-titulo">
          <div className="explorar-pc-titulo-modulo">{modulo.nombre}</div>
          <div className="explorar-pc-titulo-sub">Repaso de conceptos · {totalTarjetas} tarjetas</div>
        </div>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="explorar-pc-cuerpo">
        <div className="pc-meson">
          <button
            type="button"
            className={`pc-meson-superficie${superficie === 'comun' ? ' pc-meson-superficie--activa' : ''}`}
            aria-pressed={superficie === 'comun'}
            onClick={() => setSuperficie('comun')}
          >
            <div className="pc-meson-cabecera">
              <svg width="17" height="17" viewBox="0 0 18 18">
                <rect x="1.5" y="6" width="15" height="10" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6.5 6 V4 A2 2 0 0 1 11.5 4 V6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="1.5" y1="10" x2="16.5" y2="10" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              <span className="pc-meson-nombre">Caja de herramientas</span>
              <span className="pc-meson-n">{comun.length}</span>
            </div>
            <p className="pc-meson-desc">
              Habilidades de razonamiento que sirven en cualquier ciencia. Se toman por separado, según lo que el
              problema pida.
            </p>
            <div className="pc-meson-barra">
              <div className="pc-meson-barra-relleno" style={{ width: `${comunPct}%` }} />
              <span className="pc-meson-barra-pct">{comunPct}%</span>
            </div>
          </button>

          <button
            type="button"
            className={`pc-meson-superficie${superficie === 'quimica' ? ' pc-meson-superficie--activa' : ''}`}
            aria-pressed={superficie === 'quimica'}
            onClick={() => setSuperficie('quimica')}
          >
            <div className="pc-meson-cabecera">
              <svg width="17" height="17" viewBox="0 0 18 18">
                <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10" y="10" width="6.5" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="pc-meson-nombre">Bandeja de química</span>
              <span className="pc-meson-n">{quimica.length}</span>
            </div>
            <p className="pc-meson-desc">
              14 casillas de exactamente 4 tarjetas. Cada tema es un punto de entrada propio — ninguno exige otro
              primero.
            </p>
            <div className="pc-meson-barra">
              <div className="pc-meson-barra-relleno" style={{ width: `${quimPct}%` }} />
              <span className="pc-meson-barra-pct">{quimPct}%</span>
            </div>
          </button>

          <div className="pc-meson-pie">
            Un mismo mesón, dos superficies: las cinco afirmaciones del ICFES cruzan ambas y se ven en cada tarjeta,
            no aquí — esta vista es sobre <b>qué contenido</b>, no sobre qué habilidad de examen.
          </div>
        </div>

        {superficie === 'comun' && (
          <div className="pc-seccion">
            <p className="explorar-pc-intro">
              Seis herramientas, cada una del tamaño de lo que realmente contiene. No hay orden de recorrido: se toma
              la que el problema exige. Dentro de cada una, los <b>grados</b> sí van en orden — reconocer algo antes
              de saber corregirlo.
            </p>

            <div className="pc-herramientas">
              {herramientas.map((h) => {
                const open = openHerramienta === h.key
                return (
                  <div key={h.key} className={`pc-herramienta${open ? ' pc-herramienta--abierta' : ''}`}>
                    <button
                      type="button"
                      className="pc-herramienta-cabecera"
                      aria-expanded={open}
                      onClick={() => setOpenHerramienta(open ? null : h.key)}
                    >
                      <div className="pc-herramienta-info">
                        <div className="pc-herramienta-nombre">{h.nombre}</div>
                        <div className="pc-herramienta-paraque">{h.paraQue}</div>
                      </div>
                      <div className="pc-herramienta-marcas">
                        {h.cards.map((c, i) => (
                          <span
                            key={c.id}
                            className={`pc-herramienta-marca${i < h.done ? ' pc-herramienta-marca--activa' : ''}`}
                            style={{ height: `${8 + (i % 3) * 4}px` }}
                          />
                        ))}
                      </div>
                      <span className="pc-herramienta-n">{h.n}</span>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 11 11"
                        className="pc-herramienta-chevron"
                        style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        <path
                          d="M2 1 L9 5.5 L2 10"
                          fill="none"
                          stroke="var(--text-sub)"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {open && (
                      <div className="pc-herramienta-grados">
                        {[1, 2, 3].map(
                          (grado) =>
                            h.porGrado[grado].length > 0 && (
                              <div key={grado} className="pc-grado-bloque">
                                {h.porGrado[grado].map((b) => (
                                  <div
                                    key={b.bloque}
                                    className={`pc-grado-fila pc-grado-fila--${b.estado}`}
                                    style={{ marginLeft: `${(grado - 1) * 18}px` }}
                                  >
                                    <span className={`pc-grado-etiqueta pc-grado-etiqueta--${grado}`}>
                                      {GRADO_LABEL[grado]}
                                    </span>
                                    <span className="pc-grado-nombre">{b.nombre}</span>
                                    {b.estado === 'bloqueado' && <IconoCandado size={12} color="var(--text-sub)" />}
                                    <span className="pc-grado-n">{b.n}</span>
                                  </div>
                                ))}
                              </div>
                            ),
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="explorar-pc-nota">
              La escalerita de marcas a la derecha de cada herramienta es su número real de tarjetas: 31 bloques
              repartidos de forma desigual, y así se ven. Aquí el prerrequisito casi nunca es "otro tema": es{' '}
              <b>la misma idea un grado más simple</b>, y por eso se dibuja anidado, no como flecha entre iguales.
            </p>

            <button type="button" className="boton-primario explorar-pc-cta" onClick={repasarComun}>
              Repasar la caja de herramientas
            </button>
          </div>
        )}

        {superficie === 'quimica' && (
          <div className="pc-seccion">
            <p className="explorar-pc-intro">
              Catorce casillas de exactamente cuatro tarjetas: la retícula es literal, cada celda es una tarjeta.
              Ninguna casilla depende de otra — son 14 puntos de entrada reales, no una cadena.
            </p>

            <div className="pc-casillas">
              {casillasQuimica.map((c) => (
                <div key={c.bloque} className={`pc-casilla pc-casilla--${c.estado}`}>
                  <div className="pc-casilla-cabecera">
                    <span className="pc-casilla-nombre">{c.nombre}</span>
                    {c.estado === 'bloqueado' && <IconoCandado size={11} color="var(--text-sub)" />}
                  </div>
                  <div className="pc-casilla-celdas">
                    {c.cards.map((cel, i) => (
                      <span
                        key={cel.id}
                        className={`pc-casilla-celda${i < c.hechas ? ' pc-casilla-celda--hecha' : ''}`}
                      />
                    ))}
                  </div>
                  <div className="pc-casilla-pie">
                    {c.hechas} de {c.cards.length} dominadas
                  </div>
                </div>
              ))}
            </div>

            <div className="pc-metodo">
              <div className="pc-metodo-etiqueta">No son temas de química</div>
              <div className="pc-metodo-titulo">Método científico aplicado a química</div>
              <div className="pc-metodo-chips">
                {metodoQuimica.map((m) => (
                  <div key={m.bloque} className={`pc-metodo-chip pc-metodo-chip--${m.estado}`}>
                    <span className="pc-metodo-punto" />
                    <span className="pc-metodo-nombre">{m.nombre}</span>
                    <span className="pc-metodo-n">{m.n}</span>
                  </div>
                ))}
              </div>
              <p className="pc-metodo-nota">
                Estos tres rompen la retícula a propósito: son la caja de herramientas del otro lado del mesón,
                aplicada a un contexto químico concreto. Es el único punto donde las dos superficies se tocan.
              </p>
            </div>

            <button type="button" className="boton-primario explorar-pc-cta" onClick={repasarQuimica}>
              Repasar la bandeja de química
            </button>
          </div>
        )}

        <button type="button" className="boton-secundario explorar-pc-cta-todo" onClick={repasarTodo}>
          Repasar los dos núcleos mezclados
        </button>
      </div>
    </div>
  )
}
