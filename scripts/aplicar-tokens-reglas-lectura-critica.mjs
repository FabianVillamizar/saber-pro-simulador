import fs from 'node:fs'

// Retrofit de tokens [[LC-R-...|frase]] sobre las 173 tarjetas de concepto
// y los 27 ítems de Quiz Rápido de Lectura Crítica. Mismo patrón que
// aplicar-tokens-reglas-diosgenina.mjs (envuelve EN SITIO la primera
// frase-disparador que ya vive en el texto, un solo token por
// tarjeta/ítem, nunca en pregunta/respuesta_breve/opciones), con un añadido
// propio: el `subtema` de cada tarjeta ya dice qué regla le corresponde
// (no hay que adivinar por regex de contenido general), así que el mapeo
// SUBTEMA_A_REGLA hace la selección de regla y los patrones de REGLAS solo
// buscan DÓNDE envolver el token dentro del texto de esa tarjeta.

const DRY = process.argv.includes('--dry')

// subtema (tal cual vive en los 4 bancos de tarjetas) -> id de regla.
const SUBTEMA_A_REGLA = {
  metafora: 'LC-R-fig-metafora-simil',
  simil_o_comparacion: 'LC-R-fig-metafora-simil',
  metafora_vs_simil: 'LC-R-fig-metafora-simil',
  metonimia: 'LC-R-fig-metonimia-sinecdoque',
  sinecdoque: 'LC-R-fig-metonimia-sinecdoque',
  metonimia_vs_sinecdoque: 'LC-R-fig-metonimia-sinecdoque',
  hiperbole: 'LC-R-fig-hiperbole',
  ironia: 'LC-R-fig-ironia-sarcasmo',
  ironia_vs_sarcasmo: 'LC-R-fig-ironia-sarcasmo',
  personificacion_o_prosopopeya: 'LC-R-fig-personificacion-apostrofe',
  apostrofe_retorico: 'LC-R-fig-personificacion-apostrofe',
  personificacion_vs_apostrofe_retorico: 'LC-R-fig-personificacion-apostrofe',
  paradoja: 'LC-R-fig-oximoron-paradoja',
  oximoron: 'LC-R-fig-oximoron-paradoja',
  oximoron_vs_paradoja: 'LC-R-fig-oximoron-paradoja',
  antitesis: 'LC-R-fig-antitesis',
  anafora: 'LC-R-fig-anafora',
  aliteracion: 'LC-R-fig-aliteracion',
  eufemismo: 'LC-R-fig-eufemismo',
  hiperbaton: 'LC-R-fig-hiperbaton',
  simbolo_y_alegoria: 'LC-R-fig-simbolo-alegoria',
  simbolo_vs_alegoria: 'LC-R-fig-simbolo-alegoria',
  pregunta_retorica: 'LC-R-fig-pregunta-retorica',
  epiteto: 'LC-R-fig-epiteto-metafora',
  epiteto_vs_metafora: 'LC-R-fig-epiteto-metafora',
  onomatopeya: 'LC-R-fig-onomatopeya',
  gradacion_o_climax: 'LC-R-fig-gradacion',
  metaficcion: 'LC-R-fig-metaficcion',
  que_es_la_idea_principal_de_un_parrafo: 'LC-R-fun-idea-principal',
  donde_suele_aparecer_la_tesis: 'LC-R-fun-ubicacion-tesis',
  diferencia_entre_hecho_y_opinion: 'LC-R-fun-hecho-opinion',
  como_resumir_un_parrafo_en_una_sola_frase: 'LC-R-fun-resumen-fiel',
  diferencia_entre_resumir_y_opinar_sobre_un_texto: 'LC-R-fun-resumen-fiel',
  como_detectar_el_proposito_del_texto: 'LC-R-fun-proposito-texto',
  como_identificar_quien_habla_en_el_texto: 'LC-R-glo-voces-interlocutores',
  tesis_y_argumentos_de_soporte: 'LC-R-glo-tesis-soporte',
  tesis_y_su_antitesis_a_nivel_textual: 'LC-R-glo-tesis-antitesis',
  tipos_de_audiencia_de_un_texto: 'LC-R-glo-audiencia',
  voces_e_interlocutores_en_el_texto: 'LC-R-glo-voces-interlocutores',
  tipologia_textual: 'LC-R-glo-tipologia-textual',
  textos_continuos_y_discontinuos: 'LC-R-glo-tipologia-textual',
  estrategias_discursivas_comparacion_ejemplificacion_refutacion_concesion: 'LC-R-glo-estrategias-discursivas',
  funcion_del_titulo_y_los_parrafos_en_el_sentido_global: 'LC-R-glo-funcion-titulo-parrafos',
  relacion_causa_efecto_en_un_texto: 'LC-R-glo-causa-efecto',
  como_extraer_conclusiones_no_explicitas: 'LC-R-glo-conclusiones-implicitas',
  conectores_y_su_funcion_en_el_sentido_global: 'LC-R-glo-conectores',
  funcion_poetica_del_lenguaje: 'LC-R-glo-funcion-poetica',
  anticipacion_narrativa_o_foreshadowing: 'LC-R-glo-foreshadowing',
  proporcion_relativa_vs_valor_absoluto: 'LC-R-glo-proporcion-relativa',
  supuestos_no_explicitos_de_un_autor: 'LC-R-ref-supuestos-no-explicitos',
  tecnicas_de_persuasion_o_entretenimiento: 'LC-R-ref-tecnicas-persuasion',
  diferencia_entre_hecho_y_opinion_en_contexto_argumentativo: 'LC-R-fun-hecho-opinion',
  como_valorar_la_intencion_del_autor: 'LC-R-ref-intencion-autor',
  como_detectar_sesgo_o_parcialidad_del_autor: 'LC-R-ref-sesgo-autor',
  como_evaluar_la_suficiencia_de_la_evidencia: 'LC-R-ref-suficiencia-evidencia',
}
// Las 9 falacias comparten subtema 'tipos_de_falacias_comunes' — se
// resuelven por el texto de la propia pregunta (ver FALACIAS abajo), no por
// el mapa de subtema.
const FALACIAS = [
  ['LC-R-fal-ad-hominem', /ad hominem/i],
  ['LC-R-fal-falsa-dicotomia', /falsa dicotom/i],
  ['LC-R-fal-generalizacion-apresurada', /generalizaci[oó]n apresurada/i],
  ['LC-R-fal-apelacion-autoridad', /apelaci[oó]n a la autoridad/i],
  ['LC-R-fal-apelacion-emocion', /apelaci[oó]n a la emoci[oó]n/i],
  ['LC-R-fal-pendiente-resbaladiza', /pendiente resbaladiza/i],
  ['LC-R-fal-circularidad', /circularidad|petici[oó]n de principio/i],
  ['LC-R-fal-hombre-de-paja', /hombre de paja/i],
  ['LC-R-fal-correlacion-causalidad', /correlaci[oó]n (?:con|y) causalidad|post hoc/i],
]


// Frases-disparador por regla, en orden de prioridad (específica antes que
// general). El grupo 0 de cada patrón es la frase a envolver.
const FRASES_POR_REGLA = {
  'LC-R-fig-metafora-simil': [/\bs[ií]mil\b/i, /\bmet[aá]fora\b/i],
  'LC-R-fig-metonimia-sinecdoque': [/\bsin[eé]cdoque\b/i, /\bmetonimia\b/i],
  'LC-R-fig-ironia-sarcasmo': [/\bsarcasmo\b/i, /\bironía\b|\bironia\b/i],
  'LC-R-fig-personificacion-apostrofe': [/\bap[oó]strofe retórico\b/i, /\bpersonificaci[oó]n\b/i, /\bprosopopeya\b/i],
  'LC-R-fig-oximoron-paradoja': [/\bparadoja\b/i, /\box[ií]moron\b/i],
  'LC-R-fig-simbolo-alegoria': [/\balegor[ií]a\b/i, /\bs[ií]mbolo\b/i],
  'LC-R-fig-epiteto-metafora': [/\bep[ií]teto\b/i],
  'LC-R-fig-hiperbole': [/\bhip[eé]rbole\b/i, /\bexageraci[oó]n\b/i],
  'LC-R-fig-antitesis': [/\bant[ií]tesis\b/i],
  'LC-R-fig-anafora': [/\ban[aá]fora\b/i],
  'LC-R-fig-aliteracion': [/\baliteraci[oó]n\b/i],
  'LC-R-fig-eufemismo': [/\beufemismo\b/i],
  'LC-R-fig-hiperbaton': [/\bhip[eé]rbaton\b/i],
  'LC-R-fig-pregunta-retorica': [/\bpregunta retórica\b/i, /\bes retórica\b/i],
  'LC-R-fig-onomatopeya': [/\bonomatopeya\b/i],
  'LC-R-fig-gradacion': [/\bgradaci[oó]n\b/i, /\bcl[ií]max\b/i],
  'LC-R-fig-metaficcion': [/\bmetaficci[oó]n\b/i],
  'LC-R-fun-idea-principal': [/idea principal/i],
  'LC-R-fun-ubicacion-tesis': [/tesis impl[ií]cita/i, /\btesis\b/i],
  'LC-R-fun-hecho-opinion': [/hecho verificable/i, /\bhecho\b[^.]{0,15}\bopini[oó]n\b/i, /hecho (?:puro|cerrado|unánimemente aceptado)/i, /\bopini[oó]n\b/i, /\bhecho\b/i],
  'LC-R-fun-resumen-fiel': [/resumir? (?:un texto|un p[aá]rrafo|fielmente)/i, /distractor/i, /\bresumen\b/i],
  'LC-R-fun-proposito-texto': [/prop[oó]sito (?:comunicativo|del texto|dominante)/i, /prop[oó]sito dominante/i, /\bprop[oó]sito\b/i],
  'LC-R-glo-tesis-soporte': [/argumentos? de soporte/i, /raz[oó]n general que justifica/i, /\bargumento\b/i],
  'LC-R-glo-tesis-antitesis': [/ant[ií]tesis de (?:la|un) tesis/i, /idea (?:exactamente )?opuesta a (?:la|su) tesis/i, /ant[ií]tesis exacta/i, /\bant[ií]tesis\b/i],
  'LC-R-glo-audiencia': [/tipo de audiencia/i, /\baudiencia\b/i],
  'LC-R-glo-voces-interlocutores': [/\binterlocutor(?:es)?\b/i, /voces? (?:citadas|distintas|del texto)/i, /\bvoz\b/i],
  'LC-R-glo-tipologia-textual': [/texto discontinuo/i, /texto continuo/i, /tipolog[ií]a textual/i, /\bexpositivo\b/i, /\bargumentativo\b/i, /\bnarrativo\b/i, /\bdescriptivo\b/i],
  'LC-R-glo-estrategias-discursivas': [/cita de autoridad/i, /\bconcesi[oó]n\b/i, /\brefutaci[oó]n\b/i, /ejemplificaci[oó]n/i, /\bcomparaci[oó]n\b/i],
  'LC-R-glo-funcion-titulo-parrafos': [/funci[oó]n de(?:l)? (?:un )?p[aá]rrafo/i, /funci[oó]n (?:que cumple )?el t[ií]tulo/i, /\bt[ií]tulo\b/i, /funci[oó]n dentro de la (?:arquitectura|estructura)/i, /p[aá]rrafo de cierre/i],
  'LC-R-glo-causa-efecto': [/relaci[oó]n de causa-efecto/i, /causa principal/i],
  'LC-R-glo-conclusiones-implicitas': [/conclusi[oó]n no expl[ií]cita/i, /se desprende l[oó]gicamente/i, /conclusi[oó]n (?:válida|inválida|deducible)/i],
  'LC-R-glo-conectores': [/funci[oó]n (?:global )?de los conectores/i, /\bconectores?\b/i, /\bconector\b/i],
  'LC-R-glo-funcion-poetica': [/funci[oó]n po[eé]tica/i],
  'LC-R-glo-foreshadowing': [/anticipaci[oó]n narrativa/i, /foreshadowing/i, /\banticipaci[oó]n\b/i],
  'LC-R-glo-proporcion-relativa': [/proporci[oó]n relativa/i, /valor absoluto/i],
  'LC-R-ref-supuestos-no-explicitos': [/supuesto no expl[ií]cito/i, /supuesto (?:oculto|necesario)/i],
  'LC-R-ref-tecnicas-persuasion': [/t[eé]cnicas? (?:de )?persuasi[oó]n/i, /t[eé]cnicas? persuasivas?/i, /\bentretener\b/i, /\bt[eé]cnicas?\b/i],
  'LC-R-ref-intencion-autor': [/intenci[oó]n del autor/i, /intenci[oó]n declarada/i, /intenci[oó]n persuasiva/i, /\bintenci[oó]n\b/i],
  'LC-R-ref-sesgo-autor': [/sesgo o parcialidad/i, /\bsesgo\b/i],
  'LC-R-ref-suficiencia-evidencia': [/suficiencia de la evidencia/i, /evidencia (?:sólida|anecd[oó]tica)/i],
  'LC-R-fal-ad-hominem': [/ad hominem/i, /ataque personal/i],
  'LC-R-fal-falsa-dicotomia': [/falsa dicotom[ií]a/i, /falso dilema/i, /dos opciones extremas/i],
  'LC-R-fal-generalizacion-apresurada': [/generalizaci[oó]n apresurada/i, /\bgeneralizaci[oó]n\b/i],
  'LC-R-fal-apelacion-autoridad': [/apelaci[oó]n a la autoridad/i, /autoridad citada/i],
  'LC-R-fal-apelacion-emocion': [/apelaci[oó]n a la emoci[oó]n/i, /carga emocional/i, /\bla emoci[oó]n\b/i],
  'LC-R-fal-pendiente-resbaladiza': [/pendiente resbaladiza/i, /cadena de consecuencias/i],
  'LC-R-fal-circularidad': [/circularidad/i, /petici[oó]n de principio/i],
  'LC-R-fal-hombre-de-paja': [/hombre de paja/i],
  'LC-R-fal-correlacion-causalidad': [/correlaci[oó]n (?:con|y) causalidad/i, /post hoc/i],
}

const rulebook = JSON.parse(fs.readFileSync('src/data/lectura-critica/lc_reglas.json', 'utf8'))
const idsRegla = new Set(rulebook.map((r) => r.id))
for (const id of Object.values(SUBTEMA_A_REGLA)) if (!idsRegla.has(id)) throw new Error(`regla inexistente en rulebook: ${id}`)
for (const [id] of FALACIAS) if (!idsRegla.has(id)) throw new Error(`regla inexistente en rulebook: ${id}`)
for (const id of Object.keys(FRASES_POR_REGLA)) if (!idsRegla.has(id)) throw new Error(`regla con frases pero inexistente en rulebook: ${id}`)

// Envuelve la primera coincidencia de las frases de `ruleId` que aparezca
// en `texto`, evitando spans "**...**" (antes/después de 2 caracteres).
function tokenizarConRegla(texto, ruleId) {
  if (typeof texto !== 'string' || texto.includes('[[')) return null
  const patrones = FRASES_POR_REGLA[ruleId]
  if (!patrones) return null
  for (const re of patrones) {
    const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
    for (const m of texto.matchAll(global)) {
      const frase = m[0]
      if (frase.includes('|') || frase.includes('**')) continue
      const antes = texto.slice(Math.max(0, m.index - 2), m.index)
      const despues = texto.slice(m.index + frase.length, m.index + frase.length + 2)
      if (antes.includes('*') || despues.includes('*')) continue
      const nuevo = texto.slice(0, m.index) + `[[${ruleId}|${frase}]]` + texto.slice(m.index + frase.length)
      return { texto: nuevo, ruleId }
    }
  }
  return null
}

function aplicarEnCampos(obj, campos, ruleId) {
  for (const c of campos) {
    const r = tokenizarConRegla(obj[c], ruleId)
    if (r) {
      if (!DRY) obj[c] = r.texto
      return { campo: c, ruleId: r.ruleId, muestra: r.texto.match(/\[\[[^\]]+\]\]/)[0] }
    }
  }
  return null
}

// ---- tarjetas de concepto ----
const BANCOS = ['lc_fig_figuras_retoricas', 'lc_fun_estrategias_fundamentales', 'lc_glo_estrategias_discursivas', 'lc_ref_herramientas_evaluacion_critica']
let cHechas = 0,
  cTotal = 0,
  cSinRegla = 0
const cLog = []
const cSinReglaLog = []
for (const b of BANCOS) {
  const path = `src/data/lectura-critica/${b}.json`
  const cards = JSON.parse(fs.readFileSync(path, 'utf8'))
  for (const card of cards) {
    cTotal++
    if (JSON.stringify(card).includes('[[')) continue
    let ruleId = SUBTEMA_A_REGLA[card.subtema]
    if (!ruleId && card.subtema === 'tipos_de_falacias_comunes') {
      const hit = FALACIAS.find(([, re]) => re.test(card.pregunta))
      if (hit) ruleId = hit[0]
    }
    if (!ruleId) {
      cSinRegla++
      cSinReglaLog.push(`${card.id.padEnd(10)} subtema sin mapear: ${card.subtema}`)
      continue
    }
    const res = aplicarEnCampos(card, ['explicacion', 'ejemplo_aplicado', 'error_comun'], ruleId)
    if (res) {
      cHechas++
      cLog.push(`${card.id.padEnd(10)} ${res.campo.padEnd(16)} ${res.muestra}`)
    } else {
      cSinReglaLog.push(`${card.id.padEnd(10)} regla ${ruleId} sin frase-disparador en el texto`)
    }
  }
  if (!DRY) fs.writeFileSync(path, JSON.stringify(cards, null, 2) + '\n')
}

// ---- Quiz Rápido (27 ítems, todos mcq) ----
const qPath = 'src/data/lectura-critica/lc_quiz_rapido.json'
const quiz = JSON.parse(fs.readFileSync(qPath, 'utf8'))
let qHechas = 0,
  qPend = 0
const qLog = []
const bancosPorCard = {}
for (const b of BANCOS) {
  for (const card of JSON.parse(fs.readFileSync(`src/data/lectura-critica/${b}.json`, 'utf8'))) bancosPorCard[card.id] = card.subtema
}
for (const it of quiz) {
  if (JSON.stringify(it).includes('[[')) continue
  qPend++
  const subtema = bancosPorCard[it.tarjetaId]
  let ruleId = SUBTEMA_A_REGLA[subtema]
  if (!ruleId && subtema === 'tipos_de_falacias_comunes' && Array.isArray(it.opciones) && Number.isInteger(it.correcta)) {
    // Ojo: la explicación de un mcq de falacias suele nombrar TAMBIÉN la
    // falacia incorrecta para contrastarla ("No es falsa dicotomía, que...")
    // — comparar contra el enunciado completo detectaría esa mención
    // negada en vez de la correcta. La opción correcta (`opciones[correcta]`)
    // es la única fuente confiable del nombre real de la falacia.
    const hit = FALACIAS.find(([, re]) => re.test(it.opciones[it.correcta]))
    if (hit) ruleId = hit[0]
  }
  if (!ruleId) continue
  const res = aplicarEnCampos(it, ['explicacion', 'enunciado'], ruleId)
  if (res) {
    qHechas++
    qLog.push(`${it.id} ${(it.categoria || '').padEnd(20)} ${res.campo.padEnd(11)} ${res.muestra}`)
  }
}
if (!DRY) fs.writeFileSync(qPath, JSON.stringify(quiz, null, 2) + '\n')

console.log(`\n=== TARJETAS DE CONCEPTO: ${cHechas}/${cTotal} tokenizadas (${cSinRegla} sin mapeo de regla) ===`)
cLog.forEach((l) => console.log('  ' + l))
if (cSinReglaLog.length) {
  console.log('\n--- sin token ---')
  cSinReglaLog.forEach((l) => console.log('  ' + l))
}
console.log(`\n=== QUIZ RÁPIDO: ${qHechas}/${qPend} sin-token tokenizados (${quiz.length - qPend} ya tenían) ===`)
qLog.forEach((l) => console.log('  ' + l))
console.log(DRY ? '\n(dry run — nada escrito)' : '\n(escrito)')
