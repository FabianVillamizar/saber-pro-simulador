// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico de
// Razonamiento Cuantitativo (contexto aplicado). Los colores usan var(--...)
// literal para que, al inyectarse inline en el DOM (ver VisualSvg.jsx), se
// pinten con el tema activo de la app en vez de un color fijo.
// Mismo patrón que scripts/generar-visuales-pc.mjs.
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

// ---------- RC-CTX-016: eje truncado (misma pareja de barras 81 y 84) ----------
items['RC-CTX-016'] = svg('-44 0 508 260', `
  ${texto(150, 20, 'Eje desde 0', { peso: 800, tam: 13 })}
  ${linea(60, 20, 60, 200)}
  ${linea(60, 200, 200, 200)}
  ${texto(50, 24, '100', { tam: 10, color: C.sub, anchor: 'end' })}
  ${texto(50, 204, '0', { tam: 10, color: C.sub, anchor: 'end' })}
  ${rect(90, 54.2, 30, 145.8, { rx: 2, relleno: C.sub, color: C.sub, ancho: 1 })}
  ${texto(105, 46, '81', { tam: 11, peso: 700 })}
  ${rect(140, 48.8, 30, 151.2, { rx: 2, relleno: C.accent, color: C.accent, ancho: 1 })}
  ${texto(155, 40, '84', { tam: 11, peso: 700, color: C.accent })}
  ${texto(150, 222, 'diferencia moderada', { tam: 11, color: C.exito })}

  ${texto(340, 20, 'Eje truncado desde 80', { peso: 800, tam: 13 })}
  ${linea(260, 20, 260, 200)}
  ${linea(260, 200, 400, 200)}
  ${texto(250, 24, '90', { tam: 10, color: C.sub, anchor: 'end' })}
  ${texto(250, 204, '80', { tam: 10, color: C.sub, anchor: 'end' })}
  ${rect(290, 182, 30, 18, { rx: 2, relleno: C.sub, color: C.sub, ancho: 1 })}
  ${texto(305, 176, '81', { tam: 11, peso: 700 })}
  ${rect(340, 128, 30, 72, { rx: 2, relleno: C.accent, color: C.accent, ancho: 1 })}
  ${texto(355, 122, '84', { tam: 11, peso: 700, color: C.accent })}
  ${texto(340, 222, 'diferencia exagerada', { tam: 11, color: C.warning })}

  ${texto(210, 245, 'mismos datos (81 y 84) — el eje truncado hace que la barra parezca hasta el triple de alta', { tam: 10, color: C.faint })}
`)

// ---------- RC-CTX-017: ventas trimestrales 102/105/108/112, eje 0 vs truncado ----------
function barraTrimestre(x, yTop, alto, etiqueta, valor, color) {
  return `${rect(x, yTop, 34, alto, { rx: 2, relleno: color, color, ancho: 1 })}${texto(x + 17, yTop - 8, valor, { tam: 10, peso: 700 })}${texto(x + 17, 222, etiqueta, { tam: 10, color: C.sub })}`
}
items['RC-CTX-017'] = svg('-30 0 480 260', `
  ${texto(150, 14, 'Eje desde 0 (0 a 120)', { peso: 800, tam: 12 })}
  ${linea(50, 40, 50, 200)}
  ${linea(50, 200, 210, 200)}
  ${barraTrimestre(60, 57, 143, 'Q1', '102', C.sub)}
  ${barraTrimestre(100, 52.5, 147.5, 'Q2', '105', C.sub)}
  ${barraTrimestre(140, 48, 152, 'Q3', '108', C.accent)}
  ${barraTrimestre(180, 42, 158, 'Q4', '112', C.accent)}
  ${texto(130, 238, 'las cuatro barras se ven casi iguales', { tam: 10, color: C.exito })}

  ${texto(320, 20, 'Eje truncado (90 a 120)', { peso: 800, tam: 12 })}
  ${linea(250, 30, 250, 200)}
  ${linea(250, 200, 410, 200)}
  ${texto(240, 34, '120', { tam: 9, color: C.sub, anchor: 'end' })}
  ${texto(240, 204, '90', { tam: 9, color: C.sub, anchor: 'end' })}
  ${barraTrimestre(260, 128, 72, 'Q1', '102', C.sub)}
  ${barraTrimestre(300, 110, 90, 'Q2', '105', C.sub)}
  ${barraTrimestre(340, 92, 108, 'Q3', '108', C.accent)}
  ${barraTrimestre(380, 68, 132, 'Q4', '112', C.accent)}
  ${texto(330, 238, 'Q4 parece casi el doble de Q1', { tam: 10, color: C.warning })}

  ${texto(210, 255, 'datos idénticos ($102, $105, $108 y $112 millones) — solo cambió dónde empieza el eje', { tam: 10, color: C.faint })}
`)

// ---------- RC-CTX-019: doble eje, ventas (izq.) vs satisfacción (der.) ----------
function puntoLinea(pts, color) {
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const puntos = pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}" />`).join('\n  ')
  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" />\n  ${puntos}`
}
items['RC-CTX-019'] = svg('-44 0 508 240', `
  ${linea(70, 20, 70, 200)}
  ${texto(30, 30, 'Ventas', { tam: 11, color: C.accent, anchor: 'start' })}
  ${texto(30, 44, '(millones $)', { tam: 9, color: C.accent, anchor: 'start' })}
  ${texto(60, 204, '0', { tam: 9, color: C.accent, anchor: 'end' })}
  ${texto(60, 116, '50', { tam: 9, color: C.accent, anchor: 'end' })}
  ${texto(60, 34, '100', { tam: 9, color: C.accent, anchor: 'end' })}

  ${linea(350, 20, 350, 200)}
  ${texto(390, 30, 'Satisfacción', { tam: 11, color: C.warning, anchor: 'end' })}
  ${texto(390, 44, '(0 a 10 pts)', { tam: 9, color: C.warning, anchor: 'end' })}
  ${texto(360, 204, '0', { tam: 9, color: C.warning, anchor: 'start' })}
  ${texto(360, 115, '5', { tam: 9, color: C.warning, anchor: 'start' })}
  ${texto(360, 25, '10', { tam: 9, color: C.warning, anchor: 'start' })}

  ${linea(70, 200, 350, 200, { color: C.borde })}
  ${['mes 1', 'mes 2', 'mes 3', 'mes 4', 'mes 5'].map((m, i) => texto(70 + i * 70, 218, m, { tam: 9, color: C.sub })).join('\n  ')}

  ${puntoLinea([[70, 132], [140, 106.5], [210, 89.5], [280, 64], [350, 38.5]], C.accent)}
  ${puntoLinea([[70, 115], [140, 98], [210, 84.4], [280, 72.5], [350, 55.5]], C.warning)}

  ${texto(140, 60, 'ventas', { tam: 10, color: C.accent, peso: 700 })}
  ${texto(280, 100, 'satisfacción', { tam: 10, color: C.warning, peso: 700 })}

  ${texto(210, 236, 'cada eje tiene su propia escala independiente — por eso las curvas "coinciden" visualmente', { tam: 10, color: C.faint })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
