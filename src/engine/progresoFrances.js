// Progreso por lección de Français · Assimil, compartido entre
// MapaDelCurso.jsx (estado visual de cada nodo) y RepasoConceptos.jsx (para
// que "Repasar ahora" y el repaso general respeten el mismo desbloqueo
// progresivo que el Mapa — antes cada uno calculaba esto por su lado y el
// repaso general terminaba mostrando tarjetas de lecciones bloqueadas).
import { calcularDominio } from './dominio.js'
import { estaLista } from './srs.js'

// Lecciones con detalle individual en el Mapa (1-14): más allá de esto se
// resume en tarjetas de grupo colapsadas, sin datos reales todavía.
export const DETALLE_HASTA_FRANCES = 14

// Una lección se desbloquea cuando la anterior ya se repasó COMPLETA al
// menos una vez (todas sus tarjetas tienen estado SRS), no cuando está
// "dominada" — el método Assimil real avanza una lección nueva por día
// sin exigir dominio de la anterior (por eso el desbloqueo real es mucho
// más rápido que el estado visual "Completada", que sigue exigiendo el
// intervalo SRS largo).
export function calcularEstadoLecciones(tarjetasConcepto, estadosSRS, hastaLeccion = DETALLE_HASTA_FRANCES) {
  const porLeccion = {}
  for (const t of tarjetasConcepto) {
    if (t.leccion > 0) (porLeccion[t.leccion] ??= []).push(t)
  }

  const estados = {}
  let cadenaAbierta = true
  for (let n = 1; n <= hastaLeccion; n++) {
    const tarjetas = porLeccion[n]
    let estado
    let revisadaCompleta = false
    if (!tarjetas || !cadenaAbierta) {
      estado = 'bloqueada'
    } else {
      const dominio = calcularDominio(tarjetas, estadosSRS)
      revisadaCompleta = dominio.hechas === tarjetas.length
      const vencidas = tarjetas.filter((t) => estadosSRS[t.id] && estaLista(estadosSRS[t.id])).length
      if (dominio.pct === 100) estado = vencidas > 0 ? 'necesita-repaso' : 'completada'
      else if (dominio.hechas > 0) estado = 'progreso'
      else estado = 'disponible'
    }
    estados[n] = estado
    cadenaAbierta = revisadaCompleta
  }
  return estados
}

// Set de números de lección accesibles hoy (0 = Introducción, siempre
// disponible, no pasa por el candado secuencial de 1-49).
export function leccionesDesbloqueadas(tarjetasConcepto, estadosSRS, hastaLeccion = DETALLE_HASTA_FRANCES) {
  const estados = calcularEstadoLecciones(tarjetasConcepto, estadosSRS, hastaLeccion)
  const desbloqueadas = new Set([0])
  for (const [n, estado] of Object.entries(estados)) {
    if (estado !== 'bloqueada') desbloqueadas.add(Number(n))
  }
  return desbloqueadas
}
