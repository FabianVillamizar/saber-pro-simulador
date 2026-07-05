import { useEffect, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { estadoInicial, siguienteEstado, estaLista } from '../engine/srs.js'
import { crearCola, reencolarTrasFallo, retirarTrasAcierto } from '../engine/colaRefuerzo.js'
import { registrarRepaso } from '../engine/progreso.js'
import { reproducirSonido } from '../engine/sonido.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { TarjetaFlip } from '../componentes/TarjetaFlip.jsx'
import { TextoConNegritas } from '../componentes/TextoConNegritas.jsx'
import { IconoChevronIzquierdo, IconoFlechaCircular } from '../componentes/iconos.jsx'
import './RepasoConceptos.css'

const ETIQUETAS_TIPO = {
  vocabulario: 'Vocabulario',
  gramatica: 'Gramática',
  cultura_general: 'Cultura general',
}

const BOTONES_EVAL = [
  { calificacion: 'otra_vez', etiqueta: 'Otra vez', intervalo: '< 10 min', clase: 'otra_vez' },
  { calificacion: 'dificil', etiqueta: 'Difícil', intervalo: '1 día', clase: 'dificil' },
  { calificacion: 'bien', etiqueta: 'Bien', intervalo: '3 días', clase: 'bien' },
  { calificacion: 'facil', etiqueta: 'Fácil', intervalo: '6 días', clase: 'facil' },
]

export function RepasoConceptos({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [estadosSRS, setEstadosSRS] = useState(() => leerJSON(claveSRS(perfil.id, moduloId), {}))
  const [cola, setCola] = useState(null)
  const [totalInicial, setTotalInicial] = useState(0)
  const [volteada, setVolteada] = useState(false)
  const [revisadasHoy, setRevisadasHoy] = useState(0)

  // Solo se recalcula cuando cambia el módulo cargado: la cola de la
  // sesión no debe reordenarse cada vez que cambian los estados SRS
  // mientras se está respondiendo.
  useEffect(() => {
    if (!modulo) return
    const pendientes = modulo.tarjetasConcepto.filter((t) => estaLista(estadosSRS[t.id]))
    const colaInicial = crearCola(pendientes)
    setCola(colaInicial)
    setTotalInicial(colaInicial.length)
  }, [modulo])

  if (cargando || cola === null) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  function calificar(calificacion) {
    const entrada = cola[0]
    const tarjeta = entrada.valor
    const estadoActual = estadosSRS[tarjeta.id] ?? estadoInicial()
    const nuevoEstado = siguienteEstado(estadoActual, calificacion)
    const nuevosEstados = { ...estadosSRS, [tarjeta.id]: nuevoEstado }

    setEstadosSRS(nuevosEstados)
    escribirJSON(claveSRS(perfil.id, moduloId), nuevosEstados)

    if (calificacion === 'bien' || calificacion === 'facil') reproducirSonido(perfil.id, 'tarjeta')
    const { rachaAlcanzadaHoy } = registrarRepaso(perfil.id)
    if (rachaAlcanzadaHoy) reproducirSonido(perfil.id, 'racha')

    // Voltea de vuelta al frente ya mismo; el contenido recién cambia
    // ~550ms después, a mitad del flip de 600ms — mismo loop que Anki.
    setVolteada(false)
    setTimeout(() => {
      setRevisadasHoy((n) => n + 1)
      setCola(calificacion === 'otra_vez' ? reencolarTrasFallo(cola, entrada) : retirarTrasAcierto(cola, entrada))
    }, 550)
  }

  if (cola.length === 0) {
    return (
      <div className="page">
        <div className="barra-superior">
          <button type="button" className="boton-icono" onClick={onVolver}>
            <IconoChevronIzquierdo color="var(--text-sub)" />
          </button>
          <div style={{ flex: 1 }} />
          <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        </div>
        <div className="repaso-fin">
          <h2>Por hoy no quedan tarjetas pendientes</h2>
          <p>Revisaste {revisadasHoy} tarjetas en esta sesión.</p>
        </div>
      </div>
    )
  }

  const tarjeta = cola[0].valor
  const remaining = cola.length
  const progressPct = totalInicial ? Math.min(100, Math.round((revisadasHoy / totalInicial) * 100)) : 0

  return (
    <div className="repaso">
      <div className="repaso-topbar">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="repaso-titulo">
          <div className="repaso-titulo-modulo">{modulo.nombre}</div>
          <div className="repaso-titulo-sub">Repaso de tarjetas</div>
        </div>
        <div className="repaso-barra">
          <div className="repaso-barra-relleno" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="repaso-restantes">{remaining} restantes</div>
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="repaso-escenario">
        <TarjetaFlip
          volteada={volteada}
          onClick={() => setVolteada((v) => !v)}
          alturaPx={340}
          frente={
            <>
              <div className="repaso-badges">
                <span className="repaso-badge-nivel">{tarjeta.nivel_mcer}</span>
                <span className="repaso-badge-tipo">{ETIQUETAS_TIPO[tarjeta.tipo] ?? tarjeta.tipo}</span>
              </div>
              <div className="repaso-cloze">
                <div className="repaso-cloze-texto">
                  {tarjeta.antes}{' '}
                  <span className="repaso-cloze-hueco" />{' '}
                  {tarjeta.despues}
                </div>
              </div>
              <div className="repaso-hint">
                <IconoFlechaCircular color="var(--text-faint)" />
                Toca para ver la explicación
              </div>
            </>
          }
          reverso={
            <>
              <div className="repaso-reverso-cabecera">
                <span className="repaso-badge-nivel repaso-badge-nivel--chico">{tarjeta.nivel_mcer}</span>
                <div className="repaso-reverso-oracion">
                  {tarjeta.antes}{' '}
                  <span className="repaso-reverso-respuesta">{tarjeta.respuesta}</span>{' '}
                  {tarjeta.despues}
                </div>
              </div>

              <div>
                <div className="repaso-seccion-label">Regla</div>
                <div className="repaso-seccion-texto">
                  <TextoConNegritas texto={tarjeta.regla} />
                </div>
              </div>

              <div className="repaso-ejemplo">
                <div className="repaso-seccion-label repaso-seccion-label--accent">Ejemplo</div>
                <div className="repaso-ejemplo-texto">
                  <TextoConNegritas texto={tarjeta.ejemplo} />
                </div>
              </div>

              <div className="repaso-error">
                <span className="repaso-error-icono" />
                <div>
                  <div className="repaso-seccion-label repaso-seccion-label--warn">Error común</div>
                  <div className="repaso-error-texto">
                    <TextoConNegritas texto={tarjeta.error_comun} />
                  </div>
                </div>
              </div>
            </>
          }
        />
      </div>

      <div className={`repaso-eval${volteada ? ' repaso-eval--activo' : ''}`}>
        {BOTONES_EVAL.map((b) => (
          <button
            key={b.calificacion}
            type="button"
            className={`repaso-eval-boton repaso-eval-boton--${b.clase}`}
            onClick={() => calificar(b.calificacion)}
          >
            <span className="repaso-eval-etiqueta">{b.etiqueta}</span>
            <span className="repaso-eval-intervalo">{b.intervalo}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
