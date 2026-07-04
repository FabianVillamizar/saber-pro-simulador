import { listarModulos } from '../engine/loadModulos.js'
import { PanelProgreso } from '../componentes/PanelProgreso.jsx'
import './Home.css'

export function Home({ onAbrirModulo }) {
  const modulos = listarModulos()

  return (
    <div className="page">
      <header className="header">
        <h1>Saber Pro</h1>
        <p>Simulador de estudio · ICFES Colombia</p>
      </header>

      <PanelProgreso />

      <main className="modulos">
        {modulos.map((modulo) => (
          <article
            key={modulo.id}
            className={`tarjeta${modulo.disponible ? '' : ' tarjeta--bloqueada'}`}
          >
            <h2>{modulo.nombre}</h2>
            <p>{modulo.descripcion}</p>
            <button
              type="button"
              className="boton-primario"
              disabled={!modulo.disponible}
              onClick={() => onAbrirModulo(modulo.id)}
            >
              {modulo.disponible ? 'Comenzar' : 'Próximamente'}
            </button>
          </article>
        ))}
      </main>
    </div>
  )
}
