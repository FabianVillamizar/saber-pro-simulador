import fs from 'node:fs'

// Retrofit de tokens [[RC-R-...|frase]] sobre las 153 tarjetas de concepto y
// los ítems de opción múltiple de Razonamiento Cuantitativo. Mismo patrón
// que aplicar-tokens-reglas-lectura-critica.mjs: envuelve EN SITIO la
// primera frase-disparador que ya vive en el texto, un solo token por
// tarjeta/ítem, nunca en `pregunta`/`opciones` (spoiler). Diferencias con
// LC: RC mapea por `bloque` (no `subtema`), y como un bloque puede tocar
// varias reglas, cada tarjeta prueba una lista ordenada de candidatas
// (las del bloque, luego un puñado de reglas transversales) y usa la
// primera que tenga una frase-disparador presente en el texto.
//
// Correr:  node scripts/aplicar-tokens-reglas-rc.mjs [--dry]

const DRY = process.argv.includes('--dry')
const DIR = 'src/data/razonamiento-cuantitativo'

// bloque (MAYUSCULA-CON-GUIONES, tal cual en los datos) -> reglas candidatas,
// de la más específica a la más general.
const BLOQUE_A_REGLAS = {
  'FRACCIONES-PORCENTAJES': ['RC-R-cambio-porcentual', 'RC-R-porcentaje-de', 'RC-R-factor-multiplicativo'],
  'NOTACION-CIENTIFICA': ['RC-R-notacion-cientifica-ops', 'RC-R-notacion-cientifica'],
  'RELACIONES-LINEALES': ['RC-R-relacion-lineal', 'RC-R-razon-de-cambio'],
  'RAZON-CAMBIO': ['RC-R-razon-de-cambio', 'RC-R-relacion-lineal'],
  'REPARTO-PROPORCIONAL': ['RC-R-reparto-en-cascada', 'RC-R-reparto-proporcional'],
  'OPTIMIZACION-RAZON': ['RC-R-costo-por-unidad', 'RC-R-razon-de-cambio'],
  'CONVERSION-UNIDADES': ['RC-R-conversion-unidades'],
  'PORCENTAJE-AVANZADO': ['RC-R-subir-bajar-mismo-porcentaje', 'RC-R-variaciones-sucesivas', 'RC-R-cambio-porcentual', 'RC-R-factor-multiplicativo'],
  'SUCESIONES-SERIES': ['RC-R-serie-geometrica-infinita', 'RC-R-aritmetica-vs-geometrica', 'RC-R-progresion-geometrica', 'RC-R-progresion-aritmetica'],
  'VARIACIONES-SUCESIVAS': ['RC-R-subir-bajar-mismo-porcentaje', 'RC-R-variaciones-sucesivas', 'RC-R-factor-multiplicativo', 'RC-R-interes-compuesto'],
  'INTERES-SIMPLE-COMPUESTO': ['RC-R-regla-del-72', 'RC-R-interes-compuesto', 'RC-R-interes-simple'],
  'PROMEDIO-DE-PROMEDIOS': ['RC-R-promedio-ponderado'],
  'CORRELACION-CAUSALIDAD': ['RC-R-correlacion-causalidad'],
  'ESCALAS-ENGANOSAS': ['RC-R-eje-truncado'],
  'PROPORCIONALIDAD-DIRECTA-INVERSA': ['RC-R-regla-de-tres-compuesta', 'RC-R-tasas-que-se-suman', 'RC-R-proporcionalidad-inversa', 'RC-R-proporcionalidad-directa', 'RC-R-regla-de-tres-simple'],
  'NOTACION-NUEVA-EN-PROBLEMA': ['RC-R-notacion-nueva'],
  'RIESGO-RELATIVO-ABSOLUTO': ['RC-R-riesgo-relativo-absoluto'],
  'REP-DATOS': ['RC-R-eje-truncado', 'RC-R-tendencia-vs-fluctuacion'],
  'CONJUNTOS': ['RC-R-conjuntos-union-interseccion'],
  'CONTEO': ['RC-R-principio-multiplicacion', 'RC-R-principio-suma'],
  'PROBABILIDAD': ['RC-R-falacia-del-jugador', 'RC-R-falacia-tasa-base', 'RC-R-probabilidad-complementaria', 'RC-R-probabilidad-clasica'],
  'PROMEDIO-RANGO': ['RC-R-media-y-rango', 'RC-R-promedio-ponderado'],
  'MUESTREO': ['RC-R-muestra-representativa'],
  'LECTURA-TABLA': ['RC-R-tendencia-vs-fluctuacion'],
  'EXTRAPOLACION': ['RC-R-extrapolacion', 'RC-R-tendencia-vs-fluctuacion'],
  'TRIANGULOS-POLIGONOS': ['RC-R-area-triangulo', 'RC-R-perimetro-no-determina-area', 'RC-R-desigualdad-triangular'],
  'SOLIDOS': ['RC-R-volumen-prisma-cilindro', 'RC-R-area-circulo'],
  'PARALELISMO-ORTOGONALIDAD': ['RC-R-suficiencia-de-datos', 'RC-R-area-triangulo'],
  'DESIGUALDAD-TRIANGULAR': ['RC-R-desigualdad-triangular'],
  'COORDENADAS-CARTESIANAS': ['RC-R-distancia-entre-puntos'],
  'SUFICIENCIA-DATOS': ['RC-R-suficiencia-de-datos', 'RC-R-perimetro-no-determina-area'],
  'ROTACION-ORIENTACION': ['RC-R-numeracion-pistas'],
  'ESPIRAL-RAICES': ['RC-R-espiral-de-teodoro'],
}

// Reglas transversales: se prueban DESPUÉS de las del bloque, para cualquier
// tarjeta cuyo bloque no encontró frase.
const TRANSVERSALES = [
  'RC-R-factor-multiplicativo',
  'RC-R-proporcionalidad-directa',
  'RC-R-proporcionalidad-inversa',
  'RC-R-promedio-ponderado',
  'RC-R-correlacion-causalidad',
  'RC-R-regla-de-tres-simple',
  'RC-R-probabilidad-complementaria',
  'RC-R-area-circulo',
]

// Frases-disparador por regla (el grupo 0 del match es lo que se envuelve).
const FRASES_POR_REGLA = {
  'RC-R-porcentaje-de': [/porcentaje de una cantidad/i, /el \d+\s?% de/i, /\bpor ciento\b/i],
  'RC-R-cambio-porcentual': [/variaci[oó]n porcentual/i, /porcentaje de cambio/i, /cambio porcentual/i],
  'RC-R-factor-multiplicativo': [/factor multiplicativo/i, /como una multiplicaci[oó]n/i, /representarse como una multiplicaci[oó]n/i],
  'RC-R-notacion-cientifica': [/notaci[oó]n cient[ií]fica/i],
  'RC-R-notacion-cientifica-ops': [/suman los exponentes/i, /restan los exponentes/i, /multiplican los coeficientes/i, /dividen los coeficientes/i],
  'RC-R-relacion-lineal': [/relaci[oó]n lineal/i, /\bpendiente\b/i, /\bintercepto\b/i],
  'RC-R-razon-de-cambio': [/raz[oó]n de cambio/i],
  'RC-R-conversion-unidades': [/conversi[oó]n de unidades/i, /convertir de una unidad/i, /factores? unitario/i],
  'RC-R-reparto-proporcional': [/reparto proporcional/i, /en partes iguales/i, /en proporci[oó]n a/i],
  'RC-R-reparto-en-cascada': [/reparto en cascada/i, /reparto por niveles/i, /en cascada/i, /cada nivel (?:mantiene|conserva) su/i],
  'RC-R-costo-por-unidad': [/costo por unidad/i, /precio por (?:unidad|tornillo|kil[oó]gramo|kg|kilo)/i, /raz[oó]n unitaria/i, /costo unitario/i],
  'RC-R-progresion-aritmetica': [/progresi[oó]n aritm[eé]tica/i, /diferencia (?:fija|constante)/i, /t[eé]rmino n(?:-[eé]simo)?/i],
  'RC-R-progresion-geometrica': [/progresi[oó]n geom[eé]trica/i, /raz[oó]n (?:fija|constante)/i, /crecimiento exponencial/i],
  'RC-R-aritmetica-vs-geometrica': [/aritm[eé]tica vs\.? geom[eé]trica/i, /tres t[eé]rminos/i, /resta constante/i, /divisi[oó]n constante/i],
  'RC-R-serie-geometrica-infinita': [/serie geom[eé]trica infinita/i, /infinitos t[eé]rminos/i, /suma (?:de )?infinit/i],
  'RC-R-variaciones-sucesivas': [/cambios (?:porcentuales )?sucesivos/i, /variaciones sucesivas/i, /encaden\w+ multiplicando/i, /multiplic\w+ (?:todos )?(?:esos |los )?factores/i],
  'RC-R-subir-bajar-mismo-porcentaje': [/subir y (?:luego )?bajar el mismo/i, /no se cancela/i, /se cancela/i],
  'RC-R-interes-simple': [/inter[eé]s simple/i],
  'RC-R-interes-compuesto': [/inter[eé]s compuesto/i, /intereses sobre (?:los )?intereses/i],
  'RC-R-regla-del-72': [/regla del 72/i],
  'RC-R-promedio-ponderado': [/promedio ponderado/i, /promedio de promedios/i, /pesar cada grupo/i, /ponderad[oa]/i],
  'RC-R-correlacion-causalidad': [/correlaci[oó]n no (?:implica|es) causalidad/i, /correlaci[oó]n y causalidad/i, /\bcorrelaci[oó]n\b/i, /tercera variable/i, /var[íi]an juntas/i],
  'RC-R-eje-truncado': [/eje (?:truncado|manipulado)/i, /ejes? enga[nñ]os/i, /no (?:empieza|arranca) en cero/i, /escala (?:enga[nñ]osa|comprimida)/i, /eje vertical/i],
  'RC-R-proporcionalidad-directa': [/proporcionalidad directa/i, /directamente proporcional/i],
  'RC-R-proporcionalidad-inversa': [/proporcionalidad inversa/i, /inversamente proporcional/i],
  'RC-R-tasas-que-se-suman': [/sumar (?:las )?tasas/i, /tasas de (?:llenado|trabajo)/i, /trabajos? simult[aá]neo/i],
  'RC-R-regla-de-tres-simple': [/regla de tres simple/i],
  'RC-R-regla-de-tres-compuesta': [/regla de tres compuesta/i],
  'RC-R-notacion-nueva': [/s[ií]mbolo (?:definido|nuevo)/i, /notaci[oó]n nueva/i, /definid[oa] en el (?:propio )?problema/i, /operaci[oó]n (?:propia|del problema)/i],
  'RC-R-riesgo-relativo-absoluto': [/riesgo relativo/i, /riesgo absoluto/i],
  'RC-R-probabilidad-clasica': [/casos favorables/i, /probabilidad (?:cl[aá]sica|de (?:un|el) evento)/i, /entre 0 y 1/i],
  'RC-R-probabilidad-complementaria': [/probabilidad complementaria/i, /1 menos la probabilidad/i, /complementari[oa]/i, /al menos un/i],
  'RC-R-principio-multiplicacion': [/principio de (?:la )?multiplicaci[oó]n/i, /una opci[oó]n de cada grupo/i, /combinar una de cada/i],
  'RC-R-principio-suma': [/principio de (?:la )?suma/i],
  'RC-R-media-y-rango': [/\brango\b/i, /valor m[aá]ximo menos el m[ií]nimo/i, /media aritm[eé]tica/i],
  'RC-R-muestra-representativa': [/muestra representativa/i, /muestra (?:grande|suficiente)/i, /representa\w* (?:a )?(?:la|toda la) poblaci[oó]n/i, /sesgo de (?:selecci[oó]n|muestreo)/i],
  'RC-R-conjuntos-union-interseccion': [/uni[oó]n de (?:dos )?conjuntos/i, /intersecci[oó]n/i, /diagrama de Venn/i],
  'RC-R-extrapolacion': [/extrapol\w+/i, /proyectar (?:fuera|m[aá]s all[aá])/i, /fuera del rango/i],
  'RC-R-tendencia-vs-fluctuacion': [/disminuci[oó]n constante/i, /tendencia (?:constante|decreciente|creciente)/i, /no fue constante/i],
  'RC-R-falacia-tasa-base': [/falacia de la tasa base/i, /tasa base/i, /falso positivo/i],
  'RC-R-falacia-del-jugador': [/falacia del jugador/i, /eventos? independientes?/i],
  'RC-R-area-triangulo': [/[aá]rea de un tri[aá]ngulo/i, /base (?:por|×|x) (?:la )?altura/i, /altura(?: es)? perpendicular/i],
  'RC-R-area-circulo': [/[aá]rea de(?:l| un) c[ií]rculo/i, /pi por el radio/i, /radio al cuadrado/i, /circunferencia/i, /usar el di[aá]metro/i],
  'RC-R-volumen-prisma-cilindro': [/volumen de (?:un )?(?:cilindro|prisma)/i, /[aá]rea de la base (?:por|×|x|multiplicada)/i, /lado al cubo/i],
  'RC-R-perimetro-no-determina-area': [/mismo per[ií]metro/i, /el per[ií]metro (?:no|solo|por s[ií])/i, /figuras? irregular/i],
  'RC-R-desigualdad-triangular': [/desigualdad triangular/i, /formar (?:un )?tri[aá]ngulo/i],
  'RC-R-suficiencia-de-datos': [/suficiencia de (?:los )?datos/i, /datos suficientes/i, /medir (?:solo )?una parte/i, /son suficientes (?:estas|los|estos)/i],
  'RC-R-distancia-entre-puntos': [/f[oó]rmula de (?:la )?distancia/i, /distancia entre (?:dos )?puntos/i, /ra[íi]z de la suma de los cuadrados/i],
  'RC-R-numeracion-pistas': [/n[uú]mero de (?:la )?pista/i, /numeraci[oó]n de (?:las )?pistas/i, /\brumbo\b/i],
  'RC-R-espiral-de-teodoro': [/espiral de Teodoro/i, /espiral de ra[íi]ces/i, /caracol de Pit[aá]goras/i],
}

const rulebook = JSON.parse(fs.readFileSync(`${DIR}/rc_reglas.json`, 'utf8'))
const idsRegla = new Set(rulebook.map((r) => r.id))
for (const arr of Object.values(BLOQUE_A_REGLAS)) for (const id of arr) if (!idsRegla.has(id)) throw new Error(`regla inexistente en rulebook: ${id}`)
for (const id of TRANSVERSALES) if (!idsRegla.has(id)) throw new Error(`transversal inexistente: ${id}`)
for (const id of Object.keys(FRASES_POR_REGLA)) if (!idsRegla.has(id)) throw new Error(`frases para regla inexistente: ${id}`)

function tokenizarConRegla(texto, ruleId) {
  if (typeof texto !== 'string' || texto.includes('[[')) return null
  const patrones = FRASES_POR_REGLA[ruleId] || []
  for (const re of patrones) {
    const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
    for (const m of texto.matchAll(global)) {
      const frase = m[0]
      if (frase.includes('|') || frase.includes('**') || frase.includes('[')) continue
      const antes = texto.slice(Math.max(0, m.index - 2), m.index)
      const despues = texto.slice(m.index + frase.length, m.index + frase.length + 2)
      if (antes.includes('*') || despues.includes('*')) continue
      return texto.slice(0, m.index) + `[[${ruleId}|${frase}]]` + texto.slice(m.index + frase.length)
    }
  }
  return null
}

function aplicar(obj, campos, candidatas) {
  for (const ruleId of candidatas) {
    for (const c of campos) {
      const nuevo = tokenizarConRegla(obj[c], ruleId)
      if (nuevo) {
        if (!DRY) obj[c] = nuevo
        return { campo: c, ruleId, muestra: nuevo.match(/\[\[[^\]]+\]\]/)[0] }
      }
    }
  }
  return null
}

// ---- tarjetas de concepto ----
const BANCOS_CONCEPTOS = ['rc_conceptos_algebra_calculo', 'rc_conceptos_contexto_aplicado', 'rc_conceptos_estadistica', 'rc_conceptos_geometria']
let cHechas = 0
let cTotal = 0
const cLog = []
const cSin = []
for (const b of BANCOS_CONCEPTOS) {
  const path = `${DIR}/${b}.json`
  const cards = JSON.parse(fs.readFileSync(path, 'utf8'))
  for (const card of cards) {
    cTotal++
    if (JSON.stringify(card).includes('[[')) continue
    const candidatas = [...(BLOQUE_A_REGLAS[card.bloque] || []), ...TRANSVERSALES]
    const res = aplicar(card, ['regla', 'error_comun', 'respuesta'], candidatas)
    if (res) {
      cHechas++
      cLog.push(`${card.id.padEnd(11)} ${res.campo.padEnd(12)} ${res.muestra}`)
    } else {
      cSin.push(`${card.id.padEnd(11)} bloque ${card.bloque}`)
    }
  }
  if (!DRY) fs.writeFileSync(path, JSON.stringify(cards, null, 2) + '\n')
}

// ---- ítems de opción múltiple ----
const BANCOS_ITEMS = [
  'rc_items_argumentacion',
  'rc_items_formulacion_ejecucion',
  'rc_items_geometria_contexto_facil',
  'rc_items_interpretacion_representacion',
  'rc_items_probabilidad',
  'rc_items_uis_entrenamiento',
]
let iHechas = 0
let iTotal = 0
const iLog = []
for (const b of BANCOS_ITEMS) {
  const path = `${DIR}/${b}.json`
  const grupos = JSON.parse(fs.readFileSync(path, 'utf8'))
  for (const g of grupos) {
    for (const p of g.preguntas) {
      iTotal++
      if (JSON.stringify(p).includes('[[')) continue
      // el `contenido` de la pregunta es el núcleo, no el bloque; se prueban
      // solo las transversales + las reglas de todos los bloques de ese
      // núcleo no se conocen aquí, así que se usa el pool transversal, que
      // cubre los conceptos que más aparecen en `explicacion_correcta`.
      const res = aplicar(p, ['explicacion_correcta'], TRANSVERSALES.concat(Object.keys(FRASES_POR_REGLA)))
      if (res) {
        iHechas++
        iLog.push(`${p.id.padEnd(12)} ${res.muestra}`)
      }
    }
  }
  if (!DRY) fs.writeFileSync(path, JSON.stringify(grupos, null, 2) + '\n')
}

console.log(`\n=== TARJETAS: ${cHechas}/${cTotal} tokenizadas ===`)
cLog.forEach((l) => console.log('  ' + l))
if (cSin.length) {
  console.log(`\n--- ${cSin.length} sin token ---`)
  cSin.forEach((l) => console.log('  ' + l))
}
console.log(`\n=== ÍTEMS: ${iHechas}/${iTotal} con token en explicacion_correcta ===`)
iLog.forEach((l) => console.log('  ' + l))
console.log(DRY ? '\n(dry run — nada escrito)' : '\n(escrito)')
