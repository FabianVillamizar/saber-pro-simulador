// Cola con refuerzo: cualquier práctica secuencial (preguntas de una parte,
// tarjetas de repaso) puede fallar un ítem y necesitar que reaparezca más
// seguido que el resto en la misma sesión. Genérico a propósito: no sabe
// si `valor` es una pregunta o una tarjeta de concepto.
function barajar(items) {
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// `yaOrdenado` lo usan las partes con preguntas agrupadas (mismo texto):
// el llamador ya barajó por grupo con barajarPorGrupo() y no quiere que
// crearCola vuelva a barajar suelto y separe preguntas del mismo grupo.
export function crearCola(items, { yaOrdenado = false } = {}) {
  return (yaOrdenado ? items : barajar(items)).map((valor) => ({ valor, fallos: 0 }))
}

// Reinserta la entrada más adelante en la cola (no al final): entre más
// veces haya fallado, más cerca vuelve a aparecer.
export function reencolarTrasFallo(cola, entrada) {
  const actualizada = { ...entrada, fallos: entrada.fallos + 1 }
  const restante = cola.filter((e) => e !== entrada)
  const distancia = Math.max(1, 3 - actualizada.fallos)
  const posicion = Math.min(restante.length, distancia)
  return [...restante.slice(0, posicion), actualizada, ...restante.slice(posicion)]
}

export function retirarTrasAcierto(cola, entrada) {
  return cola.filter((e) => e !== entrada)
}
