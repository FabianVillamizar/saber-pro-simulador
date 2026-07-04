import { useEffect, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { estadoInicial, siguienteEstado, estaLista, CALIFICACIONES } from '../engine/srs.js'
import { crearCola, reencolarTrasFallo, retirarTrasAcierto } from '../engine/colaRefuerzo.js'
import { registrarRepaso } from '../engine/progreso.js'
import './RepasoConceptos.css'

const ETIQUETAS_CALIFICACION = {
  otra_vez: 'Otra vez',
  dificil: 'Difícil',
  bien: 'Bien',
  facil: 'Fácil',
}

export function RepasoConceptos({ moduloId, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const [estadosSRS, setEstadosSRS] = useState(() => leerJSON(`srs:${moduloId}`, {}))
  const [cola, setCola] = useState(null)
  const [mostrarReverso, setMostrarReverso] = useState(false)
  const [revisadasHoy, setRevisadasHoy] = useState(0)

  // Solo se recalcula cuando cambia el módulo cargado: la cola de la
  // sesión no debe reordenarse cada vez que cambian los estados SRS
  // mientras se está respondiendo.
  useEffect(() => {
    if (!modulo) return
    const pendientes = modulo.tarjetasConcepto.filter((t) => estaLista(estadosSRS[t.id]))
    setCola(crearCola(pendientes))
  }, [modulo])

  if (cargando || cola === null) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  function calificar(calificacion) {
    const entrada = cola[0]
    const tarjeta = entrada.valor
    const estadoActual = estadosSRS[tarjeta.id] ?? estadoInicial()
    const nuevoEstado = siguienteEstado(estadoActual, calificacion)
    const nuevosEstados = { ...estadosSRS, [tarjeta.id]: nuevoEstado }

    setEstadosSRS(nuevosEstados)
    escribirJSON(`srs:${moduloId}`, nuevosEstados)
    registrarRepaso()
    setRevisadasHoy((n) => n + 1)
    setMostrarReverso(false)
    setCola(calificacion === 'otra_vez' ? reencolarTrasFallo(cola, entrada) : retirarTrasAcierto(cola, entrada))
  }

  if (cola.length === 0) {
    return (
      <div className="page">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={onVolver}>
            ← {modulo.nombre}
          </button>
        </div>
        <div className="repaso-fin">
          <h2>Por hoy no quedan tarjetas pendientes</h2>
          <p>Revisaste {revisadasHoy} tarjetas en esta sesión.</p>
        </div>
      </div>
    )
  }

  const tarjeta = cola[0].valor

  return (
    <div className="page">
      <div className="barra-superior">
        <button type="button" className="boton-volver" onClick={onVolver}>
          ← {modulo.nombre}
        </button>
        <span className="repaso-progreso">{cola.length} pendientes</span>
      </div>

      <div className="tarjeta-flash">
        <p className="tarjeta-flash-meta">
          {tarjeta.nivel_mcer} · {tarjeta.tipo.replace('_', ' ')}
        </p>
        <p className="tarjeta-flash-front">{tarjeta.front}</p>
        {mostrarReverso && <p className="tarjeta-flash-back">{tarjeta.back}</p>}
      </div>

      {!mostrarReverso ? (
        <button type="button" className="boton-primario" onClick={() => setMostrarReverso(true)}>
          Mostrar respuesta
        </button>
      ) : (
        <div className="calificacion-botones">
          {CALIFICACIONES.map((c) => (
            <button
              key={c}
              type="button"
              className={`boton-calificacion boton-calificacion--${c}`}
              onClick={() => calificar(c)}
            >
              {ETIQUETAS_CALIFICACION[c]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
