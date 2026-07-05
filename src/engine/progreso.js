// Racha y progreso diario, compartidos por todos los módulos (es un
// hábito de estudio general, no algo que se fragmente por módulo) pero
// namespaced por perfil (esta app la usan varias personas).
import { leerJSON, escribirJSON } from './storage.js'
import { fechaDesdeClave, formatoFecha, sumarDias } from './fecha.js'
import { claveProgreso } from './clavesPerfil.js'
import { ID_INVITADO } from './perfiles.js'

export function leerProgreso(perfilId) {
  return leerJSON(claveProgreso(perfilId), {})
}

// `rachaAlcanzadaHoy` avisa al llamador si este registro fue el que
// acaba de completar el día (repaso + práctica por parte) — el momento
// exacto en el que suena el sonido de racha, no en cada actividad.
function registrarActividad(perfilId, tipo, ahora = new Date()) {
  const progreso = leerProgreso(perfilId)
  const fecha = formatoFecha(ahora)
  const diaAntes = progreso[fecha]
  const completoAntes = diaCompleto(diaAntes)

  const dia = diaAntes ?? { repaso: 0, practicaParte: 0, simulacro: 0 }
  dia[tipo] = (dia[tipo] ?? 0) + 1
  progreso[fecha] = dia
  if (perfilId !== ID_INVITADO) escribirJSON(claveProgreso(perfilId), progreso)

  return { progreso, rachaAlcanzadaHoy: !completoAntes && diaCompleto(dia) }
}

export function registrarRepaso(perfilId, ahora) {
  return registrarActividad(perfilId, 'repaso', ahora)
}

export function registrarPracticaParte(perfilId, ahora) {
  return registrarActividad(perfilId, 'practicaParte', ahora)
}

export function registrarSimulacro(perfilId, ahora) {
  return registrarActividad(perfilId, 'simulacro', ahora)
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

// Racha más larga de días completos registrada en todo el historial, no
// solo la que termina hoy/ayer (a diferencia de calcularRacha).
export function calcularRachaMasLarga(progreso) {
  const fechas = Object.keys(progreso).sort()
  let mejor = 0
  let actual = 0
  let anterior = null
  for (const fecha of fechas) {
    if (!diaCompleto(progreso[fecha])) {
      actual = 0
      anterior = fecha
      continue
    }
    const esConsecutivo = anterior && formatoFecha(sumarDias(fechaDesdeClave(anterior), 1)) === fecha
    actual = esConsecutivo ? actual + 1 : 1
    mejor = Math.max(mejor, actual)
    anterior = fecha
  }
  return mejor
}
