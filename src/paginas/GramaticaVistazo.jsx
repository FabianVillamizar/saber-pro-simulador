import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo } from '../componentes/iconos.jsx'
import { ContenidoRegla, ETIQUETA_TIPO } from '../componentes/TextoConReglas.jsx'
import '../componentes/TextoConReglas.css'
import './GramaticaVistazo.css'

// Pantalla de referencia: el rulebook de "Reglas en contexto"
// (modulo.reglas) como una hoja navegable, filtrable por nivel MCER. Es el
// mismo contenido que el popover, pero a lo ancho de la pantalla y todo de
// una vez. Hoy solo la usa Inglés (gateada en ModuloHub.jsx).

const NIVELES = ['A1', 'A2', 'B1', 'B2']
const GRUPOS = [
  { id: 'gramatica', label: 'Gramática' },
  { id: 'vocabulario', label: 'Vocabulario' },
]

export function GramaticaVistazo({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [nivel, setNivel] = useState(null)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const reglas = modulo.reglas ?? []
  const visibles = nivel ? reglas.filter((r) => r.nivel === nivel) : reglas
  const grupos = GRUPOS.map((g) => ({
    ...g,
    reglas: visibles.filter((r) => (r.grupo ?? 'gramatica') === g.id),
  })).filter((g) => g.reglas.length)

  return (
    <div className="page gv">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="gv-titulo">
          <div className="gv-titulo-modulo">{modulo.nombre}</div>
          <div className="gv-titulo-sub">Gramática de un vistazo</div>
        </div>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="gv-contenido">
        <p className="gv-intro">
          {reglas.length} reglas — las mismas que abre el popover al tocar un término subrayado en el Quiz
          Rápido y en Repaso de conceptos, aquí todas juntas.
        </p>

        <div className="gv-filtros" role="group" aria-label="Filtrar por nivel">
          <button
            type="button"
            className={`gv-chip${nivel === null ? ' gv-chip--on' : ''}`}
            onClick={() => setNivel(null)}
          >
            Todos
          </button>
          {NIVELES.map((n) => (
            <button
              key={n}
              type="button"
              className={`gv-chip${nivel === n ? ' gv-chip--on' : ''}`}
              onClick={() => setNivel(nivel === n ? null : n)}
            >
              {n}
            </button>
          ))}
        </div>

        {grupos.map((g) => (
          <section key={g.id} className="gv-grupo">
            <h2 className="gv-grupo-titulo">{g.label}</h2>
            <div className="gv-grid">
              {g.reglas.map((r) => (
                <article
                  key={r.id}
                  className={`gv-card${r.variante === 'desarrollo' ? ' gv-card--ancha' : ''}`}
                  data-tipo={r.tipo}
                  data-acento={modulo.acentoReglas || undefined}
                >
                  <div className="gv-card-cabecera">
                    <span className="rc-pop-badge">{ETIQUETA_TIPO[r.tipo] ?? r.tipo}</span>
                    {r.nivel && <span className="gv-nivel">{r.nivel}</span>}
                  </div>
                  <ContenidoRegla regla={r} />
                </article>
              ))}
            </div>
          </section>
        ))}

        {visibles.length === 0 && <p className="gv-vacio">No hay reglas de nivel {nivel}.</p>}
      </div>
    </div>
  )
}
