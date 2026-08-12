// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico
// de Razonamiento Cuantitativo — ítems de argumentación
// (rc_items_argumentacion.json). Los colores usan var(--...) literal para
// que, al inyectarse inline en el DOM (ver VisualSvg.jsx), se pinten con el
// tema activo de la app en vez de un color fijo. Mismo patrón/helpers que
// scripts/generar-visuales-pc.mjs.
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

// ---------- RC-GRUPO-047: sistema de riego, dos tanques cilíndricos ----------
function cilindro(cx, topY, w, h, { color = C.texto } = {}) {
  const rx = w / 2
  return `
  <ellipse cx="${cx}" cy="${topY}" rx="${rx}" ry="8" fill="none" stroke="${color}" stroke-width="2" />
  ${linea(cx - rx, topY, cx - rx, topY + h, { color })}
  ${linea(cx + rx, topY, cx + rx, topY + h, { color })}
  <path d="M${cx - rx},${topY + h} A${rx},8 0 0 0 ${cx + rx},${topY + h}" fill="none" stroke="${color}" stroke-width="2" />
  `
}
items['RC-GRUPO-047'] = svg('0 0 400 280', `
  ${texto(120, 20, 'Tanque superior (elevado)', { tam: 11, peso: 700 })}
  ${cilindro(120, 40, 110, 70, { color: C.accent })}

  ${linea(120, 110, 120, 150, { color: C.sub })}
  ${linea(120, 150, 300, 150, { color: C.sub })}
  ${linea(300, 150, 300, 175, { flecha: true, color: C.sub })}
  ${texto(210, 140, 'tubería (desborde)', { tam: 10, color: C.sub })}

  ${texto(300, 165, 'Tanque inferior', { tam: 11, peso: 700 })}
  ${cilindro(300, 178, 110, 55, { color: C.exito })}

  ${linea(30, 245, 370, 245, { color: C.faint })}
  ${texto(200, 240, 'nivel del suelo', { tam: 10, color: C.faint })}
  ${texto(200, 265, 'capacidad total = capacidad tanque superior + capacidad tanque inferior', { tam: 10, color: C.faint })}
`)

// ---------- RC-GRUPO-048: trapecio, dos lados paralelos, sin altura ----------
items['RC-GRUPO-048'] = svg('-16 0 432 220', `
  <polygon points="70,150 330,150 270,50 130,50" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${linea(130, 50, 270, 50, { color: C.accent, ancho: 3 })}
  ${texto(200, 35, '18 m', { tam: 13, peso: 700, color: C.accent })}
  ${linea(70, 150, 330, 150, { color: C.accent, ancho: 3 })}
  ${texto(200, 175, '12 m', { tam: 13, peso: 700, color: C.accent })}

  ${linea(200, 55, 200, 145, { color: C.warning, punteada: true })}
  <circle cx="200" cy="100" r="16" fill="none" stroke="${C.warning}" stroke-width="2" stroke-dasharray="3,3" />
  ${texto(240, 104, '¿altura?', { tam: 11, color: C.warning, anchor: 'start' })}
  ${texto(200, 200, 'no hay ninguna medida de la distancia perpendicular entre los lados paralelos', { tam: 10, color: C.warning })}
`)

// ---------- RC-GRUPO-054: pentágono irregular, solo perímetro ----------
items['RC-GRUPO-054'] = svg('0 0 400 260', `
  <polygon points="200,30 320,110 275,220 125,220 80,110" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${texto(200, 15, 'lote (pentágono irregular)', { tam: 11, color: C.sub })}
  ${['?','?','?','?','?'].map((_, i) => {
    const pts = [[200,30],[320,110],[275,220],[125,220],[80,110]]
    const [x1,y1] = pts[i]
    const [x2,y2] = pts[(i+1)%5]
    const mx = (x1+x2)/2, my = (y1+y2)/2
    return texto(mx, my, '?', { tam: 12, color: C.warning, peso: 700 })
  }).join('\n  ')}
  ${rect(130, 235, 140, 22, { rx: 6, color: C.accent })}
  ${texto(200, 250, 'perímetro total = 84 m', { tam: 11, color: C.accent, peso: 700 })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
