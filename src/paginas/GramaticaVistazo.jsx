import { useMemo, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo } from '../componentes/iconos.jsx'
import { ContenidoRegla, ETIQUETA_TIPO } from '../componentes/TextoConReglas.jsx'
import '../componentes/TextoConReglas.css'
import './GramaticaVistazo.css'

// Pantalla de referencia: el rulebook de "Reglas en contexto"
// (modulo.reglas) como una hoja navegable. Es el mismo contenido que el
// popover, pero a lo ancho de la pantalla y todo de una vez.
//
// Genérica por módulo:
//   - Inglés agrupa Gramática / Vocabulario (campo `grupo` de la regla) y
//     filtra por nivel MCER (campo `nivel`).
//   - Diosgenina agrupa por bloque del protocolo (`grupo` = FQT/HID/…/EST),
//     con la etiqueta que da `modulo.categorias`, y no tiene niveles — el
//     filtro de nivel solo aparece si alguna regla trae `nivel`.
// El título y la intro salen de `modulo.reglasVistazo` cuando existen.

const GRUPOS_INGLES = [
  { id: 'gramatica', label: 'Gramática' },
  { id: 'vocabulario', label: 'Vocabulario' },
]

const INTRO_POR_DEFECTO =
  'Las mismas que abre el popover al tocar un término subrayado en el Quiz Rápido y en Repaso de conceptos, aquí todas juntas.'

export function GramaticaVistazo({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [nivel, setNivel] = useState(null)

  const reglas = useMemo(() => modulo?.reglas ?? [], [modulo])

  // Niveles presentes, en orden MCER si aplica; el filtro se oculta si
  // ninguna regla del módulo declara `nivel`.
  const niveles = useMemo(() => {
    const orden = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const set = new Set(reglas.map((r) => r.nivel).filter(Boolean))
    return orden.filter((n) => set.has(n)).concat([...set].filter((n) => !orden.includes(n)))
  }, [reglas])

  // Grupos: los explícitos de Inglés, o los derivados del campo `grupo`
  // (bloques del protocolo en Diosgenina) en el orden en que aparecen en el
  // rulebook, con la etiqueta de `modulo.categorias`.
  const grupos = useMemo(() => {
    if (!modulo) return []
    const usaInglesGrupos = reglas.some((r) => r.grupo === 'gramatica' || r.grupo === 'vocabulario')
    if (usaInglesGrupos) return GRUPOS_INGLES
    const vistos = []
    for (const r of reglas) {
      const g = r.grupo ?? '__todas'
      if (!vistos.includes(g)) vistos.push(g)
    }
    if (vistos.length === 1 && vistos[0] === '__todas') return [{ id: '__todas', label: null }]
    return vistos.map((g) => ({ id: g, label: modulo.categorias?.[g] ?? g }))
  }, [modulo, reglas])

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const titulo = modulo.reglasVistazo?.titulo ?? 'Gramática de un vistazo'
  const intro = modulo.reglasVistazo?.intro ?? INTRO_POR_DEFECTO
  const visibles = nivel ? reglas.filter((r) => r.nivel === nivel) : reglas
  const gruposConReglas = grupos
    .map((g) => ({
      ...g,
      reglas: visibles.filter((r) => (r.grupo ?? '__todas') === g.id),
    }))
    .filter((g) => g.reglas.length)

  return (
    <div className="page gv">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="gv-titulo">
          <div className="gv-titulo-modulo">{modulo.nombre}</div>
          <div className="gv-titulo-sub">{titulo}</div>
        </div>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="gv-contenido">
        <p className="gv-intro">
          {reglas.length} reglas — {intro}
        </p>

        {niveles.length > 0 && (
          <div className="gv-filtros" role="group" aria-label="Filtrar por nivel">
            <button
              type="button"
              className={`gv-chip${nivel === null ? ' gv-chip--on' : ''}`}
              onClick={() => setNivel(null)}
            >
              Todos
            </button>
            {niveles.map((n) => (
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
        )}

        {gruposConReglas.map((g) => (
          <section key={g.id} className="gv-grupo">
            {g.label && <h2 className="gv-grupo-titulo">{g.label}</h2>}
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
