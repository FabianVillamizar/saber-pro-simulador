import { useState } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo } from '../componentes/iconos.jsx'
import '../estilos/frances.css'
import './CompletaLaFrase.css'

// Igual que el Exercice 2 real del libro: el hueco se muestra como puntos
// (uno por letra de la respuesta), no como raya — eso se reserva para el
// cloze de la tarjeta de repaso, ver README de diseño. Frases tomadas de
// las mismas lecciones que ya tiene el módulo (1-7).
const EJERCICIOS = [
  { antes: 'Nous', despues: 'au restaurant ce soir.', respuesta: 'allons', pista: 'aller' },
  { antes: 'Vous', despues: "l'heure, s'il vous plaît ?", respuesta: 'avez', pista: 'avoir' },
  { antes: 'Il va', despues: 'cinéma.', respuesta: 'au', pista: 'à + le' },
  { antes: "C'", despues: 'une bonne idée.', respuesta: 'est', pista: 'être' },
]

function normalizarLetra(a, b) {
  return a && b && a.toLowerCase() === b.toLowerCase()
}

export function CompletaLaFrase({ perfil, onCambiarPerfil, onVolver }) {
  const { dark, toggle } = useTheme()
  const [valores, setValores] = useState({ 0: '', 1: '', 2: '', 3: '' })
  const [corregido, setCorregido] = useState(false)

  const correctas = corregido
    ? EJERCICIOS.filter((ej, i) => (valores[i] || '').trim().toLowerCase() === ej.respuesta.toLowerCase()).length
    : 0

  return (
    <div className="completa-frase">
      <div className="completa-frase-topbar">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div>
          <div className="completa-frase-titulo">Complète la phrase</div>
          <div className="completa-frase-sub">Lección 12 · Exercice 2</div>
        </div>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="completa-frase-cuerpo">
        <p className="completa-frase-instrucciones">
          Como en el método Assimil: cada punto representa una letra de la palabra que falta. Escribe tu respuesta y
          pulsa &ldquo;Corregir&rdquo;.
        </p>

        <div className="completa-frase-lista">
          {EJERCICIOS.map((ej, i) => {
            const valor = valores[i] || ''
            const esCorrecta = valor.trim().toLowerCase() === ej.respuesta.toLowerCase()
            const len = Math.max(valor.trim().length, ej.respuesta.length)
            const diff = corregido
              ? Array.from({ length: len }, (_, j) => {
                  const ch = valor.trim()[j] || '·'
                  const ok = normalizarLetra(valor.trim()[j], ej.respuesta[j])
                  return { ch, ok }
                })
              : []

            return (
              <div key={i} className="completa-frase-ejercicio">
                <div className="completa-frase-enunciado">
                  <span className="completa-frase-num">{i + 1}.</span>
                  <span>{ej.antes}</span>
                  <span className="completa-frase-puntos">
                    {Array.from({ length: ej.respuesta.length }).map((_, j) => (
                      <span key={j} className="completa-frase-punto" />
                    ))}
                  </span>
                  <span>{ej.despues}</span>
                  <span className="completa-frase-pista">({ej.pista})</span>
                </div>

                <input
                  value={valor}
                  onChange={(e) => setValores((v) => ({ ...v, [i]: e.target.value }))}
                  placeholder="Escribe la palabra que falta…"
                  className={`completa-frase-input${corregido ? (esCorrecta ? ' completa-frase-input--ok' : ' completa-frase-input--mal') : ''}`}
                />

                {corregido && (
                  <div className={`completa-frase-resultado${esCorrecta ? ' completa-frase-resultado--ok' : ' completa-frase-resultado--mal'}`}>
                    <div className="completa-frase-diff">
                      {diff.map((d, j) => (
                        <span key={j} className={d.ok ? 'completa-frase-diff-ok' : 'completa-frase-diff-mal'}>
                          {d.ch}
                        </span>
                      ))}
                    </div>
                    {!esCorrecta && (
                      <div className="completa-frase-respuesta-correcta">
                        Respuesta correcta: <b>{ej.respuesta}</b>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="completa-frase-acciones">
          <button type="button" className="completa-frase-boton-primario" onClick={() => setCorregido(true)}>
            Corregir
          </button>
          <button
            type="button"
            className="completa-frase-boton-secundario"
            onClick={() => {
              setCorregido(false)
              setValores({ 0: '', 1: '', 2: '', 3: '' })
            }}
          >
            Reintentar
          </button>
          {corregido && (
            <div className="completa-frase-puntaje">
              {correctas} de {EJERCICIOS.length} correctas
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
