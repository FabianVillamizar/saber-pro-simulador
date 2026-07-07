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
  LogarithmicScale,
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
  LogarithmicScale,
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

// Para gráficas por categoría (todo menos "dispersion"), Chart.js usa un
// único array de `labels` compartido por todos los datasets, alineado por
// posición — no por valor de `x`. Si una serie no tiene exactamente las
// mismas categorías que las demás (ej. dos grupos de un histograma con
// bins distintos), usar solo las categorías de la primera serie hace que
// los valores de las otras series se grafiquen contra el eje X equivocado.
// Por eso se arma la unión de categorías de todas las series, y cada
// dataset se remapea a esa unión (con un hueco donde esa serie no tenía
// dato para esa categoría, ver spanGaps más abajo).
function unirCategorias(series) {
  const labels = []
  const vistos = new Set()
  for (const s of series) {
    for (const p of s.datos) {
      if (!vistos.has(p.x)) {
        vistos.add(p.x)
        labels.push(p.x)
      }
    }
  }
  // Si todas las categorías empiezan con un número (bins tipo "3-4", "10-11",
  // o años/valores simples), se ordenan numéricamente; si no, se respeta el
  // orden en que aparecieron (categorías nominales como meses o niveles).
  const numeros = labels.map((l) => parseFloat(String(l).replace(',', '.')))
  const todasNumericas = numeros.every((n) => !Number.isNaN(n))
  return todasNumericas ? [...labels].sort((a, b) => parseFloat(a) - parseFloat(b)) : labels
}

// Algunos fenómenos (ej. ley de Arrhenius, escalamiento alométrico) abarcan
// varios órdenes de magnitud en Y. En escala lineal, todo lo que no sea el
// valor más grande se aplana visualmente contra el 0 — literalmente
// desaparece la serie que se quería comparar. Si todos los valores son
// positivos (log no admite 0 ni negativos) y el rango abarca más de 2
// órdenes de magnitud, se usa escala logarítmica en vez de lineal.
function necesitaEscalaLog(series) {
  const valores = series.flatMap((s) => s.datos.map((p) => p.y)).filter((v) => typeof v === 'number' && Number.isFinite(v))
  if (valores.length === 0) return false
  if (valores.some((v) => v <= 0)) return false
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  return max / min > 100
}

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
      const esCategorias = datos.tipoGrafico !== 'dispersion'
      const labels = esCategorias ? unirCategorias(datos.series) : undefined
      const escalaLogY = datos.tipoGrafico !== 'barras' && datos.tipoGrafico !== 'histograma' && necesitaEscalaLog(datos.series)
      chartRef.current?.destroy()
      chartRef.current = new Chart(canvasRef.current, {
        type: TIPO_CHARTJS[datos.tipoGrafico] ?? 'bar',
        data: {
          labels,
          datasets: datos.series.map((s, i) => {
            const porCategoria = esCategorias ? new Map(s.datos.map((p) => [p.x, p.y])) : null
            return {
              label: s.nombre,
              // `null` (no 0) para categorías que esa serie no trae: en un
              // histograma/barras un hueco se ve igual que una barra en 0,
              // pero en una línea un 0 crea un pico/valle falso hacia el eje
              // — spanGaps hace que la línea conecte directo entre sus
              // puntos reales, saltándose los huecos, en vez de caer a 0.
              data: esCategorias ? labels.map((l) => porCategoria.get(l) ?? null) : s.datos,
              spanGaps: true,
              backgroundColor: i === 0 ? serie[0] : serie[i % serie.length],
              borderColor: i === 0 ? serie[0] : serie[i % serie.length],
              pointBackgroundColor: i === 0 ? serie[0] : serie[i % serie.length],
              borderWidth: 2,
              borderRadius: datos.tipoGrafico === 'barras' || datos.tipoGrafico === 'histograma' ? 4 : 0,
              tension: 0.25,
              fill: false,
            }
          }),
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
              type: escalaLogY ? 'logarithmic' : 'linear',
              title: { display: !!datos.ejeY, text: datos.ejeY, color: textoSub, font: { size: 12, weight: 600 } },
              // Los ticks por defecto de la escala logarítmica de Chart.js
              // muestran el número completo (ej. "0,0000000000001"),
              // ilegible para valores tan pequeños — se formatean en
              // notación científica solo en modo log.
              ticks: escalaLogY
                ? {
                    color: textoSub,
                    callback: (v) => {
                      const exponente = Math.log10(v)
                      // Math.log10(1000) puede dar 2.9999999999999996 por
                      // redondeo de punto flotante, por eso se compara con
                      // tolerancia en vez de Number.isInteger directo.
                      const esPotenciaDeDiez = Math.abs(exponente - Math.round(exponente)) < 1e-6
                      return esPotenciaDeDiez ? v.toExponential(0).replace('+', '') : ''
                    },
                  }
                : { color: textoSub },
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
