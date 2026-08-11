// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico
// de los grupos de ítems de Interpretación y Representación de Razonamiento
// Cuantitativo. Mismos helpers y convención de colores que
// scripts/generar-visuales-pc.mjs — var(--...) literal para que el SVG
// inyectado inline se pinte con el tema activo.
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

function circulo(cx, cy, r, { relleno = 'none', color = C.texto, ancho = 2 } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}" />`
}

function rect(x, y, w, h, { rx = 8, relleno = 'none', color = C.texto, ancho = 2, dash = false } = {}) {
  const dasharray = dash ? ' stroke-dasharray="4,4"' : ''
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${dasharray} />`
}

const items = {}

// ---------- RC-GRUPO-002: huerto 15x10 con camino de 1m ----------
// Rectángulo 15m (horizontal) x 10m (vertical). El camino de 1m de ancho
// cruza TODO el ancho (los 10m, verticalmente), partiendo el largo (15m) en
// dos zonas de siembra a lado y lado.
items['RC-GRUPO-002'] = svg('0 0 420 220', `
  ${rect(30, 30, 360, 140, { color: C.texto })}
  ${rect(190, 30, 40, 140, { relleno: C.borde, color: C.borde })}
  ${texto(110, 105, 'Zona de siembra A', { tam: 12, peso: 700 })}
  ${texto(210, 105, 'Camino', { tam: 10, color: C.sub, peso: 700 })}
  ${texto(210, 120, '1 m', { tam: 10, color: C.sub })}
  ${texto(305, 105, 'Zona de siembra B', { tam: 12, peso: 700 })}

  ${linea(30, 185, 390, 185, { flecha: true })}
  ${linea(390, 185, 30, 185, { flecha: true })}
  ${texto(210, 200, '15 m (largo)', { tam: 11, color: C.sub })}

  ${linea(15, 30, 15, 170, { flecha: true })}
  ${linea(15, 170, 15, 30, { flecha: true })}
  ${texto(15, 20, '10 m (ancho)', { tam: 11, color: C.sub, anchor: 'start' })}
`)

// ---------- RC-GRUPO-007: plano casa escala 1:100, habitación 4x3 cm ----------
items['RC-GRUPO-007'] = svg('0 0 400 240', `
  ${rect(40, 40, 320, 160, { color: C.borde, dash: true })}
  ${rect(120, 80, 160, 120, { color: C.texto })}
  ${texto(200, 145, 'Habitación principal', { tam: 12, peso: 700 })}

  ${linea(120, 65, 280, 65, { flecha: true })}
  ${linea(280, 65, 120, 65, { flecha: true })}
  ${texto(200, 55, '4 cm', { tam: 11, color: C.accent })}

  ${linea(105, 80, 105, 200, { flecha: true })}
  ${linea(105, 200, 105, 80, { flecha: true })}
  ${texto(90, 145, '3 cm', { tam: 11, color: C.accent, anchor: 'end' })}

  ${rect(50, 205, 130, 26, { rx: 6, color: C.sub })}
  ${texto(115, 222, 'Escala 1:100  →  1 cm = 1 m', { tam: 11, color: C.sub })}
`)

// ---------- RC-GRUPO-012: ángulos, "Norte de cancha" 0°, 100°, +40° ----------
function puntoEnCirculo(cx, cy, r, gradosDesdeNorte) {
  // 0° = arriba (Norte), sentido horario, igual que una brújula.
  const rad = ((gradosDesdeNorte - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}
function arcoAngular(cx, cy, r, desde, hasta, color) {
  const [x1, y1] = puntoEnCirculo(cx, cy, r, desde)
  const [x2, y2] = puntoEnCirculo(cx, cy, r, hasta)
  const largo = hasta - desde > 180 ? 1 : 0
  return `<path d="M${x1},${y1} A${r},${r} 0 ${largo} 1 ${x2},${y2}" fill="none" stroke="${color}" stroke-width="2.5" marker-end="url(#flecha)" />`
}
items['RC-GRUPO-012'] = svg('0 0 300 300', `
  ${circulo(150, 150, 100, { color: C.borde })}
  ${(() => {
    const [nx, ny] = puntoEnCirculo(150, 150, 100, 0)
    return `${linea(150, 150, nx, ny, { color: C.sub, punteada: true })}${texto(150, 35, "Norte de cancha (0°)", { tam: 11, color: C.sub })}`
  })()}
  ${(() => {
    const [x, y] = puntoEnCirculo(150, 150, 100, 100)
    const ax = x > 150 ? 'start' : 'end'
    const tx = x + (x > 150 ? 18 : -18)
    return `${linea(150, 150, x, y, { color: C.accent, ancho: 3, flecha: true })}${texto(tx, y - 10, '100°', { tam: 11, color: C.accent, anchor: ax })}${texto(tx, y + 6, '1er intento', { tam: 11, color: C.accent, anchor: ax })}`
  })()}
  ${(() => {
    const [x, y] = puntoEnCirculo(150, 150, 100, 140)
    const ax = x > 150 ? 'start' : 'end'
    const tx = x + (x > 150 ? 18 : -18)
    return `${linea(150, 150, x, y, { color: C.exito, ancho: 3, flecha: true })}${texto(tx, y + 16, '140°', { tam: 11, color: C.exito, anchor: ax })}${texto(tx, y + 32, '2do intento', { tam: 11, color: C.exito, anchor: ax })}`
  })()}
  ${arcoAngular(150, 150, 40, 100, 140, C.warning)}
  ${texto(150, 280, '+40° hacia la derecha (sentido horario)', { tam: 11, color: C.warning })}
`, { markerColor: C.accent })

// ---------- RC-GRUPO-017: mapa 1:25.000, museo-plaza 6 cm ----------
items['RC-GRUPO-017'] = svg('0 0 400 220', `
  ${rect(30, 30, 340, 140, { color: C.borde, dash: true })}
  <circle cx="90" cy="100" r="7" fill="${C.accent}" />
  ${texto(90, 80, 'Museo', { tam: 12, peso: 700 })}
  <circle cx="330" cy="100" r="7" fill="${C.exito}" />
  ${texto(330, 80, 'Plaza principal', { tam: 12, peso: 700 })}
  ${linea(97, 100, 323, 100, { color: C.texto, ancho: 2 })}
  ${texto(210, 118, '6 cm (en el mapa)', { tam: 11, color: C.sub })}

  ${rect(50, 185, 160, 26, { rx: 6, color: C.sub })}
  ${texto(130, 202, 'Escala 1:25.000', { tam: 11, color: C.sub })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
