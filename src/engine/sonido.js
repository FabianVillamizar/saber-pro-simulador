// Sonido sutil, opcional, en 3 momentos puntuales: calificar "Bien"/
// "Fácil" en una tarjeta, alcanzar la racha del día, terminar un
// simulacro. <audio> simple (new Audio()), no Web Audio API: son clips
// cortos de una sola vez, no hace falta un AudioContext.
import { leerJSON, escribirJSON } from './storage.js'
import tarjetaBien from '../assets/sonidos/tarjeta-bien.ogg'
import racha from '../assets/sonidos/racha.ogg'
import simulacroCompleto from '../assets/sonidos/simulacro-completo.ogg'

const SONIDOS = {
  tarjeta: tarjetaBien,
  racha,
  simulacro: simulacroCompleto,
}

function claveSonido(perfilId) {
  return `${perfilId}:sonido`
}

// Encendido por defecto, pero guardado por perfil: Fabián y Sledy pueden
// preferir distinto en el mismo dispositivo.
export function sonidoActivado(perfilId) {
  return leerJSON(claveSonido(perfilId), true)
}

export function establecerSonidoActivado(perfilId, activado) {
  escribirJSON(claveSonido(perfilId), activado)
}

export function reproducirSonido(perfilId, nombre) {
  if (!sonidoActivado(perfilId)) return
  const src = SONIDOS[nombre]
  if (!src) return
  const audio = new Audio(src)
  audio.volume = 0.5
  // Los navegadores pueden bloquear el primer play() si todavía no hubo
  // interacción del usuario en la página; no es un error que haya que
  // mostrar, el sonido simplemente no suena esa vez.
  audio.play().catch(() => {})
}
