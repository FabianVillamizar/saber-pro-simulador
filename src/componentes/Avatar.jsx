import './Avatar.css'

// Círculo con la inicial del nombre del perfil, coloreado con su color
// (o el accent global si no eligió uno).
export function Avatar({ nombre, color, size = 36 }) {
  const inicial = nombre?.trim()?.[0]?.toUpperCase() ?? '?'
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.42, background: color || 'var(--accent)' }}
    >
      {inicial}
    </div>
  )
}
