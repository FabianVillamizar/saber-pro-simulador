import { useState } from 'react'
import { obtenerPerfilActivo, establecerPerfilActivo } from '../engine/perfiles.js'

export function usePerfilActivo() {
  const [perfil, setPerfil] = useState(() => obtenerPerfilActivo())

  function cambiarPerfil(id) {
    establecerPerfilActivo(id)
    setPerfil(obtenerPerfilActivo())
  }

  return { perfil, cambiarPerfil }
}
