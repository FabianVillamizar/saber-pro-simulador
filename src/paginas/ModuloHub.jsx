import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import './ModuloHub.css'

const MODOS = [
  {
    id: 'repaso',
    nombre: 'Repaso de conceptos',
    descripcion: 'Tarjetas de vocabulario, gramática y cultura general con repetición espaciada.',
  },
  {
    id: 'practica-parte',
    nombre: 'Práctica por parte',
    descripcion: 'Elige una parte (1-7) y practica sus ítems en orden aleatorio con feedback inmediato.',
  },
  {
    id: 'simulacro',
    nombre: 'Simulacro completo',
    descripcion: '45 preguntas respetando la proporción real por parte, cronometrado.',
  },
]

export function ModuloHub({ moduloId, perfil, onCambiarPerfil, onVolver, onSeleccionarModo }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()

  if (cargando) return <div className="page estado-carga">Cargando módulo…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  return (
    <div className="page">
      <div className="barra-superior">
        <button type="button" className="boton-volver" onClick={onVolver}>
          ← Módulos
        </button>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <header className="modulo-hub-header">
        <h1>{modulo.nombre}</h1>
        <p>{modulo.descripcion}</p>
        <p className="modulo-hub-resumen">
          {modulo.tarjetasConcepto.length} tarjetas de concepto · {modulo.preguntas.length} preguntas de práctica
        </p>
      </header>

      <main className="modos">
        {MODOS.map((modo) => (
          <article key={modo.id} className="modo-tarjeta">
            <h2>{modo.nombre}</h2>
            <p>{modo.descripcion}</p>
            <button type="button" className="boton-primario" onClick={() => onSeleccionarModo(modo.id)}>
              Empezar
            </button>
          </article>
        ))}
      </main>
    </div>
  )
}
