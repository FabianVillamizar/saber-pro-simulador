import { useState } from 'react'
import { sonidoActivado, establecerSonidoActivado } from '../engine/sonido.js'

export function useSonido(perfilId) {
  const [activado, setActivado] = useState(() => sonidoActivado(perfilId))

  function alternar() {
    const nuevo = !activado
    establecerSonidoActivado(perfilId, nuevo)
    setActivado(nuevo)
  }

  return { activado, alternar }
}
