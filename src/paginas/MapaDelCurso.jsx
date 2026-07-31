import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { estaLista } from '../engine/srs.js'
import { calcularEstadoLecciones, leccionesDesbloqueadas, DETALLE_HASTA_FRANCES } from '../engine/progresoFrances.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo, IconoCheck, IconoCandado, IconoReloj, IconoFlechaDerecha } from '../componentes/iconos.jsx'
import '../estilos/frances.css'
import './MapaDelCurso.css'

// Lecciones con detalle individual en el mapa: más allá de esto se resume
// en tarjetas de grupo colapsadas — nodos sin contenido real todavía no
// aportarían nada. Cuando el módulo crezca, este número puede subir junto
// con los datos reales (ver también progresoFrances.js).
const DETALLE_HASTA = DETALLE_HASTA_FRANCES
const REVISIONES = new Set([7, 14, 21, 28, 35, 42, 49])

export function MapaDelCurso({ perfil, onCambiarPerfil, onVolver, onIrARepaso, onVerModos }) {
  const { modulo, cargando } = useModulo('frances')
  const { dark, toggle } = useTheme()

  if (cargando || !modulo) return <div className="page estado-carga">Cargando…</div>

  const estadosSRS = leerJSON(claveSRS(perfil.id, 'frances'), {})
  const porLeccion = {}
  for (const t of modulo.tarjetasConcepto) {
    ;(porLeccion[t.leccion] ??= []).push(t)
  }

  const leccionActual = Math.max(1, ...Object.keys(porLeccion).map(Number).filter((n) => n > 0))

  // Aprendizaje progresivo (ver progresoFrances.js): una lección con datos
  // solo se desbloquea cuando la anterior ya se repasó completa al menos
  // una vez. Aparte de eso, igual que una tarjeta suelta, una lección
  // "dominada" se debilita con el tiempo si no se repasa: si ya llegó al
  // 100% pero alguna de sus tarjetas volvió a estar lista para repasar,
  // el nodo pasa de "completada" a "necesita-repaso" — sin tocar el
  // progreso guardado ni volver a bloquear lo que sigue.
  const estadosLecciones = calcularEstadoLecciones(modulo.tarjetasConcepto, estadosSRS, DETALLE_HASTA)
  const nodos = []
  for (let n = 1; n <= DETALLE_HASTA; n++) {
    nodos.push({
      numero: n,
      tituloFr: modulo.categorias?.[String(n)] ?? `Lección ${n}`,
      estado: estadosLecciones[n],
      revision: REVISIONES.has(n),
    })
  }

  // El conteo del banner debe coincidir con lo que el repaso general
  // realmente muestra (RepasoConceptos aplica el mismo desbloqueo) — de
  // lo contrario "Repasar ahora" prometería tarjetas de lecciones que en
  // realidad siguen bloqueadas.
  const abiertas = leccionesDesbloqueadas(modulo.tarjetasConcepto, estadosSRS, DETALLE_HASTA)
  const pendientesHoy = modulo.tarjetasConcepto.filter(
    (t) => abiertas.has(t.leccion) && estaLista(estadosSRS[t.id])
  ).length

  const grupos = []
  for (let inicio = DETALLE_HASTA + 1; inicio <= 49; inicio += 7) {
    const fin = Math.min(inicio + 6, 49)
    grupos.push({ label: `Lecciones ${inicio}–${fin}`, rango: `${inicio}–${fin}` })
  }

  const totalConDatos = Object.keys(porLeccion).filter((n) => Number(n) > 0).length
  const overallPct = Math.round((totalConDatos / 49) * 100)

  return (
    <div className="mapa-curso">
      <div className="mapa-curso-topbar">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div>
          <div className="mapa-curso-titulo">Mapa del curso</div>
          <div className="mapa-curso-sub">Français · Assimil · Fase receptiva</div>
        </div>
        <div style={{ flex: 1 }} />
        <button type="button" className="mapa-curso-ver-modos" onClick={onVerModos}>
          Ver todos los modos
        </button>
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      {pendientesHoy > 0 && (
        <div className="mapa-curso-cta">
          <div>
            <div className="mapa-curso-cta-eyebrow">Repaso pendiente</div>
            <div className="mapa-curso-cta-meta">
              Tienes {pendientesHoy} tarjeta{pendientesHoy === 1 ? '' : 's'} lista{pendientesHoy === 1 ? '' : 's'} para repasar hoy
            </div>
          </div>
          <button type="button" className="mapa-curso-cta-boton" onClick={() => onIrARepaso()}>
            Repasar ahora
            <IconoFlechaDerecha size={14} color="#fff" />
          </button>
        </div>
      )}

      <div className="mapa-curso-progreso">
        <div className="mapa-curso-barra">
          <div className="mapa-curso-barra-relleno" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="mapa-curso-contador">
          Lección {leccionActual} de 49
        </div>
      </div>

      <div className="mapa-curso-leyenda">
        <span className="mapa-curso-leyenda-item">
          <span className="mapa-curso-punto mapa-curso-punto--completada" /> Completada
        </span>
        <span className="mapa-curso-leyenda-item">
          <span className="mapa-curso-punto mapa-curso-punto--necesita-repaso" /> Necesita repaso
        </span>
        <span className="mapa-curso-leyenda-item">
          <span className="mapa-curso-punto mapa-curso-punto--progreso" /> En progreso
        </span>
        <span className="mapa-curso-leyenda-item">
          <span className="mapa-curso-punto mapa-curso-punto--disponible" /> Disponible
        </span>
        <span className="mapa-curso-leyenda-item">
          <span className="mapa-curso-punto mapa-curso-punto--bloqueada" /> Bloqueada
        </span>
      </div>

      <div className="mapa-curso-camino">
        <div className="mapa-curso-linea" />
        <div className="mapa-curso-nodos">
          {nodos.map((n, i) => {
            const clickable = n.estado !== 'bloqueada'
            const offset = i % 2 === 0 ? -46 : 46
            return (
              <div key={n.numero} className="mapa-curso-fila-nodo">
                <div
                  className={`mapa-curso-nodo-envoltorio${clickable ? ' mapa-curso-nodo-envoltorio--clic' : ''}`}
                  style={{ transform: `translateX(${offset}px)` }}
                  onClick={() => clickable && onIrARepaso(n.numero)}
                >
                  {n.revision ? (
                    <div className={`mapa-curso-rombo mapa-curso-nodo--${n.estado}`}>
                      <span className="mapa-curso-rombo-num">{n.numero}</span>
                    </div>
                  ) : (
                    <div className={`mapa-curso-circulo mapa-curso-nodo--${n.estado}`}>
                      {n.estado === 'completada' && <IconoCheck size={16} color="white" />}
                      {n.estado === 'necesita-repaso' && <IconoReloj size={16} color="var(--fr-accent)" />}
                      {n.estado === 'bloqueada' && <IconoCandado size={13} color="var(--text-faint)" />}
                      {(n.estado === 'progreso' || n.estado === 'disponible') && <span>{n.numero}</span>}
                    </div>
                  )}
                  <div className={`mapa-curso-etiqueta${n.estado === 'bloqueada' ? ' mapa-curso-etiqueta--tenue' : ''}`}>
                    {n.tituloFr}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mapa-curso-grupos">
        {grupos.map((g) => (
          <div key={g.rango} className="mapa-curso-grupo">
            <IconoCandado size={15} color="var(--text-faint)" />
            <div>
              <div className="mapa-curso-grupo-label">{g.label}</div>
              <div className="mapa-curso-grupo-rango">Bloqueado</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
