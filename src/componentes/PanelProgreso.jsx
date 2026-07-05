import { useRef, useState } from 'react'
import { exportarProgreso, importarProgreso } from '../engine/exportarImportar.js'
import { formatoFecha } from '../engine/fecha.js'
import './PanelProgreso.css'

// Backup/restauración de progreso local: no está en el mockup del
// Dashboard, pero es funcionalidad real (localStorage no sincroniza entre
// dispositivos) que vale la pena conservar — discreta, al pie de la página.
export function PanelProgreso() {
  const [mensaje, setMensaje] = useState(null)
  const inputRef = useRef(null)

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
        window.location.reload()
      } catch (e) {
        setMensaje(`No se pudo importar: ${e.message}`)
      }
    }
    lector.readAsText(archivo)
  }

  return (
    <div className="panel-progreso">
      <button type="button" className="panel-progreso-link" onClick={exportar}>
        Exportar progreso
      </button>
      <span className="panel-progreso-separador">·</span>
      <button type="button" className="panel-progreso-link" onClick={() => inputRef.current.click()}>
        Importar progreso
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="panel-progreso-input-oculto"
        onChange={manejarArchivoSeleccionado}
      />
      {mensaje && <p className="panel-progreso-mensaje">{mensaje}</p>}
    </div>
  )
}
