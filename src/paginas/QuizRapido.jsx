import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { claveQuizRapido } from '../engine/clavesPerfil.js'
import { ID_INVITADO } from '../engine/perfiles.js'
import { barajarPorGrupo } from '../engine/simulacro.js'
import { registrarPracticaParte } from '../engine/progreso.js'
import { formatoFecha, diferenciaDias } from '../engine/fecha.js'
import { PreguntaMultipleChoice } from '../componentes/PreguntaMultipleChoice.jsx'
import { PanelExplicacion } from '../componentes/PanelExplicacion.jsx'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoFlechaCircular, IconoFlechaDerecha, IconoCheck, IconoChevronIzquierdo } from '../componentes/iconos.jsx'
import './QuizRapido.css'

const DURACIONES = [
  { id: 'sprint', nombre: 'Sprint', cantidad: 10 },
  { id: 'repaso', nombre: 'Repaso', cantidad: 20 },
  { id: 'banco', nombre: 'Banco completo', cantidad: Infinity },
]

function etiquetaFecha(fechaClave) {
  const dias = diferenciaDias(new Date(`${fechaClave}T00:00:00`), new Date())
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'hace 1 día'
  return `hace ${dias} días`
}

function etiquetaCategoria(clave, categorias) {
  return categorias?.[clave] ?? `Parte ${clave}`
}

function contarPorGrupo(preguntas) {
  const conteo = {}
  for (const p of preguntas) conteo[p.grupoId] = (conteo[p.grupoId] ?? 0) + 1
  return conteo
}

export function QuizRapido({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()

  const [duracion, setDuracion] = useState('sprint')
  const [filtros, setFiltros] = useState([])

  // null = pantalla de configuración. Un array = sesión en curso o
  // terminada (fase se decide por índice vs. longitud, igual que
  // Simulacro.jsx).
  const [sesion, setSesion] = useState(null)
  const [indice, setIndice] = useState(0)
  const [seleccion, setSeleccion] = useState(null)
  const [respondida, setRespondida] = useState(false)
  const [aciertos, setAciertos] = useState(0)
  const [fallos, setFallos] = useState([])
  const [falloAbierto, setFalloAbierto] = useState(null)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const categorias = modulo.categorias
  const ultimo = leerJSON(claveQuizRapido(perfil.id, moduloId), null)

  const preguntasFiltradas = filtros.length > 0 ? modulo.preguntas.filter((p) => filtros.includes(p.parte)) : modulo.preguntas
  const conteoPorCategoria = {}
  for (const p of modulo.preguntas) conteoPorCategoria[p.parte] = (conteoPorCategoria[p.parte] ?? 0) + 1

  function alternarFiltro(clave) {
    setFiltros((f) => (f.includes(clave) ? f.filter((x) => x !== clave) : [...f, clave]))
  }

  function empezar() {
    const cantidad = DURACIONES.find((d) => d.id === duracion).cantidad
    const preguntas = barajarPorGrupo(preguntasFiltradas).slice(0, Math.min(cantidad, preguntasFiltradas.length))
    setSesion(preguntas)
    setIndice(0)
    setSeleccion(null)
    setRespondida(false)
    setAciertos(0)
    setFallos([])
    setFalloAbierto(null)
  }

  function reiniciarAConfig() {
    setSesion(null)
  }

  // ============ CONFIG ============
  if (!sesion) {
    return (
      <div className="page quiz-rapido">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={onVolver}>
            ← {modulo.nombre}
          </button>
          <div style={{ flex: 1 }} />
          <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>

        <h1 className="quiz-rapido-titulo">¿Cuánto quieres repasar?</h1>
        <p className="quiz-rapido-lede">Corto, variado y con corrección inmediata. Puedes parar cuando quieras.</p>

        {ultimo && (
          <div className="quiz-rapido-ultimo">
            <IconoFlechaCircular size={13} />
            Último Quiz rápido: {ultimo.aciertos}/{ultimo.total} · {etiquetaFecha(ultimo.fecha)}
          </div>
        )}

        <div className="quiz-rapido-seccion-label">Duración</div>
        <div className="quiz-rapido-duraciones">
          {DURACIONES.map((d) => {
            const cantidadReal = Math.min(d.cantidad, preguntasFiltradas.length)
            return (
              <button
                key={d.id}
                type="button"
                className={`quiz-rapido-duracion${duracion === d.id ? ' quiz-rapido-duracion--activa' : ''}`}
                onClick={() => setDuracion(d.id)}
              >
                <span className="quiz-rapido-duracion-nombre">{d.nombre}</span>
                <span className="quiz-rapido-duracion-detalle">{cantidadReal} preguntas</span>
              </button>
            )
          })}
        </div>

        {categorias && (
          <>
            <div className="quiz-rapido-seccion-label">Filtrar por sub-categoría · vacío = todo</div>
            <div className="nucleo-filtro">
              {Object.entries(categorias).map(([clave, nombre]) => (
                <button
                  key={clave}
                  type="button"
                  className={`nucleo-boton${filtros.includes(clave) ? ' nucleo-boton--activo' : ''}`}
                  onClick={() => alternarFiltro(clave)}
                >
                  {filtros.includes(clave) && <IconoCheck size={11} />} {nombre}
                  <span className="quiz-rapido-filtro-n">{conteoPorCategoria[clave] ?? 0}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="quiz-rapido-empezar-fila">
          <button
            type="button"
            className="boton-primario quiz-rapido-empezar"
            onClick={empezar}
            disabled={preguntasFiltradas.length === 0}
          >
            Empezar · {Math.min(DURACIONES.find((d) => d.id === duracion).cantidad, preguntasFiltradas.length)} preguntas
            <IconoFlechaDerecha size={14} color="#fff" />
          </button>
          <span className="quiz-rapido-banco-label">
            {filtros.length === 0
              ? `Sin filtro: todo el banco de ${modulo.nombre}`
              : `${filtros.length} sub-categoría${filtros.length > 1 ? 's' : ''} seleccionada${filtros.length > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    )
  }

  // ============ FINAL ============
  if (indice >= sesion.length) {
    const pct = Math.round((aciertos / sesion.length) * 100)
    let titulo, mensaje
    if (pct >= 90) {
      titulo = '¡Perfecto!'
      mensaje = 'Entra tranquilo a este repaso — lo tienes sólido. Vuelve en unos días para mantenerlo fresco.'
    } else if (pct >= 70) {
      titulo = 'Vas bien'
      mensaje = 'Dominas la mayoría. Revisa abajo los puntos flojos y vuelve a intentarlo pronto.'
    } else if (pct >= 45) {
      titulo = 'A medias'
      mensaje = 'Hay una base, pero se cae en varios casos. Abre las tarjetas relacionadas antes de repetir.'
    } else {
      titulo = 'Repite este repaso'
      mensaje = 'Esta selección todavía no está lista. Repasa las tarjetas de teoría primero y vuelve al quiz después.'
    }

    const vistasPorCategoria = {}
    for (const p of sesion) {
      vistasPorCategoria[p.parte] ??= { total: 0, fallos: 0 }
      vistasPorCategoria[p.parte].total++
    }
    for (const f of fallos) vistasPorCategoria[f.pregunta.parte].fallos++
    const desglose = Object.entries(vistasPorCategoria).map(([clave, { total, fallos: f }]) => {
      const acierto = total - f
      const dpct = Math.round((acierto / total) * 100)
      return { clave, nombre: etiquetaCategoria(clave, categorias), total, acierto, pct: dpct }
    })

    return (
      <div className="page quiz-rapido">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={onVolver}>
            ← {modulo.nombre}
          </button>
          <div style={{ flex: 1 }} />
          <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>

        <h1 className="quiz-rapido-titulo">{titulo}</h1>
        <p className="quiz-rapido-lede">{mensaje}</p>

        <div className="quiz-rapido-puntaje">
          <span className="quiz-rapido-puntaje-numero">{aciertos}</span>
          <span className="quiz-rapido-puntaje-total">/ {sesion.length}</span>
          <span className="quiz-rapido-puntaje-pct">{pct}%</span>
        </div>

        {categorias && desglose.length > 1 && (
          <>
            <div className="quiz-rapido-seccion-label">Dónde estuviste débil</div>
            <div className="quiz-rapido-desglose">
              {desglose.map((d) => (
                <div key={d.clave} className="quiz-rapido-desglose-fila">
                  <div className="quiz-rapido-desglose-cabecera">
                    <span>{d.nombre}</span>
                    <span>
                      {d.acierto}/{d.total} · {d.pct}%
                    </span>
                  </div>
                  <div className="quiz-rapido-barra">
                    <div
                      className={`quiz-rapido-barra-relleno${d.pct >= 70 ? ' quiz-rapido-barra-relleno--bien' : d.pct >= 45 ? ' quiz-rapido-barra-relleno--medio' : ' quiz-rapido-barra-relleno--mal'}`}
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {fallos.length > 0 && (
          <>
            <div className="quiz-rapido-seccion-label">Lo que falló ({fallos.length})</div>
            <div className="quiz-rapido-fallos">
              {fallos.map((f, i) => {
                const abierto = falloAbierto === i
                return (
                  <div key={f.pregunta.id} className="quiz-rapido-fallo">
                    <p className="quiz-rapido-fallo-enunciado">{f.pregunta.enunciado}</p>
                    <button
                      type="button"
                      className="quiz-rapido-fallo-toggle"
                      onClick={() => setFalloAbierto(abierto ? null : i)}
                    >
                      <IconoChevronIzquierdo size={12} color="var(--accent)" />
                      {abierto ? 'Ocultar explicación' : 'Ver explicación'}
                    </button>
                    {abierto && (
                      <PanelExplicacion
                        pregunta={f.pregunta}
                        seleccion={f.seleccion}
                        esCorrecta={false}
                        tarjetasConcepto={modulo.tarjetasConcepto}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div className="quiz-rapido-final-acciones">
          <button type="button" className="boton-primario" onClick={reiniciarAConfig}>
            Otro Quiz rápido
          </button>
          <button type="button" className="boton-secundario" onClick={onVolver}>
            Volver al módulo
          </button>
        </div>
      </div>
    )
  }

  // ============ PREGUNTA ============
  const gruposConteo = contarPorGrupo(sesion)
  const pregunta = sesion[indice]
  const esCorrecta = respondida && seleccion === pregunta.respuestaCorrecta

  function seleccionarOpcion(letra) {
    if (respondida) return
    const ok = letra === pregunta.respuestaCorrecta
    if (ok) setAciertos((n) => n + 1)
    else setFallos((f) => [...f, { pregunta, seleccion: letra }])
    registrarPracticaParte(perfil.id)
    setSeleccion(letra)
    setRespondida(true)
  }

  function siguiente() {
    const esUltima = indice + 1 >= sesion.length
    if (esUltima && perfil.id !== ID_INVITADO) {
      escribirJSON(claveQuizRapido(perfil.id, moduloId), { fecha: formatoFecha(new Date()), aciertos, total: sesion.length })
    }
    setIndice((i) => i + 1)
    setSeleccion(null)
    setRespondida(false)
  }

  const progressPct = Math.round((indice / sesion.length) * 100)

  return (
    <div className="page quiz-rapido">
      <div className="barra-superior">
        <button type="button" className="boton-volver" onClick={() => setSesion(null)}>
          ← Detener
        </button>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="quiz-rapido-status">
        <span>
          {indice + 1} / {sesion.length}
        </span>
        <div className="quiz-rapido-progreso">
          <div className="quiz-rapido-progreso-relleno" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="quiz-rapido-aciertos">{aciertos} ✓</span>
      </div>

      {categorias && <div className="quiz-rapido-badge">{etiquetaCategoria(pregunta.parte, categorias)}</div>}

      {gruposConteo[pregunta.grupoId] > 1 && (
        <p className="practica-grupo-nota">
          Estas preguntas se basan en el mismo texto · {pregunta.numEnGrupo} de {gruposConteo[pregunta.grupoId]}
        </p>
      )}

      <PreguntaMultipleChoice
        pregunta={pregunta}
        seleccion={seleccion}
        onSeleccionar={seleccionarOpcion}
        deshabilitado={respondida}
        mostrarCorreccion={respondida}
      />

      {respondida && (
        <PanelExplicacion
          pregunta={pregunta}
          seleccion={seleccion}
          esCorrecta={esCorrecta}
          tarjetasConcepto={modulo.tarjetasConcepto}
        />
      )}

      {respondida && (
        <button type="button" className="boton-primario quiz-rapido-siguiente" onClick={siguiente}>
          {indice + 1 >= sesion.length ? 'Ver resultado' : 'Siguiente'}
          <IconoFlechaDerecha size={14} color="#fff" />
        </button>
      )}
    </div>
  )
}
