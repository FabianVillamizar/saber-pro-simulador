// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico de
// Razonamiento Cuantitativo (ítems de formulación y ejecución). Los colores
// usan var(--...) literal para que, al inyectarse inline en el DOM (ver
// VisualSvg.jsx), se pinten con el tema activo de la app en vez de un color
// fijo. Mismo patrón que scripts/generar-visuales-pc.mjs.
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR_SALIDA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/assets/visuals/razonamiento-cuantitativo')
mkdirSync(DIR_SALIDA, { recursive: true })

const C = {
  texto: 'var(--text)',
  sub: 'var(--text-sub)',
  faint: 'var(--text-faint)',
  accent: 'var(--accent)',
  exito: 'var(--exito)',
  warning: 'var(--warning)',
  borde: 'var(--border)',
}

function svg(viewBox, body, { markerColor = C.texto } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <defs>
    <marker id="flecha" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="${markerColor}" />
    </marker>
  </defs>
${body}
</svg>`
}

function linea(x1, y1, x2, y2, { color = C.texto, ancho = 2, punteada = false, flecha = false } = {}) {
  const dash = punteada ? ' stroke-dasharray="5,5"' : ''
  const marker = flecha ? ' marker-end="url(#flecha)"' : ''
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round"${dash}${marker} />`
}

function texto(x, y, contenido, { color = C.texto, tam = 12, peso = 500, anchor = 'middle' } = {}) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${tam}" font-weight="${peso}" text-anchor="${anchor}">${contenido}</text>`
}

function circulo(cx, cy, r, { relleno = 'none', color = C.texto, ancho = 2, opacidad } = {}) {
  const op = opacidad !== undefined ? ` fill-opacity="${opacidad}"` : ''
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${op} />`
}

function rect(x, y, w, h, { rx = 8, relleno = 'none', color = C.texto, ancho = 2, dash = false } = {}) {
  const dasharray = dash ? ' stroke-dasharray="4,4"' : ''
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${dasharray} />`
}

const items = {}

// ---------- RC-GRUPO-029: diagrama de Venn, club deportivo ----------
// 200 miembros, fútbol=90, baloncesto=70, ambos=25 → solo fútbol=65, solo
// baloncesto=45, ninguno=200-65-45-25=65.
items['RC-GRUPO-029'] = svg('0 0 400 260', `
  ${rect(20, 20, 360, 200, { rx: 12, color: C.borde })}
  ${texto(200, 40, 'Club deportivo · 200 miembros', { peso: 700, tam: 13 })}

  ${circulo(170, 140, 75, { color: C.accent, relleno: C.accent, opacidad: 0.12 })}
  ${circulo(250, 140, 75, { color: C.exito, relleno: C.exito, opacidad: 0.12 })}

  ${texto(135, 135, '65', { tam: 18, peso: 800, color: C.accent })}
  ${texto(135, 155, 'solo fútbol', { tam: 10, color: C.accent })}

  ${texto(210, 135, '25', { tam: 18, peso: 800 })}
  ${texto(210, 155, 'ambos', { tam: 10, color: C.sub })}

  ${texto(285, 135, '45', { tam: 18, peso: 800, color: C.exito })}
  ${texto(285, 155, 'solo básquet', { tam: 10, color: C.exito })}

  ${texto(200, 235, '65 no practican ninguno de los dos (fuera de los círculos)', { tam: 11, color: C.faint })}
`)

// ---------- RC-GRUPO-033: tablero 8x8, notación fila+columna ----------
function tablero8x8(ox, oy, celda) {
  let s = ''
  for (let i = 0; i <= 8; i++) {
    s += linea(ox, oy + i * celda, ox + 8 * celda, oy + i * celda, { color: C.borde })
    s += linea(ox + i * celda, oy, ox + i * celda, oy + 8 * celda, { color: C.borde })
  }
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  for (let c = 0; c < 8; c++) {
    s += texto(ox + c * celda + celda / 2, oy + 8 * celda + 16, cols[c], { tam: 11, color: C.sub })
  }
  for (let r = 1; r <= 8; r++) {
    // fila 1 abajo, fila 8 arriba (tablero se lee de abajo hacia arriba)
    const y = oy + (8 - r) * celda + celda / 2 + 4
    s += texto(ox - 14, y, String(r), { tam: 11, color: C.sub, anchor: 'end' })
  }
  return s
}
function celdaXY(ox, oy, celda, fila, colLetra) {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const c = cols.indexOf(colLetra)
  return [ox + c * celda + celda / 2, oy + (8 - fila) * celda + celda / 2]
}
items['RC-GRUPO-033'] = svg('0 0 400 300', (() => {
  const ox = 40, oy = 20, celda = 34
  const [x0, y0] = celdaXY(ox, oy, celda, 2, 'C')
  const [x1, y1] = celdaXY(ox, oy, celda, 5, 'E')
  let s = tablero8x8(ox, oy, celda)
  // zona alcanzable: filas 2 a 5, columnas C a E (rectángulo de casillas), sin diagonal
  s += rect(x0 - celda / 2, y1 - celda / 2, 3 * celda, 4 * celda, { rx: 4, color: C.accent, dash: true })
  s += circulo(x0, y0, 10, { relleno: C.texto, color: C.texto })
  s += texto(x0, y0 + 26, 'unidad en 2C', { tam: 10, color: C.sub })
  s += linea(x0, y0, x0, y1, { color: C.accent, ancho: 2, flecha: true })
  s += linea(x0, y0, x1, y0, { color: C.exito, ancho: 2, flecha: true })
  s += texto(x0 - 30, (y0 + y1) / 2, '+3 filas', { tam: 10, color: C.accent, anchor: 'end' })
  s += texto((x0 + x1) / 2, y0 - 10, '+2 columnas', { tam: 10, color: C.exito })
  s += texto(200, 285, 'zona alcanzable (recta, sin diagonal): filas 2-5 × columnas C-E', { tam: 10, color: C.faint })
  return s
})())

// ---------- RC-GRUPO-044: terreno rectangular + tanque cilíndrico ----------
items['RC-GRUPO-044'] = svg('-12 0 424 260', `
  ${texto(200, 20, 'Planta del terreno · 40 m × 25 m', { peso: 700, tam: 13 })}
  ${rect(40, 40, 320, 160, { rx: 4, color: C.texto })}
  ${linea(40, 210, 360, 210, { color: C.sub })}
  ${texto(200, 226, '40 m', { tam: 11, color: C.sub })}
  ${linea(24, 40, 24, 200, { color: C.sub })}
  ${texto(14, 120, '25 m', { tam: 11, color: C.sub, anchor: 'end' })}

  ${circulo(320, 80, 22, { color: C.accent, relleno: C.accent, opacidad: 0.15 })}
  ${linea(320, 80, 342, 80, { color: C.accent })}
  ${texto(331, 72, 'r=2 m', { tam: 10, color: C.accent })}
  ${texto(320, 118, 'tanque cilíndrico', { tam: 10, color: C.accent })}
  ${texto(320, 132, '(altura 3 m)', { tam: 10, color: C.accent })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
