import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { estadoDeGrupo, porcentajeDominio } from '../engine/srs.js'
import {
  NOMBRES_BLOQUE,
  DESCRIPCION_NUCLEO,
  FIRMA_LABEL_NUCLEO,
  ORDEN_BLOQUES,
  FORMULA_BLOQUE,
  TRAMPA_BLOQUE,
  dependenciasCruzadas,
} from '../modulos/razonamiento-cuantitativo/exploracion.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { Formula } from '../componentes/Formula.jsx'
import { IconoChevronIzquierdo, IconoCandado } from '../componentes/iconos.jsx'
import './ExploracionRazonamientoCuantitativo.css'

const ORDEN_NUCLEOS = ['algebra_calculo', 'contexto_aplicado', 'estadistica', 'geometria']

const ETIQUETA_NUCLEO = {
  algebra_calculo: 'Álgebra y cálculo',
  contexto_aplicado: 'Contexto aplicado',
  estadistica: 'Estadística',
  geometria: 'Geometría',
}

function IconoAndamiaje({ size = 13, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="3" cy="11" r="2" fill="none" stroke={color} strokeWidth="1.4" />
      <circle cx="11" cy="3" r="2" fill="none" stroke={color} strokeWidth="1.4" />
      <line x1="4.4" y1="9.6" x2="9.6" y2="4.4" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

function IconoFlechaCuelga({ color }) {
  return (
    <svg width={9} height={9} viewBox="0 0 10 10" className="rq-icono-cuelga">
      <path d="M1 5 H8" stroke={color} strokeWidth="1.3" />
      <path d="M5.5 2 L8.5 5 L5.5 8" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ExploracionRazonamientoCuantitativo({ moduloId, perfil, onCambiarPerfil, onVolver, onRepasar }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [estadosSRS] = useState(() => leerJSON(claveSRS(perfil.id, moduloId), {}))
  const [seleccionado, setSeleccionado] = useState('algebra_calculo')
  const [andamiajeOn, setAndamiajeOn] = useState(true)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const tarjetasPorId = new Map(modulo.tarjetasConcepto.map((t) => [t.id, t]))
  const porNucleo = {}
  for (const t of modulo.tarjetasConcepto) (porNucleo[t.contenido] ??= []).push(t)

  const totalConPrereq = modulo.tarjetasConcepto.filter((t) => t.prereqs?.length).length
  const totalTarjetas = modulo.tarjetasConcepto.length
  const totalBloques = new Set(modulo.tarjetasConcepto.map((t) => t.bloque)).size

  const nucleos = ORDEN_NUCLEOS.map((n) => {
    const tarjetas = porNucleo[n] ?? []
    const bloquesOrden = ORDEN_BLOQUES[n]
    const conPrereq = tarjetas.filter((t) => t.prereqs?.length).length
    const dominioPct = porcentajeDominio(tarjetas, estadosSRS)
    const dif = { baja: 0, media: 0, alta: 0 }
    for (const t of tarjetas) dif[t.dificultad] = (dif[t.dificultad] ?? 0) + 1
    return {
      id: n,
      nombre: ETIQUETA_NUCLEO[n],
      total: tarjetas.length,
      dominioPct,
      firmaLabel: FIRMA_LABEL_NUCLEO[n],
      descripcion: DESCRIPCION_NUCLEO[n],
      meta: `${bloquesOrden.length} bloques · ${dif.baja} baja / ${dif.media} media / ${dif.alta} alta`,
      prereqLabel: `${conPrereq} de ${tarjetas.length} · ${Math.round((conPrereq / tarjetas.length) * 100)}%`,
      bloquesOrden,
      // La "firma" son barras decorativas: ancho/alto real (número de
      // tarjetas del bloque) para que no sea puro adorno, sombreadas de
      // izquierda a derecha según el dominio general del núcleo.
      firma: bloquesOrden.map((b, i) => {
        const nCards = tarjetas.filter((t) => t.bloque === b).length
        const iluminado = i < Math.round((dominioPct / 100) * bloquesOrden.length)
        return { n: nCards, iluminado }
      }),
    }
  })

  const sel = nucleos.find((n) => n.id === seleccionado)
  const tarjetasSel = porNucleo[seleccionado] ?? []
  const deps = dependenciasCruzadas(tarjetasSel, tarjetasPorId)

  const bloquesDetalle = sel.bloquesOrden.map((b) => {
    const cards = tarjetasSel.filter((t) => t.bloque === b)
    const estado = estadoDeGrupo(cards, estadosSRS)
    const d = deps.get(b) ?? { dependeDe: new Set(), sostiene: new Set() }
    const dependeDeBloque = [...d.dependeDe][0] ?? null
    return {
      bloque: b,
      nombre: NOMBRES_BLOQUE[b] ?? b,
      n: cards.length,
      cards,
      estado,
      dependeDe: dependeDeBloque ? NOMBRES_BLOQUE[dependeDeBloque] ?? dependeDeBloque : null,
      sostieneN: d.sostiene.size,
      hechas: cards.filter((c) => (estadosSRS[c.id]?.repeticiones ?? 0) >= 1).length,
    }
  })

  const dotFor = (estado) => (estado === 'dominado' ? 'dominado' : estado === 'activo' ? 'activo' : 'inactivo')

  function repasar() {
    onRepasar(null, sel.bloquesOrden)
  }

  const maxTarjetasBloque = Math.max(...bloquesDetalle.map((b) => b.n), 1)

  return (
    <div className="page explorar-rq">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="explorar-rq-titulo">
          <div className="explorar-rq-titulo-modulo">{modulo.nombre}</div>
          <div className="explorar-rq-titulo-sub">
            Repaso de conceptos · {totalTarjetas} tarjetas · {totalBloques} bloques
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className={`explorar-rq-and-boton${andamiajeOn ? ' explorar-rq-and-boton--activo' : ''}`}
          aria-pressed={andamiajeOn}
          onClick={() => setAndamiajeOn((v) => !v)}
        >
          <IconoAndamiaje color={andamiajeOn ? 'var(--accent)' : 'var(--text-sub)'} />
          Ver andamiaje
        </button>
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="explorar-rq-cuerpo">
        {andamiajeOn && (
          <div className="explorar-rq-and-banner">
            <IconoAndamiaje size={16} color="var(--accent)" />
            <div>
              {totalConPrereq} de {totalTarjetas} tarjetas dependen de otra — el{' '}
              {Math.round((totalConPrereq / totalTarjetas) * 100)}%, el andamiaje más denso del simulador. Con esta
              vista activa, cada bloque muestra <b>de qué cuelga</b> y <b>qué sostiene</b>.
            </div>
          </div>
        )}

        <div className="explorar-rq-nucleos">
          {nucleos.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`explorar-rq-nucleo${seleccionado === n.id ? ' explorar-rq-nucleo--activo' : ''}`}
              aria-pressed={seleccionado === n.id}
              onClick={() => setSeleccionado(n.id)}
            >
              <div className="explorar-rq-nucleo-cabecera">
                <span className="explorar-rq-nucleo-nombre">{n.nombre}</span>
                <span className="explorar-rq-nucleo-total">{n.total}</span>
              </div>

              <div className={`explorar-rq-firma explorar-rq-firma--${n.id.replace(/_/g, '-')}`}>
                {n.firma.map((f, i) => (
                  <span
                    key={i}
                    className={`explorar-rq-firma-barra${f.iluminado ? ' explorar-rq-firma-barra--activa' : ''}`}
                    style={n.id === 'geometria' ? { flex: f.n } : { height: `${10 + f.n * 3}px` }}
                  />
                ))}
              </div>

              <div className="explorar-rq-nucleo-firmalabel">{n.firmaLabel}</div>

              <div className="explorar-rq-nucleo-dominio">
                <div className="explorar-rq-nucleo-dominio-barra">
                  <div className="explorar-rq-nucleo-dominio-relleno" style={{ width: `${n.dominioPct}%` }} />
                </div>
                <span className="explorar-rq-nucleo-dominio-pct">{n.dominioPct}%</span>
              </div>

              <div className="explorar-rq-nucleo-prereq">
                <IconoAndamiaje size={10} color="currentColor" />
                {n.prereqLabel}
              </div>
            </button>
          ))}
        </div>

        <div className="explorar-rq-detalle">
          <div className="explorar-rq-detalle-cabecera">
            <span className="explorar-rq-detalle-nombre">{sel.nombre}</span>
            <span className="explorar-rq-detalle-meta">{sel.meta}</span>
          </div>
          <p className="explorar-rq-descripcion">{sel.descripcion}</p>

          {seleccionado === 'algebra_calculo' && (
            <>
              <div className="rq-cadena">
                {bloquesDetalle.map((b, i) => (
                  <div key={b.bloque} className="rq-cadena-fila">
                    <div className="rq-cadena-rail">
                      <span className={`rq-cadena-rail-linea${i === 0 ? ' rq-cadena-rail-linea--oculta' : ''}`} />
                      <span className={`rq-cadena-punto rq-cadena-punto--${dotFor(b.estado)}`} />
                      <span
                        className={`rq-cadena-rail-linea rq-cadena-rail-linea--flex${
                          i === bloquesDetalle.length - 1 ? ' rq-cadena-rail-linea--oculta' : ''
                        }`}
                      />
                    </div>
                    <div className={`rq-cadena-fila-caja rq-cadena-fila-caja--${b.estado}`}>
                      <div className="rq-cadena-fila-info">
                        <div className="rq-cadena-fila-nombre">{b.nombre}</div>
                        {andamiajeOn && b.dependeDe && (
                          <div className="rq-cadena-fila-dep">
                            <IconoFlechaCuelga color="var(--text-sub)" />
                            Cuelga de <b>{b.dependeDe}</b>
                          </div>
                        )}
                        {andamiajeOn && b.sostieneN > 0 && (
                          <div className="rq-cadena-fila-sostiene">
                            Sostiene {b.sostieneN} {b.sostieneN === 1 ? 'bloque' : 'bloques'}
                          </div>
                        )}
                      </div>
                      {FORMULA_BLOQUE[b.bloque] && (
                        <div className={`rq-cadena-fila-formula rq-cadena-fila-formula--${b.estado}`}>
                          <Formula tex={FORMULA_BLOQUE[b.bloque]} />
                        </div>
                      )}
                      <div className="rq-cadena-fila-n">{b.n}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="explorar-rq-nota">
                Un solo hilo vertical: aquí los bloques no se apilan en capas ni se reparten en un eje, se{' '}
                <b>encadenan</b>. Es la forma honesta de mostrar el {sel.prereqLabel.split(' · ')[1]} de prerrequisitos
                de este núcleo — cada eslabón cuelga del anterior y sostiene al siguiente.
              </p>
            </>
          )}

          {seleccionado === 'contexto_aplicado' && (
            <>
              <div className="rq-trampas">
                {bloquesDetalle.map((b) => {
                  const filled = b.estado === 'dominado' ? 4 : b.estado === 'activo' ? 2 : b.estado === 'nuevo' ? 1 : 0
                  return (
                    <div key={b.bloque} className={`rq-trampas-fila rq-trampas-fila--${b.estado}`}>
                      <div className="rq-trampas-fila-cabecera">
                        <div className="rq-trampas-fila-info">
                          <div className="rq-trampas-fila-nombre">{b.nombre}</div>
                          <div className="rq-trampas-fila-trampa">{TRAMPA_BLOQUE[b.bloque]}</div>
                        </div>
                        <div className="rq-trampas-exposicion">
                          {[0, 1, 2, 3].map((i) => (
                            <span
                              key={i}
                              className={`rq-trampas-exposicion-barra${i < filled ? ' rq-trampas-exposicion-barra--activa' : ''}`}
                              style={{ height: `${8 + i * 3}px` }}
                            />
                          ))}
                        </div>
                        <div className="rq-cadena-fila-n">{b.n}</div>
                      </div>
                      {andamiajeOn && b.dependeDe && (
                        <div className="rq-cadena-fila-dep rq-trampas-fila-dep">
                          <IconoFlechaCuelga color="var(--text-sub)" />
                          Cuelga de <b>{b.dependeDe}</b>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="explorar-rq-nota-caja">
                Solo 1 de 29 tarjetas es de dificultad baja y apenas 6 traen fórmula fija: aquí no hay rampa ni
                ecuación que memorizar. Las 4 barritas de cada bloque no miden dificultad sino <b>exposición</b> —
                vista, practicada, acertada sin ayuda, sostenida — porque cuando todo nace difícil lo único medible
                con honestidad es cuántas veces te has enfrentado a la trampa.
              </div>
            </>
          )}

          {seleccionado === 'estadistica' && (
            <>
              <div className="rq-reticula">
                {bloquesDetalle.map((b) => (
                  <div key={b.bloque} className={`rq-reticula-caja rq-reticula-caja--${b.estado}`}>
                    <div className="rq-reticula-caja-cabecera">
                      <span className="rq-reticula-caja-nombre">{b.nombre}</span>
                      {b.estado === 'bloqueado' && <IconoCandado size={12} color="var(--text-sub)" />}
                    </div>
                    <div className="rq-reticula-celdas">
                      {Array.from({ length: b.n }, (_, i) => (
                        <span key={i} className={`rq-reticula-celda${i < b.hechas ? ' rq-reticula-celda--hecha' : ''}`} />
                      ))}
                    </div>
                    {andamiajeOn && b.dependeDe ? (
                      <div className="rq-reticula-caja-pie">
                        Cuelga de <b>{b.dependeDe}</b>
                      </div>
                    ) : (
                      <div className="rq-reticula-caja-pie">
                        {b.hechas} de {b.n} dominadas
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="explorar-rq-nota">
                Los 8 bloques tienen exactamente 5 tarjetas cada uno — el único núcleo perfectamente parejo. La
                retícula lo aprovecha en vez de esconderlo: cada bloque es una fila de celdas idénticas y el progreso
                se lee de un vistazo, sin barras porcentuales que traduzcan lo que ya es contable.
              </p>
            </>
          )}

          {seleccionado === 'geometria' && (
            <>
              <div className="rq-escala">
                {bloquesDetalle.map((b) => (
                  <div key={b.bloque} className="rq-escala-fila">
                    <div
                      className={`rq-escala-caja rq-escala-caja--${b.estado}`}
                      style={{ width: `${Math.max(22, Math.round((b.n / maxTarjetasBloque) * 62))}%` }}
                    >
                      {b.estado === 'bloqueado' ? (
                        <IconoCandado size={12} color="var(--text-sub)" />
                      ) : (
                        <span className={`rq-escala-punto rq-escala-punto--${dotFor(b.estado)}`} />
                      )}
                      <span className="rq-escala-nombre">{b.nombre}</span>
                    </div>
                    <span className="rq-escala-n">
                      {b.n} {b.n === 1 ? 'tarjeta' : 'tarjetas'}
                    </span>
                    {andamiajeOn && b.dependeDe && (
                      <span className="rq-escala-dep">← {b.dependeDe}</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="explorar-rq-nota">
                El ancho de cada barra es literalmente su número de tarjetas. Los dos bloques más recientes —
                desigualdad triangular y espiral de raíces— tienen solo 2 cada uno, y se ven pequeños porque lo son:
                en un módulo espacial, la proporción visual dice la verdad más rápido que un número al costado.
              </p>
            </>
          )}

          <button type="button" className="boton-primario explorar-rq-cta" onClick={repasar}>
            Repasar {sel.nombre.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  )
}
