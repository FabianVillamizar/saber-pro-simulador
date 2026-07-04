import { useRef, useState } from 'react'
import { leerProgreso, calcularRacha } from '../engine/progreso.js'
import { formatoFecha } from '../engine/fecha.js'
import { exportarProgreso, importarProgreso } from '../engine/exportarImportar.js'
import { Heatmap } from './Heatmap.jsx'
import './PanelProgreso.css'

export function PanelProgreso() {
  const [progreso, setProgreso] = useState(() => leerProgreso())
  const [mensaje, setMensaje] = useState(null)
  const inputRef = useRef(null)

  const racha = calcularRacha(progreso)
  const diaDeHoy = progreso[formatoFecha(new Date())]
  const repasoHecho = (diaDeHoy?.repaso ?? 0) > 0
  const practicaHecha = (diaDeHoy?.practicaParte ?? 0) > 0

  function exportar() {
    const datos = exportarProgreso()
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `saber-pro-progreso-${formatoFecha(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function manejarArchivoSeleccionado(evento) {
    const archivo = evento.target.files[0]
    evento.target.value = ''
    if (!archivo) return

    const lector = new FileReader()
    lector.onload = () => {
      try {
        importarProgreso(JSON.parse(lector.result))
        setProgreso(leerProgreso())
        setMensaje({ tipo: 'ok', texto: 'Progreso importado correctamente.' })
      } catch (e) {
        setMensaje({ tipo: 'error', texto: `No se pudo importar: ${e.message}` })
      }
    }
    lector.readAsText(archivo)
  }

  return (
    <section className="panel-progreso">
      <div className="panel-progreso-cabecera">
        <div>
          <p className="racha">
            🔥 {racha} {racha === 1 ? 'día' : 'días'} de racha
          </p>
          <p className="racha-hoy">
            Hoy: {repasoHecho ? '✓' : '—'} repaso de conceptos · {practicaHecha ? '✓' : '—'} práctica por parte
          </p>
        </div>
        <div className="panel-progreso-acciones">
          <button type="button" className="boton-secundario" onClick={exportar}>
            Exportar progreso
          </button>
          <button type="button" className="boton-secundario" onClick={() => inputRef.current.click()}>
            Importar progreso
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            className="panel-progreso-input-oculto"
            onChange={manejarArchivoSeleccionado}
          />
        </div>
      </div>

      {mensaje && (
        <p className={`panel-progreso-mensaje panel-progreso-mensaje--${mensaje.tipo}`}>{mensaje.texto}</p>
      )}

      <Heatmap progreso={progreso} />
    </section>
  )
}
