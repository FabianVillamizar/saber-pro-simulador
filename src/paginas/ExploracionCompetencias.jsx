import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { estadoDeGrupo, porcentajeDominio } from '../engine/srs.js'
import {
  NOMBRES_BLOQUE,
  DESCRIPCION_COMPETENCIA,
  CAPAS_CONOCIMIENTOS,
  TRAMPA_POR_COMPETENCIA,
  bloqueRequerido,
} from '../modulos/competencias-ciudadanas/exploracion.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo, IconoAdvertencia, IconoCandado, IconoFlechaDerecha } from '../componentes/iconos.jsx'
import './ExploracionCompetencias.css'

const ORDEN_COMPETENCIAS = ['conocimientos', 'argumentacion', 'multiperspectivismo', 'pensamiento_sistemico']

const ETIQUETA_COMPETENCIA = {
  conocimientos: 'Conocimientos',
  argumentacion: 'Argumentación',
  multiperspectivismo: 'Multiperspectivismo',
  pensamiento_sistemico: 'Pensamiento Sistémico',
}

const ESTRATOS = [
  { clave: 'alta', etiqueta: 'Alta' },
  { clave: 'media', etiqueta: 'Media' },
  { clave: 'baja', etiqueta: 'Baja' },
]

// 4 barritas de profundidad (vista → practicada → acertada → sostenida),
// no una escalera de dificultad falsa: útil sobre todo en
// multiperspectivismo/pensamiento sistémico, que no tienen tarjetas
// "fáciles" con las que fingir una rampa de entrada.
function profundidad(estado) {
  const llenas = estado === 'dominado' ? 4 : estado === 'activo' ? 2 : estado === 'nuevo' ? 1 : 0
  return [0, 1, 2, 3].map((i) => i < llenas)
}

export function ExploracionCompetencias({ moduloId, perfil, onCambiarPerfil, onVolver, onRepasar }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  // Solo lectura: el SRS lo escribe RepasoConceptos.jsx. Se reusa acá para
  // calcular dominio/estado real por bloque y capa.
  const [estadosSRS] = useState(() => leerJSON(claveSRS(perfil.id, moduloId), {}))
  const [seleccionada, setSeleccionada] = useState('conocimientos')
  const [capaAbierta, setCapaAbierta] = useState(1)
  const [trampasOn, setTrampasOn] = useState(false)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const tarjetasPorId = new Map(modulo.tarjetasConcepto.map((t) => [t.id, t]))
  const porCompetencia = {}
  for (const t of modulo.tarjetasConcepto) {
    ;(porCompetencia[t.competencia_asociada] ??= []).push(t)
  }

  const pilares = ORDEN_COMPETENCIAS.map((comp) => {
    const tarjetas = porCompetencia[comp] ?? []
    const dif = { baja: 0, media: 0, alta: 0 }
    for (const t of tarjetas) dif[t.dificultad] = (dif[t.dificultad] ?? 0) + 1
    const max = Math.max(dif.baja, dif.media, dif.alta, 1)
    return {
      id: comp,
      nombre: ETIQUETA_COMPETENCIA[comp],
      total: tarjetas.length,
      dif,
      max,
      sinRampa: dif.baja === 0,
      dominioPct: porcentajeDominio(tarjetas, estadosSRS),
      trampa: TRAMPA_POR_COMPETENCIA[comp].etiqueta,
    }
  })

  const tarjetasSeleccionada = porCompetencia[seleccionada] ?? []
  const esConocimientos = seleccionada === 'conocimientos'

  function bloqueInfo(bloqueId, universo) {
    const tarjetas = universo.filter((t) => t.bloque === bloqueId)
    const estado = estadoDeGrupo(tarjetas, estadosSRS)
    const requiereBloque = estado === 'bloqueado' ? bloqueRequerido(tarjetas, estadosSRS, tarjetasPorId, bloqueId) : null
    return {
      id: bloqueId,
      nombre: NOMBRES_BLOQUE[bloqueId] ?? bloqueId,
      n: tarjetas.length,
      estado,
      requiere: requiereBloque ? NOMBRES_BLOQUE[requiereBloque] ?? requiereBloque : null,
    }
  }

  const capas = esConocimientos
    ? CAPAS_CONOCIMIENTOS.map((capa) => {
        const tarjetasCapa = tarjetasSeleccionada.filter((t) => capa.bloques.includes(t.bloque))
        return {
          ...capa,
          pct: porcentajeDominio(tarjetasCapa, estadosSRS),
          totalTarjetas: tarjetasCapa.length,
          bloques: capa.bloques.map((b) => bloqueInfo(b, tarjetasSeleccionada)),
        }
      })
    : []

  const bloquesPlanos = !esConocimientos
    ? [...new Set(tarjetasSeleccionada.map((t) => t.bloque))].map((b) => bloqueInfo(b, tarjetasSeleccionada))
    : []

  const bloquesTrampa = ORDEN_COMPETENCIAS.flatMap((comp) =>
    TRAMPA_POR_COMPETENCIA[comp].bloques.map((bloque) => ({
      ...bloqueInfo(bloque, porCompetencia[comp] ?? []),
      competencia: ETIQUETA_COMPETENCIA[comp],
    }))
  )

  const sel = pilares.find((p) => p.id === seleccionada)

  function repasar() {
    if (trampasOn) onRepasar(null, bloquesTrampa.map((b) => b.id))
    else onRepasar(seleccionada, null)
  }

  return (
    <div className="page explorar-cc">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="explorar-cc-titulo">
          <div className="explorar-cc-titulo-modulo">{modulo.nombre}</div>
          <div className="explorar-cc-titulo-sub">Repaso de conceptos · {modulo.tarjetasConcepto.length} tarjetas</div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className={`explorar-cc-trampas-btn${trampasOn ? ' explorar-cc-trampas-btn--activo' : ''}`}
          onClick={() => setTrampasOn((v) => !v)}
        >
          <IconoAdvertencia size={13} color={trampasOn ? 'var(--warning)' : 'currentColor'} />
          Modo trampas
        </button>
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="explorar-cc-cuerpo">
        {trampasOn && (
          <div className="explorar-cc-banner-trampas">
            <IconoAdvertencia size={17} color="var(--warning)" />
            <div>
              Estás filtrando por <b>trampa de pensamiento</b>, no por competencia: bloques de las 4 competencias
              donde el error común descrito en la tarjeta es justo la trampa que le da nombre.
            </div>
          </div>
        )}

        <div className="explorar-cc-pilares">
          {pilares.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`explorar-cc-pilar${seleccionada === p.id ? ' explorar-cc-pilar--activo' : ''}`}
              onClick={() => {
                setSeleccionada(p.id)
                setCapaAbierta(1)
              }}
            >
              <div className="explorar-cc-pilar-cabecera">
                <span className="explorar-cc-pilar-nombre">{p.nombre}</span>
                <span className="explorar-cc-pilar-total">{p.total}</span>
              </div>

              <div className="explorar-cc-estratos">
                {ESTRATOS.map((e) => {
                  const n = p.dif[e.clave]
                  return (
                    <div key={e.clave} className="explorar-cc-estrato-fila">
                      <span className={`explorar-cc-estrato-label${n === 0 ? ' explorar-cc-estrato-label--vacio' : ''}`}>
                        {e.etiqueta}
                      </span>
                      <span className="explorar-cc-estrato-barra">
                        <span
                          className={`explorar-cc-estrato-relleno${n === 0 ? ' explorar-cc-estrato-relleno--vacio' : ''}`}
                          style={{ width: `${Math.round((n / p.max) * 100)}%` }}
                        />
                      </span>
                      <span className={`explorar-cc-estrato-n${n === 0 ? ' explorar-cc-estrato-label--vacio' : ''}`}>{n}</span>
                    </div>
                  )
                })}
              </div>

              {p.sinRampa && (
                <div className="explorar-cc-sin-rampa">Empieza en terreno difícil — no hay tarjetas de entrada.</div>
              )}

              <div className="explorar-cc-pilar-trampa">
                <IconoAdvertencia size={11} color="var(--warning)" />
                {p.trampa}
              </div>

              <div className="explorar-cc-pilar-dominio">
                <div className="explorar-cc-pilar-dominio-relleno" style={{ width: `${p.dominioPct}%` }} />
              </div>
            </button>
          ))}
        </div>

        <div className="explorar-cc-drilldown">
          {trampasOn ? (
            <>
              <div className="explorar-cc-drilldown-cabecera">
                <span className="explorar-cc-drilldown-nombre">Modo trampas</span>
                <span className="explorar-cc-drilldown-meta">{bloquesTrampa.length} bloques</span>
              </div>
              <p className="explorar-cc-descripcion">
                Un bloque por cada trampa de pensamiento con nombre propio en el módulo, sin importar de qué
                competencia venga.
              </p>
              <div className="explorar-cc-bloques-lista">
                {bloquesTrampa.map((b) => (
                  <FilaBloque key={b.id} bloque={b} etiquetaExtra={b.competencia} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="explorar-cc-drilldown-cabecera">
                <span className="explorar-cc-drilldown-nombre">{sel.nombre}</span>
                <span className="explorar-cc-drilldown-meta">
                  {sel.dominioPct}% dominado · {esConocimientos ? `${CAPAS_CONOCIMIENTOS.length} capas` : `${bloquesPlanos.length} bloques`}
                </span>
              </div>
              <p className="explorar-cc-descripcion">{DESCRIPCION_COMPETENCIA[seleccionada]}</p>

              {esConocimientos ? (
                <>
                  <div className="explorar-cc-capas">
                    {[...capas].reverse().map((capa) => {
                      const abierta = capaAbierta === capa.nivel
                      return (
                        <div key={capa.nivel} className={`explorar-cc-capa${abierta ? ' explorar-cc-capa--abierta' : ''}`}>
                          <button
                            type="button"
                            className="explorar-cc-capa-cabecera"
                            onClick={() => setCapaAbierta((n) => (n === capa.nivel ? null : capa.nivel))}
                          >
                            <span className={`explorar-cc-capa-num${capa.pct > 0 ? ' explorar-cc-capa-num--activo' : ''}`}>
                              {capa.nivel}
                            </span>
                            <span className="explorar-cc-capa-info">
                              <span className="explorar-cc-capa-nombre">{capa.nombre}</span>
                              <span className="explorar-cc-capa-meta">
                                {capa.bloques.length} bloques · {capa.totalTarjetas} tarjetas
                              </span>
                            </span>
                            <span className="explorar-cc-capa-progreso">
                              <span className="explorar-cc-capa-progreso-barra">
                                <span className="explorar-cc-capa-progreso-relleno" style={{ width: `${capa.pct}%` }} />
                              </span>
                              <span className="explorar-cc-capa-progreso-pct">{capa.pct}%</span>
                            </span>
                            <span className={`explorar-cc-capa-chevron${abierta ? ' explorar-cc-capa-chevron--abierta' : ''}`}>
                              <IconoFlechaDerecha size={11} color="var(--text-faint)" />
                            </span>
                          </button>
                          {abierta && (
                            <div className="explorar-cc-bloques-lista explorar-cc-bloques-lista--capa">
                              {capa.bloques.map((b) => (
                                <FilaBloque key={b.id} bloque={b} />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="explorar-cc-nota">
                    Se leen de abajo hacia arriba: los fundamentos sostienen lo que está encima, igual que la
                    jerarquía normativa que enseña la capa 1.
                  </p>
                </>
              ) : (
                <>
                  <div className="explorar-cc-bloques-lista">
                    {bloquesPlanos.map((b) => (
                      <FilaBloque key={b.id} bloque={b} conProfundidad />
                    ))}
                  </div>
                  <p className="explorar-cc-nota">
                    Las 4 barritas son <b>profundidad</b> (vista → practicada → acertada → sostenida), no
                    dificultad: la métrica honesta cuando todas las tarjetas nacen difíciles.
                  </p>
                </>
              )}
            </>
          )}

          <button type="button" className="boton-primario explorar-cc-cta" onClick={repasar}>
            {trampasOn ? 'Repasar solo mis trampas' : `Repasar ${sel.nombre.toLowerCase()}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function FilaBloque({ bloque, conProfundidad = false, etiquetaExtra = null }) {
  const bloqueado = bloque.estado === 'bloqueado'
  return (
    <div className={`explorar-cc-bloque explorar-cc-bloque--${bloque.estado}`}>
      {bloqueado ? (
        <IconoCandado size={13} color="var(--text-faint)" />
      ) : (
        <span className={`explorar-cc-bloque-punto explorar-cc-bloque-punto--${bloque.estado}`} />
      )}
      <div className="explorar-cc-bloque-info">
        <div className="explorar-cc-bloque-nombre">
          {bloque.nombre}
          {etiquetaExtra && <span className="explorar-cc-bloque-etiqueta">{etiquetaExtra}</span>}
        </div>
        {bloqueado && bloque.requiere && (
          <div className="explorar-cc-bloque-requiere">
            Requiere: <b>{bloque.requiere}</b>
          </div>
        )}
      </div>
      {conProfundidad && (
        <div className="explorar-cc-profundidad">
          {profundidad(bloque.estado).map((lleno, i) => (
            <span key={i} className={`explorar-cc-profundidad-barra${lleno ? ' explorar-cc-profundidad-barra--llena' : ''}`} style={{ height: `${7 + i * 3}px` }} />
          ))}
        </div>
      )}
      <span className="explorar-cc-bloque-n">{bloque.n}</span>
    </div>
  )
}
