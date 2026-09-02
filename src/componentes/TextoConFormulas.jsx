import { PATRON, renderizarFragmento } from './textoFragmentos.jsx'

// Fórmulas y símbolos incrustados dentro de una oración normal
// ($...$ inline, $$...$$ en bloque), más **negrita** — necesario para
// Teoría de Grupos (y cualquier módulo futuro igual de denso en
// notación), donde casi cualquier campo de texto trae un símbolo
// matemático a mitad de frase ("el grupo puntual del NH₃ es $C_{3v}$",
// "$\hat{C}_n^n = \hat{E}$"). A diferencia de Formula.jsx (que renderiza
// un campo `formula_latex` completo, aparte, siempre como su propio
// bloque), este componente vive dentro del mismo texto corrido.
//
// Por qué no usar Unicode plano (Ĉₙ, σ̂, Dₙd) como ya hace PC/Diosgenina
// con CO₂/H⁺: ese Unicode alcanza para subíndices simples de química,
// pero se rompe aquí de dos formas reales, no solo estéticas —
//   1. Unicode NO tiene subíndice para la letra "d" (σd, Dₙd quedan con
//      un salto de tamaño real entre la "n" subíndice y la "d" normal).
//   2. Los operadores con "sombrero" (Ĉₙ, σ̂, Ŝₙ, Ê) apilan acento
//      combinante + subíndice + a veces superíndice sobre un solo
//      glifo — el soporte de fuente para esa combinación es
//      inconsistente entre navegador/SO.
// KaTeX no tiene ninguno de los dos problemas (compone el glifo desde
// cero), así que cualquier operador con sombrero o símbolo con
// subíndice "d" debe escribirse en LaTeX (`$\hat{C}_n$`, `$\sigma_d$`,
// `$D_{nd}$`), nunca en Unicode suelto. Las etiquetas de grupo puntual
// sin sombrero y sin "d" (C₂ᵥ, C₃ᵥ, D₆ₕ, Oₕ) sí pueden seguir en
// Unicode plano dentro del texto si se prefiere — ese subconjunto no
// tiene ninguno de los dos problemas.
//
// El parser en sí (PATRON + renderizarFragmento) vive en
// textoFragmentos.jsx, compartido con TextoConReglas (superset estricto
// que además reconoce el token `[[id-regla|texto]]`).

// Mismo soporte de párrafos separados por línea en blanco que
// TextoConNegritas, para no perderlo en campos largos (explicacion de
// una derivación puede necesitar varios párrafos).
export function TextoConFormulas({ texto }) {
  if (!texto) return null
  const parrafos = texto.split(/\n{2,}/)
  const renderizarParrafo = (parrafo, prefijo) =>
    parrafo
      .split(PATRON)
      .filter((p) => p !== '')
      .map((p, i) => renderizarFragmento(p, `${prefijo}-${i}`))

  if (parrafos.length === 1) return renderizarParrafo(texto, 'p0')
  return parrafos.map((parrafo, i) => (
    <p key={i} style={{ margin: i === 0 ? 0 : '0.7em 0 0' }}>
      {renderizarParrafo(parrafo, `p${i}`)}
    </p>
  ))
}
