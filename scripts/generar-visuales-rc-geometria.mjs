// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico de
// Razonamiento Cuantitativo (geometría). Los colores usan var(--...) literal
// para que, al inyectarse inline en el DOM (ver VisualSvg.jsx), se pinten con
// el tema activo de la app en vez de un color fijo. Mismo patrón que
// scripts/generar-visuales-pc.mjs. A diferencia de PC, estos son diagramas de
// geometría real: ángulos/proporciones dibujados a la escala relativa que
// describe visual_descripcion, no solo ilustrativos.
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
function circulo(cx, cy, r, { relleno = 'none', color = C.texto, ancho = 2, opacidad, dash = false } = {}) {
  const op = opacidad !== undefined ? ` fill-opacity="${opacidad}"` : ''
  const da = dash ? ' stroke-dasharray="4,4"' : ''
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${op}${da} />`
}
function rect(x, y, w, h, { rx = 4, relleno = 'none', color = C.texto, ancho = 2, dash = false } = {}) {
  const dasharray = dash ? ' stroke-dasharray="4,4"' : ''
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${dasharray} />`
}
function poligono(puntos, { relleno = 'none', color = C.texto, ancho = 2 } = {}) {
  return `<polygon points="${puntos.map((p) => p.join(',')).join(' ')}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}" />`
}
function arco(cx, cy, r, aIni, aFin, { color = C.texto, ancho = 2 } = {}) {
  const p1 = [cx + r * Math.cos((aIni * Math.PI) / 180), cy + r * Math.sin((aIni * Math.PI) / 180)]
  const p2 = [cx + r * Math.cos((aFin * Math.PI) / 180), cy + r * Math.sin((aFin * Math.PI) / 180)]
  const largo = Math.abs(aFin - aIni) > 180 ? 1 : 0
  return `<path d="M${p1[0]},${p1[1]} A${r},${r} 0 ${largo} 1 ${p2[0]},${p2[1]}" fill="none" stroke="${color}" stroke-width="${ancho}" />`
}

const items = {}

// ---------- RC-GEO-001: perímetro de un rectángulo ----------
items['RC-GEO-001'] = svg('0 0 300 200', `
  ${rect(70, 50, 160, 100, { color: C.texto })}
  ${arco(150, 100, 130, -50, 300, { color: C.accent, ancho: 3 })}
  ${texto(150, 30, '5 cm', { tam: 11 })}
  ${texto(255, 100, '3 cm', { tam: 11 })}
  ${texto(150, 170, '5 cm', { tam: 11 })}
  ${texto(45, 100, '3 cm', { tam: 11 })}
  ${texto(150, 195, 'perímetro = 5+3+5+3 = 16 cm (recorre los 4 lados)', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-002: área del triángulo, altura perpendicular ----------
items['RC-GEO-002'] = svg('0 0 300 200', `
  ${poligono([[40,160],[220,160],[130,40]], { color: C.texto })}
  ${linea(130, 160, 130, 40, { color: C.accent, punteada: true })}
  ${rect(122, 152, 16, 16, { color: C.accent, rx: 0 })}
  ${texto(130, 180, 'base = 8 cm', { tam: 11 })}
  ${texto(150, 100, 'altura = 5 cm', { tam: 11, color: C.accent, anchor: 'start' })}
  ${texto(150, 195, 'altura es perpendicular (90°) a la base', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-003: paralelogramo dividido en 2 triángulos ----------
items['RC-GEO-003'] = svg('0 0 300 200', `
  ${poligono([[60,160],[220,160],[260,50],[100,50]], { color: C.texto })}
  ${linea(60, 160, 260, 50, { color: C.accent })}
  ${texto(140, 175, 'base = 6 cm', { tam: 11 })}
  ${texto(160, 100, 'triángulo 1', { tam: 10, color: C.sub })}
  ${texto(200, 130, 'triángulo 2', { tam: 10, color: C.sub })}
  ${texto(150, 195, 'la diagonal parte el paralelogramo en 2 triángulos idénticos', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-004: círculo, circunferencia vs área ----------
items['RC-GEO-004'] = svg('0 0 300 220', `
  ${circulo(150, 100, 70, { relleno: C.accent, color: C.accent, opacidad: 0.15 })}
  ${linea(150, 100, 220, 100, { color: C.texto })}
  ${texto(185, 90, 'r = 7 cm', { tam: 11 })}
  ${arco(150, 100, 82, -30, 300, { color: C.exito, ancho: 3 })}
  ${texto(150, 20, 'contorno (circunferencia) = 2πr', { tam: 11, color: C.exito })}
  ${texto(150, 195, 'interior sombreado = área = πr² (unidades distintas: cm vs cm²)', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-005: figura en L (rectángulo menos rectángulo) ----------
items['RC-GEO-005'] = svg('0 0 300 220', `
  ${poligono([[50,180],[250,180],[250,60],[150,60],[150,110],[50,110]], { color: C.texto })}
  ${rect(150, 60, 100, 50, { color: C.warning, dash: true })}
  ${texto(200, 50, '10 m × 6 m (completo)', { tam: 10, color: C.sub })}
  ${texto(200, 90, 'falta: 4 m × 3 m', { tam: 10, color: C.warning })}
  ${texto(150, 205, 'área = (10×6) − (4×3) = 60 − 12', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-006: caja rectangular 3D, largo/ancho/alto ----------
function caja3d(ox, oy, w, h, d) {
  const off = 30
  let s = poligono([[ox,oy],[ox+w,oy],[ox+w,oy+h],[ox,oy+h]], { color: C.texto })
  s += poligono([[ox,oy],[ox+off,oy-off],[ox+w+off,oy-off],[ox+w,oy]], { color: C.texto })
  s += poligono([[ox+w,oy],[ox+w+off,oy-off],[ox+w+off,oy+h-off],[ox+w,oy+h]], { color: C.texto })
  return s
}
items['RC-GEO-006'] = svg('0 0 300 220', `
  ${caja3d(60, 150, 120, 90)}
  ${texto(120, 175, 'largo', { tam: 11 })}
  ${texto(200, 90, 'ancho', { tam: 11 })}
  ${texto(45, 110, 'alto', { tam: 11, color: C.accent })}
  ${texto(150, 205, 'volumen = largo × ancho × alto', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-007: cilindro, radio y altura ----------
items['RC-GEO-007'] = svg('0 0 300 220', `
  <ellipse cx="150" cy="60" rx="60" ry="18" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${linea(90, 60, 90, 160, { color: C.texto })}
  ${linea(210, 60, 210, 160, { color: C.texto })}
  <path d="M90,160 A60,18 0 0 0 210,160" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${linea(150, 60, 150, 160, { color: C.accent, punteada: true })}
  ${texto(170, 115, 'altura', { tam: 11, color: C.accent, anchor: 'start' })}
  ${linea(150, 60, 178, 60, { color: C.exito })}
  ${texto(165, 50, 'r', { tam: 11, color: C.exito })}
  ${texto(150, 200, 'volumen = (πr²) × altura', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-008: esfera dentro del cilindro que la contiene ----------
items['RC-GEO-008'] = svg('0 0 300 220', `
  <ellipse cx="120" cy="50" rx="45" ry="14" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${linea(75, 50, 75, 150, { color: C.texto })}
  ${linea(165, 50, 165, 150, { color: C.texto })}
  <path d="M75,150 A45,14 0 0 0 165,150" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${circulo(120, 100, 45, { color: C.accent, relleno: C.accent, opacidad: 0.15 })}
  ${texto(120, 185, 'esfera : cilindro que la contiene = 2 : 3', { tam: 11, color: C.accent })}
  ${texto(220, 100, 'volumen esfera', { tam: 10, color: C.faint, anchor: 'start' })}
  ${texto(220, 116, '= (4/3)πr³', { tam: 10, color: C.faint, anchor: 'start' })}
`)

// ---------- RC-GEO-009: caja 3D, 6 caras identificadas ----------
items['RC-GEO-009'] = svg('0 0 300 220', `
  ${caja3d(60, 160, 120, 100)}
  ${texto(120, 190, '① frente', { tam: 10 })}
  ${texto(120, 90, '② arriba', { tam: 10 })}
  ${texto(200, 130, '③ lado', { tam: 10 })}
  ${texto(150, 205, '6 caras rectangulares (frente/atrás, arriba/abajo, 2 lados) → área total', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-010: dos esferas, radio doble ----------
items['RC-GEO-010'] = svg('0 0 320 200', `
  ${circulo(80, 120, 30, { color: C.texto })}
  ${texto(80, 165, 'r = 2 cm', { tam: 11 })}
  ${circulo(220, 100, 60, { color: C.accent })}
  ${texto(220, 175, 'r = 4 cm (el doble)', { tam: 11, color: C.accent })}
  ${texto(150, 20, '¿el volumen también se duplica?', { tam: 11, color: C.faint })}
`)

// ---------- RC-GEO-011: paralelas y perpendiculares ----------
items['RC-GEO-011'] = svg('0 0 320 200', `
  ${linea(30, 50, 160, 50, { color: C.texto })}
  ${linea(30, 80, 160, 80, { color: C.texto })}
  ${texto(95, 40, 'paralelas (nunca se cruzan)', { tam: 10, color: C.sub })}

  ${linea(230, 40, 230, 160, { color: C.texto })}
  ${linea(190, 100, 280, 100, { color: C.texto })}
  ${rect(222, 92, 16, 16, { color: C.exito, rx: 0 })}
  ${texto(255, 90, '90°', { tam: 10, color: C.exito })}
  ${texto(230, 180, 'perpendiculares', { tam: 10, color: C.sub })}
`)

// ---------- RC-GEO-012: transversal corta 2 paralelas, ángulos correspondientes ----------
items['RC-GEO-012'] = svg('0 0 320 220', `
  ${linea(30, 70, 290, 70, { color: C.texto })}
  ${linea(30, 160, 290, 160, { color: C.texto })}
  ${linea(90, 30, 230, 200, { color: C.accent })}
  ${arco(133, 70, 24, 55, 125, { color: C.exito, ancho: 2 })}
  ${texto(133, 45, '70°', { tam: 11, color: C.exito })}
  ${arco(196, 160, 24, 55, 125, { color: C.warning, ancho: 2 })}
  ${texto(196, 135, '?', { tam: 11, color: C.warning })}
  ${texto(160, 205, 'ángulos correspondientes: misma posición relativa en cada cruce', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-013: dos segmentos perpendiculares a la misma recta ----------
items['RC-GEO-013'] = svg('0 0 300 200', `
  ${linea(40, 150, 260, 150, { color: C.texto })}
  ${linea(90, 150, 90, 60, { color: C.accent })}
  ${rect(82, 142, 16, 16, { color: C.accent, rx: 0 })}
  ${linea(190, 150, 190, 60, { color: C.accent })}
  ${rect(182, 142, 16, 16, { color: C.accent, rx: 0 })}
  ${texto(150, 180, 'ambos forman 90° con la recta horizontal', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-014: desigualdad triangular, caso límite ----------
items['RC-GEO-014'] = svg('0 0 300 180', `
  ${linea(40, 130, 180, 130, { color: C.texto })}
  ${linea(180, 130, 260, 130, { color: C.texto, punteada: true })}
  ${linea(40, 130, 260, 130, { color: C.faint })}
  ${texto(110, 148, '3', { tam: 11 })}
  ${texto(220, 148, '4', { tam: 11 })}
  ${texto(150, 110, '5 (el tercer lado, en línea recta)', { tam: 10, color: C.warning })}
  ${texto(150, 165, 'caso límite: 3+4=7 apenas mayor que 5 — si fuera igual, no cerraría', { tam: 9, color: C.faint })}
`)

// ---------- RC-GEO-016: plano cartesiano, 4 cuadrantes, punto (3,-2) ----------
items['RC-GEO-016'] = svg('0 0 300 220', `
  ${linea(150, 20, 150, 200, { color: C.sub })}
  ${linea(30, 110, 270, 110, { color: C.sub })}
  ${texto(180, 50, 'Cuadrante I', { tam: 10, color: C.faint })}
  ${texto(110, 50, 'Cuadrante II', { tam: 10, color: C.faint })}
  ${texto(110, 180, 'Cuadrante III', { tam: 10, color: C.faint })}
  ${texto(190, 180, 'Cuadrante IV', { tam: 10, color: C.faint })}
  <circle cx="210" cy="150" r="5" fill="${C.accent}" />
  ${texto(225, 155, '(3, −2)', { tam: 11, color: C.accent, anchor: 'start' })}
`)

// ---------- RC-GEO-017: distancia entre 2 puntos, triángulo rectángulo auxiliar ----------
items['RC-GEO-017'] = svg('0 0 300 220', `
  ${linea(40, 30, 40, 190, { color: C.faint })}
  ${linea(30, 180, 270, 180, { color: C.faint })}
  <circle cx="70" cy="150" r="5" fill="${C.texto}" />
  ${texto(70, 168, '(1,1)', { tam: 10 })}
  <circle cx="190" cy="60" r="5" fill="${C.texto}" />
  ${texto(190, 48, '(4,5)', { tam: 10 })}
  ${linea(70, 150, 190, 60, { color: C.accent, ancho: 2.5 })}
  ${linea(70, 150, 190, 150, { color: C.exito, punteada: true })}
  ${linea(190, 150, 190, 60, { color: C.exito, punteada: true })}
  ${texto(130, 165, 'diferencia en x', { tam: 9, color: C.exito })}
  ${texto(210, 105, 'diferencia en y', { tam: 9, color: C.exito, anchor: 'start' })}
  ${texto(150, 200, 'distancia = hipotenusa del triángulo rectángulo formado', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-018: dos segmentos, sube/avanza ----------
items['RC-GEO-018'] = svg('0 0 300 220', `
  ${linea(40, 30, 40, 190, { color: C.faint })}
  ${linea(30, 180, 270, 180, { color: C.faint })}
  ${linea(40, 180, 120, 140, { color: C.accent, ancho: 2.5 })}
  ${linea(40, 180, 120, 180, { color: C.sub, punteada: true })}
  ${linea(120, 180, 120, 140, { color: C.sub, punteada: true })}
  ${texto(80, 195, 'avanza 4', { tam: 9, color: C.sub })}
  ${linea(70, 60, 150, 20, { color: C.exito, ancho: 2.5 })}
  ${linea(70, 60, 150, 60, { color: C.sub, punteada: true })}
  ${linea(150, 60, 150, 20, { color: C.sub, punteada: true })}
  ${texto(200, 130, 'ambos suben 2 mientras avanzan 4 → misma inclinación', { tam: 10, color: C.faint })}
`)

// ---------- RC-GEO-020: dos tanques cilíndricos conectados ----------
function cilindroPeq(ox, oy, rx, alto, opts = {}) {
  const { color = C.texto, dash = false } = opts
  let s = `<ellipse cx="${ox}" cy="${oy}" rx="${rx}" ry="${rx * 0.3}" fill="none" stroke="${color}" stroke-width="2" ${dash ? 'stroke-dasharray="4,4"' : ''} />`
  s += linea(ox - rx, oy, ox - rx, oy + alto, { color, punteada: dash })
  s += linea(ox + rx, oy, ox + rx, oy + alto, { color, punteada: dash })
  s += `<path d="M${ox - rx},${oy + alto} A${rx},${rx * 0.3} 0 0 0 ${ox + rx},${oy + alto}" fill="none" stroke="${color}" stroke-width="2" ${dash ? 'stroke-dasharray="4,4"' : ''} />`
  return s
}
items['RC-GEO-020'] = svg('0 0 300 240', `
  ${cilindroPeq(150, 30, 35, 50, { color: C.warning, dash: true })}
  ${texto(220, 55, '¿medidas?', { tam: 10, color: C.warning, anchor: 'start' })}
  ${linea(150, 80, 150, 110, { color: C.texto })}
  ${cilindroPeq(150, 120, 50, 70)}
  ${linea(100, 120, 100, 190, { color: C.accent, punteada: true })}
  ${texto(85, 155, 'altura', { tam: 10, color: C.accent, anchor: 'end' })}
  ${linea(150, 120, 200, 120, { color: C.exito })}
  ${texto(180, 112, 'r', { tam: 10, color: C.exito })}
  ${texto(150, 225, 'tanque inferior: medidas conocidas · tanque superior: sin medir', { tam: 9, color: C.faint })}
`)

// ---------- RC-GEO-021: cuadrado (1 lado) vs rectángulo (2 lados) ----------
items['RC-GEO-021'] = svg('0 0 300 200', `
  ${rect(40, 60, 90, 90, { color: C.texto })}
  ${texto(85, 50, 'lado = 5 cm', { tam: 10 })}
  ${texto(85, 175, 'cuadrado: 1 sola medida', { tam: 10, color: C.sub })}

  ${rect(180, 70, 100, 60, { color: C.texto })}
  ${texto(230, 60, '?', { tam: 11 })}
  ${texto(170, 100, '?', { tam: 11, anchor: 'end' })}
  ${texto(230, 150, 'rectángulo: 2 medidas distintas', { tam: 10, color: C.sub })}
`)

// ---------- RC-GEO-022: círculo 360°, dirección y su opuesta ----------
items['RC-GEO-022'] = svg('0 0 300 260', `
  ${circulo(150, 130, 90, { color: C.borde })}
  ${texto(150, 30, '0° (N)', { tam: 10, color: C.sub })}
  ${texto(250, 130, '90° (E)', { tam: 10, color: C.sub })}
  ${texto(150, 235, '180° (S)', { tam: 10, color: C.sub })}
  ${texto(50, 130, '270° (O)', { tam: 10, color: C.sub })}
  ${(() => {
    const a1 = -90 + 50, a2 = -90 + 230
    const p1 = [150 + 90 * Math.cos((a1 * Math.PI) / 180), 130 + 90 * Math.sin((a1 * Math.PI) / 180)]
    const p2 = [150 + 90 * Math.cos((a2 * Math.PI) / 180), 130 + 90 * Math.sin((a2 * Math.PI) / 180)]
    return linea(p1[0], p1[1], p2[0], p2[1], { color: C.accent, ancho: 2.5 }) +
      `<circle cx="${p1[0]}" cy="${p1[1]}" r="4" fill="${C.accent}" />` +
      `<circle cx="${p2[0]}" cy="${p2[1]}" r="4" fill="${C.accent}" />` +
      texto(p1[0] + 15, p1[1] - 5, '50°', { tam: 10, color: C.accent, anchor: 'start' }) +
      texto(p2[0] - 15, p2[1] + 15, '?', { tam: 10, color: C.accent, anchor: 'end' })
  })()}
  ${texto(150, 15, 'una recta que pasa por el centro conecta una dirección con su opuesta', { tam: 9, color: C.faint })}
`)

// ---------- RC-GEO-023: giro 45° a la derecha desde 80° ----------
items['RC-GEO-023'] = svg('0 0 300 260', `
  ${circulo(150, 130, 90, { color: C.borde })}
  ${texto(150, 30, '0° (N)', { tam: 10, color: C.sub })}
  ${texto(250, 130, '90° (E)', { tam: 10, color: C.sub })}
  ${(() => {
    const a1 = -90 + 80
    const p1 = [150 + 90 * Math.cos((a1 * Math.PI) / 180), 130 + 90 * Math.sin((a1 * Math.PI) / 180)]
    return linea(150, 130, p1[0], p1[1], { color: C.sub, ancho: 2 }) +
      texto(p1[0] + 10, p1[1] - 5, '80° inicial', { tam: 10, color: C.sub, anchor: 'start' }) +
      arco(150, 130, 40, a1, a1 + 45, { color: C.exito, ancho: 2 }) +
      texto(190, 120, '+45°', { tam: 10, color: C.exito })
  })()}
  ${texto(150, 245, 'girar a la derecha (horario) suma el ángulo a la dirección inicial', { tam: 9, color: C.faint })}
`)

// ---------- RC-GEO-024: rosa de los vientos, dirección 200° ----------
items['RC-GEO-024'] = svg('0 0 300 260', `
  ${circulo(150, 130, 90, { color: C.borde })}
  ${texto(150, 30, 'N (0°)', { tam: 11, color: C.sub })}
  ${texto(250, 135, 'E (90°)', { tam: 11, color: C.sub })}
  ${texto(150, 235, 'S (180°)', { tam: 11, color: C.sub })}
  ${texto(50, 135, 'O (270°)', { tam: 11, color: C.sub })}
  ${(() => {
    const a1 = -90 + 200
    const p1 = [150 + 90 * Math.cos((a1 * Math.PI) / 180), 130 + 90 * Math.sin((a1 * Math.PI) / 180)]
    return linea(150, 130, p1[0], p1[1], { color: C.accent, ancho: 2.5 }) +
      `<circle cx="${p1[0]}" cy="${p1[1]}" r="4" fill="${C.accent}" />` +
      texto(p1[0] - 10, p1[1] + 18, '200°', { tam: 10, color: C.accent, anchor: 'end' })
  })()}
  ${texto(150, 250, 'entre S (180°) y O (270°), más cerca de S', { tam: 9, color: C.faint })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
