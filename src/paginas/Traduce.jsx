import { useState } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo, IconoCheck, IconoX } from '../componentes/iconos.jsx'
import '../estilos/frances.css'
import './Traduce.css'

// Frases ES→FR de muestra tomadas de las mismas lecciones 1-6 que ya
// tiene el módulo, con la traducción literal como pista adicional (mismo
// recurso pedagógico que usan las tarjetas de diálogo del repaso).
const FRASES = [
  { es: 'Buenos días, ¿cómo está usted?', fr: 'Bonjour, comment allez-vous ?', literal: '(literalmente: buenos días, cómo va usted)' },
  { es: 'Quisiera dos cafés, por favor.', fr: "Je voudrais deux cafés, s'il vous plaît.", literal: '(literalmente: yo querría dos cafés...)' },
  { es: '¿Qué hora es?', fr: 'Quelle heure est-il ?', literal: '(literalmente: cuál hora es-ella)' },
  { es: '¿Dónde está la estación de metro?', fr: 'Où est la station de métro ?', literal: '(literalmente: dónde está la estación de metro)' },
  { es: 'Tengo una reserva a nombre de García.', fr: "J'ai une réservation au nom de García.", literal: '(literalmente: yo tengo una reservación al nombre de García)' },
]

// Quita los diacríticos combinantes (U+0300-U+036F) que deja `normalize
// ('NFD')` — construido con String.fromCharCode en vez de un literal de
// regex con los caracteres pegados, para evitar cualquier problema de
// codificación al guardar el archivo.
const RANGO_DIACRITICOS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g')
const RANGO_PUNTUACION = /[.,;:!?'"«»]/g

function normalizar(s) {
  return s
    .normalize('NFD')
    .replace(RANGO_DIACRITICOS, '')
    .toLowerCase()
    .replace(RANGO_PUNTUACION, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

const RETROALIMENTACION = {
  correcto: { clase: 'correcto', etiqueta: '¡Correcto!' },
  casi: { clase: 'casi', etiqueta: 'Casi — revisa la ortografía o conjugación.' },
  incorrecto: { clase: 'incorrecto', etiqueta: 'Incorrecto — inténtalo de nuevo o mira la respuesta.' },
}

export function Traduce({ perfil, onCambiarPerfil, onVolver }) {
  const { dark, toggle } = useTheme()
  const [indice, setIndice] = useState(0)
  const [intento, setIntento] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [respuestaVisible, setRespuestaVisible] = useState(false)

  const frase = FRASES[indice]

  function comprobar() {
    const a = normalizar(intento)
    const b = normalizar(frase.fr)
    if (!a) return
    if (a === b) {
      setFeedback('correcto')
      return
    }
    const dist = levenshtein(a, b)
    const similaridad = 1 - dist / Math.max(a.length, b.length, 1)
    setFeedback(similaridad >= 0.75 ? 'casi' : 'incorrecto')
  }

  function siguiente() {
    setIndice((i) => (i + 1) % FRASES.length)
    setIntento('')
    setFeedback(null)
    setRespuestaVisible(false)
  }

  const fb = feedback ? RETROALIMENTACION[feedback] : null

  return (
    <div className="traduce">
      <div className="traduce-topbar">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div>
          <div className="traduce-titulo">Traduis la phrase</div>
          <div className="traduce-sub">
            Frase {indice + 1} de {FRASES.length}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="traduce-cuerpo">
        <div className="traduce-prompt">
          <div className="traduce-prompt-label">Traduce al francés</div>
          <div className="traduce-prompt-texto">{frase.es}</div>
        </div>

        <textarea
          value={intento}
          onChange={(e) => setIntento(e.target.value)}
          placeholder="Escribe tu intento en francés…"
          className={`traduce-textarea${fb ? ` traduce-textarea--${fb.clase}` : ''}`}
        />

        <div className="traduce-acciones">
          <button type="button" className="traduce-boton-primario" onClick={comprobar}>
            Comprobar
          </button>
          <button type="button" className="traduce-boton-secundario" onClick={() => setRespuestaVisible(true)}>
            Ver respuesta
          </button>
          <button type="button" className="traduce-boton-secundario traduce-boton-siguiente" onClick={siguiente}>
            Siguiente frase →
          </button>
        </div>

        {fb && (
          <div className={`traduce-feedback traduce-feedback--${fb.clase}`}>
            <span className={`traduce-feedback-icono traduce-feedback-icono--${fb.clase}`}>
              {feedback === 'correcto' && <IconoCheck size={12} color="white" />}
              {feedback === 'casi' && '~'}
              {feedback === 'incorrecto' && <IconoX size={11} color="white" />}
            </span>
            <div className={`traduce-feedback-texto traduce-feedback-texto--${fb.clase}`}>{fb.etiqueta}</div>
          </div>
        )}

        {respuestaVisible && (
          <div className="traduce-respuesta">
            <div className="traduce-respuesta-label">Respuesta correcta</div>
            <div className="traduce-respuesta-fr">{frase.fr}</div>
            <div className="traduce-respuesta-literal">{frase.literal}</div>
          </div>
        )}
      </div>
    </div>
  )
}
