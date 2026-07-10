import { useState } from 'react'
import { desbloquearModulo } from '../engine/accesoModulo.js'
import './GateAcceso.css'

function soloDigitos(valor) {
  return valor.replace(/\D/g, '').slice(0, 4)
}

// Fricción, no seguridad: código fijo hasheado en el bundle de un sitio
// estático (ver comentario en accesoModulo.js). Solo evita el click
// accidental sobre un módulo que ya es visible en el dashboard.
export function GateAcceso({ perfil, moduloId, nombreModulo, onExito, onCancelar }) {
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState(null)

  function confirmar(e) {
    e.preventDefault()
    if (desbloquearModulo(perfil.id, moduloId, codigo)) {
      onExito()
    } else {
      setError('Código incorrecto.')
      setCodigo('')
    }
  }

  return (
    <div className="gate-acceso-fondo" onClick={onCancelar}>
      <div className="gate-acceso-tarjeta" onClick={(e) => e.stopPropagation()}>
        <h2 className="gate-acceso-titulo">{nombreModulo}</h2>
        <p className="gate-acceso-nota">Este módulo pide un código de acceso.</p>
        <form className="gate-acceso-form" onSubmit={confirmar}>
          <input
            type="password"
            inputMode="numeric"
            value={codigo}
            onChange={(e) => {
              setCodigo(soloDigitos(e.target.value))
              setError(null)
            }}
            placeholder="••••"
            autoFocus
          />
          {error && <p className="gate-acceso-error">{error}</p>}
          <button type="submit" className="boton-primario" disabled={codigo.length !== 4}>
            Entrar
          </button>
          <button type="button" className="gate-acceso-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}
