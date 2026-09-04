import fs from 'node:fs'

// Retrofit de tokens [[DG-R-...|frase]] sobre las 100 tarjetas de concepto
// y los ~73 ítems de Quiz Rápido que aún no tienen ninguno. Patrón de
// Inglés (aplicar-tokens-reglas-ingles.mjs): envuelve EN SITIO la primera
// frase-disparador que ya vive en el texto, sin agregar oraciones nuevas.
// Un solo token por tarjeta/ítem. Nunca en opciones/fragmentos/respuesta/
// alternativas/izq/der (spoiler + el verificador lo rechaza).

const DRY = process.argv.includes('--dry')

// Reglas en orden de prioridad de coincidencia (específica antes que
// general). Cada patrón: la coincidencia (grupo 0) es la frase a envolver.
const REGLAS = [
  ['DG-R-oxocarbenio', [/ion oxocarbenio/i, /carbono anomérico/i]],
  ['DG-R-henderson-hasselbalch', [/Henderson-?Hasselbalch/i]],
  ['DG-R-van-deemter', [/(?:la )?ecuación de van Deemter/i, /\bvan Deemter\b/, /tres mecanismos (?:distintos )?ensanchan el pico/i]],
  ['DG-R-beer-lambert', [/(?:la )?ley de Beer-Lambert/i, /\bBeer-Lambert\b/, /las absorbancias de cada (?:uno|compuesto)[^.]{0,40}se suman/i]],
  ['DG-R-arrhenius', [/(?:la )?ecuación de Arrhenius/i, /según Arrhenius/i, /sigue Arrhenius/i, /depende exponencialmente de la temperatura/i]],
  ['DG-R-fick', [/(?:primera )?ley de Fick/i]],
  ['DG-R-reparto', [/coeficiente de (?:partición|reparto)/i, /ley de reparto de Nernst/i, /constante de reparto/i]],
  ['DG-R-accion-de-masas', [/principio de Le Chatelier/i, /\bLe Chatelier\b/, /acción de masas/i, /el exceso (?:masivo |constante )?de agua desplaza el equilibrio/i]],
  ['DG-R-catalisis-especifica', [/catálisis ácida específica/i, /el protón[^.]{0,60}se libera de nuevo/i]],
  ['DG-R-ebullicion-presion', [/el punto de ebullición depende de la presión externa/i, /reducir la presión externa baja el punto de ebullición/i, /la presión de vapor iguala la (?:presión )?externa/i, /bajar la presión[^.]{0,25}baja/i]],
  ['DG-R-disolucion-energia', [/lo semejante disuelve lo semejante/i, /contabilidad energética de la mezcla/i, /balance energético de la mezcla/i]],
  ['DG-R-dielectrica', [/constante dieléctrica/i]],
  ['DG-R-cromoforo', [/crea(?:ndo)?[^.]{0,20}un cromóforo/i, /un cromóforo donde (?:antes )?no (?:existía|había)/i, /conjugación (?:π )?extendida que sí absorbe/i, /brecha HOMO-?LUMO/i]],
  ['DG-R-rendimiento-cruce', [/una carrera entre dos reacciones/i, /dos reacciones con (?:distintos )?relojes/i, /el rendimiento neto es la resta/i, /son dos reacciones con relojes distintos/i]],
  ['DG-R-neutralizacion-suave', [/con bicarbonato de sodio, una base débil/i, /NaHCO₃[^.]{0,45}(?:libera|liberando) CO₂/i, /NaOH neutralizaría de golpe/i, /neutraliza(?:r)? (?:el hidrolizado )?con bicarbonato/i]],
  ['DG-R-extracciones-multiples', [/(?:la )?ecuación de extracciones múltiples/i, /extracciones múltiples/i, /la fracción no extraída/i, /dividir (?:el |ese )?(?:mismo )?volumen (?:total )?en (?:3|tres|más|varias)/i]],
  ['DG-R-lavado-inverso', [/un lavado[^.]{0,40}(?:mini-?extracción|al revés|remueve)/i]],
  ['DG-R-eficiencia-vs-selectividad', [/eficiencia y selectividad rara vez suben juntas/i, /(?:un )?compromiso entre extraer[^.]{0,20}mucho[^.]{0,20}limpio/i, /prioriza (?:deliberadamente )?rendimiento sobre pureza/i, /cambia pureza por rendimiento/i]],
  ['DG-R-emulsion', [/cinéticamente (?:atrapad\w*|estable)/i, /las saponinas[^.]{0,40}tensioactivo/i, /una emulsión no es solo/i]],
  ['DG-R-desecante', [/reacción (?:química )?de hidratación con estequiometría/i, /el sulfato de sodio anhidro/i, /es un desecante/i]],
  ['DG-R-evaporar-concentra', [/evaporar solo (?:quita|remueve)[^.]{0,20}solvente/i, /paso de (?:\*\*)?concentración(?:\*\*)?, no de (?:\*\*)?purificación/i, /evaporación es un paso de (?:\*\*)?concentración/i]],
  ['DG-R-nucleacion', [/sitios? de nucleación/i, /\bsobrecalentamiento\b/i, /(?:un |sin )?sólido amorfo/i, /perlas de ebullición/i]],
  ['DG-R-almacenamiento', [/vial ámbar/i, /\bfotodegradación\b/i, /(?:la )?regla Q₁₀/i]],
  ['DG-R-silanol', [/grupos? silanol/i, /\bsilanoles(?: residuales)?\b/i]],
  ['DG-R-revelado', [/el revelador reacciona (?:químicamente )?con (?:el|la)/i, /el revelador no ['"]?tiñe['"]?(?: pasivamente| de forma pasiva)?/i, /una derivatización[^.]{0,20}(?:in situ|sobre la placa)/i]],
  ['DG-R-capilaridad', [/\bcapilaridad\b/i, /(?:la )?adhesión (?:es más fuerte que|supera)[^.]{0,20}cohesión/i]],
  ['DG-R-resolucion', [/(?:la )?resolución[^.]{0,30}(?:ancho de las (?:manchas|bandas)|manchas anchas|bandas anchas)/i, /manchas anchas se solapan/i]],
  ['DG-R-rf', [/\$R_f\$/]],
  ['DG-R-blanco', [/blanco de reactivos/i, /blanco de matriz/i, /restar (?:el |del )blanco/i, /un blanco es una muestra/i]],
  ['DG-R-lod-loq', [/límite de detección/i, /límite de cuantificación/i, /\bLOD\b/, /\bLOQ\b/]],
  ['DG-R-lambda-max', [/leer en el máximo/i, /el máximo de absorbancia \(λ/i, /λmax/i]],
  ['DG-R-estandar-interno', [/(?:un |el |con )estándar interno/i]],
  ['DG-R-factor-capacidad', [/\$t_R\$ depende de (?:factores|variabilidad)/i, /(?:el )?factor de capacidad k['’]?/i, /\$k'\$/, /(?:el )?tiempo muerto/i, /\$t_0\$/]],
  ['DG-R-perfilar-vs-cuantificar', [/perfilar no es cuantificar/i, /cuantificar exige trazabilidad/i, /perfilar es (?:más modesto|generar un patrón relativo|una comparación relativa)/i]],
  ['DG-R-tres-indices', [/tres índices convergentes/i, /triangulación de métodos/i, /combinar (?:los )?tres[^.]{0,40}(?:convergencia|más confianza|más robusta)/i]],
  ['DG-R-efecto-vs-significancia', [/tamaño de efecto y significancia/i, /(?:el )?tamaño de efecto\b/i, /estadísticamente significativo[^.]{0,40}(?:irrelevante|prácticamente)/i]],
  ['DG-R-pvalor', [/(?:el )?p-valor es la probabilidad/i, /la hipótesis nula \(H₀/i, /P\(datos \| H₀/]],
  ['DG-R-poder', [/(?:el )?poder estadístico/i, /error Tipo II/i, /falta de poder/i]],
  ['DG-R-factorial', [/(?:un )?diseño factorial/i, /un factor a la vez/i, /\bOFAT\b/, /(?:una )?interacción entre (?:dos )?factores/i]],
]

const RULE_IDS = new Set(REGLAS.map((r) => r[0]))
const rulebook = JSON.parse(fs.readFileSync('src/data/diosgenina/dio_reglas.json', 'utf8'))
for (const id of RULE_IDS) if (!rulebook.some((r) => r.id === id)) throw new Error(`regla inexistente en rulebook: ${id}`)

// Envuelve la coincidencia que aparece MÁS TEMPRANO en el texto (así gana
// el concepto que la oración nombra primero, típico de las definiciones);
// desempate por orden de prioridad en REGLAS. Devuelve {texto, ruleId} o null.
function tokenizar(texto) {
  if (typeof texto !== 'string' || texto.includes('[[')) return null
  let mejor = null // { idx, prio, ruleId, frase }
  REGLAS.forEach(([ruleId, patrones], prio) => {
    for (const re of patrones) {
      const m = texto.match(re)
      if (!m || m.index == null) continue
      const frase = m[0]
      if (frase.includes('|') || frase.includes('**')) continue
      const antes = texto.slice(Math.max(0, m.index - 2), m.index)
      const despues = texto.slice(m.index + frase.length, m.index + frase.length + 2)
      if (antes.includes('*') || despues.includes('*')) continue
      if (!mejor || m.index < mejor.idx || (m.index === mejor.idx && prio < mejor.prio)) {
        mejor = { idx: m.index, prio, ruleId, frase }
      }
      break // primer patrón que casa para esta regla
    }
  })
  if (!mejor) return null
  const nuevo = texto.slice(0, mejor.idx) + `[[${mejor.ruleId}|${mejor.frase}]]` + texto.slice(mejor.idx + mejor.frase.length)
  return { texto: nuevo, ruleId: mejor.ruleId }
}

// aplica a la primera de una lista de campos que produzca un token
function aplicarEnCampos(obj, campos) {
  for (const c of campos) {
    const r = tokenizar(obj[c])
    if (r) {
      if (!DRY) obj[c] = r.texto
      return { campo: c, ruleId: r.ruleId, muestra: r.texto.match(/\[\[[^\]]+\]\]/)[0] }
    }
  }
  return null
}

// ---- tarjetas de concepto ----
const bloques = ['fqt', 'hid', 'ell', 'ser', 'tlc', 'esp', 'hpl', 'pft', 'est']
let cHechas = 0,
  cTotal = 0
const cLog = []
for (const b of bloques) {
  const path = `src/data/diosgenina/dio_${b}.json`
  const cards = JSON.parse(fs.readFileSync(path, 'utf8'))
  for (const card of cards) {
    cTotal++
    if (JSON.stringify(card).includes('[[')) continue
    const res = aplicarEnCampos(card, ['regla', 'respuesta', 'error_comun', 'conexion_cotidiana'])
    if (res) {
      cHechas++
      cLog.push(`${card.id.padEnd(8)} ${res.campo.padEnd(18)} ${res.muestra}`)
    }
  }
  if (!DRY) fs.writeFileSync(path, JSON.stringify(cards, null, 2) + '\n')
}

// ---- Quiz Rápido ----
const qPath = 'src/data/diosgenina/dio_quiz_rapido.json'
const quiz = JSON.parse(fs.readFileSync(qPath, 'utf8'))
let qHechas = 0,
  qPend = 0
const qLog = []
for (const it of quiz) {
  if (JSON.stringify(it).includes('[[')) continue
  qPend++
  const campos = it.formato === 'fill' ? ['enunciado', 'despues', 'antes', 'explicacion'] : ['enunciado', 'explicacion']
  const res = aplicarEnCampos(it, campos)
  if (res) {
    qHechas++
    qLog.push(`${it.id} ${(it.categoria || '').padEnd(4)} ${res.campo.padEnd(11)} ${res.muestra}`)
  }
}
if (!DRY) fs.writeFileSync(qPath, JSON.stringify(quiz, null, 2) + '\n')

console.log(`\n=== TARJETAS DE CONCEPTO: ${cHechas}/${cTotal} tokenizadas ===`)
cLog.forEach((l) => console.log('  ' + l))
console.log(`\n=== QUIZ RÁPIDO: ${qHechas}/${qPend} sin-token tokenizados (${quiz.length - qPend} ya tenían) ===`)
qLog.forEach((l) => console.log('  ' + l))
console.log(DRY ? '\n(dry run — nada escrito)' : '\n(escrito)')
