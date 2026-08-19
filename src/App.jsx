import { useState } from 'react'
import './App.css'
import { usePerfilActivo } from './hooks/usePerfilActivo.js'
import { SeleccionPerfil } from './paginas/SeleccionPerfil.jsx'
import { Home } from './paginas/Home.jsx'
import { ModuloHub } from './paginas/ModuloHub.jsx'
import { RepasoConceptos } from './paginas/RepasoConceptos.jsx'
import { PracticaPorParte } from './paginas/PracticaPorParte.jsx'
import { QuizRapido } from './paginas/QuizRapido.jsx'
import { Simulacro } from './paginas/Simulacro.jsx'
import { Ajustes } from './paginas/Ajustes.jsx'
import { LeccionCompleta } from './paginas/LeccionCompleta.jsx'
import { CompletaLaFrase } from './paginas/CompletaLaFrase.jsx'
import { Traduce } from './paginas/Traduce.jsx'
import { MapaDelCurso } from './paginas/MapaDelCurso.jsx'
import { EnsayosModelo } from './paginas/EnsayosModelo.jsx'
import { PracticarEnsayo } from './paginas/PracticarEnsayo.jsx'
import { EjerciciosRapidos } from './paginas/EjerciciosRapidos.jsx'
import { EscribeLaRespuesta } from './paginas/EscribeLaRespuesta.jsx'
import { PracticarLapizPapel } from './paginas/PracticarLapizPapel.jsx'
import { ExploracionCompetencias } from './paginas/ExploracionCompetencias.jsx'
import { ExploracionLecturaCritica } from './paginas/ExploracionLecturaCritica.jsx'
import { ExploracionRazonamientoCuantitativo } from './paginas/ExploracionRazonamientoCuantitativo.jsx'
import { ExploracionPensamientoCientifico } from './paginas/ExploracionPensamientoCientifico.jsx'
import { MapaConocimientoQuimica } from './paginas/MapaConocimientoQuimica.jsx'

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
        onIrAMapaQuimica={() => setPantalla({ tipo: 'mapa-quimica' })}
      />
    )
  }

  if (pantalla.tipo === 'ajustes') {
    return <Ajustes perfil={perfil} onCambiarPerfil={onCambiarPerfil} onVolver={irAHome} />
  }

  // Química · Red completa: proyecto aparte del Saber Pro, sin tarjetas
  // todavía (ver src/modulos/quimica-completa/mapa.js) — por eso no pasa
  // por ModuloHub ni por indiceModulos.js como los demás módulos, solo
  // necesita perfil (para el selector) y volver a Home.
  if (pantalla.tipo === 'mapa-quimica') {
    return <MapaConocimientoQuimica perfil={perfil} onCambiarPerfil={onCambiarPerfil} onVolver={irAHome} />
  }

  const volverAModulo = () => setPantalla({ tipo: 'modulo', moduloId: pantalla.moduloId })

  // "Repaso de conceptos" de los módulos con vista de exploración propia
  // (pilares por competencia + drill-down, en vez de ir directo a la cola
  // de tarjetas) aterriza primero ahí — ver ModuloHub.jsx, que no
  // necesitó cambios porque la tarjeta "Repaso de conceptos" sigue siendo
  // la misma para todos los módulos; el desvío ocurre acá, en el único
  // lugar donde se traduce "modo elegido" a pantalla real. Un solo mapa
  // moduloId -> componente en vez de una pantalla nueva por módulo, para
  // que agregar el próximo (Pensamiento Científico, Razonamiento
  // Cuantitativo...) no vuelva a tocar el switch de pantallas de abajo.
  const COMPONENTES_EXPLORACION = {
    'competencias-ciudadanas': ExploracionCompetencias,
    'lectura-critica': ExploracionLecturaCritica,
    'razonamiento-cuantitativo': ExploracionRazonamientoCuantitativo,
    'pensamiento-cientifico': ExploracionPensamientoCientifico,
  }

  const irAModo = (modo, moduloId) => {
    if (modo === 'repaso' && COMPONENTES_EXPLORACION[moduloId]) {
      setPantalla({ tipo: 'explorar', moduloId })
    } else {
      setPantalla({ tipo: modo, moduloId })
    }
  }

  if (pantalla.tipo === 'modulo') {
    // Français · Assimil no aterriza en la grilla de modos: el Mapa del
    // curso es la entrada (ver MapaDelCurso.jsx) porque, a diferencia de
    // los módulos de examen, aquí "dónde voy" (qué lección sigue) importa
    // tanto como "qué quiero practicar". Los otros 4 modos quedan detrás
    // de "Ver todos los modos" (pantalla 'modulo-modos').
    if (pantalla.moduloId === 'frances') {
      return (
        <MapaDelCurso
          perfil={perfil}
          onCambiarPerfil={onCambiarPerfil}
          onVolver={irAHome}
          onIrARepaso={(leccion) => setPantalla({ tipo: 'repaso', moduloId: 'frances', leccion })}
          onVerModos={() => setPantalla({ tipo: 'modulo-modos', moduloId: 'frances' })}
        />
      )
    }
    return (
      <ModuloHub
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={irAHome}
        onSeleccionarModo={(modo) => irAModo(modo, pantalla.moduloId)}
      />
    )
  }

  if (pantalla.tipo === 'modulo-modos') {
    return (
      <ModuloHub
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
        onSeleccionarModo={(modo) => irAModo(modo, pantalla.moduloId)}
      />
    )
  }

  if (pantalla.tipo === 'explorar') {
    const ComponenteExploracion = COMPONENTES_EXPLORACION[pantalla.moduloId]
    return (
      <ComponenteExploracion
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
        onRepasar={(categoriaFiltro, bloquesFiltro) =>
          setPantalla({ tipo: 'repaso', moduloId: pantalla.moduloId, categoriaFiltro, bloquesFiltro })
        }
      />
    )
  }

  if (pantalla.tipo === 'repaso') {
    return (
      <RepasoConceptos
        moduloId={pantalla.moduloId}
        leccion={pantalla.leccion}
        categoriaFiltro={pantalla.categoriaFiltro}
        bloquesFiltro={pantalla.bloquesFiltro}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
        onIrACompletaFrase={() => setPantalla({ tipo: 'completa-frase', moduloId: 'frances' })}
        onIrATraduce={() => setPantalla({ tipo: 'traduce', moduloId: 'frances' })}
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

  if (pantalla.tipo === 'quiz-rapido') {
    return (
      <QuizRapido
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

  // Modos propios de Français · Assimil (ver ModuloHub.jsx / MODOS_FRANCES)
  // — no dependen de moduloId porque hoy solo existen para ese módulo.
  if (pantalla.tipo === 'leccion-completa') {
    return <LeccionCompleta perfil={perfil} onCambiarPerfil={onCambiarPerfil} onVolver={volverAModulo} />
  }

  if (pantalla.tipo === 'completa-frase') {
    return <CompletaLaFrase perfil={perfil} onCambiarPerfil={onCambiarPerfil} onVolver={volverAModulo} />
  }

  if (pantalla.tipo === 'traduce') {
    return <Traduce perfil={perfil} onCambiarPerfil={onCambiarPerfil} onVolver={volverAModulo} />
  }

  // Modos propios de Comunicación Escrita (ver ModuloHub.jsx /
  // MODOS_COMUNICACION_ESCRITA) — igual que arriba, solo existen para ese
  // módulo hoy, así que sí toman moduloId de pantalla (siempre será
  // 'comunicacion-escrita') en vez de asumirlo fijo.
  if (pantalla.tipo === 'ensayos-modelo') {
    return (
      <EnsayosModelo
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
      />
    )
  }

  if (pantalla.tipo === 'practicar-ensayo') {
    return (
      <PracticarEnsayo
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
      />
    )
  }

  // Modo propio de Inglés (ver ModuloHub.jsx / MODO_ESCRIBIR_INGLES): a
  // diferencia de los modos de Français/Comunicación Escrita de arriba,
  // este convive con los 3 modos estándar en vez de reemplazarlos, así que
  // sí toma moduloId de pantalla igual que 'repaso'/'practica-parte'.
  if (pantalla.tipo === 'escribe-respuesta') {
    return (
      <EscribeLaRespuesta
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
      />
    )
  }

  if (pantalla.tipo === 'ejercicios-rapidos') {
    return (
      <EjerciciosRapidos
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
      />
    )
  }

  // Modo propio de Razonamiento Cuantitativo (ver ModuloHub.jsx /
  // MODO_LAPIZ_PAPEL_RC) — mismo patrón que 'escribe-respuesta': convive
  // con los 3 modos estándar, así que toma moduloId de pantalla.
  if (pantalla.tipo === 'lapiz-papel') {
    return (
      <PracticarLapizPapel
        moduloId={pantalla.moduloId}
        perfil={perfil}
        onCambiarPerfil={onCambiarPerfil}
        onVolver={volverAModulo}
      />
    )
  }

  return null
}

export default App
