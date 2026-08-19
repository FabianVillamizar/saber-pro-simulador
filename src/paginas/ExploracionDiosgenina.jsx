import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { estadoDeGrupo, porcentajeDominio, grupoRequerido } from '../engine/srs.js'
import { BLOQUES, ETIQUETA_ETAPA } from '../modulos/diosgenina/mapa.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { TextoConNegritas } from '../componentes/TextoConNegritas.jsx'
import { IconoChevronIzquierdo, IconoBombilla, IconoCandado } from '../componentes/iconos.jsx'
import './ExploracionDiosgenina.css'

const ETIQUETA_ESTADO = { dominado: 'Dominado', activo: 'En banco', nuevo: 'Disponible', bloqueado: 'Bloqueado' }

export function ExploracionDiosgenina({ moduloId, perfil, onCambiarPerfil, onVolver, onRepasar }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [estadosSRS] = useState(() => leerJSON(claveSRS(perfil.id, moduloId), {}))
  const [seleccionado, setSeleccionado] = useState('FQT')
  const [bancoAbierto, setBancoAbierto] = useState(false)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const tarjetasTeoria = modulo.tarjetasConcepto.filter((t) => t.modulo === 'diosgenina' && t.bloque)
  const tarjetasPorId = new Map(tarjetasTeoria.map((t) => [t.id, t]))
  const nombreBloque = (codigo) => modulo.categorias?.[codigo] ?? codigo

  const porBloque = {}
  for (const t of tarjetasTeoria) (porBloque[t.bloque] ??= []).push(t)

  const bloques = BLOQUES.map((b) => {
    const tarjetas = porBloque[b.codigo] ?? []
    const estado = estadoDeGrupo(tarjetas, estadosSRS)
    const dominadas = tarjetas.filter((t) => (estadosSRS[t.id]?.repeticiones ?? 0) >= 1).length
    const requiere =
      estado === 'bloqueado' ? grupoRequerido(tarjetas, estadosSRS, tarjetasPorId, b.codigo, (t) => t.bloque) : null
    // Tarjeta representativa: la primera sin prerrequisitos propios si hay
    // una (suele ser la más introductoria del bloque), o la primera a
    // secas.
    const muestra = tarjetas.find((t) => !t.prereqs?.length) ?? tarjetas[0]
    return {
      ...b,
      nombre: nombreBloque(b.codigo),
      tarjetas,
      n: tarjetas.length,
      dominadas,
      estado,
      requiere,
      muestra,
    }
  })

  const bloquesPorCodigo = Object.fromEntries(bloques.map((b) => [b.codigo, b]))
  const etapas = ETIQUETA_ETAPA.map((rotulo, i) => ({
    rotulo,
    nodos: bloques.filter((b) => b.etapa === i),
  }))

  const sel = bloquesPorCodigo[seleccionado] ?? bloques[0]
  const totalTarjetas = tarjetasTeoria.length
  const totalDominadas = bloques.reduce((a, b) => a + b.dominadas, 0)

  const conexiones = bloques.filter((b) => b.muestra?.conexion_cotidiana)

  return (
    <div className="page explorar-dg">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="explorar-dg-titulo">
          <div className="explorar-dg-titulo-modulo">{modulo.nombre}</div>
          <div className="explorar-dg-titulo-sub">
            Semillero Pharmactive · UIS · 9 bloques · {totalTarjetas} tarjetas
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className={`explorar-dg-banco-btn${bancoAbierto ? ' explorar-dg-banco-btn--activo' : ''}`}
          onClick={() => setBancoAbierto((v) => !v)}
        >
          <IconoBombilla size={14} color={bancoAbierto ? 'var(--warning)' : 'currentColor'} />
          Banco de conexiones
        </button>
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="explorar-dg-cuerpo">
        <div className="explorar-dg-bitacora">
          <div className="explorar-dg-bitacora-cabecera">
            <div className="explorar-dg-bitacora-titulo">Esto no es un temario: es el protocolo que estás corriendo</div>
            <div className="explorar-dg-bitacora-conteo">
              {totalDominadas} de {totalTarjetas} dominadas
            </div>
          </div>
          <p className="explorar-dg-bitacora-texto">
            El orden de los bloques es el orden real del banco: hidrolizas antes de extraer, extraes antes de secar,
            y no puedes interpretar un cromatograma sin entender partición. La ruta no se puede reordenar porque el
            experimento tampoco.
          </p>
          <div className="explorar-dg-progreso">
            <div className="explorar-dg-progreso-barra">
              <div
                className="explorar-dg-progreso-relleno"
                style={{ width: `${totalTarjetas ? Math.round((totalDominadas / totalTarjetas) * 100) : 0}%` }}
              />
            </div>
            <div className="explorar-dg-leyenda">
              <span className="explorar-dg-leyenda-item">
                <span className="explorar-dg-punto explorar-dg-punto--dominado" />
                Dominado
              </span>
              <span className="explorar-dg-leyenda-item">
                <span className="explorar-dg-punto explorar-dg-punto--banco" />
                En banco
              </span>
              <span className="explorar-dg-leyenda-item">
                <span className="explorar-dg-punto explorar-dg-punto--disponible" />
                Disponible
              </span>
              <span className="explorar-dg-leyenda-item">
                <span className="explorar-dg-punto explorar-dg-punto--bloqueado" />
                Bloqueado
              </span>
            </div>
          </div>
        </div>

        <div className="explorar-dg-ruta">
          {etapas.map((et, i) => (
            <div key={et.rotulo}>
              <div className="explorar-dg-etapa-rotulo">
                <span>{et.rotulo}</span>
                <span className="explorar-dg-etapa-linea" />
              </div>
              <div className="explorar-dg-nodos">
                {et.nodos.map((b) => (
                  <button
                    key={b.codigo}
                    type="button"
                    className={`explorar-dg-nodo explorar-dg-nodo--${b.estado}${seleccionado === b.codigo ? ' explorar-dg-nodo--seleccionado' : ''}${b.n >= 16 ? ' explorar-dg-nodo--grande' : ''}`}
                    onClick={() => setSeleccionado(b.codigo)}
                  >
                    <div className="explorar-dg-nodo-cabecera">
                      <span className="explorar-dg-nodo-codigo">{b.codigo}</span>
                      <div className="explorar-dg-nodo-info">
                        <div className="explorar-dg-nodo-nombre">{b.nombre}</div>
                        <div className="explorar-dg-nodo-meta">
                          {b.n} tarjetas · {ETIQUETA_ESTADO[b.estado]}
                        </div>
                      </div>
                      {b.estado === 'bloqueado' && <IconoCandado size={13} color="var(--text-sub)" />}
                    </div>
                    <div className="explorar-dg-marcas">
                      {b.tarjetas.map((t, k) => (
                        <span
                          key={t.id}
                          className={`explorar-dg-marca${k < b.dominadas ? ' explorar-dg-marca--dominada' : ''}`}
                        />
                      ))}
                    </div>
                    {b.entradas.length > 0 && (
                      <div className="explorar-dg-pills">
                        <span className="explorar-dg-pills-etiqueta">necesita</span>
                        {b.entradas.map((e) => (
                          <span
                            key={e}
                            className={`explorar-dg-pill${bloquesPorCodigo[e]?.estado === 'dominado' ? ' explorar-dg-pill--ok' : ''}`}
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                    {b.salidas.length > 0 ? (
                      <div className="explorar-dg-pills">
                        <span className="explorar-dg-pills-etiqueta">alimenta</span>
                        {b.salidas.slice(0, 3).map((s) => (
                          <span key={s} className="explorar-dg-pill explorar-dg-pill--mudo">
                            {s}
                          </span>
                        ))}
                        {b.salidas.length > 3 && (
                          <span className="explorar-dg-pill explorar-dg-pill--mudo">+{b.salidas.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <div className="explorar-dg-cierre">cierra el recorrido</div>
                    )}
                  </button>
                ))}
              </div>
              {i < etapas.length - 1 && (
                <div className="explorar-dg-conector">
                  <svg width="14" height="20" viewBox="0 0 14 20">
                    <line x1="7" y1="0" x2="7" y2="14" stroke="var(--border)" strokeWidth="2" />
                    <path
                      d="M3 12 L7 17 L11 12"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {sel && (
          <div className={`explorar-dg-panel explorar-dg-panel--${sel.estado}`}>
            <div className="explorar-dg-panel-cabecera">
              <span className="explorar-dg-panel-codigo">{sel.codigo}</span>
              <div className="explorar-dg-panel-info">
                <div className="explorar-dg-panel-nombre">{sel.nombre}</div>
                <div className="explorar-dg-panel-meta">
                  {sel.n} tarjetas · {ETIQUETA_ESTADO[sel.estado]}
                </div>
              </div>
              <div className="explorar-dg-panel-pct">
                <div className="explorar-dg-panel-pct-num">{porcentajeDominio(sel.tarjetas, estadosSRS)}%</div>
                <div className="explorar-dg-panel-pct-label">dominado</div>
              </div>
            </div>

            {sel.estado === 'bloqueado' && (
              <div className="explorar-dg-bloqueo">
                <IconoCandado size={15} color="var(--text-sub)" />
                <p>
                  Este bloque no entra al repaso todavía
                  {sel.requiere ? (
                    <>
                      : te falta avanzar en <b>{nombreBloque(sel.requiere)}</b>
                    </>
                  ) : (
                    '.'
                  )}{' '}
                  No es una traba artificial — sin eso, sus tarjetas no se pueden responder razonando, solo
                  memorizando.
                </p>
              </div>
            )}

            {sel.muestra && (
              <div className="explorar-dg-tarjeta-muestra">
                <div className="explorar-dg-tarjeta-muestra-cuerpo">
                  <div className="explorar-dg-tarjeta-muestra-label">Tarjeta representativa</div>
                  <div className="explorar-dg-tarjeta-muestra-pregunta">
                    <TextoConNegritas texto={sel.muestra.pregunta} />
                  </div>
                </div>
                {sel.muestra.conexion_cotidiana && (
                  <div className="explorar-dg-tarjeta-muestra-curioso">
                    <IconoBombilla size={15} color="var(--warning)" />
                    <div>
                      <TextoConNegritas texto={sel.muestra.conexion_cotidiana} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="explorar-dg-panel-acciones">
              <button
                type="button"
                className="boton-primario"
                disabled={sel.estado === 'bloqueado'}
                onClick={() => onRepasar(null, [sel.codigo])}
              >
                {sel.estado === 'bloqueado' ? 'Bloqueado por prerrequisitos' : `Repasar ${sel.codigo}`}
              </button>
            </div>
          </div>
        )}

        {bancoAbierto && (
          <div className="explorar-dg-banco">
            <div className="explorar-dg-banco-titulo">Banco de conexiones</div>
            <p className="explorar-dg-banco-texto">
              Cada tarjeta trae una conexión con otra disciplina. Aquí se leen juntas, fuera del orden del protocolo
              — es la única vista del módulo donde la ruta no manda.
            </p>
            <div className="explorar-dg-banco-lista">
              {conexiones.map((b) => (
                <div key={b.codigo} className="explorar-dg-banco-item">
                  <span className="explorar-dg-banco-item-codigo">{b.codigo}</span>
                  <div>
                    <TextoConNegritas texto={b.muestra.conexion_cotidiana} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
