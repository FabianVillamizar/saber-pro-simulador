import { useState } from 'react'
import './App.css'
import { Home } from './paginas/Home.jsx'
import { ModuloHub } from './paginas/ModuloHub.jsx'
import { RepasoConceptos } from './paginas/RepasoConceptos.jsx'
import { PracticaPorParte } from './paginas/PracticaPorParte.jsx'
import { Simulacro } from './paginas/Simulacro.jsx'

function App() {
  const [pantalla, setPantalla] = useState({ tipo: 'home' })

  if (pantalla.tipo === 'home') {
    return <Home onAbrirModulo={(moduloId) => setPantalla({ tipo: 'modulo', moduloId })} />
  }

  const volverAModulo = () => setPantalla({ tipo: 'modulo', moduloId: pantalla.moduloId })
  const volverAHome = () => setPantalla({ tipo: 'home' })

  if (pantalla.tipo === 'modulo') {
    return (
      <ModuloHub
        moduloId={pantalla.moduloId}
        onVolver={volverAHome}
        onSeleccionarModo={(modo) => setPantalla({ tipo: modo, moduloId: pantalla.moduloId })}
      />
    )
  }

  if (pantalla.tipo === 'repaso') {
    return <RepasoConceptos moduloId={pantalla.moduloId} onVolver={volverAModulo} />
  }

  if (pantalla.tipo === 'practica-parte') {
    return <PracticaPorParte moduloId={pantalla.moduloId} onVolver={volverAModulo} />
  }

  if (pantalla.tipo === 'simulacro') {
    return <Simulacro moduloId={pantalla.moduloId} onVolver={volverAModulo} />
  }

  return null
}

export default App
