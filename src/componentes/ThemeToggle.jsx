import { IconoLuna, IconoSol } from './iconos.jsx'
import './ThemeToggle.css'

export function ThemeToggle({ dark, onToggle }) {
  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label="Cambiar tema">
      {dark ? <IconoSol color="var(--text-sub)" /> : <IconoLuna color="var(--text-sub)" />}
    </button>
  )
}
