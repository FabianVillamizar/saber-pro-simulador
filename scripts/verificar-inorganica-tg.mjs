// Verificación de contenido para src/data/inorganica/iq_tg_conceptos.json,
// aplicando la rúbrica endurecida de la bitácora de Inorgánica: longitud
// por tarjeta, compilación KaTeX de cada fórmula, integridad de prereqs
// (sin ciclos, sin referencias rotas), y ningún símbolo prohibido (hats,
// subíndice "d") suelto en Unicode fuera de $...$.
import { readFileSync } from 'node:fs'
import katex from 'katex'

const RUTA = new URL('../src/data/inorganica/iq_tg_conceptos.json', import.meta.url)
const tarjetas = JSON.parse(readFileSync(RUTA, 'utf-8'))

const CAMPOS_TEXTO = ['pregunta', 'respuesta', 'regla', 'ejemplo', 'error_comun', 'conexion_cotidiana']
const PATRON_MATH = /\$\$[^$]+?\$\$|\$[^$]+?\$/g
// σd/Dₙd/Cₙd (subíndice "d" no existe en Unicode, salto de tamaño real) y
// cualquier letra con acento circunflejo combinante U+0302 (Ĉ, Ŝ, Ê, el
// "sombrero" de operador) — ambos casos deben ir siempre en LaTeX.
const PATRON_SIMBOLO_PROHIBIDO = /σd|Dₙd|Cₙd|̂/u

let errores = 0
const ids = new Set()
const longitudes = []

for (const t of tarjetas) {
  // 1. id duplicado
  if (ids.has(t.id)) {
    console.log('FAIL id duplicado:', t.id)
    errores++
  }
  ids.add(t.id)

  // 2. longitud total de campos de texto
  const textoCompleto = CAMPOS_TEXTO.map((c) => t[c] ?? '').join(' ')
  const longitud = textoCompleto.length
  longitudes.push({ id: t.id, longitud })
  if (longitud < 700 || longitud > 1700) {
    console.log(`FAIL longitud fuera de rango (${longitud} car.):`, t.id)
    errores++
  }

  // 3. símbolo prohibido en Unicode plano fuera de $...$ (se remueven los
  // spans de math antes de buscar, para no marcar falsos positivos dentro
  // de LaTeX legítimo)
  for (const campo of CAMPOS_TEXTO) {
    const valor = t[campo]
    if (!valor) continue
    const sinMath = valor.replace(PATRON_MATH, '')
    const hallazgo = sinMath.match(PATRON_SIMBOLO_PROHIBIDO)
    if (hallazgo) {
      console.log(`FAIL símbolo prohibido en Unicode plano ("${hallazgo[0]}") en ${t.id}.${campo}`)
      errores++
    }
  }

  // 4. cada $...$/$$...$$ de todos los campos + formula_latex compila en KaTeX
  const todosLosCampos = [...CAMPOS_TEXTO, 'formula_latex']
  for (const campo of todosLosCampos) {
    const valor = t[campo]
    if (!valor) continue
    const spans = campo === 'formula_latex' ? [`$${valor}$`] : (valor.match(PATRON_MATH) ?? [])
    for (const span of spans) {
      const tex = span.startsWith('$$') ? span.slice(2, -2) : span.slice(1, -1)
      try {
        katex.renderToString(tex, { throwOnError: true })
      } catch (e) {
        console.log(`FAIL KaTeX no compila en ${t.id}.${campo}: "${tex}" -> ${e.message}`)
        errores++
      }
    }
  }
}

// 5. prereqs: referencias existentes + sin ciclos (DFS)
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
