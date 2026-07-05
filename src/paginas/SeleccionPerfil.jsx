import { useState } from 'react'
import { listarPerfiles, crearPerfil, COLORES_PERFIL } from '../engine/perfiles.js'
import { useTheme } from '../hooks/useTheme.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { Avatar } from '../componentes/Avatar.jsx'
import { Marca } from '../componentes/Marca.jsx'
import './SeleccionPerfil.css'

export function SeleccionPerfil({ onSeleccionar }) {
  const { dark, toggle } = useTheme()
  const [perfiles, setPerfiles] = useState(() => listarPerfiles())
  const [creando, setCreando] = useState(perfiles.length === 0)
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(null)
  const [errorNombre, setErrorNombre] = useState(null)

  function confirmarCreacion(e) {
    e.preventDefault()
    if (!nombre.trim()) {
      setErrorNombre('Escribe un nombre para el perfil.')
      return
    }
    const perfil = crearPerfil({ nombre, color })
    setPerfiles([...perfiles, perfil])
    onSeleccionar(perfil.id)
  }

  return (
    <div className="seleccion-perfil">
      <div className="seleccion-perfil-toggle">
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="seleccion-perfil-tarjeta">
        <Marca texto="Saber Pro" grande />
        <h1 className="seleccion-perfil-titulo">¿Quién va a estudiar?</h1>

        {perfiles.length > 0 && (
          <div className="seleccion-perfil-grid">
            {perfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                className="seleccion-perfil-item"
                onClick={() => onSeleccionar(p.id)}
              >
                <Avatar nombre={p.nombre} color={p.color} size={48} />
                <span>{p.nombre}</span>
              </button>
            ))}
            <button type="button" className="seleccion-perfil-item seleccion-perfil-item--nuevo" onClick={() => setCreando(true)}>
              <span className="seleccion-perfil-mas">+</span>
              <span>Crear perfil</span>
            </button>
          </div>
        )}

        {creando && (
          <form className="seleccion-perfil-form" onSubmit={confirmarCreacion}>
            <label className="seleccion-perfil-label">
              Nombre
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value)
                  setErrorNombre(null)
                }}
                placeholder="Tu nombre"
                autoFocus
              />
            </label>
            {errorNombre && <p className="seleccion-perfil-error">{errorNombre}</p>}

            <div className="seleccion-perfil-colores">
              <span className="seleccion-perfil-label">Color (opcional)</span>
              <div className="seleccion-perfil-swatches">
                <button
                  type="button"
                  className={`seleccion-perfil-swatch seleccion-perfil-swatch--sin${color === null ? ' seleccion-perfil-swatch--activo' : ''}`}
                  onClick={() => setColor(null)}
                  aria-label="Sin color"
                />
                {COLORES_PERFIL.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`seleccion-perfil-swatch${color === c ? ' seleccion-perfil-swatch--activo' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="boton-primario">
              Crear y continuar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
