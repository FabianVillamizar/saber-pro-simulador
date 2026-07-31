// Francés (Assimil) — palabra + pronunciación figurada simplificada al
// estilo del propio libro (p.ej. "sept [set]", "dix-sept [deesset]"), no
// IPA estricta. Se usa para el contador de "restantes" en el repaso y en
// el pie de la Lección Completa — el mismo truco de refuerzo de
// vocabulario que usa el libro al numerar sus propias páginas.
const NUMEROS = [
  ['zéro', '[zéro]'], ['un', '[un]'], ['deux', '[deu]'], ['trois', '[troa]'], ['quatre', '[catr]'],
  ['cinq', '[sank]'], ['six', '[siss]'], ['sept', '[set]'], ['huit', '[uit]'], ['neuf', '[neuf]'],
  ['dix', '[diss]'], ['onze', '[onze]'], ['douze', '[douze]'], ['treize', '[trèze]'], ['quatorze', '[catorze]'],
  ['quinze', '[kinze]'], ['seize', '[sèze]'], ['dix-sept', '[deesset]'], ['dix-huit', '[deezuit]'], ['dix-neuf', '[deeznenf]'],
  ['vingt', '[van]'], ['vingt et un', '[vantéun]'], ['vingt-deux', '[vantdeu]'], ['vingt-trois', '[vantroa]'], ['vingt-quatre', '[vancatr]'],
  ['vingt-cinq', '[vansank]'], ['vingt-six', '[vansiss]'], ['vingt-sept', '[vanset]'], ['vingt-huit', '[vantuit]'], ['vingt-neuf', '[vantneuf]'],
  ['trente', '[tront]'], ['trente et un', '[trontéun]'], ['trente-deux', '[trontdeu]'], ['trente-trois', '[trontroa]'], ['trente-quatre', '[troncatr]'],
  ['trente-cinq', '[tronsank]'], ['trente-six', '[tronsiss]'], ['trente-sept', '[tronset]'], ['trente-huit', '[trontuit]'], ['trente-neuf', '[trontneuf]'],
  ['quarante', '[carront]'], ['quarante et un', '[carrontéun]'], ['quarante-deux', '[carrontdeu]'], ['quarante-trois', '[carrontroa]'], ['quarante-quatre', '[carroncatr]'],
  ['quarante-cinq', '[carronsank]'], ['quarante-six', '[carronsiss]'], ['quarante-sept', '[carronset]'], ['quarante-huit', '[carrontuit]'], ['quarante-neuf', '[carrontneuf]'],
]

export function numeroFrances(n) {
  const i = Math.max(0, Math.min(49, Math.round(n)))
  const [palabra, fonetica] = NUMEROS[i]
  return { palabra, fonetica }
}
