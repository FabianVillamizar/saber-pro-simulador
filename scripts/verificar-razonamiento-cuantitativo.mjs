// Verificación integral de Razonamiento Cuantitativo: las 4 bancas de
// tarjetas de concepto (`rc_conceptos_*.json`), las 6 bancas de ítems de
// opción múltiple (`rc_items_*.json`, formato "grupo + preguntas" A-D), el
// banco de Lápiz y Papel (`rc_lapiz_papel.json`, fase 1 de 4 opciones) y —
// cuando exista — el rulebook de "Reglas en contexto" (`rc_reglas.json`).
//
// Nació de la auditoría de 2026-09-05 (misma pasada que ya cerró Lectura
// Crítica y Competencias Ciudadanas): `rc_items_argumentacion.json` tenía
// la opción correcta como la más larga en 29/30 preguntas (97%) y la fase 1
// de Lápiz y Papel en 30/38 (79%). Este script deja esas métricas como
// guardia de regresión, además de la integridad estructural que RC nunca
// tuvo verificada por separado.
//
// Correr: `node scripts/verificar-razonamiento-cuantitativo.mjs`
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import katex from 'katex'
import { NOMBRES_BLOQUE } from '../src/modulos/razonamiento-cuantitativo/exploracion.js'

const base = new URL('../src/data/razonamiento-cuantitativo/', import.meta.url)
const dirSvg = new URL('../src/assets/visuals/razonamiento-cuantitativo/', import.meta.url)
const dirRaster = new URL('../src/assets/raster/razonamiento-cuantitativo/', import.meta.url)

const leer = (archivo) => JSON.parse(readFileSync(new URL(`${archivo}.json`, base), 'utf-8'))
const svgEnDisco = new Set(readdirSync(dirSvg))
const rasterEnDisco = new Set(existsSync(dirRaster) ? readdirSync(dirRaster) : [])

let errores = 0
let avisos = 0
const fail = (msg) => {
  console.log('FAIL', msg)
  errores++
}
const aviso = (msg) => {
  console.log('AVISO', msg)
  avisos++
}
const pct = (n, d) => (d === 0 ? 0 : Math.round((100 * n) / d))

// ---------------------------------------------------------------------------
// Vocabulario compartido (espejo de indiceModulos.js + exploracion.js)
// ---------------------------------------------------------------------------
const NUCLEOS = new Set(['algebra_calculo', 'contexto_aplicado', 'estadistica', 'geometria'])
const COMPETENCIAS = new Set(['interpretacion_representacion', 'formulacion_ejecucion', 'argumentacion'])
const DIFICULTADES = new Set(['baja', 'media', 'alta'])
const MODOS = new Set(['cloze', 'pregunta'])
const BLOQUES = new Set(Object.keys(NOMBRES_BLOQUE))
const LETRAS = ['A', 'B', 'C', 'D']

const CONCEPTOS = {
  algebra_calculo: 'rc_conceptos_algebra_calculo',
  contexto_aplicado: 'rc_conceptos_contexto_aplicado',
  estadistica: 'rc_conceptos_estadistica',
  geometria: 'rc_conceptos_geometria',
}
const BANCOS_ITEMS = [
  'rc_items_argumentacion',
  'rc_items_formulacion_ejecucion',
  'rc_items_geometria_contexto_facil',
  'rc_items_interpretacion_representacion',
  'rc_items_probabilidad',
  'rc_items_uis_entrenamiento',
]

// ---------------------------------------------------------------------------
// 1. Tarjetas de concepto
// ---------------------------------------------------------------------------
const idsConcepto = new Set()
const tarjetas = []
for (const [nucleo, archivo] of Object.entries(CONCEPTOS)) {
  const banco = leer(archivo)
  for (const c of banco) {
    tarjetas.push(c)
    if (!/^RC-(ALG|CTX|EST|GEO)-\d+$/.test(c.id ?? '')) fail(`${archivo}: id fuera de patrón ${JSON.stringify(c.id)}`)
    if (idsConcepto.has(c.id)) fail(`id de tarjeta duplicado: ${c.id}`)
    idsConcepto.add(c.id)
    if (c.contenido !== nucleo) fail(`${c.id}: contenido "${c.contenido}" no coincide con el archivo (${nucleo})`)
    if (!BLOQUES.has(c.bloque)) fail(`${c.id}: bloque desconocido ${JSON.stringify(c.bloque)}`)
    if (!MODOS.has(c.modo)) fail(`${c.id}: modo debe ser cloze|pregunta (es ${JSON.stringify(c.modo)})`)
    if (!DIFICULTADES.has(c.dificultad)) fail(`${c.id}: dificultad inválida ${JSON.stringify(c.dificultad)}`)
    for (const campo of ['regla', 'ejemplo', 'error_comun']) {
      if (typeof c[campo] !== 'string' || c[campo].trim() === '') fail(`${c.id}: campo "${campo}" vacío o ausente`)
    }
    if (c.modo === 'cloze' && (typeof c.respuesta !== 'string' || c.respuesta.trim() === '')) {
      fail(`${c.id}: tarjeta cloze sin "respuesta"`)
    }
  }
}
// prereqs resuelven
for (const c of tarjetas) {
  for (const p of c.prereqs ?? []) {
    if (!idsConcepto.has(p)) fail(`${c.id}: prereq "${p}" no existe`)
  }
}
// visuales bien formados
const comprobarVisual = (obj, etiqueta, exigeVisualPosicion) => {
  if (!obj.tipo_visual || obj.tipo_visual === 'ninguno') return false
  const canales = ['grafica_datos_estructurados', 'tabla_filas', 'imagen'].filter((k) => obj[k])
  if (canales.length !== 1) {
    fail(`${etiqueta}: tipo_visual="${obj.tipo_visual}" pero ${canales.length} canales de datos (${canales.join(',') || 'ninguno'}); debe haber exactamente 1`)
  }
  if (obj.imagen) {
    const nombre = obj.imagen.split('/').pop()
    if (obj.imagen.endsWith('.svg') && !svgEnDisco.has(nombre)) fail(`${etiqueta}: imagen "${obj.imagen}" no existe en assets/visuals/razonamiento-cuantitativo/`)
    if (!obj.imagen.endsWith('.svg') && !rasterEnDisco.has(nombre)) fail(`${etiqueta}: imagen "${obj.imagen}" no existe en assets/raster/razonamiento-cuantitativo/`)
  }
  if (exigeVisualPosicion && !['frente', 'reverso'].includes(obj.visual_posicion)) {
    fail(`${etiqueta}: tarjeta con visual sin visual_posicion válido (frente|reverso) — RepasoConceptos.jsx no lo renderiza`)
  }
  return true
}
const visualPorNucleo = {}
for (const c of tarjetas) {
  visualPorNucleo[c.contenido] ??= { con: 0, total: 0 }
  visualPorNucleo[c.contenido].total++
  if (comprobarVisual(c, c.id, true)) visualPorNucleo[c.contenido].con++
}

// ---------------------------------------------------------------------------
// 2. Bancas de ítems de opción múltiple
// ---------------------------------------------------------------------------
const idsItem = new Set()
const idsGrupo = new Set()
const rubrica = {} // por banco: { total, masLarga, masCorta, margen, pos }
let rubricaGlobal = { total: 0, conLongitud: 0, masLarga: 0, masCorta: 0, margen: 0 }

for (const archivo of BANCOS_ITEMS) {
  const grupos = leer(archivo)
  const r = { total: 0, conLongitud: 0, masLarga: 0, masCorta: 0, margen: 0, pos: { A: 0, B: 0, C: 0, D: 0 } }
  for (const g of grupos) {
    if (!/^RC-GRUPO-\d+$/.test(g.id ?? '')) fail(`${archivo}: grupo con id fuera de patrón ${JSON.stringify(g.id)}`)
    if (idsGrupo.has(g.id)) fail(`id de grupo duplicado: ${g.id}`)
    idsGrupo.add(g.id)
    if (!Array.isArray(g.preguntas) || g.preguntas.length === 0) {
      fail(`${g.id}: grupo sin preguntas`)
      continue
    }
    comprobarVisual(g, g.id, false)
    for (const p of g.preguntas) {
      r.total++
      if (!/^RC-ITEM-\d+$/.test(p.id ?? '')) fail(`${g.id}: pregunta con id fuera de patrón ${JSON.stringify(p.id)}`)
      if (idsItem.has(p.id)) fail(`id de ítem duplicado entre bancas: ${p.id}`)
      idsItem.add(p.id)

      const letras = Object.keys(p.opciones ?? {})
      if (letras.length !== 4 || !LETRAS.every((l) => letras.includes(l))) {
        fail(`${p.id}: opciones debe tener exactamente A-D (tiene ${letras.join(',') || 'nada'})`)
        continue
      }
      for (const [l, t] of Object.entries(p.opciones)) {
        if (typeof t !== 'string' || t.trim() === '') fail(`${p.id}: opción ${l} vacía o no es texto`)
      }
      if (!letras.includes(p.respuesta_correcta)) {
        fail(`${p.id}: respuesta_correcta "${p.respuesta_correcta}" no es una letra válida`)
        continue
      }
      // distractores: exactamente las 3 letras no-correctas, cada una con explicación
      const dist = p.distractores ?? {}
      const esperadas = letras.filter((l) => l !== p.respuesta_correcta)
      for (const l of esperadas) {
        if (!dist[l]) fail(`${p.id}: falta distractor para la opción ${l}`)
        else if (typeof dist[l].explicacion !== 'string' || dist[l].explicacion.trim() === '') fail(`${p.id}: distractor ${l} sin explicación`)
      }
      for (const l of Object.keys(dist)) {
        if (l === p.respuesta_correcta) fail(`${p.id}: distractores incluye la letra correcta ${l}`)
        else if (!letras.includes(l)) fail(`${p.id}: distractor con letra inexistente ${l}`)
      }
      if (typeof p.explicacion_correcta !== 'string' || p.explicacion_correcta.trim() === '') fail(`${p.id}: explicacion_correcta vacía`)
      if (!COMPETENCIAS.has(p.competencia)) fail(`${p.id}: competencia inválida ${JSON.stringify(p.competencia)}`)
      if (!NUCLEOS.has(p.contenido)) fail(`${p.id}: contenido inválido ${JSON.stringify(p.contenido)}`)
      if (!DIFICULTADES.has(p.dificultad)) fail(`${p.id}: dificultad inválida ${JSON.stringify(p.dificultad)}`)
      for (const t of p.tarjetas_relacionadas ?? []) {
        if (!idsConcepto.has(t)) fail(`${p.id}: tarjetas_relacionadas apunta a "${t}", que no existe`)
      }
      if (p.opciones_imagen) {
        const li = Object.keys(p.opciones_imagen)
        if (li.length !== 4 || !LETRAS.every((l) => li.includes(l))) fail(`${p.id}: opciones_imagen no tiene A-D`)
        for (const ruta of Object.values(p.opciones_imagen)) {
          if (!rasterEnDisco.has(String(ruta).split('/').pop())) fail(`${p.id}: opciones_imagen "${ruta}" no existe en disco`)
        }
      }

      // --- rúbrica de sesgo ---
      r.pos[p.respuesta_correcta]++
      const lens = LETRAS.map((l) => p.opciones[l].length)
      const cl = p.opciones[p.respuesta_correcta].length
      const max = Math.max(...lens)
      const min = Math.min(...lens)
      // El sesgo de longitud solo es explotable si hay prosa real que leer:
      // en ítems de respuesta numérica ("13 m²" vs "40 m²"), de fórmula, o de
      // "¿cuál gráfica?" (opciones_imagen, donde el estudiante mira la imagen y
      // no este texto) la "longitud" no da ninguna pista. Se cuenta solo
      // cuando hay opciones de prosa de verdad: la más larga pasa de 40
      // caracteres y no es un ítem de opción-imagen.
      if (max !== min && max >= 40 && !p.opciones_imagen) {
        r.conLongitud++
        if (cl === max) r.masLarga++
        if (cl === min) r.masCorta++
        const resto = lens.filter((_, i) => LETRAS[i] !== p.respuesta_correcta)
        if (cl > 1.6 * (resto.reduce((a, b) => a + b, 0) / resto.length)) r.margen++
      }

      // --- fuga de la explicación: nombra textualmente la correcta y también un distractor ---
      const ec = p.explicacion_correcta.toLowerCase()
      const frag = (s) => s.toLowerCase().replace(/[.,;:]/g, '').trim().slice(0, 40)
      const correctaEn = frag(p.opciones[p.respuesta_correcta]).length > 12 && ec.includes(frag(p.opciones[p.respuesta_correcta]))
      const distractorEn = esperadas.some((l) => frag(p.opciones[l]).length > 12 && ec.includes(frag(p.opciones[l])))
      if (correctaEn && distractorEn) aviso(`${p.id}: la explicación parece citar textualmente la correcta y un distractor (posible fuga estilo-LC)`)
    }
  }
  rubrica[archivo] = r
  rubricaGlobal.total += r.total
  rubricaGlobal.conLongitud += r.conLongitud
  rubricaGlobal.masLarga += r.masLarga
  rubricaGlobal.masCorta += r.masCorta
  rubricaGlobal.margen += r.margen
}

// ---------------------------------------------------------------------------
// 3. Lápiz y Papel — fase 1
// ---------------------------------------------------------------------------
const lp = leer('rc_lapiz_papel')
const idsLp = new Set()
const lpRub = { total: 0, masLarga: 0, pos: [0, 0, 0, 0] }
for (const e of lp) {
  if (!/^RC-LP-\d+$/.test(e.id ?? '')) fail(`rc_lapiz_papel: id fuera de patrón ${JSON.stringify(e.id)}`)
  if (idsLp.has(e.id)) fail(`id de lápiz y papel duplicado: ${e.id}`)
  idsLp.add(e.id)
  if (!NUCLEOS.has(e.nucleo)) fail(`${e.id}: nucleo inválido ${JSON.stringify(e.nucleo)}`)
  if (!['formula', 'trampa'].includes(e.tipo)) fail(`${e.id}: tipo debe ser formula|trampa (es ${JSON.stringify(e.tipo)})`)
  if (e.bloque != null && !BLOQUES.has(e.bloque)) fail(`${e.id}: bloque desconocido ${JSON.stringify(e.bloque)} (usar null si no viene de una tarjeta)`)
  for (const campo of ['enunciado', 'promptFase1', 'respuesta', 'enfoqueCorto']) {
    if (typeof e[campo] !== 'string' || e[campo].trim() === '') fail(`${e.id}: campo "${campo}" vacío o ausente`)
  }
  if (!Array.isArray(e.opciones) || e.opciones.length !== 4) {
    fail(`${e.id}: fase 1 debe tener exactamente 4 opciones`)
    continue
  }
  const correctas = e.opciones.filter((o) => o.correcta)
  if (correctas.length !== 1) fail(`${e.id}: fase 1 debe tener exactamente 1 opción correcta (tiene ${correctas.length})`)
  e.opciones.forEach((o, i) => {
    if (typeof o.texto !== 'string' || o.texto.trim() === '') fail(`${e.id}: opción ${i} sin texto`)
  })
  const ci = e.opciones.findIndex((o) => o.correcta)
  if (ci >= 0) {
    lpRub.total++
    lpRub.pos[ci]++
    const lens = e.opciones.map((o) => o.texto.length)
    if (Math.max(...lens) !== Math.min(...lens) && lens[ci] === Math.max(...lens)) lpRub.masLarga++
  }
}

// ---------------------------------------------------------------------------
// 4. Rulebook de "Reglas en contexto" (opcional — Fase 2 de la auditoría)
// ---------------------------------------------------------------------------
const rutaReglas = new URL('rc_reglas.json', base)
if (existsSync(rutaReglas)) {
  const reglas = JSON.parse(readFileSync(rutaReglas, 'utf-8'))
  const TIPOS_OK = new Set(['regla', 'principio', 'norma', 'definicion', 'ley', 'corolario', 'teorema'])
  const idsRegla = new Set()
  const katexOk = (tex, ctx) => {
    try {
      katex.renderToString(String(tex), { throwOnError: true })
      return true
    } catch (e) {
      fail(`KaTeX no compila en ${ctx}: "${tex}" -> ${String(e.message).split('\n')[0]}`)
      return false
    }
  }
  for (const r of reglas) {
    if (typeof r.id !== 'string' || !/^RC-R-[a-z0-9-]+$/.test(r.id)) fail(`regla con id fuera de patrón: ${JSON.stringify(r.id)}`)
    if (idsRegla.has(r.id)) fail(`regla con id duplicado: ${r.id}`)
    idsRegla.add(r.id)
    for (const c of ['tipo', 'titulo', 'variante', 'cuerpo']) {
      if (typeof r[c] !== 'string' || r[c].trim() === '') fail(`${r.id}: campo "${c}" vacío o ausente`)
    }
    if (!TIPOS_OK.has(r.tipo)) fail(`${r.id}: tipo desconocido ${JSON.stringify(r.tipo)}`)
    if (!['corta', 'desarrollo'].includes(r.variante)) fail(`${r.id}: variante debe ser corta|desarrollo`)
    if (r.variante === 'desarrollo' && !r.formula && !r.tabla) fail(`${r.id}: variante "desarrollo" sin formula ni tabla`)
    if (r.formula) katexOk(r.formula, `${r.id}.formula`)
    // KaTeX de cada `$…$` embebido en cuerpo/ejemplo y en celdas de tabla
    for (const campo of ['cuerpo', 'ejemplo']) {
      const partes = String(r[campo] ?? '').split('$')
      for (let i = 1; i < partes.length; i += 2) katexOk(partes[i], `${r.id}.${campo}`)
    }
    if (r.tabla) {
      const t = r.tabla
      if (!Array.isArray(t.encabezados) || !Array.isArray(t.filas)) fail(`${r.id}: tabla mal formada`)
      else {
        const cols = t.encabezados.length
        t.filas.forEach((f, i) => {
          if (!Array.isArray(f) || f.length !== cols) fail(`${r.id}: fila ${i} de la tabla no tiene ${cols} celdas`)
        })
        for (const celda of [...t.encabezados, ...t.filas.flat()]) {
          const partes = String(celda).split('$')
          for (let i = 1; i < partes.length; i += 2) katexOk(partes[i], `${r.id}.tabla`)
        }
      }
    }
    // Estilo de prosa directa del proyecto: sin em-dash en título/cuerpo/ejemplo.
    for (const campo of ['titulo', 'cuerpo', 'ejemplo']) {
      if (typeof r[campo] === 'string' && /—|--/.test(r[campo])) aviso(`${r.id}: "${campo}" tiene guion largo, va contra el estilo de prosa directa`)
    }
  }
  // tokens [[id|texto]] en todo el contenido de RC resuelven a una regla real
  const TOKEN = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g
  const revisarTokens = (texto, etiqueta) => {
    if (typeof texto !== 'string') return
    for (const m of texto.matchAll(TOKEN)) {
      if (!idsRegla.has(m[1].trim())) fail(`${etiqueta}: token [[${m[1].trim()}]] no corresponde a ninguna regla de rc_reglas.json`)
    }
  }
  for (const c of tarjetas) for (const k of ['regla', 'ejemplo', 'error_comun', 'pregunta', 'respuesta']) revisarTokens(c[k], c.id)
  for (const archivo of BANCOS_ITEMS) {
    for (const g of leer(archivo)) for (const p of g.preguntas) revisarTokens(p.explicacion_correcta, p.id)
  }
  console.log(`\nrc_reglas.json: ${reglas.length} reglas, tokens verificados`)
} else {
  console.log('\nrc_reglas.json: aún no existe (Fase 2 de la auditoría) — se omite la verificación del rulebook')
}

// ---------------------------------------------------------------------------
// Informe
// ---------------------------------------------------------------------------
console.log(`\n== Inventario ==`)
console.log(`${tarjetas.length} tarjetas de concepto · ${idsItem.size} preguntas en ${idsGrupo.size} grupos · ${lp.length} ejercicios de lápiz y papel`)

console.log(`\n== Cobertura visual por núcleo ==`)
for (const [n, v] of Object.entries(visualPorNucleo)) {
  const p = pct(v.con, v.total)
  console.log(`  ${n}: ${v.con}/${v.total} (${p}%)`)
  if (p < 30) aviso(`cobertura visual baja en ${n} (${p}%)`)
}

console.log(`\n== Sesgo en bancas de opción múltiple (posición se baraja en vivo en Práctica/Simulacro) ==`)
console.log(`   (los % de longitud se miden solo sobre preguntas con opciones de prosa, > 40 caracteres, sin opciones_imagen)`)
for (const [archivo, r] of Object.entries(rubrica)) {
  const pL = pct(r.masLarga, r.conLongitud)
  console.log(
    `  ${archivo.replace('rc_items_', '')}: n=${r.total} (prosa ${r.conLongitud}) · más larga ${pL}% · más corta ${pct(r.masCorta, r.conLongitud)}% · correcta >1.6x resto ${pct(r.margen, r.conLongitud)}% · pos ${LETRAS.map((l) => `${l}:${r.pos[l]}`).join(' ')}`,
  )
  if (r.conLongitud >= 8 && pL > 55) fail(`${archivo}: la correcta es la más larga en ${pL}% de las preguntas de prosa (umbral 55%)`)
  else if (r.conLongitud >= 8 && pL > 45) aviso(`${archivo}: la correcta es la más larga en ${pL}% de las preguntas de prosa (por encima del 45%, hay margen)`)
  const max = Math.max(...LETRAS.map((l) => r.pos[l]))
  if (r.total >= 8 && pct(max, r.total) > 45) aviso(`${archivo}: la posición de la correcta en el JSON fuente está sesgada (${LETRAS.map((l) => `${l}:${r.pos[l]}`).join(' ')})`)
}
const pLG = pct(rubricaGlobal.masLarga, rubricaGlobal.conLongitud)
console.log(`  TOTAL: n=${rubricaGlobal.total} (prosa ${rubricaGlobal.conLongitud}) · más larga ${pLG}% · más corta ${pct(rubricaGlobal.masCorta, rubricaGlobal.conLongitud)}% · correcta >1.6x resto ${pct(rubricaGlobal.margen, rubricaGlobal.conLongitud)}%`)

console.log(`\n== Sesgo en Lápiz y Papel (fase 1; posición se baraja en vivo) ==`)
const pLLP = pct(lpRub.masLarga, lpRub.total)
console.log(`  n=${lpRub.total} · herramienta correcta es la opción más larga ${pLLP}% · pos ${lpRub.pos.map((v, i) => `${i}:${v}`).join(' ')}`)
if (pLLP > 55) fail(`lápiz y papel: la correcta es la más larga en ${pLLP}% de los ejercicios (umbral 55%)`)
else if (pLLP > 45) aviso(`lápiz y papel: la correcta es la más larga en ${pLLP}% (por encima del 45%)`)

console.log(`\n${errores === 0 ? 'OK' : errores + ' error(es)'} · ${avisos} aviso(s)`)
process.exit(errores === 0 ? 0 : 1)
