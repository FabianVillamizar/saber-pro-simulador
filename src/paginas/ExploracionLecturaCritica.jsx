import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { estadoDeGrupo, grupoRequerido, porcentajeDominio } from '../engine/srs.js'
import {
  NOMBRES_SUBTEMA,
  NOMBRES_CATEGORIA_CULTURA,
  DESCRIPCION_COMPETENCIA,
  POSICION_SUBTEMA,
  MARGEN_POSICION_COMPETENCIA,
  SUBTEMAS_NO_FIGURA_IDENTIFICACION_LOCAL,
  TRAMPAS,
  paresIdentificacionLocal,
} from '../modulos/lectura-critica/exploracion.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo, IconoCandado, IconoCheck } from '../componentes/iconos.jsx'
import './ExploracionLecturaCritica.css'

const ORDEN_COMPETENCIAS = ['identificacion_local', 'comprension_global', 'reflexion_evaluacion']

const ETIQUETA_COMPETENCIA = {
  identificacion_local: 'Identificación local',
  comprension_global: 'Comprensión global',
  reflexion_evaluacion: 'Reflexión y evaluación',
}

export function ExploracionLecturaCritica({ moduloId, perfil, onCambiarPerfil, onVolver, onRepasar }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [estadosSRS] = useState(() => leerJSON(claveSRS(perfil.id, moduloId), {}))
  const [seleccionada, setSeleccionada] = useState('identificacion_local')
  const [trampaSel, setTrampaSel] = useState(TRAMPAS[0].patron)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const tarjetasPorId = new Map(modulo.tarjetasConcepto.map((t) => [t.id, t]))
  const porCompetencia = {}
  const cultura = []
  for (const t of modulo.tarjetasConcepto) {
    if (t.competencia_asociada) (porCompetencia[t.competencia_asociada] ??= []).push(t)
    else cultura.push(t)
  }

  const pilares = ORDEN_COMPETENCIAS.map((comp) => {
    const tarjetas = porCompetencia[comp] ?? []
    let forma
    if (comp === 'identificacion_local') {
      const figuras = tarjetas.filter((t) => !SUBTEMAS_NO_FIGURA_IDENTIFICACION_LOCAL.includes(t.subtema))
      forma = `${figuras.length} de ${tarjetas.length} son figuras retóricas · 7 pares que se confunden`
    } else if (comp === 'comprension_global') {
      forma = 'Estructura del texto, tesis, tipologías, conectores'
    } else {
      const baja = tarjetas.filter((t) => t.dificultad === 'baja').length
      forma = `La más diversa · sin tema que agrupe · ${baja} ${baja === 1 ? 'tarjeta fácil' : 'tarjetas fáciles'}`
    }
    return {
      id: comp,
      nombre: ETIQUETA_COMPETENCIA[comp],
      total: tarjetas.length,
      dominioPct: porcentajeDominio(tarjetas, estadosSRS),
      margenPos: MARGEN_POSICION_COMPETENCIA[comp],
      forma,
    }
  })

  const totalTrampas = TRAMPAS.reduce((a, b) => a + b.n, 0)
  const trampaActiva = TRAMPAS.find((tr) => tr.patron === trampaSel)

  const tarjetasSeleccionada = porCompetencia[seleccionada] ?? []
  const esIdentificacion = seleccionada === 'identificacion_local'

  const pares = esIdentificacion ? paresIdentificacionLocal(tarjetasSeleccionada, estadosSRS, tarjetasPorId) : []

  const subtemasEje = !esIdentificacion
    ? [...new Set(tarjetasSeleccionada.map((t) => t.subtema))]
        .map((subtema) => {
          const tarjetas = tarjetasSeleccionada.filter((t) => t.subtema === subtema)
          const estado = estadoDeGrupo(tarjetas, estadosSRS)
          const requiereSubtema = estado === 'bloqueado' ? grupoRequerido(tarjetas, estadosSRS, tarjetasPorId, subtema, (t) => t.subtema) : null
          return {
            subtema,
            nombre: NOMBRES_SUBTEMA[subtema] ?? subtema,
            n: tarjetas.length,
            estado,
            pos: POSICION_SUBTEMA[subtema] ?? 50,
            requiere: requiereSubtema ? NOMBRES_SUBTEMA[requiereSubtema] ?? requiereSubtema : null,
          }
        })
        .sort((a, b) => a.pos - b.pos)
    : []

  const categoriasCultura = seleccionada === 'cultura'
    ? Object.entries(NOMBRES_CATEGORIA_CULTURA).map(([clave, nombre]) => ({
        clave,
        nombre,
        n: cultura.filter((t) => t.categoria === clave).length,
      }))
    : []

  const seleccionadaEsCultura = seleccionada === 'cultura'
  const sel = seleccionadaEsCultura
    ? { nombre: 'Cultura general', meta: `${NOMBRES_CATEGORIA_CULTURA ? Object.keys(NOMBRES_CATEGORIA_CULTURA).length : 6} categorías · ${cultura.filter((t) => t.prereqs?.length).length} de ${cultura.length} con prerrequisito` }
    : {
        nombre: ETIQUETA_COMPETENCIA[seleccionada],
        meta: esIdentificacion
          ? `${pares.length} pares · ${tarjetasSeleccionada.length} tarjetas`
          : `${subtemasEje.length} subtemas · ${tarjetasSeleccionada.length} tarjetas`,
      }

  function repasar() {
    if (seleccionadaEsCultura) onRepasar(null, Object.keys(NOMBRES_CATEGORIA_CULTURA))
    else onRepasar(seleccionada, null)
  }

  const maxCat = Math.max(...categoriasCultura.map((c) => c.n), 1)

  return (
    <div className="page explorar-lc">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="explorar-lc-titulo">
          <div className="explorar-lc-titulo-modulo">{modulo.nombre}</div>
          <div className="explorar-lc-titulo-sub">Repaso de conceptos · {modulo.tarjetasConcepto.length} tarjetas</div>
        </div>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="explorar-lc-cuerpo">
        {/* El margen: barra de trampas, siempre visible */}
        <div className="explorar-lc-margen">
          <div className="explorar-lc-margen-cabecera">
            <span className="explorar-lc-margen-titulo">El margen: lo que el texto dice / lo que tú añades</span>
            <span className="explorar-lc-margen-total">{totalTrampas} trampas clasificadas</span>
          </div>
          <p className="explorar-lc-margen-texto">
            Casi la mitad de tus errores posibles son del mismo tipo: dar por dicho algo que el texto nunca dijo. No
            es una trampa más entre ocho — es el eje del módulo, así que vive aquí arriba, no escondida en un
            filtro.
          </p>
          <div className="explorar-lc-margen-barra">
            {TRAMPAS.map((tr, i) => (
              <button
                key={tr.patron}
                type="button"
                className={`explorar-lc-margen-segmento${trampaSel === tr.patron ? ' explorar-lc-margen-segmento--activo' : ''}${i === 0 ? ' explorar-lc-margen-segmento--principal' : ''}`}
                style={{ width: `${(tr.n / totalTrampas) * 100}%` }}
                onClick={() => setTrampaSel(tr.patron)}
                title={`${tr.nombre} — ${tr.n} apariciones`}
              >
                {tr.n / totalTrampas > 0.12 && (
                  <span className="explorar-lc-margen-etiqueta">
                    {tr.nombre} · {tr.n}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="explorar-lc-margen-seleccion">
            {trampaActiva.nombre} · {trampaActiva.n} apariciones ({Math.round((trampaActiva.n / totalTrampas) * 100)}%
            de todas las trampas)
          </p>
        </div>

        {/* Pilares */}
        <div className="explorar-lc-pilares">
          {pilares.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`explorar-lc-pilar${seleccionada === p.id ? ' explorar-lc-pilar--activo' : ''}`}
              onClick={() => setSeleccionada(p.id)}
            >
              <div className="explorar-lc-pilar-cabecera">
                <span className="explorar-lc-pilar-nombre">{p.nombre}</span>
                <span className="explorar-lc-pilar-total">{p.total}</span>
              </div>
              <div className="explorar-lc-pilar-eje">
                <div className="explorar-lc-pilar-eje-barra">
                  <span className="explorar-lc-pilar-eje-punto" style={{ left: `${p.margenPos}%` }} />
                </div>
                <div className="explorar-lc-pilar-eje-etiquetas">
                  <span>Lo dicho</span>
                  <span>Lo inferido</span>
                </div>
              </div>
              <div className="explorar-lc-pilar-forma">{p.forma}</div>
              <div className="explorar-lc-pilar-dominio">
                <div className="explorar-lc-pilar-dominio-barra">
                  <div className="explorar-lc-pilar-dominio-relleno" style={{ width: `${p.dominioPct}%` }} />
                </div>
                <span className="explorar-lc-pilar-dominio-pct">{p.dominioPct}% dominado</span>
              </div>
            </button>
          ))}

          <button
            type="button"
            className={`explorar-lc-pilar-cultura${seleccionadaEsCultura ? ' explorar-lc-pilar-cultura--activo' : ''}`}
            onClick={() => setSeleccionada('cultura')}
          >
            <span className="explorar-lc-pilar-cultura-eyebrow">Fuera de las 3</span>
            <span className="explorar-lc-pilar-cultura-nombre">Cultura general</span>
            <span className="explorar-lc-pilar-cultura-desc">{cultura.length} tarjetas · reverso de 2 secciones, sin error común</span>
            <div className="explorar-lc-pilar-dominio">
              <div className="explorar-lc-pilar-dominio-barra">
                <div className="explorar-lc-pilar-dominio-relleno" style={{ width: `${porcentajeDominio(cultura, estadosSRS)}%` }} />
              </div>
            </div>
          </button>
        </div>

        {/* Detalle */}
        <div className="explorar-lc-detalle">
          <div className="explorar-lc-detalle-cabecera">
            <span className="explorar-lc-detalle-nombre">{sel.nombre}</span>
            <span className="explorar-lc-detalle-meta">{sel.meta}</span>
          </div>
          {!seleccionadaEsCultura && <p className="explorar-lc-descripcion">{DESCRIPCION_COMPETENCIA[seleccionada]}</p>}

          {esIdentificacion && (
            <>
              <div className="explorar-lc-pares">
                {pares.map((p) => (
                  <div key={p.id} className={`explorar-lc-par${p.ambosDominados ? ' explorar-lc-par--completo' : ''}`}>
                    <div className="explorar-lc-par-lados">
                      {p.lados.map((lado) => (
                        <div key={lado.subtema} className={`explorar-lc-par-chip explorar-lc-par-chip--${lado.estado}`}>
                          <span className={`explorar-lc-par-chip-dot explorar-lc-par-chip-dot--${lado.estado}`} />
                          <span className="explorar-lc-par-chip-nombre">{lado.nombre}</span>
                          <span className="explorar-lc-par-chip-estado">
                            {{ dominado: 'Dominado', activo: 'En curso', nuevo: 'Sin ver', bloqueado: 'Bloqueado' }[lado.estado]}
                          </span>
                        </div>
                      ))}
                      {!p.esParUnico && (
                        <div className={`explorar-lc-par-vs${p.ambosDominados ? ' explorar-lc-par-vs--completo' : ''}`}>
                          <span className="explorar-lc-par-vs-linea" />
                          <span className="explorar-lc-par-vs-texto">vs.</span>
                        </div>
                      )}
                    </div>
                    <div className={`explorar-lc-par-puente${p.ambosDominados ? ' explorar-lc-par-puente--completo' : ''}`}>
                      {p.ambosDominados ? <IconoCheck size={13} color="var(--exito)" /> : <IconoCandado size={12} color="var(--text-faint)" />}
                      <div>
                        <div className="explorar-lc-par-puente-titulo">Tarjeta de distinción: {p.nombre.replace(' vs. ', ' ↔ ')}</div>
                        <div className="explorar-lc-par-puente-mensaje">
                          {p.ambosDominados
                            ? p.esParUnico
                              ? 'Disponible — ya dominas el fundamento.'
                              : 'Disponible — ya dominas ambos lados del par.'
                            : `Te falta dominar: ${p.lados.filter((l) => l.estado !== 'dominado').map((l) => l.nombre).join(' y ')}.`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="explorar-lc-nota">
                La tarjeta de distinción no está "bloqueada" en abstracto: el propio par te dice qué falta. El puente
                se ve punteado mientras algún lado siga sin dominar, y sólido cuando ambos ya lo están.
              </p>
            </>
          )}

          {!esIdentificacion && !seleccionadaEsCultura && (
            <>
              <div className="explorar-lc-eje-etiquetas">
                <span>Lo que el texto dice</span>
                <span>Lo que el lector infiere</span>
              </div>
              <div className="explorar-lc-subtemas">
                {subtemasEje.map((s) => (
                  <div key={s.subtema} className={`explorar-lc-subtema explorar-lc-subtema--${s.estado}`}>
                    {s.estado === 'bloqueado' ? (
                      <IconoCandado size={12} color="var(--text-faint)" />
                    ) : (
                      <span className={`explorar-lc-subtema-dot explorar-lc-subtema-dot--${s.estado}`} />
                    )}
                    <div className="explorar-lc-subtema-info">
                      <div className="explorar-lc-subtema-nombre">{s.nombre}</div>
                      {s.estado === 'bloqueado' && s.requiere && (
                        <div className="explorar-lc-subtema-requiere">
                          Requiere: <b>{s.requiere}</b>
                        </div>
                      )}
                    </div>
                    <div className="explorar-lc-subtema-eje">
                      <span className="explorar-lc-subtema-eje-punto" style={{ left: `${s.pos}%` }} />
                    </div>
                    <span className="explorar-lc-subtema-n">{s.n}</span>
                  </div>
                ))}
              </div>
              <p className="explorar-lc-nota">
                Cada subtema se sitúa en el mismo eje del encabezado. Es la única jerarquía honesta acá — estos
                subtemas no se apilan, se reparten.
              </p>
            </>
          )}

          {seleccionadaEsCultura && (
            <>
              <div className="explorar-lc-categorias">
                {categoriasCultura.map((c) => (
                  <div key={c.clave} className="explorar-lc-categoria-fila">
                    <span className="explorar-lc-categoria-nombre">{c.nombre}</span>
                    <span className="explorar-lc-categoria-barra">
                      <span className="explorar-lc-categoria-relleno" style={{ width: `${(c.n / maxCat) * 100}%` }} />
                    </span>
                    <span className="explorar-lc-categoria-n">{c.n}</span>
                  </div>
                ))}
              </div>
              <p className="explorar-lc-nota-cultura">
                Este mazo es deliberadamente desigual y así se muestra: {categoriasCultura[0]?.n} tarjetas de{' '}
                {categoriasCultura[0]?.nombre.toLowerCase()} frente a {categoriasCultura[categoriasCultura.length - 1]?.n} de{' '}
                {categoriasCultura[categoriasCultura.length - 1]?.nombre.toLowerCase()}. Sus tarjetas tienen reverso
                de <b>2 secciones</b> (respuesta + ejemplo), sin "error común" — no se inventa una tercera sección
                vacía para que se vean iguales a las otras {modulo.tarjetasConcepto.length - cultura.length}.
              </p>
            </>
          )}

          <button type="button" className="boton-primario explorar-lc-cta" onClick={repasar}>
            Repasar {sel.nombre.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  )
}
