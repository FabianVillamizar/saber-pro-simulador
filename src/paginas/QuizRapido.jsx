import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { claveQuizRapido } from '../engine/clavesPerfil.js'
import { ID_INVITADO } from '../engine/perfiles.js'
import { registrarPracticaParte } from '../engine/progreso.js'
import { formatoFecha, diferenciaDias } from '../engine/fecha.js'
import { TextoConNegritas } from '../componentes/TextoConNegritas.jsx'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoFlechaCircular, IconoFlechaDerecha, IconoCheck, IconoChevronIzquierdo } from '../componentes/iconos.jsx'
import './QuizRapido.css'

const LETRAS = ['A', 'B', 'C', 'D', 'E']
const ETIQUETA_FORMATO = { mcq: 'Opción múltiple', fill: 'Completa', build: 'Arma la frase', match: 'Empareja' }
const DURACIONES = [
  { id: 'sprint', nombre: 'Sprint', cantidad: 10 },
  { id: 'repaso', nombre: 'Repaso', cantidad: 20 },
  { id: 'banco', nombre: 'Banco completo', cantidad: Infinity },
]

function barajar(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function normalizar(s) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
}

function etiquetaFecha(fechaClave) {
  const dias = diferenciaDias(new Date(`${fechaClave}T00:00:00`), new Date())
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'hace 1 día'
  return `hace ${dias} días`
}

function etiquetaCategoria(clave, categorias) {
  return categorias?.[clave] ?? clave
}

// Misma tarjeta de concepto puede venir en 3 esquemas distintos según el
// módulo (ver PanelExplicacion.jsx, que resuelve el mismo problema para el
// puente pregunta->teoría del banco de examen): cloze de Inglés
// (antes/despues/respuesta), "científica" de PC/RC (modo + regla/ejemplo),
// o pregunta/respuesta_breve/explicacion/ejemplo_aplicado de CC/LC. Este
// piloto solo tiene contenido para CC, pero detectar el esquema aquí (en
// vez de asumir el de CC) deja el componente listo para el resto de
// módulos sin tener que volver a tocarlo.
function TarjetaTeoria({ tarjeta }) {
  const esCientifica = 'modo' in tarjeta
  const esCloze = esCientifica ? tarjeta.modo === 'cloze' : 'antes' in tarjeta
  const enunciado = esCloze ? `${tarjeta.antes}___${tarjeta.despues}` : tarjeta.pregunta
  const respuesta = esCientifica ? tarjeta.respuesta : tarjeta.respuesta_breve
  const explicacion = esCientifica ? tarjeta.regla : tarjeta.explicacion
  const ejemplo = esCientifica ? tarjeta.ejemplo : tarjeta.ejemplo_aplicado

  return (
    <div className="qr-teoria">
      <p className="qr-teoria-pregunta">{enunciado}</p>
      <p className="qr-teoria-respuesta">{respuesta}</p>
      <div className="qr-teoria-label">Explicación</div>
      <p className="qr-teoria-texto">
        <TextoConNegritas texto={explicacion} />
      </p>
      {ejemplo && (
        <>
          <div className="qr-teoria-label qr-teoria-label--accent">Ejemplo</div>
          <p className="qr-teoria-texto">
            <TextoConNegritas texto={ejemplo} />
          </p>
        </>
      )}
      {tarjeta.error_comun && (
        <>
          <div className="qr-teoria-label qr-teoria-label--warn">Error común</div>
          <p className="qr-teoria-texto">
            <TextoConNegritas texto={tarjeta.error_comun} />
          </p>
        </>
      )}
    </div>
  )
}

export function QuizRapido({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()

  const [duracion, setDuracion] = useState('sprint')
  const [filtros, setFiltros] = useState([])

  const [sesion, setSesion] = useState(null)
  const [indice, setIndice] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [fallos, setFallos] = useState([])
  const [falloAbierto, setFalloAbierto] = useState(null)

  const [revelado, setRevelado] = useState(false)
  const [acerto, setAcerto] = useState(false)
  const [seleccion, setSeleccion] = useState(null)
  const [fillValue, setFillValue] = useState('')
  const [banco, setBanco] = useState([])
  const [armado, setArmado] = useState([])
  const [matchDer, setMatchDer] = useState([])
  const [matchPares, setMatchPares] = useState({})
  const [matchPendiente, setMatchPendiente] = useState(null)

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const categorias = modulo.categorias
  const banco_ = modulo.quizRapido ?? []
  const ultimo = leerJSON(claveQuizRapido(perfil.id, moduloId), null)
  const preguntasFiltradas = filtros.length > 0 ? banco_.filter((p) => filtros.includes(p.categoria)) : banco_
  const conteoPorCategoria = {}
  for (const p of banco_) conteoPorCategoria[p.categoria] = (conteoPorCategoria[p.categoria] ?? 0) + 1

  function alternarFiltro(clave) {
    setFiltros((f) => (f.includes(clave) ? f.filter((x) => x !== clave) : [...f, clave]))
  }

  function cargarPregunta(item) {
    setRevelado(false)
    setAcerto(false)
    setSeleccion(null)
    setFillValue('')
    if (item.formato === 'build') {
      setBanco(barajar(item.fragmentos.map((texto, idx) => ({ texto, idx }))))
      setArmado([])
    } else {
      setBanco([])
      setArmado([])
    }
    if (item.formato === 'match') {
      setMatchDer(barajar(item.der.map((texto, idx) => ({ texto, idx }))))
      setMatchPares({})
      setMatchPendiente(null)
    } else {
      setMatchDer([])
      setMatchPares({})
      setMatchPendiente(null)
    }
  }

  function empezar() {
    const cantidad = DURACIONES.find((d) => d.id === duracion).cantidad
    const preguntas = barajar(preguntasFiltradas).slice(0, Math.min(cantidad, preguntasFiltradas.length))
    setSesion(preguntas)
    setIndice(0)
    setAciertos(0)
    setFallos([])
    setFalloAbierto(null)
    cargarPregunta(preguntas[0])
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

        <div className="qr-shell">
          <div className="qr-tabs">
            <div className="qr-tab">
              <span className="qr-tab-dot" />
              Quiz rápido
            </div>
            <div className="qr-tab-modulo">{modulo.nombre}</div>
          </div>
          <div className="qr-sheet">
            <div className="qr-margin" />
            <div className="qr-rules" />
            <div className="qr-content">
              <h1 className="qr-titulo">¿Cuánto quieres repasar?</h1>
              <p className="qr-lede">Corto, variado y con corrección inmediata. Puedes parar cuando quieras.</p>

              {ultimo && (
                <div className="qr-ultimo">
                  <IconoFlechaCircular size={13} />
                  Último Quiz rápido: {ultimo.aciertos}/{ultimo.total} · {etiquetaFecha(ultimo.fecha)}
                </div>
              )}

              {banco_.length === 0 ? (
                <p className="qr-vacio">Todavía no hay preguntas cortas para este módulo.</p>
              ) : (
                <>
                  <div className="qr-seccion-label">Duración</div>
                  <div className="qr-duraciones">
                    {DURACIONES.map((d) => {
                      const cantidadReal = Math.min(d.cantidad, preguntasFiltradas.length)
                      return (
                        <button
                          key={d.id}
                          type="button"
                          className={`qr-duracion${duracion === d.id ? ' qr-duracion--activa' : ''}`}
                          onClick={() => setDuracion(d.id)}
                        >
                          <span className="qr-duracion-nombre">{d.nombre}</span>
                          <span className="qr-duracion-detalle">{cantidadReal} preguntas</span>
                        </button>
                      )
                    })}
                  </div>

                  {categorias && (
                    <>
                      <div className="qr-seccion-label">Filtrar por sub-categoría · vacío = todo</div>
                      <div className="qr-filtros">
                        {Object.entries(categorias)
                          .filter(([clave]) => conteoPorCategoria[clave] > 0)
                          .map(([clave, nombre]) => (
                            <button
                              key={clave}
                              type="button"
                              className={`qr-filtro${filtros.includes(clave) ? ' qr-filtro--activo' : ''}`}
                              onClick={() => alternarFiltro(clave)}
                            >
                              {filtros.includes(clave) && <IconoCheck size={11} />} {nombre}
                              <span className="qr-filtro-n">{conteoPorCategoria[clave] ?? 0}</span>
                            </button>
                          ))}
                      </div>
                    </>
                  )}

                  <div className="qr-empezar-fila">
                    <button
                      type="button"
                      className="qr-boton-primario"
                      onClick={empezar}
                      disabled={preguntasFiltradas.length === 0}
                    >
                      Empezar · {Math.min(DURACIONES.find((d) => d.id === duracion).cantidad, preguntasFiltradas.length)}{' '}
                      preguntas
                      <IconoFlechaDerecha size={14} color="#fff" />
                    </button>
                    <span className="qr-banco-label">
                      {filtros.length === 0
                        ? `Sin filtro: todo el banco de ${modulo.nombre}`
                        : `${filtros.length} sub-categoría${filtros.length > 1 ? 's' : ''} seleccionada${filtros.length > 1 ? 's' : ''}`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
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
      vistasPorCategoria[p.categoria] ??= { total: 0, fallos: 0 }
      vistasPorCategoria[p.categoria].total++
    }
    for (const f of fallos) vistasPorCategoria[f.item.categoria].fallos++
    const desglose = Object.entries(vistasPorCategoria).map(([clave, { total, fallos: nFallos }]) => {
      const acierto = total - nFallos
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

        <div className="qr-shell">
          <div className="qr-tabs">
            <div className="qr-tab">
              <span className="qr-tab-dot" />
              Resultado
            </div>
            <div className="qr-tab-modulo">{modulo.nombre}</div>
          </div>
          <div className="qr-sheet">
            <div className="qr-margin" />
            <div className="qr-rules" />
            <div className="qr-content">
              <h1 className="qr-titulo">{titulo}</h1>
              <p className="qr-lede">{mensaje}</p>

              <div className="qr-puntaje">
                <span className="qr-puntaje-numero">{aciertos}</span>
                <span className="qr-puntaje-total">/ {sesion.length}</span>
                <span className="qr-puntaje-pct">{pct}%</span>
              </div>

              {categorias && desglose.length > 1 && (
                <>
                  <div className="qr-seccion-label">Dónde estuviste débil</div>
                  <div className="qr-desglose">
                    {desglose.map((d) => (
                      <div key={d.clave} className="qr-desglose-fila">
                        <div className="qr-desglose-cabecera">
                          <span>{d.nombre}</span>
                          <span>
                            {d.acierto}/{d.total} · {d.pct}%
                          </span>
                        </div>
                        <div className="qr-barra">
                          <div
                            className={`qr-barra-relleno${d.pct >= 70 ? ' qr-barra-relleno--bien' : d.pct >= 45 ? ' qr-barra-relleno--medio' : ' qr-barra-relleno--mal'}`}
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
                  <div className="qr-seccion-label">Lo que falló ({fallos.length})</div>
                  <div className="qr-fallos">
                    {fallos.map((f, i) => {
                      const abierto = falloAbierto === i
                      const tarjeta = modulo.tarjetasConcepto.find((t) => t.id === f.item.tarjetaId)
                      return (
                        <div key={f.item.id} className="qr-fallo">
                          <p className="qr-fallo-enunciado">{f.item.enunciado}</p>
                          <div className="qr-fallo-respuestas">
                            <span className="qr-fallo-tuya">tu respuesta: {f.tuRespuesta}</span>
                            <span className="qr-fallo-correcta">correcta: {f.correcta}</span>
                          </div>
                          {tarjeta && (
                            <button
                              type="button"
                              className="qr-fallo-toggle"
                              onClick={() => setFalloAbierto(abierto ? null : i)}
                            >
                              <IconoChevronIzquierdo
                                size={12}
                                color="var(--qr-accent)"
                              />
                              {abierto ? 'Ocultar tarjeta relacionada' : 'Ver tarjeta relacionada'}
                            </button>
                          )}
                          {abierto && tarjeta && <TarjetaTeoria tarjeta={tarjeta} />}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              <div className="qr-final-acciones">
                <button type="button" className="qr-boton-primario" onClick={() => setSesion(null)}>
                  Otro Quiz rápido
                </button>
                <button type="button" className="qr-boton-secundario" onClick={onVolver}>
                  Volver al módulo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ PREGUNTA ============
  const item = sesion[indice]

  function respuestaMostrada() {
    if (item.formato === 'mcq') return seleccion != null ? item.opciones[seleccion] : '(sin responder)'
    if (item.formato === 'fill') return fillValue.trim() || '(sin responder)'
    if (item.formato === 'build') return armado.length ? armado.map((i) => item.fragmentos[i]).join(' ') : '(sin responder)'
    const n = item.izq.length
    const correctos = item.izq.filter((_, i) => matchPares[i] === item.pares[i]).length
    return `${correctos}/${n} pares`
  }

  function respuestaCorrectaTexto() {
    if (item.formato === 'mcq') return item.opciones[item.correcta]
    if (item.formato === 'fill') return item.respuesta
    if (item.formato === 'build') return item.fragmentos.join(' ')
    return `${item.izq.length}/${item.izq.length} pares`
  }

  function comprobar() {
    let ok = false
    if (item.formato === 'mcq') {
      if (seleccion == null) return
      ok = seleccion === item.correcta
    } else if (item.formato === 'fill') {
      if (!fillValue.trim()) return
      const val = normalizar(fillValue)
      ok = [item.respuesta, ...(item.alternativas ?? [])].some((a) => normalizar(a) === val)
    } else if (item.formato === 'build') {
      if (armado.length !== item.fragmentos.length) return
      ok = armado.every((idx, pos) => idx === pos)
    } else {
      const n = item.izq.length
      if (Object.keys(matchPares).length < n) return
      ok = item.izq.every((_, i) => matchPares[i] === item.pares[i])
    }
    registrarPracticaParte(perfil.id)
    if (ok) setAciertos((a) => a + 1)
    else setFallos((f) => [...f, { item, tuRespuesta: respuestaMostrada(), correcta: respuestaCorrectaTexto() }])
    setRevelado(true)
    setAcerto(ok)
  }

  function siguiente() {
    const esUltima = indice + 1 >= sesion.length
    if (esUltima && perfil.id !== ID_INVITADO) {
      escribirJSON(claveQuizRapido(perfil.id, moduloId), { fecha: formatoFecha(new Date()), aciertos, total: sesion.length })
    }
    const siguienteIndice = indice + 1
    if (siguienteIndice < sesion.length) cargarPregunta(sesion[siguienteIndice])
    setIndice(siguienteIndice)
  }

  let listo = false
  if (item.formato === 'mcq') listo = seleccion !== null
  else if (item.formato === 'fill') listo = fillValue.trim().length > 0
  else if (item.formato === 'build') listo = armado.length === item.fragmentos.length
  else listo = Object.keys(matchPares).length === item.izq.length

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

      <div className="qr-shell">
        <div className="qr-tabs">
          <div className="qr-tab">
            <span className="qr-tab-dot" />
            Quiz rápido
          </div>
          <div className="qr-tab-modulo">{modulo.nombre}</div>
        </div>
        <div className="qr-sheet">
          <div className="qr-margin" />
          <div className="qr-rules" />
          <div className="qr-content">
            <div className="qr-status">
              <span>
                {indice + 1} / {sesion.length}
              </span>
              <div className="qr-progreso">
                <div className="qr-progreso-relleno" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="qr-aciertos">{aciertos} ✓</span>
            </div>

            <div className="qr-badges">
              <span className="qr-badge">{ETIQUETA_FORMATO[item.formato]}</span>
              {categorias && <span className="qr-badge qr-badge--suave">{etiquetaCategoria(item.categoria, categorias)}</span>}
            </div>

            <p className="qr-enunciado">{item.enunciado}</p>

            {item.formato === 'mcq' && (
              <div className="qr-opciones">
                {item.opciones.map((texto, i) => {
                  let cls = 'qr-opcion'
                  if (revelado) {
                    if (i === item.correcta) cls += ' qr-opcion--correcta'
                    else if (i === seleccion) cls += ' qr-opcion--incorrecta'
                  } else if (i === seleccion) cls += ' qr-opcion--seleccionada'
                  return (
                    <button key={i} type="button" className={cls} disabled={revelado} onClick={() => setSeleccion(i)}>
                      <span className="qr-opcion-letra">{LETRAS[i]}</span>
                      <span className="qr-opcion-texto">{texto}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {item.formato === 'fill' && (
              <div className="qr-fill">
                <p className="qr-fill-frase">
                  {item.antes}{' '}
                  <span className={`qr-fill-hueco${revelado ? (acerto ? ' qr-fill-hueco--correcta' : ' qr-fill-hueco--incorrecta') : ''}`}>
                    {revelado ? item.respuesta : fillValue.trim() || '?'}
                  </span>{' '}
                  {item.despues}
                </p>
                {!revelado && (
                  <input
                    className="qr-fill-input"
                    value={fillValue}
                    onChange={(e) => setFillValue(e.target.value)}
                    placeholder="Escribe tu respuesta…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') comprobar()
                    }}
                  />
                )}
              </div>
            )}

            {item.formato === 'build' && (
              <div className="qr-build">
                <div
                  className={`qr-build-tray${revelado ? (acerto ? ' qr-build-tray--correcta' : ' qr-build-tray--incorrecta') : ''}`}
                >
                  {armado.length === 0 && <span className="qr-build-placeholder">Toca los fragmentos en orden…</span>}
                  {armado.map((fragIdx, pos) => (
                    <button
                      key={pos}
                      type="button"
                      className="qr-chip qr-chip--puesto"
                      disabled={revelado}
                      onClick={() => setArmado((a) => a.filter((_, i) => i !== pos))}
                    >
                      {item.fragmentos[fragIdx]}
                    </button>
                  ))}
                </div>
                {!revelado && (
                  <div className="qr-build-banco">
                    {banco
                      .filter((b) => !armado.includes(b.idx))
                      .map((b) => (
                        <button
                          key={b.idx}
                          type="button"
                          className="qr-chip"
                          onClick={() => setArmado((a) => [...a, b.idx])}
                        >
                          {b.texto}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}

            {item.formato === 'match' && (
              <div className="qr-match">
                <div className="qr-match-col">
                  {item.izq.map((texto, i) => {
                    const tienePar = matchPares[i] !== undefined
                    let cls = 'qr-match-item'
                    if (revelado && tienePar) cls += matchPares[i] === item.pares[i] ? ' qr-match-item--correcta' : ' qr-match-item--incorrecta'
                    else if (matchPendiente === i) cls += ' qr-match-item--pendiente'
                    else if (tienePar) cls += ' qr-match-item--emparejada'
                    return (
                      <button
                        key={i}
                        type="button"
                        className={cls}
                        disabled={revelado || tienePar}
                        onClick={() => setMatchPendiente(i)}
                      >
                        {texto}
                      </button>
                    )
                  })}
                </div>
                <div className="qr-match-col">
                  {matchDer.map(({ texto, idx }) => {
                    const izqKey = Object.keys(matchPares).find((k) => matchPares[k] === idx)
                    const usado = izqKey !== undefined
                    let cls = 'qr-match-item'
                    if (revelado && usado) cls += item.pares[Number(izqKey)] === idx ? ' qr-match-item--correcta' : ' qr-match-item--incorrecta'
                    else if (usado) cls += ' qr-match-item--emparejada'
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={cls}
                        disabled={revelado || usado || matchPendiente === null}
                        onClick={() => {
                          setMatchPares((p) => ({ ...p, [matchPendiente]: idx }))
                          setMatchPendiente(null)
                        }}
                      >
                        {texto}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {revelado && (
              <div className="qr-feedback">
                <p className={`qr-feedback-titulo${acerto ? ' qr-feedback-titulo--ok' : ' qr-feedback-titulo--no'}`}>
                  {acerto ? '¡Correcto!' : 'Casi — revisa esto:'}
                </p>
                <div className="qr-feedback-explicacion">
                  <TextoConNegritas texto={item.explicacion} />
                </div>
              </div>
            )}

            <div className="qr-acciones">
              {!revelado && (
                <button type="button" className="qr-boton-primario" onClick={comprobar} disabled={!listo}>
                  Comprobar
                </button>
              )}
              {revelado && (
                <button type="button" className="qr-boton-primario" onClick={siguiente}>
                  {indice + 1 >= sesion.length ? 'Ver resultado' : 'Siguiente'}
                  <IconoFlechaDerecha size={14} color="#fff" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
