import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { porcentajeDominio, estadoDeGrupo } from '../engine/srs.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo } from '../componentes/iconos.jsx'
import './ExploracionHabilidadesLaboratorio.css'

// Una línea de contexto por técnica. Es lo ÚNICO que hay que tocar aquí
// cuando el semillero agregue una técnica nueva — y es opcional: si falta
// la entrada, la tarjeta de la técnica se muestra igual, solo sin la
// frase. El resto (nombre, conteo, % dominado, estado) sale de
// `modulo.categorias` y de las tarjetas, así que la técnica aparece sola
// en cuanto su JSON y su clave en `categorias` existen.
const DESCRIPCION_TECNICA = {
  lle: 'La partición entre dos líquidos inmiscibles, derivada desde la igualdad de potencial químico hasta la Ley de Reparto de Nernst.',
  cf: 'Punto de fusión, ebullición, índice de refracción y rotación óptica como cuatro consecuencias de una misma condición de extremal.',
}

const ETIQUETA_ESTADO = {
  dominado: 'Dominado',
  activo: 'En repaso',
  nuevo: 'Sin empezar',
  bloqueado: 'Bloqueado',
}

export function ExploracionHabilidadesLaboratorio({ moduloId, perfil, onCambiarPerfil, onVolver, onRepasar }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [estadosSRS] = useState(() => leerJSON(claveSRS(perfil.id, moduloId), {}))

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const porBloque = {}
  for (const t of modulo.tarjetasConcepto) {
    const clave = t.bloque ?? t.subtema ?? t.categoria
    if (!clave) continue
    ;(porBloque[clave] ??= []).push(t)
  }

  // Una tarjeta de técnica por cada clave de `categorias` que de verdad
  // tenga tarjetas cargadas — así se puede declarar `categorias.cf` antes
  // de que exista el contenido sin que aparezca una técnica vacía y rota.
  const tecnicas = Object.entries(modulo.categorias ?? {})
    .map(([codigo, nombre]) => {
      const tarjetas = porBloque[codigo] ?? []
      return {
        codigo,
        nombre,
        tarjetas,
        n: tarjetas.length,
        pct: porcentajeDominio(tarjetas, estadosSRS),
        estado: estadoDeGrupo(tarjetas, estadosSRS),
        descripcion: DESCRIPCION_TECNICA[codigo],
      }
    })
    .filter((t) => t.n > 0)

  const totalTarjetas = tecnicas.reduce((a, t) => a + t.n, 0)

  return (
    <div className="page explorar-hl">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="explorar-hl-titulo">
          <div className="explorar-hl-titulo-modulo">{modulo.nombre}</div>
          <div className="explorar-hl-titulo-sub">
            Semillero Pharmactive · UIS · {tecnicas.length} {tecnicas.length === 1 ? 'técnica' : 'técnicas'} ·{' '}
            {totalTarjetas} tarjetas
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="explorar-hl-cuerpo">
        <p className="explorar-hl-intro">
          Cada técnica es un repaso del semillero, completo de primeros principios a frontera. Elige una para repasarla
          entera, o haz el repaso mezclado del día con lo que tengas pendiente en todas.
        </p>

        <button type="button" className="explorar-hl-mezclado" onClick={() => onRepasar(null, null)}>
          <div className="explorar-hl-mezclado-texto">
            <span className="explorar-hl-mezclado-titulo">Repaso mezclado de todo el módulo</span>
            <span className="explorar-hl-mezclado-sub">
              Solo las tarjetas vencidas hoy, cruzando todas las técnicas — la cola de repetición espaciada normal.
            </span>
          </div>
          <span className="explorar-hl-mezclado-flecha" aria-hidden="true">
            →
          </span>
        </button>

        <div className="explorar-hl-lista">
          {tecnicas.map((t) => (
            <article key={t.codigo} className={`explorar-hl-tecnica explorar-hl-tecnica--${t.estado}`}>
              <div className="explorar-hl-tecnica-cabecera">
                <span className="explorar-hl-tecnica-codigo">{t.codigo.toUpperCase()}</span>
                <div className="explorar-hl-tecnica-info">
                  <div className="explorar-hl-tecnica-nombre">{t.nombre}</div>
                  <div className="explorar-hl-tecnica-meta">
                    {t.n} tarjetas · {ETIQUETA_ESTADO[t.estado] ?? t.estado}
                  </div>
                </div>
                <div className="explorar-hl-tecnica-pct">
                  <div className="explorar-hl-tecnica-pct-num">{t.pct}%</div>
                  <div className="explorar-hl-tecnica-pct-label">dominado</div>
                </div>
              </div>

              <div className="explorar-hl-barra">
                <div className="explorar-hl-barra-relleno" style={{ width: `${t.pct}%` }} />
              </div>

              {t.descripcion && <p className="explorar-hl-tecnica-desc">{t.descripcion}</p>}

              <button type="button" className="boton-primario" onClick={() => onRepasar(null, [t.codigo])}>
                Repasar {t.codigo.toUpperCase()}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
