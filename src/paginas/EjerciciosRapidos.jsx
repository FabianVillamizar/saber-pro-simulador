import { useEffect, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { claveEjercicios } from '../engine/clavesPerfil.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo, IconoReloj } from '../componentes/iconos.jsx'
import './EjerciciosRapidos.css'

const INTRODUCCION_SEGUNDOS = 180

const CHECKLIST_INTRODUCCION = [
  { id: 'postura', texto: 'Mi primera o segunda frase ya deja clara mi postura, no solo el tema.' },
  { id: 'especifico', texto: 'Esa postura responde la pregunta exacta, no el tema en general.' },
  { id: 'sin_evasion', texto: 'No es un "depende" vago — si tomé un término medio, digo bajo qué condición.' },
  { id: 'formal', texto: 'Usé un registro formal, sin muletillas orales ("o sea", "digamos que").' },
]

function barajar(items) {
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function formatoTiempo(segundosTotales) {
  const m = Math.floor(segundosTotales / 60)
  const s = segundosTotales % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Normaliza los dos tipos de ejercicio a la misma forma de opciones para el
// render y el manejo de clic: cloze trae un array de strings + `respuesta`
// suelta, elección ya trae objetos `{texto, correcta}` — ambos terminan en
// `{texto, correcta}[]` para que el resto del componente no necesite saber
// cuál de los dos está mostrando.
function opcionesDe(item) {
  if (item.ejercicio === 'cloze') {
    return item.opciones.map((texto) => ({ texto, correcta: texto === item.respuesta }))
  }
  return item.opciones
}

export function EjerciciosRapidos({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()

  // hub | drill | drill-fin | intro-elegir | intro-escribiendo | intro-revision
  const [fase, setFase] = useState('hub')

  const [estadisticas, setEstadisticas] = useState(() => leerJSON(claveEjercicios(perfil.id), {}))
  const [cola, setCola] = useState([])
  const [indice, setIndice] = useState(0)
  const [seleccion, setSeleccion] = useState(null)
  const [aciertosSesion, setAciertosSesion] = useState(0)

  const [temaIntroId, setTemaIntroId] = useState(null)
  const [textoIntro, setTextoIntro] = useState('')
  const [segundosIntro, setSegundosIntro] = useState(INTRODUCCION_SEGUNDOS)
  const [checklistMarcado, setChecklistMarcado] = useState({})

  // setTimeout encadenado, mismo patrón que PracticarEnsayo.jsx/Simulacro.jsx
  // para no acumular drift ni quedar con un closure desactualizado.
  useEffect(() => {
    if (fase !== 'intro-escribiendo') return
    if (segundosIntro <= 0) {
      setFase('intro-revision')
      return
    }
    const id = setTimeout(() => setSegundosIntro((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [fase, segundosIntro])

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const dominioOrden = [...new Set(modulo.temasEnsayo.map((t) => t.dominio))]
  const grupos = dominioOrden.map((dominio) => ({
    dominio,
    etiqueta: modulo.dominios?.[dominio] ?? dominio,
    temas: modulo.temasEnsayo.filter((t) => t.dominio === dominio),
  }))

  const totalesGlobales = Object.values(estadisticas).reduce(
    (acc, e) => ({ intentos: acc.intentos + e.intentos, aciertos: acc.aciertos + e.aciertos }),
    { intentos: 0, aciertos: 0 }
  )

  function iniciarDrill() {
    setCola(barajar(modulo.ejercicios))
    setIndice(0)
    setSeleccion(null)
    setAciertosSesion(0)
    setFase('drill')
  }

  function responder(opcion) {
    if (seleccion) return
    setSeleccion(opcion)
    const item = cola[indice]
    const prev = estadisticas[item.id] ?? { intentos: 0, aciertos: 0 }
    const nuevas = {
      ...estadisticas,
      [item.id]: { intentos: prev.intentos + 1, aciertos: prev.aciertos + (opcion.correcta ? 1 : 0) },
    }
    setEstadisticas(nuevas)
    escribirJSON(claveEjercicios(perfil.id), nuevas)
    if (opcion.correcta) setAciertosSesion((a) => a + 1)
  }

  function siguienteDrill() {
    if (indice + 1 >= cola.length) {
      setFase('drill-fin')
      return
    }
    setIndice((i) => i + 1)
    setSeleccion(null)
  }

  function elegirTemaIntro(id) {
    setTemaIntroId(id)
    setTextoIntro('')
    setSegundosIntro(INTRODUCCION_SEGUNDOS)
    setChecklistMarcado({})
    setFase('intro-escribiendo')
  }

  const item = fase === 'drill' ? cola[indice] : null
  const opciones = item ? opcionesDe(item) : []
  const temaIntro = modulo.temasEnsayo.find((t) => t.id === temaIntroId) ?? null
  const modeloIntro = modulo.ensayosModelo.find((m) => m.tema_id === temaIntroId) ?? null
  const parrafoModelo = modeloIntro ? modeloIntro.texto.split('\n\n')[0] : null

  return (
    <div className="page ejercicios-rapidos">
      <div className="barra-superior">
        <button
          type="button"
          className="boton-icono"
          onClick={() => (fase === 'hub' ? onVolver() : setFase('hub'))}
        >
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="ejercicios-rapidos-titulo">
          <div className="ejercicios-rapidos-titulo-modulo">{modulo.nombre}</div>
          <div className="ejercicios-rapidos-titulo-sub">Ejercicios rápidos</div>
        </div>
        <div style={{ flex: 1 }} />
        {fase === 'intro-escribiendo' && (
          <div className="ejercicios-rapidos-timer">
            <IconoReloj color="var(--accent)" />
            <span>{formatoTiempo(segundosIntro)}</span>
          </div>
        )}
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      {fase === 'hub' && (
        <div className="ejercicios-rapidos-hub">
          <p className="ejercicios-rapidos-info">
            Práctica corta entre la teoría y el ensayo completo — sin cronómetro de 40 minutos.
          </p>
          <div className="ejercicios-rapidos-modos">
            <div className="ejercicios-rapidos-modo">
              <div className="ejercicios-rapidos-modo-titulo">Conectores y ortografía</div>
              <div className="ejercicios-rapidos-modo-desc">
                {modulo.ejercicios.length} ejercicios de opción múltiple con corrección inmediata.
              </div>
              {totalesGlobales.intentos > 0 && (
                <div className="ejercicios-rapidos-modo-stats">
                  Precisión histórica: {Math.round((totalesGlobales.aciertos / totalesGlobales.intentos) * 100)}% (
                  {totalesGlobales.aciertos}/{totalesGlobales.intentos})
                </div>
              )}
              <button type="button" className="boton-primario" onClick={iniciarDrill}>
                Empezar
              </button>
            </div>

            <div className="ejercicios-rapidos-modo">
              <div className="ejercicios-rapidos-modo-titulo">Introducción exprés</div>
              <div className="ejercicios-rapidos-modo-desc">
                Elige un tema y escribe solo la introducción (tema + postura) en 3 minutos — luego compárala con el
                ensayo modelo real.
              </div>
              <button type="button" className="boton-primario" onClick={() => setFase('intro-elegir')}>
                Empezar
              </button>
            </div>
          </div>
        </div>
      )}

      {fase === 'drill' && item && (
        <div className="ejercicios-rapidos-drill">
          <div className="ejercicios-rapidos-progreso">
            {indice + 1} / {cola.length} · Aciertos: {aciertosSesion}
          </div>

          {item.ejercicio === 'cloze' ? (
            <div className="ejercicios-rapidos-cloze">
              {item.antes && <span>{item.antes} </span>}
              <span className="ejercicios-rapidos-hueco">
                {seleccion ? seleccion.texto : '＿＿＿＿＿'}
              </span>
              {item.despues && <span> {item.despues}</span>}
            </div>
          ) : (
            <div className="ejercicios-rapidos-pregunta">{item.pregunta}</div>
          )}

          <div className="ejercicios-rapidos-opciones">
            {opciones.map((op) => {
              const esElegida = seleccion?.texto === op.texto
              let clase = 'ejercicios-rapidos-opcion'
              if (seleccion) {
                if (op.correcta) clase += ' ejercicios-rapidos-opcion--correcta'
                else if (esElegida) clase += ' ejercicios-rapidos-opcion--incorrecta'
              }
              return (
                <button key={op.texto} type="button" className={clase} onClick={() => responder(op)}>
                  {op.texto}
                </button>
              )
            })}
          </div>

          {seleccion && (
            <>
              <div className="ejercicios-rapidos-explicacion">
                <div className="ejercicios-rapidos-explicacion-titulo">
                  {seleccion.correcta ? '✓ Correcto' : '✗ La respuesta correcta está resaltada arriba'}
                </div>
                <div className="ejercicios-rapidos-explicacion-texto">{item.explicacion}</div>
              </div>
              <button type="button" className="boton-primario" onClick={siguienteDrill}>
                {indice + 1 >= cola.length ? 'Ver resultado →' : 'Siguiente →'}
              </button>
            </>
          )}
        </div>
      )}

      {fase === 'drill-fin' && (
        <div className="ejercicios-rapidos-fin">
          <h2>
            {aciertosSesion} / {cola.length}
          </h2>
          <p>Aciertos en esta sesión.</p>
          <div className="ejercicios-rapidos-fin-botones">
            <button type="button" className="boton-primario" onClick={iniciarDrill}>
              Repetir
            </button>
            <button type="button" className="boton-secundario" onClick={() => setFase('hub')}>
              Volver
            </button>
          </div>
        </div>
      )}

      {fase === 'intro-elegir' && (
        <div className="ejercicios-rapidos-select">
          <p className="ejercicios-rapidos-info">Elige un tema — tendrás 3 minutos solo para la introducción.</p>
          <div className="ejercicios-rapidos-grupos">
            {grupos.map((grupo) => (
              <div key={grupo.dominio}>
                <div className="ejercicios-rapidos-grupo-label">{grupo.etiqueta}</div>
                <div className="ejercicios-rapidos-grupo-lista">
                  {grupo.temas.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="ejercicios-rapidos-tema"
                      onClick={() => elegirTemaIntro(t.id)}
                    >
                      {t.pregunta}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fase === 'intro-escribiendo' && temaIntro && (
        <div className="ejercicios-rapidos-intro">
          <div className="ejercicios-rapidos-contexto">
            <p className="ejercicios-rapidos-contexto-texto">{temaIntro.contexto}</p>
            <p className="ejercicios-rapidos-contexto-pregunta">{temaIntro.pregunta}</p>
          </div>
          <textarea
            className="ejercicios-rapidos-textarea"
            value={textoIntro}
            onChange={(e) => setTextoIntro(e.target.value)}
            placeholder="Escribe solo la introducción: tema + tu postura explícita…"
            autoFocus
          />
          <button type="button" className="boton-primario" onClick={() => setFase('intro-revision')}>
            Terminar y revisar →
          </button>
        </div>
      )}

      {fase === 'intro-revision' && temaIntro && (
        <div className="ejercicios-rapidos-revision">
          <div className="ejercicios-rapidos-revision-label">Tu introducción</div>
          <div className="ejercicios-rapidos-revision-texto">
            {textoIntro.trim() || <em>No escribiste nada.</em>}
          </div>

          <div className="ejercicios-rapidos-checklist">
            <div className="ejercicios-rapidos-revision-label">Autoevalúa</div>
            {CHECKLIST_INTRODUCCION.map((c) => (
              <label key={c.id} className="ejercicios-rapidos-checklist-item">
                <input
                  type="checkbox"
                  checked={!!checklistMarcado[c.id]}
                  onChange={() => setChecklistMarcado((m) => ({ ...m, [c.id]: !m[c.id] }))}
                />
                {c.texto}
              </label>
            ))}
          </div>

          {parrafoModelo && (
            <div className="ejercicios-rapidos-modelo">
              <div className="ejercicios-rapidos-revision-label">Así empieza el ensayo modelo de este tema</div>
              <div className="ejercicios-rapidos-modelo-texto">{parrafoModelo}</div>
            </div>
          )}

          <div className="ejercicios-rapidos-fin-botones">
            <button type="button" className="boton-primario" onClick={() => setFase('intro-elegir')}>
              Otro tema
            </button>
            <button type="button" className="boton-secundario" onClick={() => setFase('hub')}>
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
