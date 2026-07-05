import { useState } from 'react'
import {
  listarPerfiles,
  crearPerfil,
  verificarPin,
  restablecerPin,
  COLORES_PERFIL,
  MAX_PERFILES,
  ID_INVITADO,
} from '../engine/perfiles.js'
import { useTheme } from '../hooks/useTheme.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { Avatar } from '../componentes/Avatar.jsx'
import { Marca } from '../componentes/Marca.jsx'
import './SeleccionPerfil.css'

function soloDigitos(valor) {
  return valor.replace(/\D/g, '').slice(0, 4)
}

export function SeleccionPerfil({ onSeleccionar }) {
  const { dark, toggle } = useTheme()
  const [perfiles, setPerfiles] = useState(() => listarPerfiles())
  const [creando, setCreando] = useState(perfiles.length === 0)
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(null)
  const [pin, setPin] = useState('')
  const [pinConfirmar, setPinConfirmar] = useState('')
  const [errorCreacion, setErrorCreacion] = useState(null)

  const [desbloqueando, setDesbloqueando] = useState(null)
  const [pinDesbloqueo, setPinDesbloqueo] = useState('')
  const [errorDesbloqueo, setErrorDesbloqueo] = useState(null)
  const [restableciendoPin, setRestableciendoPin] = useState(false)
  const [nuevoPin, setNuevoPin] = useState('')
  const [nuevoPinConfirmar, setNuevoPinConfirmar] = useState('')
  const [errorNuevoPin, setErrorNuevoPin] = useState(null)

  const hayCupo = perfiles.length < MAX_PERFILES

  function confirmarCreacion(e) {
    e.preventDefault()
    if (!nombre.trim()) {
      setErrorCreacion('Escribe un nombre para el perfil.')
      return
    }
    if (pin.length !== 4) {
      setErrorCreacion('El PIN debe tener 4 dígitos.')
      return
    }
    if (pin !== pinConfirmar) {
      setErrorCreacion('Los dos PIN no coinciden.')
      return
    }
    try {
      const perfil = crearPerfil({ nombre, color, pin })
      setPerfiles([...perfiles, perfil])
      onSeleccionar(perfil.id)
    } catch (err) {
      setErrorCreacion(err.message)
    }
  }

  function confirmarDesbloqueo(e) {
    e.preventDefault()
    if (!verificarPin(desbloqueando, pinDesbloqueo)) {
      setErrorDesbloqueo('PIN incorrecto.')
      setPinDesbloqueo('')
      return
    }
    onSeleccionar(desbloqueando.id)
  }

  function cancelarDesbloqueo() {
    setDesbloqueando(null)
    setPinDesbloqueo('')
    setErrorDesbloqueo(null)
    setRestableciendoPin(false)
    setNuevoPin('')
    setNuevoPinConfirmar('')
    setErrorNuevoPin(null)
  }

  function iniciarRestablecerPin() {
    if (
      !window.confirm(`Esto va a reemplazar el PIN de ${desbloqueando.nombre}. Su progreso no se toca. ¿Continuar?`)
    ) {
      return
    }
    setRestableciendoPin(true)
    setPinDesbloqueo('')
    setErrorDesbloqueo(null)
  }

  function confirmarNuevoPin(e) {
    e.preventDefault()
    if (nuevoPin.length !== 4) {
      setErrorNuevoPin('El PIN debe tener 4 dígitos.')
      return
    }
    if (nuevoPin !== nuevoPinConfirmar) {
      setErrorNuevoPin('Los dos PIN no coinciden.')
      return
    }
    restablecerPin(desbloqueando.id, nuevoPin)
    onSeleccionar(desbloqueando.id)
  }

  if (desbloqueando) {
    return (
      <div className="seleccion-perfil">
        <div className="seleccion-perfil-toggle">
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>

        <div className="seleccion-perfil-tarjeta">
          <Avatar nombre={desbloqueando.nombre} color={desbloqueando.color} size={48} />
          <h1 className="seleccion-perfil-titulo">
            {restableciendoPin ? `Nuevo PIN de ${desbloqueando.nombre}` : `PIN de ${desbloqueando.nombre}`}
          </h1>

          {!restableciendoPin && (
            <form className="seleccion-perfil-form" onSubmit={confirmarDesbloqueo}>
              <label className="seleccion-perfil-label">
                PIN
                <input
                  type="password"
                  inputMode="numeric"
                  value={pinDesbloqueo}
                  onChange={(e) => {
                    setPinDesbloqueo(soloDigitos(e.target.value))
                    setErrorDesbloqueo(null)
                  }}
                  placeholder="••••"
                  autoFocus
                />
              </label>
              {errorDesbloqueo && <p className="seleccion-perfil-error">{errorDesbloqueo}</p>}

              <button type="submit" className="boton-primario" disabled={pinDesbloqueo.length !== 4}>
                Continuar
              </button>
              <button type="button" className="seleccion-perfil-cancelar" onClick={iniciarRestablecerPin}>
                ¿Olvidaste tu PIN?
              </button>
              <button type="button" className="seleccion-perfil-cancelar" onClick={cancelarDesbloqueo}>
                ← Elegir otro perfil
              </button>
            </form>
          )}

          {restableciendoPin && (
            <form className="seleccion-perfil-form" onSubmit={confirmarNuevoPin}>
              <label className="seleccion-perfil-label">
                Nuevo PIN (4 dígitos)
                <input
                  type="password"
                  inputMode="numeric"
                  value={nuevoPin}
                  onChange={(e) => {
                    setNuevoPin(soloDigitos(e.target.value))
                    setErrorNuevoPin(null)
                  }}
                  placeholder="••••"
                  autoFocus
                />
              </label>
              <label className="seleccion-perfil-label">
                Confirmar nuevo PIN
                <input
                  type="password"
                  inputMode="numeric"
                  value={nuevoPinConfirmar}
                  onChange={(e) => {
                    setNuevoPinConfirmar(soloDigitos(e.target.value))
                    setErrorNuevoPin(null)
                  }}
                  placeholder="••••"
                />
              </label>
              {errorNuevoPin && <p className="seleccion-perfil-error">{errorNuevoPin}</p>}

              <button type="submit" className="boton-primario">
                Guardar y continuar
              </button>
              <button type="button" className="seleccion-perfil-cancelar" onClick={cancelarDesbloqueo}>
                ← Elegir otro perfil
              </button>
            </form>
          )}
        </div>
      </div>
    )
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
                onClick={() => setDesbloqueando(p)}
              >
                <Avatar nombre={p.nombre} color={p.color} size={48} />
                <span>{p.nombre}</span>
              </button>
            ))}
            {hayCupo && (
              <button type="button" className="seleccion-perfil-item seleccion-perfil-item--nuevo" onClick={() => setCreando(true)}>
                <span className="seleccion-perfil-mas">+</span>
                <span>Crear perfil</span>
              </button>
            )}
          </div>
        )}

        {!hayCupo && !creando && (
          <button
            type="button"
            className="seleccion-perfil-invitado"
            onClick={() => onSeleccionar(ID_INVITADO)}
          >
            Continuar como invitado
          </button>
        )}
        {!hayCupo && !creando && (
          <p className="seleccion-perfil-invitado-nota">
            Ya hay {MAX_PERFILES} perfiles en este dispositivo. Como invitado puedes practicar, pero nada se guarda.
          </p>
        )}

        {creando && hayCupo && (
          <form className="seleccion-perfil-form" onSubmit={confirmarCreacion}>
            <label className="seleccion-perfil-label">
              Nombre
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value)
                  setErrorCreacion(null)
                }}
                placeholder="Tu nombre"
                autoFocus
              />
            </label>

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

            <label className="seleccion-perfil-label">
              PIN (4 dígitos)
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  setPin(soloDigitos(e.target.value))
                  setErrorCreacion(null)
                }}
                placeholder="••••"
              />
            </label>
            <label className="seleccion-perfil-label">
              Confirmar PIN
              <input
                type="password"
                inputMode="numeric"
                value={pinConfirmar}
                onChange={(e) => {
                  setPinConfirmar(soloDigitos(e.target.value))
                  setErrorCreacion(null)
                }}
                placeholder="••••"
              />
            </label>
            {errorCreacion && <p className="seleccion-perfil-error">{errorCreacion}</p>}

            <button type="submit" className="boton-primario">
              Crear y continuar
            </button>
            {perfiles.length > 0 && (
              <button type="button" className="seleccion-perfil-cancelar" onClick={() => setCreando(false)}>
                ← Elegir otro perfil
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
