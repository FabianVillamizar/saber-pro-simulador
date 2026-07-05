import { useTheme } from '../hooks/useTheme.js'
import { useSonido } from '../hooks/useSonido.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { Interruptor } from '../componentes/Interruptor.jsx'
import { IconoChevronIzquierdo, IconoSonido, IconoSonidoMudo } from '../componentes/iconos.jsx'
import './Ajustes.css'

export function Ajustes({ perfil, onCambiarPerfil, onVolver }) {
  const { dark, toggle } = useTheme()
  const { activado, alternar } = useSonido(perfil.id)

  return (
    <div className="page">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <h1>Ajustes</h1>
      <p className="ajustes-subtitulo">Preferencias de {perfil.nombre} en este dispositivo.</p>

      <div className="ajustes-lista">
        <div className="ajustes-fila">
          <div className="ajustes-fila-icono">
            {activado ? <IconoSonido color="var(--accent)" /> : <IconoSonidoMudo color="var(--text-faint)" />}
          </div>
          <div className="ajustes-fila-info">
            <div className="ajustes-fila-titulo">Sonido</div>
            <div className="ajustes-fila-desc">
              Un sonido corto al calificar una tarjeta como "Bien" o "Fácil", al alcanzar la racha del día, y al
              terminar un simulacro.
            </div>
          </div>
          <Interruptor activado={activado} onCambiar={alternar} etiqueta="Activar sonido" />
        </div>
      </div>
    </div>
  )
}
