import './FraseConTokens.css'

// Francés (Assimil) — renderiza una frase como una lista de tokens en vez
// de una sola cadena, porque el frente de la tarjeta y la Lección Completa
// necesitan resaltar dos cosas que un string plano no puede: la marca de
// liaison (un arco bajo el hueco entre dos palabras enlazadas) y las
// referencias numeradas a nota. Se reusa entre RepasoConceptos.jsx y
// LeccionCompleta.jsx en vez de duplicar el switch por tipo de token.
//
// tok.isWord   → palabra suelta
// tok.isLiaison → { w1, w2 } enlazadas, con el arco SVG debajo
// tok.isBlank  → hueco cloze (raya punteada) — no confundir con el hueco
//                de puntos de CompletaLaFrase.jsx, que es un ejercicio
//                distinto adrede (ver README de diseño)
// tok.isNote   → palabra + círculo de número de nota
export function FraseConTokens({ tokens, tamano = 21 }) {
  return (
    <span className="frase-tokens" style={{ fontSize: tamano }}>
      {tokens.map((tok, i) => {
        if (tok.isLiaison) {
          return (
            <span className="frase-tokens-liaison" key={i}>
              <span className="frase-tokens-palabra">{tok.w1}</span>
              <span className="frase-tokens-palabra">{tok.w2}</span>
              <svg className="frase-tokens-arco" width="26" height="11" viewBox="0 0 26 11">
                <path d="M2 2 Q13 12 24 2" fill="none" stroke="var(--fr-accent)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          )
        }
        if (tok.isBlank) return <span className="frase-tokens-hueco" key={i} />
        if (tok.isNote) {
          return (
            <span className="frase-tokens-nota" key={i}>
              <span className="frase-tokens-palabra">{tok.w}</span>
              <span className="frase-tokens-nota-num">{tok.n}</span>
            </span>
          )
        }
        return (
          <span className="frase-tokens-palabra" key={i}>
            {tok.w}
          </span>
        )
      })}
    </span>
  )
}
