import { useState } from 'react'
import './App.css'
import { usePerfilActivo } from './hooks/usePerfilActivo.js'
import { SeleccionPerfil } from './paginas/SeleccionPerfil.jsx'
import { Home } from './paginas/Home.jsx'
import { ModuloHub } from './paginas/ModuloHub.jsx'
import { RepasoConceptos } from './paginas/RepasoConceptos.jsx'
import { PracticaPorParte } from './paginas/PracticaPorParte.jsx'
import { Simulacro } from './paginas/Simulacro.jsx'
import { Ajustes } from './paginas/Ajustes.jsx'

function App() {
  const { perfil, cambiarPerfil } = usePerfilActivo()
  const [pantalla, setPantalla] = useState({ tipo: 'home' })

  // Sin perfil activo (primer uso, o se acaba de crear el primero): la
  // selección de perfil bloquea el resto de la app.
  if (!perfil) {
    return <SeleccionPerfil onSeleccionar={cambiarPerfil} />
  }

  const irAHome = () => setPantalla({ tipo: 'home' })
  const onCambiarPerfil = () => setPantalla({ tipo: 'seleccion-perfil' })

  if (pantalla.tipo === 'seleccion-perfil') {
    return (
      <SeleccionPerfil
        onSeleccionar={(id) => {
          cambiarPerfil(id)
          irAHome()
        }}
      />
    )
  }

  if (pantalla.tipo === 'home') {
    return (
      <Home
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onAbrirModulo={(moduloId) => setPantalla({ tipo: 'modulo', moduloId })}
        onIrADirecto={(modo, moduloId) => setPantalla({ tipo: modo, moduloId })}
        onIrAAjustes={() => setPantalla({ tipo: 'ajustes' })}
      />
    )
  }

  if (pantalla.tipo === 'ajustes') {
    return <Ajustes perfil={perfil} onCambiarPerfil={onCambiarPerfil} onVolver={irAHome} />
  }

  const volverAModulo = () => setPantalla({ tipo: 'modulo', moduloId: pantalla.moduloId })

  if (pantalla.tipo === 'modulo') {
    return (
      <ModuloHub
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={irAHome}
        onSeleccionarModo={(modo) => setPantalla({ tipo: modo, moduloId: pantalla.moduloId })}
      />
    )
  }

  if (pantalla.tipo === 'repaso') {
    return (
      <RepasoConceptos
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
      />
    )
  }

  if (pantalla.tipo === 'practica-parte') {
    return (
      <PracticaPorParte
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
      />
    )
  }

  if (pantalla.tipo === 'simulacro') {
    return (
      <Simulacro
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
        onIrARepaso={() => setPantalla({ tipo: 'repaso', moduloId: pantalla.moduloId })}
      />
    )
  }

  return null
}

export default App
