import './Interruptor.css'

// Switch on/off genérico (no es el ThemeToggle de sol/luna, que tiene su
// propio ícono) — usado para ajustes booleanos como el sonido.
export function Interruptor({ activado, onCambiar, etiqueta }) {
  return (
    <button
      type="button"
      className={`interruptor${activado ? ' interruptor--activo' : ''}`}
      onClick={onCambiar}
      role="switch"
      aria-checked={activado}
      aria-label={etiqueta}
    >
      <span className="interruptor-perilla" />
    </button>
  )
}
