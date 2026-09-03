// Verificación de contenido para src/data/habilidades-laboratorio/hl_lle_conceptos.json,
// aplicando la rúbrica de la bitácora del módulo: longitud por tarjeta,
// compilación KaTeX de formula_latex, integridad de prereqs (sin ciclos,
// sin referencias rotas), ids duplicados.
import { readFileSync } from 'node:fs'
import katex from 'katex'

const RUTA = new URL('../src/data/habilidades-laboratorio/hl_lle_conceptos.json', import.meta.url)
const tarjetas = JSON.parse(readFileSync(RUTA, 'utf-8'))

const CAMPOS_TEXTO = ['pregunta', 'respuesta', 'regla', 'ejemplo', 'error_comun', 'conexion_cotidiana']

// La longitud es carga de lectura: se mide sobre lo que el lector ve, así
// que un disparador `[[id-regla|texto visible]]` cuenta solo por su texto
// visible, no por el marcado del token (ver TextoConReglas.jsx).
function textoVisible(s) {
  return String(s ?? '').replace(/\[\[[^\]|]+\|([^\]]*)\]\]/g, '$1').replace(/\[\[([^\]|]+)\]\]/g, '$1')
}

let errores = 0
const ids = new Set()
const longitudes = []

for (const t of tarjetas) {
  if (ids.has(t.id)) {
    console.log('FAIL id duplicado:', t.id)
    errores++
  }
  ids.add(t.id)

  const textoCompleto = CAMPOS_TEXTO.map((c) => textoVisible(t[c])).join(' ')
  const longitud = textoCompleto.length
  longitudes.push({ id: t.id, longitud })
  if (longitud < 700 || longitud > 1700) {
    console.log(`FAIL longitud fuera de rango (${longitud} car.):`, t.id)
    errores++
  }

  if (t.formula_latex) {
    try {
      katex.renderToString(t.formula_latex, { throwOnError: true })
    } catch (e) {
      console.log(`FAIL KaTeX no compila en ${t.id}.formula_latex: "${t.formula_latex}" -> ${e.message}`)
      errores++
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

console.log(`\n${tarjetas.length} tarjetas, longitud promedio ${promedio} car. (min ${min}, max ${max})`)
console.log(errores === 0 ? 'OK — 0 errores' : `${errores} error(es) encontrados`)
process.exit(errores === 0 ? 0 : 1)
