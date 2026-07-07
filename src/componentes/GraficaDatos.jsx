import { useEffect, useRef } from 'react'
import {
  Chart,
  BarController,
  LineController,
  ScatterController,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
} from 'chart.js'
import './GraficaDatos.css'

Chart.register(
  BarController,
  LineController,
  ScatterController,
  BarElement,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
)

const PALETA_SERIE = ['--accent', '--exito', '--warning', '--text-sub']

function coloresTema() {
  const estilo = getComputedStyle(document.documentElement)
  return {
    texto: estilo.getPropertyValue('--text').trim(),
    textoSub: estilo.getPropertyValue('--text-sub').trim(),
    borde: estilo.getPropertyValue('--border').trim(),
    serie: PALETA_SERIE.map((v) => estilo.getPropertyValue(v).trim()),
  }
}

// tipoGrafico "histograma" se dibuja como barras (Chart.js no tiene un tipo
// histograma nativo; los datos ya vienen agrupados en bins desde el origen).
const TIPO_CHARTJS = { barras: 'bar', lineas: 'line', dispersion: 'scatter', histograma: 'bar' }

// Gráfica en vivo con Chart.js a partir de datos ya estructurados (no una
// imagen): lee las variables de color del tema en cada montaje/cambio de
// tema, porque un <canvas> no re-pinta solo cuando cambian las custom
// properties de CSS como sí lo hace el DOM normal.
export function GraficaDatos({ datos }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!datos || !canvasRef.current) return

    function construir() {
      const { textoSub, borde, serie } = coloresTema()
      chartRef.current?.destroy()
      chartRef.current = new Chart(canvasRef.current, {
        type: TIPO_CHARTJS[datos.tipoGrafico] ?? 'bar',
        data: {
          labels: datos.tipoGrafico === 'dispersion' ? undefined : datos.series[0]?.datos.map((p) => p.x),
          datasets: datos.series.map((s, i) => ({
            label: s.nombre,
            data: datos.tipoGrafico === 'dispersion' ? s.datos : s.datos.map((p) => p.y),
            backgroundColor: i === 0 ? serie[0] : serie[i % serie.length],
            borderColor: i === 0 ? serie[0] : serie[i % serie.length],
            pointBackgroundColor: i === 0 ? serie[0] : serie[i % serie.length],
            borderWidth: 2,
            borderRadius: datos.tipoGrafico === 'barras' || datos.tipoGrafico === 'histograma' ? 4 : 0,
            tension: 0.25,
            fill: false,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: datos.series.length > 1, labels: { color: textoSub, font: { size: 12 } } },
            tooltip: { enabled: true },
          },
          scales: {
            x: {
              type: datos.tipoGrafico === 'dispersion' ? 'linear' : 'category',
              title: { display: !!datos.ejeX, text: datos.ejeX, color: textoSub, font: { size: 12, weight: 600 } },
              ticks: { color: textoSub },
              grid: { color: borde },
            },
            y: {
              title: { display: !!datos.ejeY, text: datos.ejeY, color: textoSub, font: { size: 12, weight: 600 } },
              ticks: { color: textoSub },
              grid: { color: borde },
            },
          },
        },
      })
    }

    construir()

    const observer = new MutationObserver(construir)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      observer.disconnect()
      chartRef.current?.destroy()
    }
  }, [datos])

  if (!datos) return null
  return (
    <div className="grafica-datos">
      <canvas ref={canvasRef} role="img" aria-label={datos.descripcionAccesible ?? 'Gráfica de datos'} />
    </div>
  )
}
