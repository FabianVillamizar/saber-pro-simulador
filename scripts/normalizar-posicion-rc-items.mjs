// Reparte la posición A-D de la respuesta correcta en las 6 bancas de ítems
// de Razonamiento Cuantitativo. El motor ya baraja la posición en vivo
// (barajarOpcionesPregunta en engine/simulacro.js, llamado desde
// PracticaPorParte.jsx y Simulacro.jsx), así que esto NO cambia lo que ve
// el estudiante — es higiene de los datos fuente y defensa en profundidad:
// `rc_items_geometria_contexto_facil.json` traía las 10 respuestas en A y
// `rc_items_probabilidad.json` 7 de 9 en A.
//
// Baraja las claves A-D de cada pregunta con un orden determinista sembrado
// por su id (reproducible: correr dos veces deja el mismo resultado) y
// reescribe `opciones`, `respuesta_correcta`, `distractores` y
// `opciones_imagen` de forma consistente. Reserializa con la misma sangría
// de 2 espacios que ya usan los archivos.
//
// Correr: `node scripts/normalizar-posicion-rc-items.mjs`
import { readFileSync, writeFileSync } from 'node:fs'

const base = new URL('../src/data/razonamiento-cuantitativo/', import.meta.url)
const ARCHIVOS = [
  'rc_items_argumentacion',
  'rc_items_formulacion_ejecucion',
  'rc_items_geometria_contexto_facil',
  'rc_items_interpretacion_representacion',
  'rc_items_probabilidad',
  'rc_items_uis_entrenamiento',
]
const LETRAS = ['A', 'B', 'C', 'D']

// PRNG determinista (mulberry32) sembrado con un hash del id de la pregunta,
// para que el reordenamiento sea reproducible entre corridas.
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function barajarSemilla(items, semilla) {
  const rand = mulberry32(semilla)
  const c = [...items]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

const conteo = {}
let tocadas = 0

for (const archivo of ARCHIVOS) {
  const ruta = new URL(`${archivo}.json`, base)
  const grupos = JSON.parse(readFileSync(ruta, 'utf-8'))
  conteo[archivo] = { A: 0, B: 0, C: 0, D: 0 }

  for (const g of grupos) {
    for (const p of g.preguntas) {
      const orig = Object.keys(p.opciones ?? {})
      if (orig.length !== 4) continue
      // nuevoOrden[i] = letra original que ocupará la posición visual LETRAS[i]
      const nuevoOrden = barajarSemilla(orig, hash(p.id))
      const mapa = Object.fromEntries(nuevoOrden.map((o, i) => [o, LETRAS[i]]))

      const remapear = (obj) => {
        if (!obj || typeof obj !== 'object') return obj
        const r = {}
        for (const [i, o] of nuevoOrden.entries()) if (o in obj) r[LETRAS[i]] = obj[o]
        return r
      }
      p.opciones = remapear(p.opciones)
      if (p.opciones_imagen) p.opciones_imagen = remapear(p.opciones_imagen)
      if (p.distractores) p.distractores = remapear(p.distractores)
      p.respuesta_correcta = mapa[p.respuesta_correcta]
      conteo[archivo][p.respuesta_correcta]++
      tocadas++
    }
  }
  writeFileSync(ruta, JSON.stringify(grupos, null, 2) + '\n', 'utf-8')
}

console.log(`${tocadas} preguntas reordenadas`)
for (const [a, c] of Object.entries(conteo)) {
  console.log(`  ${a.replace('rc_items_', '')}: ${LETRAS.map((l) => `${l}:${c[l]}`).join(' ')}`)
}
