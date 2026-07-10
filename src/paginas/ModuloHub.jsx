import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { escribirJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import './ModuloHub.css'

// Etiquetas de los sub-bloques de diosgenina (BQ/FQ/QO/QA), solo para el
// desglose informativo de abajo — no se usan para filtrar ni agrupar en
// ningún modo de práctica (ver saber_pro_module_architecture en memoria).
const ETIQUETAS_BLOQUE_DIOSGENINA = {
  BQ: 'Bioquímica',
  FQ: 'Fisicoquímica',
  QO: 'Química Orgánica',
  QA: 'Química Analítica',
}

const MODOS = [
  {
    id: 'repaso',
    nombre: 'Repaso de conceptos',
    descripcion: 'Tarjetas de conceptos clave del módulo con repetición espaciada.',
  },
  {
    id: 'practica-parte',
    nombre: 'Práctica por sub-categoría',
    descripcion: 'Elige una parte o competencia y practica sus ítems en orden aleatorio con feedback inmediato.',
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

  const modos = MODOS.filter((modo) => modo.id !== 'simulacro' || modulo.soportaSimulacro)

  const esDiosgenina = moduloId === 'diosgenina'
  const conteoPorBloque = esDiosgenina
    ? modulo.tarjetasConcepto.reduce((conteo, t) => {
        conteo[t.bloque] = (conteo[t.bloque] ?? 0) + 1
        return conteo
      }, {})
    : null

  function reiniciarSRS() {
    if (
      !window.confirm(
        `Esto borra tu progreso de repaso (tarjetas dominadas) de ${modulo.nombre}. Tu racha y el resto de Saber Pro no se tocan. ¿Continuar?`
      )
    ) {
      return
    }
    escribirJSON(claveSRS(perfil.id, moduloId), {})
    window.location.reload()
  }

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
        {esDiosgenina && conteoPorBloque && (
          <p className="modulo-hub-resumen">
            {Object.entries(conteoPorBloque)
              .map(([bloque, n]) => `${n} ${ETIQUETAS_BLOQUE_DIOSGENINA[bloque] ?? bloque}`)
              .join(' · ')}
          </p>
        )}
        {esDiosgenina && (
          <button type="button" className="modulo-hub-reiniciar" onClick={reiniciarSRS}>
            Reiniciar progreso de repaso
          </button>
        )}
      </header>

      <main className="modos">
        {modos.map((modo) => (
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
