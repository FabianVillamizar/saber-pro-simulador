// Verificación de contenido para src/data/habilidades-laboratorio/hl_cf_conceptos.json
// (Determinación de Constantes Físicas, 2ª técnica del semillero), misma
// rúbrica que el script de LLE: longitud por tarjeta, compilación KaTeX de
// formula_latex y de cada $...$ inline, integridad de prereqs (sin ciclos,
// sin referencias rotas), ids duplicados, `connects_to` cruzado
// ("modulo:bloque") que apunte a un módulo y bloque reales, y un chequeo
// de esquema para las tarjetas con `grafica_datos_estructurados`.
//
// Diferencia con el de LLE: además de los límites duros 700-1700 (FAIL),
// avisa (WARN, no FAIL) de las tarjetas > 1500 car., porque el review del
// mazo de LLE anotó que quedó largo y para esta técnica se apuntó a la
// banda baja (~1000-1300, hasta ~1500 en las de derivación densa).
import { readFileSync } from 'node:fs'
import katex from 'katex'
import { indiceModulos } from '../src/engine/indiceModulos.js'

const RUTA = new URL('../src/data/habilidades-laboratorio/hl_cf_conceptos.json', import.meta.url)
const tarjetas = JSON.parse(readFileSync(RUTA, 'utf-8'))

const CAMPOS_TEXTO = ['pregunta', 'respuesta', 'regla', 'ejemplo', 'error_comun', 'conexion_cotidiana']
const DIFICULTADES = new Set(['baja', 'media', 'alta'])
const TIPOS_GRAFICO = new Set(['lineas', 'barras', 'dispersion', 'histograma', 'circular'])

// La longitud es carga de lectura: se mide sobre lo que el lector ve, así
// que un disparador `[[id-regla|texto visible]]` cuenta solo por su texto
// visible, no por el marcado del token (ver TextoConReglas.jsx).
function textoVisible(s) {
  return String(s ?? '').replace(/\[\[[^\]|]+\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]|]+)\]\]/g, '$1')
}

// Extrae cada expresión entre $...$ de un texto (para compilarla en KaTeX).
function formulasInline(s) {
  const out = []
  const re = /\$([^$]+)\$/g
  let m
  while ((m = re.exec(String(s ?? ''))) !== null) out.push(m[1])
  return out
}

let errores = 0
let avisos = 0
const ids = new Set()
const longitudes = []
const conteoDificultad = { baja: 0, media: 0, alta: 0 }

for (const t of tarjetas) {
  if (ids.has(t.id)) {
    console.log('FAIL id duplicado:', t.id)
    errores++
  }
  ids.add(t.id)

  if (!/^HL-CF-\d{3}$/.test(t.id)) {
    console.log(`FAIL id fuera de convención (HL-CF-###):`, t.id)
    errores++
  }
  if (t.bloque !== 'cf') {
    console.log(`FAIL ${t.id}: bloque debería ser "cf", es "${t.bloque}"`)
    errores++
  }
  if (!DIFICULTADES.has(t.dificultad)) {
    console.log(`FAIL ${t.id}: dificultad inválida "${t.dificultad}"`)
    errores++
  } else {
    conteoDificultad[t.dificultad]++
  }

  const textoCompleto = CAMPOS_TEXTO.map((c) => textoVisible(t[c])).join(' ')
  const longitud = textoCompleto.length
  longitudes.push({ id: t.id, longitud })
  if (longitud < 700 || longitud > 1700) {
    console.log(`FAIL longitud fuera de rango (${longitud} car.):`, t.id)
    errores++
  } else if (longitud > 1500) {
    console.log(`WARN tarjeta larga (${longitud} car., objetivo <=1500):`, t.id)
    avisos++
  }

  // KaTeX: formula_latex (bloque) + cada $...$ inline de los campos de texto.
  if (t.formula_latex) {
    try {
      katex.renderToString(t.formula_latex, { throwOnError: true })
    } catch (e) {
      console.log(`FAIL KaTeX no compila en ${t.id}.formula_latex: "${t.formula_latex}" -> ${e.message}`)
      errores++
    }
  }
  for (const campo of CAMPOS_TEXTO) {
    for (const expr of formulasInline(t[campo])) {
      try {
        katex.renderToString(expr, { throwOnError: true })
      } catch (e) {
        console.log(`FAIL KaTeX no compila en ${t.id}.${campo}: "$${expr}$" -> ${e.message}`)
        errores++
      }
    }
  }

  for (const destino of t.connects_to ?? []) {
    if (!String(destino).includes(':')) continue // código de bloque suelto: metadata, no chip
    const [modId, bloque] = String(destino).split(':')
    const mod = indiceModulos[modId]
    if (!mod) {
      console.log(`FAIL ${t.id}.connects_to: módulo "${modId}" no existe (en "${destino}")`)
      errores++
    } else if (!mod.categorias?.[bloque]) {
      console.log(`FAIL ${t.id}.connects_to: "${modId}" no tiene el bloque "${bloque}" en sus categorías`)
      errores++
    }
  }

  // Esquema mínimo de gráfico nativo (ver GraficaDatos.jsx / VisualCientifico.jsx).
  const g = t.grafica_datos_estructurados
  if (g) {
    if (t.tipo_visual !== 'grafica_datos') {
      console.log(`FAIL ${t.id}: trae grafica_datos_estructurados pero tipo_visual es "${t.tipo_visual}"`)
      errores++
    }
    if (!['frente', 'reverso'].includes(t.visual_posicion)) {
      console.log(`FAIL ${t.id}: visual_posicion inválida "${t.visual_posicion}"`)
      errores++
    }
    if (!textoVisible(t.visual_descripcion).trim()) {
      console.log(`FAIL ${t.id}: grafico sin visual_descripcion accesible`)
      errores++
    }
    if (!TIPOS_GRAFICO.has(g.tipoGrafico)) {
      console.log(`FAIL ${t.id}: tipoGrafico inválido "${g.tipoGrafico}"`)
      errores++
    }
    if (!Array.isArray(g.series) || g.series.length === 0) {
      console.log(`FAIL ${t.id}: grafico sin series`)
      errores++
    } else {
      for (const s of g.series) {
        if (!Array.isArray(s.datos) || s.datos.length === 0) {
          console.log(`FAIL ${t.id}: serie "${s.nombre}" sin datos`)
          errores++
          continue
        }
        for (const d of s.datos) {
          if (!('x' in d) || !('y' in d) || typeof d.y !== 'number' || Number.isNaN(d.y)) {
            console.log(`FAIL ${t.id}: punto inválido en serie "${s.nombre}": ${JSON.stringify(d)}`)
            errores++
          }
        }
      }
    }
  }
}

const porId = Object.fromEntries(tarjetas.map((t) => [t.id, t]))
for (const t of tarjetas) {
  for (const p of t.prereqs ?? []) {
    if (!porId[p]) {
      console.log(`FAIL prereq roto: ${t.id} referencia "${p}", que no existe`)
      errores++
    }
  }
}
function tieneCiclo(id, visitados = new Set(), enPila = new Set()) {
  if (enPila.has(id)) return true
  if (visitados.has(id)) return false
  visitados.add(id)
  enPila.add(id)
  for (const p of porId[id]?.prereqs ?? []) {
    if (porId[p] && tieneCiclo(p, visitados, enPila)) return true
  }
  enPila.delete(id)
  return false
}
for (const t of tarjetas) {
  if (tieneCiclo(t.id)) {
    console.log('FAIL ciclo de prereqs detectado en:', t.id)
    errores++
  }
}

const promedio = Math.round(longitudes.reduce((s, l) => s + l.longitud, 0) / longitudes.length)
const max = Math.max(...longitudes.map((l) => l.longitud))
const min = Math.min(...longitudes.map((l) => l.longitud))
const sobre1400 = longitudes.filter((l) => l.longitud > 1400).length

console.log(`\n${tarjetas.length} tarjetas, longitud promedio ${promedio} car. (min ${min}, max ${max}); ${sobre1400} > 1400`)
console.log(
  `dificultad: ${conteoDificultad.baja} baja / ${conteoDificultad.media} media / ${conteoDificultad.alta} alta`
)
if (avisos) console.log(`${avisos} aviso(s) (no bloquean)`)
console.log(errores === 0 ? 'OK — 0 errores' : `${errores} error(es) encontrados`)
process.exit(errores === 0 ? 0 : 1)
