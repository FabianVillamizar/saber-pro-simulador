import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { escribirJSON } from '../engine/storage.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import './ModuloHub.css'

// Etiquetas de los sub-bloques de diosgenina (BQ/FQ/QO/QA), solo para el
// desglose informativo de abajo — no se usan para filtrar ni agrupar en
// ningún modo de práctica (ver saber_pro_module_architecture en memoria).
const ETIQUETAS_BLOQUE_DIOSGENINA = {
  BQ: 'Bioquímica',
  FQ: 'Fisicoquímica',
  QO: 'Química Orgánica',
  QA: 'Química Analítica',
}

const MODOS = [
  {
    id: 'repaso',
    nombre: 'Repaso de conceptos',
    descripcion: 'Tarjetas de conceptos clave del módulo con repetición espaciada.',
  },
  {
    id: 'practica-parte',
    nombre: 'Práctica por sub-categoría',
    descripcion: 'Elige una parte o competencia y practica sus ítems en orden aleatorio con feedback inmediato.',
  },
  {
    id: 'quiz-rapido',
    nombre: 'Quiz rápido',
    descripcion: 'Sesión corta y mezclada de todo el banco, con corrección inmediata y diagnóstico por sub-categoría al final.',
  },
  {
    id: 'simulacro',
    nombre: 'Simulacro completo',
    descripcion: 'Preguntas respetando la proporción real por parte, cronometrado.',
  },
]

// Français · Assimil no es un módulo de examen: es un curso lineal, así
// que su hub reemplaza práctica/simulacro por sus propios modos (ver
// README de diseño en Downloads/SIMULADOR/FRANCES). Se agregan después de
// "repaso" en vez de vivir en MODOS para no ensuciar el resto de módulos
// con ids que no significan nada para ellos.
const MODOS_FRANCES = [
  {
    id: 'leccion-completa',
    nombre: 'Lección completa',
    descripcion: 'Diálogo línea por línea, pronunciación y notas de una lección — modo lectura, no tarjetas sueltas.',
  },
  {
    id: 'completa-frase',
    nombre: 'Completa la frase',
    descripcion: 'El Exercice 2 del propio libro: rellena el hueco letra por letra y corrige.',
  },
  {
    id: 'traduce',
    nombre: 'Traduce',
    descripcion: 'Traduce del español al francés y autoevalúate con feedback inmediato.',
  },
]

// Inglés es el único módulo con tarjetas de concepto en esquema cloze
// (antes/despues/respuesta) sobre las que además tiene sentido escribir la
// respuesta en vez de solo reconocerla entre 3-4 opciones — LC/CC/PC usan
// pregunta/respuesta_breve, que no es texto libre corto para comparar. Se
// agrega después de los 3 modos estándar en vez de reemplazarlos (a
// diferencia de MODOS_FRANCES/MODOS_COMUNICACION_ESCRITA): Inglés sigue
// siendo un módulo de examen normal, esto es un modo de estudio extra.
const MODO_ESCRIBIR_INGLES = {
  id: 'escribe-respuesta',
  nombre: 'Escribe la respuesta',
  descripcion: 'Las mismas tarjetas de Repaso, pero escribes la respuesta antes de verla.',
}

// Razonamiento Cuantitativo es el único módulo cuyo cuadernillo oficial
// ICFES advierte explícitamente "no se le pide usar calculadora... no se
// pedirá que elabore operaciones extenuantes" — el objeto de evaluación es
// reconocer el enfoque, no la velocidad de cálculo. Igual que
// MODO_ESCRIBIR_INGLES, convive con los 3 modos estándar en vez de
// reemplazarlos (RC sí es un módulo de examen normal con ítems reales).
const MODO_LAPIZ_PAPEL_RC = {
  id: 'lapiz-papel',
  nombre: 'Lápiz y papel',
  descripcion: 'Reconoce el enfoque antes de calcular, resuelve a mano y compárate contra el atajo.',
}

// Comunicación Escrita tampoco es un módulo de opción múltiple: el ICFES
// evalúa un ensayo argumentativo completo, así que sus modos propios
// reemplazan práctica/simulacro igual que Français (ver MODOS_FRANCES).
const MODOS_COMUNICACION_ESCRITA = [
  {
    id: 'ensayos-modelo',
    nombre: 'Ensayos modelo',
    descripcion: 'Lee ensayos de nivel 4 con anotaciones: qué frase cumple qué función y por qué.',
  },
  {
    id: 'ejercicios-rapidos',
    nombre: 'Ejercicios rápidos',
    descripcion: 'Conectores y ortografía con corrección inmediata, o una introducción exprés de 3 minutos.',
  },
  {
    id: 'practicar-ensayo',
    nombre: 'Practicar ensayo',
    descripcion: 'Sesión cronometrada (10 min planificación + 30 min escritura) con evaluación asistida por Claude.',
  },
]

export function ModuloHub({ moduloId, perfil, onCambiarPerfil, onVolver, onSeleccionarModo }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()

  if (cargando) return <div className="page estado-carga">Cargando módulo…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const esFrances = moduloId === 'frances'
  const esComunicacionEscrita = moduloId === 'comunicacion-escrita'
  const esIngles = moduloId === 'ingles'
  const esRazonamientoCuantitativo = moduloId === 'razonamiento-cuantitativo'

  // "Práctica por sub-categoría" solo tiene sentido si el módulo tiene
  // preguntas — francés, por ejemplo, es solo repaso de conceptos porque
  // Assimil no produce naturalmente un formato de opción múltiple.
  // Comunicación Escrita tampoco tiene preguntas (el ICFES evalúa un
  // ensayo completo, no un banco de opción múltiple) así que ese filtro ya
  // la excluye solo; sus dos modos propios (Ensayos Modelo / Practicar
  // Ensayo) se agregan aparte, igual que MODOS_FRANCES.
  const modos = esFrances
    ? [MODOS[0], ...MODOS_FRANCES]
    : esComunicacionEscrita
      ? [MODOS[0], ...MODOS_COMUNICACION_ESCRITA]
      : [
          ...MODOS.filter((modo) => modo.id !== 'simulacro' || modulo.soportaSimulacro)
            .filter((modo) => modo.id !== 'practica-parte' || modulo.preguntas.length > 0)
            // Quiz rápido cubre el mismo hueco que "Escribe la respuesta" ya
            // cubre para Inglés (repaso corto y mezclado con corrección
            // inmediata) — se excluye ahí para no duplicar el modo, ver
            // MODO_ESCRIBIR_INGLES arriba.
            .filter((modo) => modo.id !== 'quiz-rapido' || (modulo.preguntas.length > 0 && !esIngles)),
          ...(esIngles ? [MODO_ESCRIBIR_INGLES] : []),
          ...(esRazonamientoCuantitativo ? [MODO_LAPIZ_PAPEL_RC] : []),
        ]

  const esDiosgenina = moduloId === 'diosgenina'
  const conteoPorBloque = esDiosgenina
    ? modulo.tarjetasConcepto.reduce((conteo, t) => {
        conteo[t.bloque] = (conteo[t.bloque] ?? 0) + 1
        return conteo
      }, {})
    : null

  function reiniciarSRS() {
    if (
      !window.confirm(
        `Esto borra tu progreso de repaso (tarjetas dominadas) de ${modulo.nombre}. Tu racha y el resto de Saber Pro no se tocan. ¿Continuar?`
      )
    ) {
      return
    }
    escribirJSON(claveSRS(perfil.id, moduloId), {})
    window.location.reload()
  }

  return (
    <div className="page">
      <div className="barra-superior">
        <button type="button" className="boton-volver" onClick={onVolver}>
          ← Módulos
        </button>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <header className="modulo-hub-header">
        <h1>{modulo.nombre}</h1>
        <p>{modulo.descripcion}</p>
        <p className="modulo-hub-resumen">
          {modulo.tarjetasConcepto.length} tarjetas de concepto · {modulo.preguntas.length} preguntas de práctica
        </p>
        {esDiosgenina && conteoPorBloque && (
          <p className="modulo-hub-resumen">
            {Object.entries(conteoPorBloque)
              .map(([bloque, n]) => `${n} ${ETIQUETAS_BLOQUE_DIOSGENINA[bloque] ?? bloque}`)
              .join(' · ')}
          </p>
        )}
        {esDiosgenina && (
          <button type="button" className="modulo-hub-reiniciar" onClick={reiniciarSRS}>
            Reiniciar progreso de repaso
          </button>
        )}
      </header>

      <main className="modos">
        {modos.map((modo) => (
          <article key={modo.id} className="modo-tarjeta">
            <h2>{modo.nombre}</h2>
            <p>{modo.descripcion}</p>
            <button
              type="button"
              className={`boton-primario${esFrances ? ' boton-primario--fr' : ''}`}
              onClick={() => onSeleccionarModo(modo.id)}
            >
              Empezar
            </button>
          </article>
        ))}
      </main>
    </div>
  )
}
