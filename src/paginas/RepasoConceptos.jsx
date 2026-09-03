import { useEffect, useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { ID_INVITADO } from '../engine/perfiles.js'
import { estadoInicial, siguienteEstado, estaLista, prerequisitosCumplidos } from '../engine/srs.js'
import { leccionesDesbloqueadas } from '../engine/progresoFrances.js'
import { crearCola, reencolarTrasFallo, retirarTrasAcierto } from '../engine/colaRefuerzo.js'
import { registrarRepaso } from '../engine/progreso.js'
import { reproducirSonido } from '../engine/sonido.js'
import { indiceModulos } from '../engine/indiceModulos.js'
import { esVisibleParaPerfil } from '../engine/accesoModulo.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { TarjetaFlip } from '../componentes/TarjetaFlip.jsx'
import { TextoConNegritas } from '../componentes/TextoConNegritas.jsx'
import { ReglasProvider, TextoConReglas } from '../componentes/TextoConReglas.jsx'
import { Formula } from '../componentes/Formula.jsx'
import { VisualCientifico } from '../componentes/VisualCientifico.jsx'
import { FraseConTokens } from '../componentes/FraseConTokens.jsx'
import { LeyendaFrances, useLeyendaFrances } from '../componentes/LeyendaFrances.jsx'
import { numeroFrances } from '../engine/numerosFrances.js'
import { IconoChevronIzquierdo, IconoFlechaCircular, IconoBombilla } from '../componentes/iconos.jsx'
import '../estilos/frances.css'
import './RepasoConceptos.css'

const ETIQUETAS_TIPO = {
  vocabulario: 'Vocabulario',
  gramatica: 'Gramática',
  cultura_general: 'Cultura general',
}

// Francés (Assimil) — badge secundario del frente: tipo de tarjeta dentro
// del módulo (no confundir con ETIQUETAS_TIPO, que es del esquema cloze
// de Inglés). Ver esFrances más abajo.
const ETIQUETAS_TIPO_FRANCES = {
  dialogo: 'Diálogo',
  gramatica: 'Gramática',
  cultura: 'Cultura e historia',
  pronunciacion: 'Pronunciación',
}

// Pestañas de categoría del mockup original (Downloads/SIMULADOR/FRANCES/
// Francés - Tarjeta de Repaso.dc.html) — practicar un solo tipo a la vez en
// vez de la mezcla completa. Etiqueta corta, distinta de
// ETIQUETAS_TIPO_FRANCES ("Cultura" vs "Cultura e historia" del badge).
const ETIQUETAS_TAB_FRANCES = {
  dialogo: 'Diálogo',
  gramatica: 'Gramática',
  cultura: 'Cultura',
  pronunciacion: 'Pronunciación',
}
const ORDEN_TIPOS_FRANCES = ['dialogo', 'gramatica', 'cultura', 'pronunciacion']

// Inglés — pestañas de nivel MCER (A1-B2) del repaso general, análogas a
// ORDEN_TIPOS_FRANCES pero sobre `nivel_mcer` en vez de `tipo`: ningún otro
// módulo tiene este campo, así que la pestaña solo aplica acá.
const ORDEN_NIVELES_INGLES = ['A1', 'A2', 'B1', 'B2']

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

// `connects_to` en las tarjetas científicas tiene dos formas históricas:
// un código de bloque suelto ("ELL", "parte_IV"), que es metadata
// informativa dentro del mismo tema, y la forma cruzada "modulo:bloque"
// ("diosgenina:ELL"), que sí apunta a otro módulo. Solo la segunda se
// convierte en un chip navegable; la primera se ignora. Se descarta el
// destino si el módulo no existe o el perfil no puede verlo.
function enlacesCruzados(connectsTo, moduloActual, perfil) {
  if (!Array.isArray(connectsTo)) return []
  return connectsTo
    .map((crudo) => {
      const sep = String(crudo).indexOf(':')
      if (sep === -1) return null
      const destinoId = crudo.slice(0, sep)
      const bloque = crudo.slice(sep + 1)
      if (!destinoId || !bloque || destinoId === moduloActual) return null
      const destino = indiceModulos[destinoId]
      if (!destino || !esVisibleParaPerfil(destinoId, perfil)) return null
      return {
        moduloId: destinoId,
        bloque,
        nombre: destino.nombre,
        bloqueLabel: destino.categorias?.[bloque] ?? bloque,
      }
    })
    .filter(Boolean)
}

export function RepasoConceptos({
  moduloId,
  leccion,
  categoriaFiltro,
  bloquesFiltro,
  perfil,
  onCambiarPerfil,
  onVolver,
  onIrACompletaFrase,
  onIrATraduce,
  onIrAModuloBloque,
}) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const esModuloFrances = moduloId === 'frances'
  const esModuloIngles = moduloId === 'ingles'
  const leyenda = useLeyendaFrances(esModuloFrances)
  const [estadosSRS, setEstadosSRS] = useState(() => leerJSON(claveSRS(perfil.id, moduloId), {}))
  const [cola, setCola] = useState(null)
  const [totalInicial, setTotalInicial] = useState(0)
  const [volteada, setVolteada] = useState(false)
  const [revisadasHoy, setRevisadasHoy] = useState(0)
  const [tipoFiltro, setTipoFiltro] = useState(null)
  const [nivelFiltro, setNivelFiltro] = useState(null)

  // Solo se recalcula cuando cambia el módulo cargado, la lección elegida
  // o la pestaña de tipo: la cola de la sesión no debe reordenarse cada
  // vez que cambian los estados SRS mientras se está respondiendo.
  // Con `leccion` (viene del Mapa del curso, ver MapaDelCurso.jsx) o con
  // `categoriaFiltro`/`bloquesFiltro` (vienen de las vistas de exploración
  // por módulo — ExploracionCompetencias.jsx, ExploracionLecturaCritica.jsx
  // — ver <modulo>/exploracion.js de cada una): se repasan TODAS las
  // tarjetas de esa selección, sin importar si el SRS las marca como
  // vencidas — el usuario la eligió a propósito, no está pidiendo el
  // repaso general del día. `bloquesFiltro` compara contra `t.bloque ??
  // t.subtema ?? t.categoria` porque cada módulo nombra distinto el campo
  // que agrupa sus tarjetas (bloque en CC/Inglés, subtema en Lectura
  // Crítica, categoria en LC-CUL) — una tarjeta nunca tiene más de uno de
  // los tres, así que el fallback no puede chocar. `tipoFiltro` (pestañas
  // Diálogo/Gramática/Cultura/Pronunciación, solo francés) y `nivelFiltro` (pestañas A1-B2,
  // solo inglés) son distintos: siguen respetando el vencimiento SRS, son
  // una vista más angosta del repaso diario, no una selección explícita.
  // Los prerrequisitos (`prerequisitosCumplidos`, ver srs.js — una tarjeta
  // con `prereqs` no aparece hasta acertar al menos una vez cada
  // prerrequisito; sin prereqs es un no-op) sí aplican siempre, incluso
  // con selección explícita — elegir una competencia a propósito no debería
  // saltarse sus propios fundamentos. Sin selección explícita Y en
  // francés, además se excluyen las lecciones que el Mapa del curso
  // todavía marca como bloqueadas (mismo cálculo, ver progresoFrances.js)
  // — si no, "Repasar ahora" mostraría tarjetas de lecciones que el propio
  // Mapa dice que no se pueden abrir todavía.
  useEffect(() => {
    if (!modulo) return
    const abiertas = esModuloFrances ? leccionesDesbloqueadas(modulo.tarjetasConcepto, estadosSRS) : null
    const eligioExplicito = leccion != null || categoriaFiltro != null || bloquesFiltro != null
    const pendientes = modulo.tarjetasConcepto.filter((t) => {
      if (leccion != null && t.leccion !== leccion) return false
      if (tipoFiltro && t.tipo !== tipoFiltro) return false
      if (nivelFiltro && t.nivel_mcer !== nivelFiltro) return false
      if (categoriaFiltro && t.competencia_asociada !== categoriaFiltro) return false
      if (bloquesFiltro && !bloquesFiltro.includes(t.bloque ?? t.subtema ?? t.categoria)) return false
      if (!prerequisitosCumplidos(t, estadosSRS)) return false
      if (!eligioExplicito) {
        if (!estaLista(estadosSRS[t.id])) return false
        if (abiertas && !abiertas.has(t.leccion)) return false
      }
      return true
    })
    const colaInicial = crearCola(pendientes)
    setCola(colaInicial)
    setTotalInicial(colaInicial.length)
    setRevisadasHoy(0)
  }, [modulo, leccion, tipoFiltro, nivelFiltro, categoriaFiltro, bloquesFiltro])

  if (cargando || cola === null) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  // Pestañas de categoría (solo francés, ver ETIQUETAS_TAB_FRANCES): solo
  // se listan los tipos que de verdad existen en el alcance actual (la
  // lección elegida, o las lecciones ya desbloqueadas del módulo) — una
  // lección de sola gramática no debería ofrecer una pestaña "Cultura" que
  // siempre estaría vacía, ni tampoco una pestaña que solo tenga tarjetas
  // en lecciones que el Mapa todavía marca como bloqueadas.
  const abiertasParaTabs = esModuloFrances ? leccionesDesbloqueadas(modulo.tarjetasConcepto, estadosSRS) : null
  const tiposDisponibles = esModuloFrances
    ? ORDEN_TIPOS_FRANCES.filter((tipo) =>
        modulo.tarjetasConcepto.some(
          (t) => t.tipo === tipo && (leccion != null ? t.leccion === leccion : abiertasParaTabs.has(t.leccion))
        )
      )
    : []

  const tabsTipo = tiposDisponibles.length > 1 && (
    <div className="repaso-tipo-tabs">
      <button
        type="button"
        className={`repaso-tipo-tab${tipoFiltro == null ? ' repaso-tipo-tab--activo' : ''}`}
        onClick={() => setTipoFiltro(null)}
      >
        Todos
      </button>
      {tiposDisponibles.map((tipo) => (
        <button
          key={tipo}
          type="button"
          className={`repaso-tipo-tab${tipoFiltro === tipo ? ' repaso-tipo-tab--activo' : ''}`}
          onClick={() => setTipoFiltro(tipo)}
        >
          {ETIQUETAS_TAB_FRANCES[tipo]}
        </button>
      ))}
    </div>
  )

  // Solo se listan los niveles que de verdad hay tarjetas vencidas o no en
  // el módulo (no depende de `estaLista`, a propósito: si no, un nivel
  // sin tarjetas vencidas hoy desaparecería de las pestañas en vez de
  // simplemente mostrar la cola vacía al elegirlo).
  const nivelesDisponibles = esModuloIngles
    ? ORDEN_NIVELES_INGLES.filter((nivel) => modulo.tarjetasConcepto.some((t) => t.nivel_mcer === nivel))
    : []

  const tabsNivel = nivelesDisponibles.length > 1 && (
    <div className="repaso-nivel-tabs">
      <button
        type="button"
        className={`repaso-nivel-tab${nivelFiltro == null ? ' repaso-nivel-tab--activo' : ''}`}
        onClick={() => setNivelFiltro(null)}
      >
        Todos
      </button>
      {nivelesDisponibles.map((nivel) => (
        <button
          key={nivel}
          type="button"
          className={`repaso-nivel-tab${nivelFiltro === nivel ? ' repaso-nivel-tab--activo' : ''}`}
          onClick={() => setNivelFiltro(nivel)}
        >
          {nivel}
        </button>
      ))}
    </div>
  )

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
        {tabsTipo}
        {tabsNivel}
        <div className="repaso-fin">
          <h2>Por hoy no quedan tarjetas pendientes</h2>
          <p>Revisaste {revisadasHoy} tarjetas en esta sesión.</p>
          {esModuloFrances && (
            <div className="repaso-fin-siguiente">
              <div className="repaso-fin-siguiente-etiqueta">Seguir practicando</div>
              <div className="repaso-fin-siguiente-botones">
                <button type="button" className="repaso-fin-boton" onClick={onIrACompletaFrase}>
                  Completa la frase
                </button>
                <button type="button" className="repaso-fin-boton" onClick={onIrATraduce}>
                  Traduce
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const tarjeta = cola[0].valor
  const remaining = cola.length
  const progressPct = totalInicial ? Math.min(100, Math.round((revisadasHoy / totalInicial) * 100)) : 0
  // Cuatro esquemas de tarjeta de concepto: cloze (antes/despues/respuesta,
  // de Inglés), pregunta directa (pregunta/respuesta_breve, de
  // Competencias Ciudadanas), científica (Pensamiento Científico, que
  // unifica ambos frentes bajo un solo campo `modo` por tarjeta — no por
  // módulo completo, porque los mismos archivos mezclan tarjetas cloze y
  // de pregunta) y francés (Assimil, esquema propio con tokens/liaison,
  // ver ETIQUETAS_TIPO_FRANCES y FraseConTokens.jsx). Se detectan por presencia de
  // campos, no por `tipo` (que en CC y PC siempre vale "concepto"; en
  // francés sí se usa como discriminador interno de sub-layout, pero solo
  // después de confirmar `idioma === 'frances'`, así que no puede chocar
  // con el `tipo` fijo de otros módulos).
  const esFrances = tarjeta.idioma === 'frances'
  const esCientifica = !esFrances && 'modo' in tarjeta
  const esCloze = esCientifica ? tarjeta.modo === 'cloze' : 'antes' in tarjeta
  // LC-CUL (cultura general) es la única variante sin `competencia_asociada`
  // ni `error_comun`: categoria/pregunta/respuesta_breve/explicacion/
  // ejemplo_aplicado únicamente — reverso de 2 secciones en vez de 3.
  const esCultura = !esFrances && !esCientifica && !esCloze && 'categoria' in tarjeta
  const enlacesConecta = esCientifica ? enlacesCruzados(tarjeta.connects_to, moduloId, perfil) : []

  return (
    <ReglasProvider reglas={modulo.reglas}>
    <div className="repaso">
      <div className="repaso-topbar">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="repaso-titulo">
          <div className="repaso-titulo-modulo">{modulo.nombre}</div>
          <div className="repaso-titulo-sub">
            {leccion != null ? `Lección ${leccion} · ${modulo.categorias?.[String(leccion)] ?? ''}` : 'Repaso de tarjetas'}
          </div>
        </div>
        <div className="repaso-barra">
          <div className="repaso-barra-relleno" style={{ width: `${progressPct}%` }} />
        </div>
        {esModuloFrances ? (
          <div className="repaso-restantes-fr">
            <div className="repaso-restantes-fr-num">{remaining}</div>
            <div className="repaso-restantes-fr-palabra">
              {numeroFrances(remaining).palabra} {numeroFrances(remaining).fonetica}
            </div>
          </div>
        ) : (
          <div className="repaso-restantes">{remaining} restantes</div>
        )}
        {esModuloFrances && (
          <button type="button" className="boton-icono repaso-boton-ayuda-fr" onClick={leyenda.abrir}>
            ?
          </button>
        )}
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      {tabsTipo}
      {tabsNivel}

      <div className="repaso-escenario" data-reglas-bounds>
        <TarjetaFlip
          volteada={volteada}
          onClick={() => setVolteada((v) => !v)}
          frente={
            esFrances ? (
              <>
                <div className="repaso-badges">
                  <span className="repaso-num-leccion">{tarjeta.leccion}</span>
                  <span className="repaso-badge-tipo">{ETIQUETAS_TIPO_FRANCES[tarjeta.tipo] ?? tarjeta.tipo}</span>
                </div>
                <div className="repaso-cloze">
                  {tarjeta.tokens ? (
                    <FraseConTokens tokens={tarjeta.tokens} />
                  ) : (
                    <div className="repaso-cloze-texto">{tarjeta.pregunta}</div>
                  )}
                </div>
                <div className="repaso-hint">
                  <IconoFlechaCircular color="var(--text-faint)" />
                  Toca para ver la explicación
                </div>
              </>
            ) : esCientifica ? (
              <>
                <div className="repaso-badges">
                  <span className={`repaso-badge-dificultad repaso-badge-dificultad--${tarjeta.dificultad}`}>
                    {ETIQUETAS_DIFICULTAD[tarjeta.dificultad] ?? tarjeta.dificultad}
                  </span>
                  <span className="repaso-badge-tipo">
                    {modulo.categorias?.[tarjeta.afirmacion_asociada] ??
                      modulo.nucleos?.[tarjeta.contenido] ??
                      modulo.categorias?.[tarjeta.bloque] ??
                      tarjeta.afirmacion_asociada ??
                      tarjeta.contenido ??
                      tarjeta.bloque}
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
                        <TextoConReglas texto={tarjeta.pregunta} />
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
                  {tarjeta.dificultad && (
                    <span className={`repaso-badge-dificultad repaso-badge-dificultad--${tarjeta.dificultad}`}>
                      {ETIQUETAS_DIFICULTAD[tarjeta.dificultad] ?? tarjeta.dificultad}
                    </span>
                  )}
                  <span className="repaso-badge-nivel">
                    {modulo.categorias?.[tarjeta.competencia_asociada] ??
                      tarjeta.competencia_asociada ??
                      modulo.categorias?.[tarjeta.bloque] ??
                      tarjeta.bloque}
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
            esFrances ? (
              <>
                <div className="repaso-reverso-cabecera">
                  <span className="repaso-num-leccion repaso-num-leccion--chico">{tarjeta.leccion}</span>
                  {tarjeta.tokens ? (
                    <div className="repaso-reverso-oracion">
                      {tarjeta.antes}
                      <span className="repaso-reverso-respuesta-fr">{tarjeta.respuesta}</span>
                      {tarjeta.despues}
                    </div>
                  ) : (
                    <div className="repaso-fr-tipo-label">{ETIQUETAS_TIPO_FRANCES[tarjeta.tipo] ?? tarjeta.tipo}</div>
                  )}
                </div>

                {tarjeta.tipo === 'dialogo' && (
                  <>
                    <div className="repaso-fr-fonetica">{tarjeta.fonetica}</div>
                    <div>
                      <div className="repaso-seccion-label">Traducción</div>
                      <div className="repaso-seccion-texto">
                        {tarjeta.traduccion_natural} <span className="repaso-fr-literal">{tarjeta.traduccion_literal}</span>
                      </div>
                    </div>
                    <div className="repaso-fr-nota">
                      <span className="repaso-fr-nota-num">{tarjeta.nota_numero}</span>
                      <div className="repaso-fr-nota-texto">
                        <b>{tarjeta.nota_headword}</b> — {tarjeta.nota_texto}
                      </div>
                    </div>
                  </>
                )}

                {tarjeta.tipo === 'gramatica' && (
                  <>
                    <div className="repaso-fr-concepto">{tarjeta.concepto}</div>
                    <div>
                      <div className="repaso-seccion-label">Regla</div>
                      <div className="repaso-seccion-texto">
                        <TextoConNegritas texto={tarjeta.regla} />
                      </div>
                    </div>
                    <div className="repaso-ejemplo repaso-ejemplo--fr">
                      <div className="repaso-seccion-label repaso-seccion-label--accent-fr">Ejemplo</div>
                      <div className="repaso-ejemplo-texto">
                        <TextoConNegritas texto={tarjeta.ejemplo} />
                      </div>
                    </div>
                  </>
                )}

                {tarjeta.tipo === 'pronunciacion' && (
                  <>
                    <div>
                      <div className="repaso-seccion-label">Regla</div>
                      <div className="repaso-seccion-texto">
                        <TextoConNegritas texto={tarjeta.regla} />
                      </div>
                    </div>
                    <div className="repaso-ejemplo repaso-ejemplo--fr">
                      <div className="repaso-seccion-label repaso-seccion-label--accent-fr">Ejemplo</div>
                      <div className="repaso-ejemplo-texto">
                        <TextoConNegritas texto={tarjeta.ejemplo} />
                      </div>
                    </div>
                  </>
                )}

                {tarjeta.tipo === 'cultura' && (
                  <>
                    <div className="repaso-seccion-label">Cultura e historia</div>
                    <div className="repaso-fr-cultura-texto">{tarjeta.cultura_texto}</div>
                  </>
                )}
              </>
            ) : esCientifica ? (
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
                      <span className="repaso-reverso-respuesta">
                        <TextoConReglas texto={tarjeta.respuesta} />
                      </span>
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

                {tarjeta.regla && (
                  <div>
                    <div className="repaso-seccion-label">Regla</div>
                    <div className="repaso-seccion-texto">
                      <TextoConReglas texto={tarjeta.regla} />
                    </div>
                  </div>
                )}

                {tarjeta.ejemplo && (
                  <div className="repaso-ejemplo">
                    <div className="repaso-seccion-label repaso-seccion-label--accent">Ejemplo</div>
                    <div className="repaso-ejemplo-texto">
                      <TextoConReglas texto={tarjeta.ejemplo} />
                    </div>
                  </div>
                )}

                <div className="repaso-error">
                  <span className="repaso-error-icono" />
                  <div>
                    <div className="repaso-seccion-label repaso-seccion-label--warn">Error común</div>
                    <div className="repaso-error-texto">
                      <TextoConReglas texto={tarjeta.error_comun} />
                    </div>
                  </div>
                </div>

                {tarjeta.conexion_cotidiana && (
                  <div className="repaso-cotidiana">
                    <IconoBombilla color="var(--exito)" />
                    <div>
                      <div className="repaso-seccion-label repaso-seccion-label--exito">Conexión con la vida diaria</div>
                      <div className="repaso-cotidiana-texto">
                        <TextoConReglas texto={tarjeta.conexion_cotidiana} />
                      </div>
                    </div>
                  </div>
                )}

                {enlacesConecta.length > 0 && (
                  <div className="repaso-conecta">
                    <div className="repaso-seccion-label">Conecta con</div>
                    <div className="repaso-conecta-chips">
                      {enlacesConecta.map((enlace) => (
                        <button
                          key={`${enlace.moduloId}:${enlace.bloque}`}
                          type="button"
                          className="repaso-conecta-chip"
                          onClick={() => onIrAModuloBloque?.(enlace.moduloId, enlace.bloque)}
                        >
                          <span className="repaso-conecta-chip-modulo">{enlace.nombre}</span>
                          <span className="repaso-conecta-chip-bloque">{enlace.bloqueLabel}</span>
                        </button>
                      ))}
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
                  {tarjeta.dificultad && (
                    <span
                      className={`repaso-badge-dificultad repaso-badge-dificultad--chico repaso-badge-dificultad--${tarjeta.dificultad}`}
                    >
                      {ETIQUETAS_DIFICULTAD[tarjeta.dificultad] ?? tarjeta.dificultad}
                    </span>
                  )}
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
            className={`repaso-eval-boton repaso-eval-boton--${b.clase}${esModuloFrances && b.clase === 'bien' ? ' repaso-eval-boton--bien-fr' : ''}`}
            onClick={() => calificar(b.calificacion)}
          >
            <span className="repaso-eval-etiqueta">{b.etiqueta}</span>
            <span className="repaso-eval-intervalo">{b.intervalo}</span>
          </button>
        ))}
      </div>

      {esModuloFrances && <LeyendaFrances abierta={leyenda.abierta} onCerrar={leyenda.cerrar} />}
    </div>
    </ReglasProvider>
  )
}
