// Racha y progreso diario, compartidos por todos los módulos (es un
// hábito de estudio general, no algo que se fragmente por módulo).
import { leerJSON, escribirJSON } from './storage.js'
import { formatoFecha, sumarDias } from './fecha.js'

const CLAVE = 'progreso'

export function leerProgreso() {
  return leerJSON(CLAVE, {})
}

function registrarActividad(tipo, ahora = new Date()) {
  const progreso = leerProgreso()
  const fecha = formatoFecha(ahora)
  const dia = progreso[fecha] ?? { repaso: 0, practicaParte: 0, simulacro: 0 }
  dia[tipo] = (dia[tipo] ?? 0) + 1
  progreso[fecha] = dia
  escribirJSON(CLAVE, progreso)
  return progreso
}

export function registrarRepaso(ahora) {
  return registrarActividad('repaso', ahora)
}

export function registrarPracticaParte(ahora) {
  return registrarActividad('practicaParte', ahora)
}

export function registrarSimulacro(ahora) {
  return registrarActividad('simulacro', ahora)
}

// Día completo = al menos una sesión de repaso de conceptos + al menos
// una práctica por parte, el mismo día.
export function diaCompleto(dia) {
  return !!dia && dia.repaso > 0 && dia.practicaParte > 0
}

// Días consecutivos completos, terminando hoy o ayer: si hoy todavía no
// está completo no rompe la racha (el día sigue en curso), solo se rompe
// si ayer tampoco lo estuvo.
export function calcularRacha(progreso, ahora = new Date()) {
  let cursor = ahora
  if (!diaCompleto(progreso[formatoFecha(ahora)])) {
    cursor = sumarDias(ahora, -1)
  }

  let racha = 0
  while (diaCompleto(progreso[formatoFecha(cursor)])) {
    racha++
    cursor = sumarDias(cursor, -1)
  }
  return racha
}
