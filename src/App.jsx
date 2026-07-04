import './App.css'
import { listarModulos } from './engine/loadModulos.js'

function App() {
  const modulos = listarModulos()

  return (
    <div className="page">
      <header className="header">
        <h1>Saber Pro</h1>
        <p>Simulador de estudio · ICFES Colombia</p>
      </header>

      <main className="modulos">
        {modulos.map((modulo) => (
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
