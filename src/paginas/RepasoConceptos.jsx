import { useEffect, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { ID_INVITADO } from '../engine/perfiles.js'
import { estadoInicial, siguienteEstado, estaLista } from '../engine/srs.js'
import { crearCola, reencolarTrasFallo, retirarTrasAcierto } from '../engine/colaRefuerzo.js'
import { registrarRepaso } from '../engine/progreso.js'
import { reproducirSonido } from '../engine/sonido.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { TarjetaFlip } from '../componentes/TarjetaFlip.jsx'
import { TextoConNegritas } from '../componentes/TextoConNegritas.jsx'
import { Formula } from '../componentes/Formula.jsx'
import { VisualCientifico } from '../componentes/VisualCientifico.jsx'
import { IconoChevronIzquierdo, IconoFlechaCircular, IconoBombilla } from '../componentes/iconos.jsx'
import './RepasoConceptos.css'

const ETIQUETAS_TIPO = {
  vocabulario: 'Vocabulario',
  gramatica: 'Gramática',
  cultura_general: 'Cultura general',
}

// Lectura Crítica — LC-CUL (cultura general): única tarjeta del sistema sin
// `competencia_asociada` ni `error_comun` (ver esCultura más abajo). La
// categoría reemplaza a la competencia como badge del frente.
const ETIQUETAS_CATEGORIA_CUL = {
  mitologia_grecolatina: 'Mitología grecolatina',
  referencias_biblicas: 'Referencias bíblicas',
  filosofia: 'Filosofía',
  literatura_universal: 'Literatura universal',
  literatura_colombiana_latinoamericana: 'Literatura colombiana y latinoamericana',
  expresiones_de_origen_literario: 'Expresiones de origen literario',
}

const ETIQUETAS_DIFICULTAD = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
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
    if (perfil.id !== ID_INVITADO) escribirJSON(claveSRS(perfil.id, moduloId), nuevosEstados)

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
  // Tres esquemas de tarjeta de concepto: cloze (antes/despues/respuesta,
  // de Inglés), pregunta directa (pregunta/respuesta_breve, de
  // Competencias Ciudadanas) y científica (Pensamiento Científico, que
  // unifica ambos frentes bajo un solo campo `modo` por tarjeta — no por
  // módulo completo, porque los mismos archivos mezclan tarjetas cloze y
  // de pregunta). Se detectan por presencia de campos, no por `tipo` (que
  // en CC y PC siempre vale "concepto").
  const esCientifica = 'modo' in tarjeta
  const esCloze = esCientifica ? tarjeta.modo === 'cloze' : 'antes' in tarjeta
  // LC-CUL (cultura general) es la única variante sin `competencia_asociada`
  // ni `error_comun`: categoria/pregunta/respuesta_breve/explicacion/
  // ejemplo_aplicado únicamente — reverso de 2 secciones en vez de 3.
  const esCultura = !esCientifica && !esCloze && 'categoria' in tarjeta

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
          frente={
            esCientifica ? (
              <>
                <div className="repaso-badges">
                  <span className={`repaso-badge-dificultad repaso-badge-dificultad--${tarjeta.dificultad}`}>
                    {ETIQUETAS_DIFICULTAD[tarjeta.dificultad] ?? tarjeta.dificultad}
                  </span>
                  <span className="repaso-badge-tipo">
                    {modulo.categorias?.[tarjeta.afirmacion_asociada] ?? tarjeta.afirmacion_asociada ?? tarjeta.bloque}
                  </span>
                </div>

                {tarjeta.visual_posicion === 'frente' && (
                  <div className="repaso-visual">
                    <VisualCientifico
                      tipo={tarjeta.tipo_visual}
                      descripcion={tarjeta.visual_descripcion}
                      graficaDatos={tarjeta.grafica_datos_estructurados}
                      tablaDatos={tarjeta.tabla_filas}
                      imagen={tarjeta.imagen}
                    />
                  </div>
                )}

                <div className="repaso-cloze">
                  <div>
                    <div className="repaso-cloze-texto">
                      {esCloze ? (
                        <>
                          {tarjeta.antes}{' '}
                          <span className="repaso-cloze-hueco" />{' '}
                          {tarjeta.despues}
                        </>
                      ) : (
                        tarjeta.pregunta
                      )}
                    </div>
                    {tarjeta.formula_latex && (
                      <div className="repaso-formula">
                        <Formula tex={tarjeta.formula_latex} bloque />
                      </div>
                    )}
                  </div>
                </div>

                <div className="repaso-hint">
                  <IconoFlechaCircular color="var(--text-faint)" />
                  Toca para ver la explicación
                </div>
              </>
            ) : esCloze ? (
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
            ) : esCultura ? (
              <>
                <div className="repaso-badges">
                  <span className="repaso-badge-nivel">
                    {ETIQUETAS_CATEGORIA_CUL[tarjeta.categoria] ?? tarjeta.categoria}
                  </span>
                </div>
                <div className="repaso-cloze">
                  <div className="repaso-cloze-texto">{tarjeta.pregunta}</div>
                </div>
                <div className="repaso-hint">
                  <IconoFlechaCircular color="var(--text-faint)" />
                  Toca para ver la explicación
                </div>
              </>
            ) : (
              <>
                <div className="repaso-badges">
                  <span className="repaso-badge-nivel">
                    {modulo.categorias?.[tarjeta.competencia_asociada] ?? tarjeta.competencia_asociada}
                  </span>
                </div>
                <div className="repaso-cloze">
                  <div className="repaso-cloze-texto">{tarjeta.pregunta}</div>
                </div>
                <div className="repaso-hint">
                  <IconoFlechaCircular color="var(--text-faint)" />
                  Toca para ver la explicación
                </div>
              </>
            )
          }
          reverso={
            esCientifica ? (
              <>
                <div className="repaso-reverso-cabecera">
                  <span
                    className={`repaso-badge-dificultad repaso-badge-dificultad--chico repaso-badge-dificultad--${tarjeta.dificultad}`}
                  >
                    {ETIQUETAS_DIFICULTAD[tarjeta.dificultad] ?? tarjeta.dificultad}
                  </span>
                  <div className="repaso-reverso-oracion">
                    {esCloze ? (
                      <>
                        {tarjeta.antes}{' '}
                        <span className="repaso-reverso-respuesta">{tarjeta.respuesta}</span>{' '}
                        {tarjeta.despues}
                      </>
                    ) : (
                      <span className="repaso-reverso-respuesta">{tarjeta.respuesta}</span>
                    )}
                  </div>
                </div>

                {tarjeta.visual_posicion === 'reverso' && (
                  <div className="repaso-visual">
                    <VisualCientifico
                      tipo={tarjeta.tipo_visual}
                      descripcion={tarjeta.visual_descripcion}
                      graficaDatos={tarjeta.grafica_datos_estructurados}
                      tablaDatos={tarjeta.tabla_filas}
                      imagen={tarjeta.imagen}
                    />
                  </div>
                )}

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

                {tarjeta.conexion_cotidiana && (
                  <div className="repaso-cotidiana">
                    <IconoBombilla color="var(--exito)" />
                    <div>
                      <div className="repaso-seccion-label repaso-seccion-label--exito">Conexión con la vida diaria</div>
                      <div className="repaso-cotidiana-texto">
                        <TextoConNegritas texto={tarjeta.conexion_cotidiana} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : esCloze ? (
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
            ) : esCultura ? (
              <>
                <div className="repaso-reverso-cabecera">
                  <div className="repaso-reverso-oracion repaso-reverso-respuesta">{tarjeta.respuesta_breve}</div>
                </div>

                <div>
                  <div className="repaso-seccion-label">Explicación</div>
                  <div className="repaso-seccion-texto">
                    <TextoConNegritas texto={tarjeta.explicacion} />
                  </div>
                </div>

                <div className="repaso-ejemplo">
                  <div className="repaso-seccion-label repaso-seccion-label--accent">Ejemplo aplicado</div>
                  <div className="repaso-ejemplo-texto">
                    <TextoConNegritas texto={tarjeta.ejemplo_aplicado} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="repaso-reverso-cabecera">
                  <div className="repaso-reverso-oracion repaso-reverso-respuesta">{tarjeta.respuesta_breve}</div>
                </div>

                <div>
                  <div className="repaso-seccion-label">Explicación</div>
                  <div className="repaso-seccion-texto">
                    <TextoConNegritas texto={tarjeta.explicacion} />
                  </div>
                </div>

                <div className="repaso-ejemplo">
                  <div className="repaso-seccion-label repaso-seccion-label--accent">Ejemplo aplicado</div>
                  <div className="repaso-ejemplo-texto">
                    <TextoConNegritas texto={tarjeta.ejemplo_aplicado} />
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
            )
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
