// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico de
// Razonamiento Cuantitativo (estadística). Los colores usan var(--...)
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
function circulo(cx, cy, r, { relleno = 'none', color = C.texto, ancho = 2, opacidad } = {}) {
  const op = opacidad !== undefined ? ` fill-opacity="${opacidad}"` : ''
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${op} />`
}
function rect(x, y, w, h, { rx = 6, relleno = 'none', color = C.texto, ancho = 2, dash = false } = {}) {
  const dasharray = dash ? ' stroke-dasharray="4,4"' : ''
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${dasharray} />`
}

const items = {}

// ---------- RC-EST-003: barras + tabla equivalente ----------
items['RC-EST-003'] = svg('0 0 420 220', `
  ${texto(110, 20, 'Gráfica de barras', { peso: 700, tam: 12 })}
  ${linea(40, 170, 40, 40, { color: C.sub })}
  ${linea(40, 170, 200, 170, { color: C.sub })}
  ${rect(60, 90, 30, 80, { relleno: C.accent, color: C.accent })}
  ${rect(105, 60, 30, 110, { relleno: C.accent, color: C.accent })}
  ${rect(150, 110, 30, 60, { relleno: C.accent, color: C.accent })}
  ${texto(75, 185, 'Transp.', { tam: 9, color: C.sub })}
  ${texto(120, 185, 'Comida', { tam: 9, color: C.sub })}
  ${texto(165, 185, 'Viv.', { tam: 9, color: C.sub })}

  ${texto(320, 20, '↔ misma info como tabla', { peso: 700, tam: 12 })}
  ${rect(260, 40, 130, 130, { color: C.borde })}
  ${linea(260, 70, 390, 70, { color: C.borde })}
  ${linea(325, 40, 325, 170, { color: C.borde })}
  ${texto(292, 58, 'Categoría', { tam: 9, color: C.sub })}
  ${texto(358, 58, '%', { tam: 9, color: C.sub })}
  ${texto(292, 90, 'Transporte', { tam: 9 })}${texto(358, 90, '40%', { tam: 9 })}
  ${texto(292, 115, 'Comida', { tam: 9 })}${texto(358, 115, '35%', { tam: 9 })}
  ${texto(292, 140, 'Vivienda', { tam: 9 })}${texto(358, 140, '25%', { tam: 9 })}

  ${texto(210, 205, 'cada barra → una fila de la tabla', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-005: barras apiladas ----------
function barraApilada(cx, baseY, altoA, altoB, etiqueta) {
  const anchoBarra = 50
  const x = cx - anchoBarra / 2
  let s = rect(x, baseY - altoA, anchoBarra, altoA, { rx: 0, relleno: C.accent, color: C.accent })
  s += rect(x, baseY - altoA - altoB, anchoBarra, altoB, { rx: 0, relleno: C.exito, color: C.exito })
  s += linea(x, baseY - altoA - altoB, x + anchoBarra, baseY - altoA - altoB, { color: C.texto, ancho: 1, punteada: true })
  s += texto(cx, baseY - altoA - altoB - 6, String(altoA + altoB), { tam: 10, peso: 700 })
  s += texto(cx, baseY + 16, etiqueta, { tam: 10, color: C.sub })
  return s
}
items['RC-EST-005'] = svg('-58 0 516 220', `
  ${linea(40, 180, 40, 20, { color: C.sub })}
  ${linea(40, 180, 370, 180, { color: C.sub })}
  ${barraApilada(110, 180, 50, 30, 'Categoría 1')}
  ${barraApilada(220, 180, 30, 20, 'Categoría 2')}
  ${barraApilada(320, 180, 40, 25, 'Categoría 3')}
  ${texto(120, 205, 'naranja = A (base) · verde = B (encima) · número = altura total', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-006: Venn, unión (ambos sombreados) ----------
items['RC-EST-006'] = svg('0 0 400 220', `
  ${texto(200, 20, 'A ∪ B — unión', { peso: 700, tam: 13 })}
  ${circulo(160, 120, 70, { relleno: C.accent, color: C.accent, opacidad: 0.35 })}
  ${circulo(240, 120, 70, { relleno: C.accent, color: C.accent, opacidad: 0.35 })}
  ${texto(120, 120, 'A', { tam: 16, peso: 800 })}
  ${texto(280, 120, 'B', { tam: 16, peso: 800 })}
  ${texto(200, 200, 'toda la región sombreada: en A, en B, o en ambos', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-007: Venn, intersección (solo traslape) ----------
items['RC-EST-007'] = svg('0 0 400 220', `
  ${texto(200, 20, 'A ∩ B — intersección', { peso: 700, tam: 13 })}
  ${circulo(160, 120, 70, { color: C.texto })}
  ${circulo(240, 120, 70, { color: C.texto })}
  <clipPath id="clipA"><circle cx="160" cy="120" r="70" /></clipPath>
  <circle cx="240" cy="120" r="70" fill="${C.accent}" fill-opacity="0.4" clip-path="url(#clipA)" />
  ${texto(120, 120, 'A', { tam: 16, peso: 800 })}
  ${texto(280, 120, 'B', { tam: 16, peso: 800 })}
  ${texto(200, 200, 'solo la zona de traslape está sombreada', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-008: Venn, B subconjunto de A ----------
items['RC-EST-008'] = svg('0 0 400 220', `
  ${circulo(200, 120, 90, { color: C.texto })}
  ${texto(120, 45, 'A', { tam: 16, peso: 800 })}
  ${circulo(200, 130, 35, { color: C.accent, relleno: C.accent, opacidad: 0.2 })}
  ${texto(200, 130, 'B', { tam: 14, peso: 800, color: C.accent })}
  ${texto(200, 205, 'B está completamente dentro de A (B ⊆ A)', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-009: Venn con conteos (inglés/francés) ----------
items['RC-EST-009'] = svg('0 0 400 220', `
  ${texto(200, 20, 'A = habla inglés · B = habla francés', { peso: 700, tam: 12 })}
  ${circulo(160, 120, 70, { color: C.texto })}
  ${circulo(240, 120, 70, { color: C.texto })}
  ${texto(120, 120, '22', { tam: 18, peso: 800 })}
  ${texto(200, 120, '8', { tam: 18, peso: 800, color: C.accent })}
  ${texto(280, 120, '12', { tam: 18, peso: 800 })}
  ${texto(120, 145, 'solo A', { tam: 9, color: C.sub })}
  ${texto(200, 145, 'A∩B', { tam: 9, color: C.accent })}
  ${texto(280, 145, 'solo B', { tam: 9, color: C.sub })}
  ${texto(200, 205, '|A∪B| = 22 + 8 + 12 = 42 = |A| + |B| − |A∩B| = 30 + 20 − 8', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-010: Venn perro/gato ----------
items['RC-EST-010'] = svg('0 0 400 220', `
  ${texto(200, 20, 'A = tiene perro (28) · B = tiene gato (19)', { peso: 700, tam: 12 })}
  ${circulo(160, 120, 70, { color: C.texto })}
  ${circulo(240, 120, 70, { color: C.texto })}
  ${texto(120, 120, '22', { tam: 18, peso: 800 })}
  ${texto(200, 120, '6', { tam: 18, peso: 800, color: C.accent })}
  ${texto(280, 120, '13', { tam: 18, peso: 800 })}
  ${texto(120, 145, 'solo perro', { tam: 9, color: C.sub })}
  ${texto(200, 145, 'ambas', { tam: 9, color: C.accent })}
  ${texto(280, 145, 'solo gato', { tam: 9, color: C.sub })}
  ${texto(200, 205, '28 con perro = 22 solo perro + 6 con ambas (no 28 solo perro)', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-011: árbol de decisión 4×3 ----------
items['RC-EST-011'] = svg('0 0 420 260', `
  ${texto(30, 20, 'Entrada', { tam: 11, color: C.sub, anchor: 'start' })}
  ${[0, 1, 2, 3].map((i) => {
    const y = 40 + i * 50
    let s = linea(40, 130, 130, y, { color: C.accent })
    s += texto(135, y + 4, 'E' + (i + 1), { tam: 11, peso: 700, color: C.accent, anchor: 'start' })
    for (let j = 0; j < 3; j++) {
      const y2 = y - 14 + j * 14
      s += linea(155, y, 260, y2, { color: C.sub, ancho: 1 })
      s += texto(265, y2 + 3, 'P' + (j + 1), { tam: 8, color: C.sub, anchor: 'start' })
    }
    return s
  }).join('\n  ')}
  <circle cx="40" cy="130" r="5" fill="${C.texto}" />
  ${texto(200, 240, '4 entradas × 3 platos fuertes = 12 combinaciones (12 puntas del árbol)', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-026: población y muestra ----------
items['RC-EST-026'] = svg('0 0 400 220', `
  ${circulo(200, 110, 90, { color: C.texto })}
  ${texto(200, 30, 'Población', { tam: 13, peso: 700 })}
  ${circulo(200, 130, 35, { color: C.accent, relleno: C.accent, opacidad: 0.2 })}
  ${texto(200, 134, 'Muestra', { tam: 11, peso: 700, color: C.accent })}
`)

// ---------- RC-EST-038: línea + banda sombreada de predicción ----------
items['RC-EST-038'] = svg('-42 0 484 220', `
  ${linea(40, 180, 40, 20, { color: C.sub })}
  ${linea(40, 180, 370, 180, { color: C.sub })}
  <path d="M40,150 L100,140 L160,120 L220,105 L280,90" fill="none" stroke="${C.texto}" stroke-width="2.5" />
  <path d="M280,90 L330,70 L280,120 Z" fill="${C.accent}" fill-opacity="0.25" stroke="none" />
  <path d="M280,90 L330,70" fill="none" stroke="${C.accent}" stroke-width="2" stroke-dasharray="4,4" />
  <path d="M280,90 L330,110" fill="none" stroke="${C.accent}" stroke-width="2" stroke-dasharray="4,4" />
  ${texto(330, 60, 'rango de', { tam: 10, color: C.accent, anchor: 'start' })}
  ${texto(330, 74, 'predicción', { tam: 10, color: C.accent, anchor: 'start' })}
  ${texto(160, 205, 'línea sólida = datos reales · zona sombreada = valores probables futuros', { tam: 10, color: C.faint })}
`)

// ---------- RC-EST-039: crecimiento observado vs proyección ingenua sin límite ----------
items['RC-EST-039'] = svg('-16 0 432 220', `
  ${linea(50, 190, 50, 20, { color: C.borde })}
  ${linea(50, 190, 370, 190, { color: C.borde })}
  ${linea(50, 60, 370, 60, { color: C.warning, punteada: true })}
  ${texto(360, 52, 'población total', { tam: 9, color: C.warning, anchor: 'end' })}
  <polyline points="70,185 140,175 210,145" fill="none" stroke="${C.texto}" stroke-width="2" />
  <circle cx="70" cy="185" r="3" fill="${C.texto}" /><circle cx="140" cy="175" r="3" fill="${C.texto}" /><circle cx="210" cy="145" r="3" fill="${C.texto}" />
  ${texto(70, 200, '100', { tam: 10, color: C.sub })}${texto(140, 200, '300', { tam: 10, color: C.sub })}${texto(210, 200, '900', { tam: 10, color: C.sub })}
  <polyline points="210,145 260,90 300,40 330,10" fill="none" stroke="${C.warning}" stroke-width="2.5" stroke-dasharray="5,5" />
  ${texto(330, 22, '¿5 millones?', { tam: 11, color: C.warning, anchor: 'end' })}
  ${texto(200, 213, 'la extrapolación cruza el límite real de población — no puede continuar igual', { tam: 10, color: C.warning })}
`)

// ---------- RC-EST-040: extensión cercana confiable vs lejana incierta (banda) ----------
items['RC-EST-040'] = svg('0 0 400 220', `
  ${linea(40, 190, 40, 30, { color: C.borde })}
  ${linea(40, 190, 370, 190, { color: C.borde })}
  <polyline points="60,160 100,145 140,130 180,118" fill="none" stroke="${C.texto}" stroke-width="2" />
  <polyline points="180,118 215,108" fill="none" stroke="${C.exito}" stroke-width="2.5" stroke-dasharray="4,4" />
  ${texto(215, 98, 'corto plazo — más confiable', { tam: 10, color: C.exito, anchor: 'start' })}
  <polygon points="215,60 340,20 340,150 215,140" fill="${C.warning}" opacity="0.18" />
  <polyline points="180,118 340,85" fill="none" stroke="${C.warning}" stroke-width="2.5" stroke-dasharray="4,4" />
  ${texto(340, 75, 'largo plazo — más incierto', { tam: 10, color: C.warning, anchor: 'end' })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
