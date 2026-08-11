// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico de
// Razonamiento Cuantitativo (álgebra y cálculo). Los colores usan var(--...)
// literal para que, al inyectarse inline en el DOM (ver VisualSvg.jsx), se
// pinten con el tema activo de la app en vez de un color fijo. Mismo patrón
// que scripts/generar-visuales-pc.mjs.
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

function svg(viewBox, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
${body}
</svg>`
}

function linea(x1, y1, x2, y2, { color = C.texto, ancho = 2, punteada = false } = {}) {
  const dash = punteada ? ' stroke-dasharray="5,5"' : ''
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round"${dash} />`
}

function texto(x, y, contenido, { color = C.texto, tam = 12, peso = 500, anchor = 'middle' } = {}) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${tam}" font-weight="${peso}" text-anchor="${anchor}">${contenido}</text>`
}

function circulo(cx, cy, r, { relleno = 'none', color = C.texto, ancho = 2 } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}" />`
}

function persona(cx, cy, etiqueta, { color = C.texto, muerto = false } = {}) {
  let s = circulo(cx, cy - 10, 8, { color })
  s += linea(cx, cy - 2, cx, cy + 14, { color })
  s += linea(cx, cy + 2, cx - 8, cy + 12, { color })
  s += linea(cx, cy + 2, cx + 8, cy + 12, { color })
  if (muerto) s += `<line x1="${cx - 10}" y1="${cy - 20}" x2="${cx + 10}" y2="${cy}" stroke="${C.warning}" stroke-width="2" />`
  s += texto(cx, cy + 30, etiqueta, { tam: 10, color })
  return s
}

const items = {}

// ---------- RC-ALG-027: reparto en cascada, esquema genérico ----------
items['RC-ALG-027'] = svg('0 0 400 240', `
  ${texto(200, 20, 'Reparto en cascada · primer nivel', { peso: 700, tam: 13 })}
  ${persona(80, 70, 'Beneficiario 1')}
  ${persona(160, 70, 'Beneficiario 2')}
  ${persona(240, 70, 'Beneficiario 3')}
  ${persona(320, 70, 'Beneficiario 4', { color: C.warning, muerto: true })}
  ${texto(320, 105, '(falleció)', { tam: 10, color: C.warning })}

  ${linea(320, 118, 280, 160, { color: C.accent })}
  ${linea(320, 118, 360, 160, { color: C.accent })}
  ${persona(280, 190, 'Hijo A', { color: C.accent })}
  ${persona(360, 190, 'Hijo B', { color: C.accent })}

  ${texto(200, 225, 'la parte del Beneficiario 4 fluye solo hacia sus descendientes, no hacia los otros 3', { tam: 10, color: C.faint })}
`)

// ---------- RC-ALG-028: 5 socios, uno fallecido con 3 hijos, montos ----------
items['RC-ALG-028'] = svg('0 0 600 260', `
  ${texto(270, 20, 'Total: \$600.000.000 entre 5 socios', { peso: 700, tam: 13 })}
  ${persona(70, 70, 'Socio 1')}${texto(70, 100, '\$120.000.000', { tam: 10, color: C.sub })}
  ${persona(170, 70, 'Socio 2')}${texto(170, 100, '\$120.000.000', { tam: 10, color: C.sub })}
  ${persona(270, 70, 'Socio 3')}${texto(270, 100, '\$120.000.000', { tam: 10, color: C.sub })}
  ${persona(370, 70, 'Socio 4')}${texto(370, 100, '\$120.000.000', { tam: 10, color: C.sub })}
  ${persona(470, 70, 'Don Ernesto', { color: C.warning, muerto: true })}${texto(470, 100, '(falleció)', { tam: 10, color: C.warning })}

  ${texto(470, 120, '\$120.000.000', { tam: 10, color: C.warning })}
  ${linea(470, 128, 410, 165, { color: C.accent })}
  ${linea(470, 128, 470, 165, { color: C.accent })}
  ${linea(470, 128, 530, 165, { color: C.accent })}
  ${persona(400, 195, 'Hijo 1', { color: C.accent })}${texto(400, 225, '\$40.000.000', { tam: 10, color: C.accent })}
  ${persona(470, 195, 'Hijo 2', { color: C.accent })}${texto(470, 225, '\$40.000.000', { tam: 10, color: C.accent })}
  ${persona(540, 195, 'Hijo 3', { color: C.accent })}${texto(540, 225, '\$40.000.000', { tam: 10, color: C.accent })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
