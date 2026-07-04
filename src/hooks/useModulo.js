import { useEffect, useState } from 'react'
import { cargarModulo } from '../engine/loadModulos.js'

export function useModulo(moduloId) {
  const [estado, setEstado] = useState({ modulo: null, cargando: true, error: null })

  useEffect(() => {
    let cancelado = false
    setEstado({ modulo: null, cargando: true, error: null })
    cargarModulo(moduloId)
      .then((modulo) => {
        if (!cancelado) setEstado({ modulo, cargando: false, error: null })
      })
      .catch((error) => {
        if (!cancelado) setEstado({ modulo: null, cargando: false, error })
      })
    return () => {
      cancelado = true
    }
  }, [moduloId])

  return estado
}
