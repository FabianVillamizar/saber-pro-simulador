import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { claveEscritura } from '../engine/clavesPerfil.js'
import { ID_INVITADO } from '../engine/perfiles.js'
import { crearCola, reencolarTrasFallo, retirarTrasAcierto } from '../engine/colaRefuerzo.js'
import { registrarPracticaParte } from '../engine/progreso.js'
import { reproducirSonido } from '../engine/sonido.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { TextoConNegritas } from '../componentes/TextoConNegritas.jsx'
import { IconoCheck, IconoX } from '../componentes/iconos.jsx'
import './EscribeLaRespuesta.css'

const ETIQUETAS_TIPO = {
  vocabulario: 'Vocabulario',
  gramatica: 'Gramática',
  cultura_general: 'Cultura general',
}

const ORDEN_TIPOS = ['vocabulario', 'gramatica', 'cultura_general']

// Recuperación activa en vez de reconocimiento: las mismas tarjetas de
// concepto de RepasoConceptos.jsx (comparten el esquema antes/despues/
// respuesta), pero acá hay que escribir la respuesta antes de verla, no
// solo voltear y leer. La comparación es tolerante a mayúsculas, espacios
// y puntuación final — no a errores de ortografía reales, que es
// justamente lo que se quiere entrenar.
function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"]+$/g, '')
    .replace(/\s+/g, ' ')
}

export function EscribeLaRespuesta({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()

  const [estadisticas, setEstadisticas] = useState(() => leerJSON(claveEscritura(perfil.id, moduloId), {}))
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null)
  const [cola, setCola] = useState(null)
  const [totalInicial, setTotalInicial] = useState(0)
  const [aciertosPrimerIntento, setAciertosPrimerIntento] = useState(0)
  const [valor, setValor] = useState('')
  const [estado, setEstado] = useState(null) // null | 'correcto' | 'incorrecto'

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const tarjetasPorTipo = {}
  for (const t of modulo.tarjetasConcepto) {
    if ('antes' in t && 'respuesta' in t) (tarjetasPorTipo[t.tipo] ??= []).push(t)
  }
  const tiposDisponibles = ORDEN_TIPOS.filter((tipo) => tarjetasPorTipo[tipo]?.length > 0)

  const totalesGlobales = Object.values(estadisticas).reduce(
    (acc, e) => ({ intentos: acc.intentos + e.intentos, aciertos: acc.aciertos + e.aciertos }),
    { intentos: 0, aciertos: 0 }
  )

  function elegirTipo(tipo) {
    const colaInicial = crearCola(tarjetasPorTipo[tipo])
    setTipoSeleccionado(tipo)
    setCola(colaInicial)
    setTotalInicial(colaInicial.length)
    setAciertosPrimerIntento(0)
    setValor('')
    setEstado(null)
  }

  function verificar(e) {
    e.preventDefault()
    if (estado || !valor.trim()) return
    const entrada = cola[0]
    const tarjeta = entrada.valor
    const acierto = normalizar(valor) === normalizar(tarjeta.respuesta)

    const prev = estadisticas[tarjeta.id] ?? { intentos: 0, aciertos: 0 }
    const nuevas = { ...estadisticas, [tarjeta.id]: { intentos: prev.intentos + 1, aciertos: prev.aciertos + (acierto ? 1 : 0) } }
    setEstadisticas(nuevas)
    if (perfil.id !== ID_INVITADO) escribirJSON(claveEscritura(perfil.id, moduloId), nuevas)

    if (acierto && entrada.fallos === 0) setAciertosPrimerIntento((n) => n + 1)
    const { rachaAlcanzadaHoy } = registrarPracticaParte(perfil.id)
    if (rachaAlcanzadaHoy) reproducirSonido(perfil.id, 'racha')

    setEstado(acierto ? 'correcto' : 'incorrecto')
  }

  function siguiente() {
    const entrada = cola[0]
    setCola(estado === 'correcto' ? retirarTrasAcierto(cola, entrada) : reencolarTrasFallo(cola, entrada))
    setValor('')
    setEstado(null)
  }

  // Pantalla 1: elegir tipo de tarjeta
  if (tipoSeleccionado === null) {
    return (
      <div className="page escribe">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={onVolver}>
            ← {modulo.nombre}
          </button>
          <div style={{ flex: 1 }} />
          <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>
        <h1>Escribe la respuesta</h1>
        <p className="escribe-subtitulo">
          Igual que Repaso de conceptos, pero escribes la respuesta antes de verla — recordarla activamente deja más
          huella que solo reconocerla entre opciones.
        </p>
        <div className="escribe-tipos-grid">
          {tiposDisponibles.map((tipo) => {
            const tarjetas = tarjetasPorTipo[tipo]
            const stats = tarjetas.reduce(
              (acc, t) => {
                const e = estadisticas[t.id]
                if (!e) return acc
                return { intentos: acc.intentos + e.intentos, aciertos: acc.aciertos + e.aciertos }
              },
              { intentos: 0, aciertos: 0 }
            )
            return (
              <button key={tipo} type="button" className="escribe-tipo-tarjeta" onClick={() => elegirTipo(tipo)}>
                <span className="escribe-tipo-nombre">{ETIQUETAS_TIPO[tipo] ?? tipo}</span>
                <span className="escribe-tipo-conteo">{tarjetas.length} tarjetas</span>
                {stats.intentos > 0 && (
                  <span className="escribe-tipo-stats">
                    Precisión histórica: {Math.round((stats.aciertos / stats.intentos) * 100)}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {totalesGlobales.intentos > 0 && (
          <p className="escribe-stats-globales">
            {totalesGlobales.aciertos}/{totalesGlobales.intentos} correctas en total ·{' '}
            {Math.round((totalesGlobales.aciertos / totalesGlobales.intentos) * 100)}% de precisión
          </p>
        )}
      </div>
    )
  }

  // Pantalla 3: sesión terminada
  if (cola.length === 0) {
    return (
      <div className="page escribe">
        <div className="barra-superior">
          <button type="button" className="boton-volver" onClick={() => setTipoSeleccionado(null)}>
            ← Elegir otro tipo
          </button>
          <div style={{ flex: 1 }} />
          <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>
        <div className="escribe-fin">
          <h2>Completaste {ETIQUETAS_TIPO[tipoSeleccionado] ?? tipoSeleccionado}</h2>
          <p>
            {aciertosPrimerIntento} de {totalInicial} correctas al primer intento.
          </p>
          <div className="escribe-fin-botones">
            <button type="button" className="boton-primario" onClick={() => elegirTipo(tipoSeleccionado)}>
              Repetir
            </button>
            <button type="button" className="boton-secundario" onClick={() => setTipoSeleccionado(null)}>
              Elegir otro tipo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla 2: practicando
  const entrada = cola[0]
  const tarjeta = entrada.valor
  const dominadas = totalInicial - cola.length

  return (
    <div className="page escribe">
      <div className="barra-superior">
        <button type="button" className="boton-volver" onClick={() => setTipoSeleccionado(null)}>
          ← Elegir otro tipo
        </button>
        <span className="escribe-progreso">
          {dominadas}/{totalInicial} dominadas · {cola.length} en cola
        </span>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="escribe-badges">
        <span className="escribe-badge-nivel">{tarjeta.nivel_mcer}</span>
        <span className="escribe-badge-tipo">{ETIQUETAS_TIPO[tarjeta.tipo] ?? tarjeta.tipo}</span>
      </div>

      <form className="escribe-oracion" onSubmit={verificar}>
        <div className="escribe-oracion-texto">
          {tarjeta.antes}{' '}
          {estado ? (
            <span className={`escribe-respuesta-revelada escribe-respuesta-revelada--${estado}`}>
              {estado === 'correcto' ? valor.trim() : tarjeta.respuesta}
            </span>
          ) : (
            <input
              type="text"
              className="escribe-input"
              value={valor}
              onChange={(ev) => setValor(ev.target.value)}
              placeholder="Escribe la palabra o frase que falta…"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          )}{' '}
          {tarjeta.despues}
        </div>
        {!estado && (
          <button type="submit" className="boton-primario escribe-boton-verificar" disabled={!valor.trim()}>
            Verificar
          </button>
        )}
      </form>

      {estado && (
        <>
          <div className={`escribe-resultado escribe-resultado--${estado}`}>
            <div className="escribe-resultado-titulo">
              {estado === 'correcto' ? (
                <>
                  <IconoCheck color="var(--exito)" /> Correcto
                </>
              ) : (
                <>
                  <IconoX color="oklch(60% 0.16 20)" /> Incorrecto — la respuesta era: {tarjeta.respuesta}
                </>
              )}
            </div>
          </div>

          <div className="escribe-teoria">
            <div className="escribe-seccion-label">Regla</div>
            <div className="escribe-seccion-texto">
              <TextoConNegritas texto={tarjeta.regla} />
            </div>
            <div className="escribe-seccion-label escribe-seccion-label--accent">Ejemplo</div>
            <div className="escribe-seccion-texto">
              <TextoConNegritas texto={tarjeta.ejemplo} />
            </div>
            {estado === 'incorrecto' && tarjeta.error_comun && (
              <>
                <div className="escribe-seccion-label escribe-seccion-label--warn">Error común</div>
                <div className="escribe-seccion-texto">
                  <TextoConNegritas texto={tarjeta.error_comun} />
                </div>
              </>
            )}
          </div>

          <button type="button" className="boton-primario escribe-boton-siguiente" onClick={siguiente}>
            Siguiente
          </button>
        </>
      )}
    </div>
  )
}
