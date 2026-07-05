import { Avatar } from './Avatar.jsx'
import './SelectorPerfil.css'

// Botón chico junto al ThemeToggle: permite cambiar de perfil en
// cualquier momento, en cualquier pantalla.
export function SelectorPerfil({ perfil, onClick }) {
  return (
    <button type="button" className="selector-perfil" onClick={onClick} title="Cambiar de perfil" aria-label="Cambiar de perfil">
      <Avatar nombre={perfil?.nombre} color={perfil?.color} size={26} />
    </button>
  )
}
