import './App.css'

const MODULOS = [
  {
    id: 'ingles',
    nombre: 'Inglés',
    descripcion: 'Comprensión lectora y uso del idioma, niveles A1–B2.',
    disponible: true,
  },
  {
    id: 'razonamiento-cuantitativo',
    nombre: 'Razonamiento Cuantitativo',
    descripcion: 'Interpretación de datos, proporcionalidad y modelación.',
    disponible: false,
  },
  {
    id: 'lectura-critica',
    nombre: 'Lectura Crítica',
    descripcion: 'Análisis e interpretación de textos.',
    disponible: false,
  },
  {
    id: 'competencias-ciudadanas',
    nombre: 'Competencias Ciudadanas',
    descripcion: 'Convivencia, participación y pensamiento sistémico.',
    disponible: false,
  },
  {
    id: 'comunicacion-escrita',
    nombre: 'Comunicación Escrita',
    descripcion: 'Producción de textos argumentativos.',
    disponible: false,
  },
  {
    id: 'pensamiento-cientifico',
    nombre: 'Pensamiento Científico',
    descripcion: 'Indagación y razonamiento científico.',
    disponible: false,
  },
]

function App() {
  return (
    <div className="page">
      <header className="header">
        <h1>Saber Pro</h1>
        <p>Simulador de estudio · ICFES Colombia</p>
      </header>

      <main className="modulos">
        {MODULOS.map((modulo) => (
          <article
            key={modulo.id}
            className={`tarjeta${modulo.disponible ? '' : ' tarjeta--bloqueada'}`}
          >
            <h2>{modulo.nombre}</h2>
            <p>{modulo.descripcion}</p>
            <button type="button" disabled={!modulo.disponible}>
              {modulo.disponible ? 'Comenzar' : 'Próximamente'}
            </button>
          </article>
        ))}
      </main>
    </div>
  )
}

export default App
