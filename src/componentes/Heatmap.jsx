import { formatoFecha, sumarDias } from '../engine/fecha.js'
import './Heatmap.css'

function nivelActividad(dia) {
  if (!dia) return 0
  const total = (dia.repaso ?? 0) + (dia.practicaParte ?? 0) + (dia.simulacro ?? 0)
  if (total === 0) return 0
  if (total < 5) return 1
  if (total < 15) return 2
  if (total < 30) return 3
  return 4
}

function resumenDia(dia) {
  if (!dia) return 'sin actividad'
  return `${dia.repaso ?? 0} repaso · ${dia.practicaParte ?? 0} práctica · ${dia.simulacro ?? 0} simulacro`
}

export function Heatmap({ progreso, semanas = 18 }) {
  const hoy = new Date()
  const finSemana = sumarDias(hoy, 6 - hoy.getDay())
  const inicio = sumarDias(finSemana, -(semanas * 7 - 1))

  const columnas = []
  let cursor = inicio
  for (let semana = 0; semana < semanas; semana++) {
    const dias = []
    for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
      dias.push(cursor)
      cursor = sumarDias(cursor, 1)
    }
    columnas.push(dias)
  }

  return (
    <div>
      <div className="heatmap">
        {columnas.map((dias, i) => (
          <div key={i} className="heatmap-columna">
            {dias.map((fecha) => {
              const clave = formatoFecha(fecha)
              if (fecha > hoy) {
                return <div key={clave} className="heatmap-celda heatmap-celda--futuro" />
              }
              const nivel = nivelActividad(progreso[clave])
              return (
                <div
                  key={clave}
                  className={`heatmap-celda heatmap-celda--nivel${nivel}`}
                  title={`${clave}: ${resumenDia(progreso[clave])}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="heatmap-leyenda">
        <span className="heatmap-leyenda-texto">Menos</span>
        {[0, 1, 2, 3, 4].map((nivel) => (
          <div key={nivel} className={`heatmap-leyenda-celda heatmap-celda--nivel${nivel}`} />
        ))}
        <span className="heatmap-leyenda-texto">Más</span>
      </div>
    </div>
  )
}
