// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico /
// estructura_quimica de Pensamiento Científico. Los colores usan var(--...)
// literal para que, al inyectarse inline en el DOM (ver VisualSvg.jsx), se
// pinten con el tema activo de la app en vez de un color fijo.
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR_SALIDA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/assets/visuals/pensamiento-cientifico')
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

// ---------- PC-EST-007: experimento controlado (fertilizante) ----------
items['PC-EST-007'] = svg('0 0 400 220', `
  ${texto(200, 20, 'Todo igual excepto la variable manipulada', { color: C.sub, tam: 12 })}
  ${rect(30, 40, 150, 130, { color: C.borde })}
  ${texto(105, 60, 'Grupo A', { peso: 800 })}
  <ellipse cx="105" cy="130" rx="10" ry="40" fill="none" stroke="${C.texto}" stroke-width="2" />
  <line x1="105" y1="130" x2="105" y2="170" stroke="${C.texto}" stroke-width="3" />
  ${texto(105, 190, '+ fertilizante nuevo', { color: C.accent, tam: 11, peso: 700 })}

  ${rect(220, 40, 150, 130, { color: C.borde })}
  ${texto(295, 60, 'Grupo B (control)', { peso: 800 })}
  <ellipse cx="295" cy="130" rx="10" ry="40" fill="none" stroke="${C.texto}" stroke-width="2" />
  <line x1="295" y1="130" x2="295" y2="170" stroke="${C.texto}" stroke-width="3" />
  ${texto(295, 190, 'sin fertilizante', { color: C.sub, tam: 11, peso: 700 })}

  ${texto(200, 205, 'misma especie · edad · suelo · luz · agua', { color: C.faint, tam: 10 })}
`)

// ---------- PC-EST-018: orden de adición invertido ----------
items['PC-EST-018'] = svg('0 0 400 220', `
  ${texto(100, 20, 'Estudiante 1: A sobre B', { tam: 12, peso: 700 })}
  <path d="M60,50 L140,50 L140,90 Q140,100 130,100 L70,100 Q60,100 60,90 Z" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${texto(100, 78, 'B', { tam: 13 })}
  ${linea(100, 30, 100, 48, { flecha: true })}
  ${texto(100, 22, 'A', { tam: 12, color: C.accent })}
  <circle cx="100" cy="120" r="14" fill="none" stroke="${C.exito}" stroke-width="2" />
  <circle cx="94" cy="126" r="3" fill="${C.exito}" />
  <circle cx="106" cy="114" r="3" fill="${C.exito}" />
  ${texto(100, 150, 'reacción gradual', { color: C.exito, tam: 11, peso: 700 })}

  ${texto(300, 20, 'Estudiante 2: B sobre A', { tam: 12, peso: 700 })}
  <path d="M260,50 L340,50 L340,90 Q340,100 330,100 L270,100 Q260,100 260,90 Z" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${texto(300, 78, 'A', { tam: 13 })}
  ${linea(300, 30, 300, 48, { flecha: true })}
  ${texto(300, 22, 'B', { tam: 12, color: C.accent })}
  <circle cx="300" cy="120" r="20" fill="none" stroke="${C.warning}" stroke-width="2" />
  <circle cx="288" cy="130" r="4" fill="${C.warning}" />
  <circle cx="312" cy="108" r="4" fill="${C.warning}" />
  <circle cx="300" cy="105" r="4" fill="${C.warning}" />
  <circle cx="315" cy="128" r="3" fill="${C.warning}" />
  ${texto(300, 155, 'reacción vigorosa', { color: C.warning, tam: 11, peso: 700 })}

  ${linea(180, 90, 220, 90, { color: C.faint, punteada: true })}
  ${texto(200, 195, 'mismas sustancias y cantidades → resultados distintos', { color: C.faint, tam: 10 })}
`)

// ---------- PC-QUI-011: equilibrio N2+3H2⇌2NH3 comprimido ----------
function puntos(cx, cy, n, r, color) {
  const pos = []
  const cols = Math.ceil(Math.sqrt(n))
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    pos.push(`<circle cx="${cx - (cols - 1) * 9 + col * 18}" cy="${cy - 10 + row * 18}" r="${r}" fill="${color}" />`)
  }
  return pos.join('\n  ')
}
items['PC-QUI-011'] = svg('0 0 400 220', `
  ${texto(90, 20, 'Antes (V)', { peso: 700 })}
  ${rect(30, 35, 120, 110, { color: C.borde })}
  ${puntos(90, 90, 4, 6, C.sub)}
  ${texto(90, 165, '4 moléculas de gas', { tam: 11, color: C.sub })}

  ${linea(160, 90, 210, 90, { flecha: true, ancho: 3 })}
  ${texto(185, 78, 'V ↓ ½', { tam: 12, peso: 700, color: C.accent })}

  ${texto(300, 20, 'Después (V/2)', { peso: 700 })}
  ${rect(240, 50, 120, 80, { color: C.texto })}
  ${puntos(300, 90, 2, 6, C.accent)}
  ${texto(300, 155, '2 moléculas de gas', { tam: 11, color: C.accent })}

  ${linea(200, 195, 200, 195)}
  ${texto(200, 200, 'presión ↑ → el equilibrio se desplaza hacia los productos (NH₃)', { tam: 11, color: C.sub })}
`)

// ---------- PC-QUI-037: purificación ácido benzoico (flujo) ----------
function cajaFlujo(y, etiqueta) {
  return `${rect(80, y, 240, 34, { rx: 10 })}${texto(200, y + 22, etiqueta, { tam: 12 })}`
}
items['PC-QUI-037'] = svg('0 0 400 260', `
  ${cajaFlujo(10, 'Mezcla en disolvente orgánico')}
  ${linea(200, 44, 200, 60, { flecha: true })}
  ${cajaFlujo(62, '+ NaOH, se agita (ácido → sal soluble en agua)')}
  ${linea(200, 96, 200, 112, { flecha: true })}
  ${cajaFlujo(114, 'Se separan las fases orgánica / acuosa')}
  ${linea(200, 148, 200, 164, { flecha: true })}
  ${cajaFlujo(166, 'Fase acuosa + HCl (se acidifica)')}
  ${linea(200, 200, 200, 216, { flecha: true, color: C.accent })}
  ${rect(80, 218, 240, 34, { rx: 10, color: C.exito })}
  ${texto(200, 240, 'Precipita el ácido benzoico purificado', { tam: 12, color: C.exito, peso: 700 })}
`)

// ---------- PC-RAZ-002: dianas precisión/exactitud ----------
function diana(cx, cy, puntosArr, colorPuntos) {
  return `
  ${circulo(cx, cy, 34, { color: C.borde })}
  ${circulo(cx, cy, 22, { color: C.borde })}
  ${circulo(cx, cy, 10, { color: C.borde })}
  ${puntosArr.map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="3.5" fill="${colorPuntos}" />`).join('\n  ')}
  `
}
items['PC-RAZ-002'] = svg('0 0 400 300', `
  ${diana(100, 80, [[2, -2], [-3, 3], [1, 4], [-2, -3]], C.exito)}
  ${texto(100, 135, 'Precisa y exacta', { tam: 11, peso: 700 })}

  ${diana(300, 80, [[24, -24], [26, -20], [22, -26], [25, -22]], C.warning)}
  ${texto(300, 135, 'Precisa, no exacta', { tam: 11, peso: 700 })}

  ${diana(100, 220, [[-20, 15], [18, -22], [-15, -18], [22, 20], [0, -28]], C.accent)}
  ${texto(100, 275, 'Exacta en promedio, no precisa', { tam: 11, peso: 700 })}

  ${diana(300, 220, [[-30, 20], [28, -30], [35, 15], [-25, -30], [10, 34]], C.sub)}
  ${texto(300, 275, 'Ni exacta ni precisa', { tam: 11, peso: 700 })}
`)

// ---------- PC-RAZ-005: diseño correcto vs incorrecto ----------
items['PC-RAZ-005'] = svg('0 0 400 220', `
  ${texto(100, 18, '✗ Incorrecto', { color: C.warning, peso: 800 })}
  ${rect(20, 30, 160, 60, { color: C.warning })}
  ${texto(100, 55, 'Grupo A · zona 1', { tam: 11 })}
  ${texto(100, 75, 'con fertilizante', { tam: 11, color: C.sub })}
  ${rect(20, 100, 160, 60, { color: C.warning })}
  ${texto(100, 125, 'Grupo B · zona 2', { tam: 11 })}
  ${texto(100, 145, 'sin fertilizante', { tam: 11, color: C.sub })}
  ${texto(100, 178, 'zona y tratamiento se mezclan', { tam: 10, color: C.warning })}

  ${texto(300, 18, '✓ Correcto', { color: C.exito, peso: 800 })}
  ${rect(220, 30, 160, 60, { color: C.exito })}
  ${texto(300, 55, 'Mismas parcelas', { tam: 11 })}
  ${texto(300, 75, 'Tiempo 1: sin fertilizante', { tam: 11, color: C.sub })}
  ${linea(300, 90, 300, 98, { flecha: true, color: C.exito })}
  ${rect(220, 100, 160, 60, { color: C.exito })}
  ${texto(300, 125, 'Mismas parcelas', { tam: 11 })}
  ${texto(300, 145, 'Tiempo 2: con fertilizante', { tam: 11, color: C.sub })}
  ${texto(300, 178, 'única variable: el tiempo/tratamiento', { tam: 10, color: C.exito })}
`)

// ---------- PC-RAZ-007: variables del péndulo ----------
items['PC-RAZ-007'] = svg('0 0 400 220', `
  ${rect(30, 80, 150, 60, { rx: 10, color: C.accent })}
  ${texto(105, 103, 'Variable independiente', { tam: 11, peso: 700, color: C.accent })}
  ${texto(105, 122, 'longitud del hilo', { tam: 12 })}

  ${linea(180, 110, 220, 110, { flecha: true, ancho: 3 })}

  ${rect(220, 80, 150, 60, { rx: 10, color: C.exito })}
  ${texto(295, 103, 'Variable dependiente', { tam: 11, peso: 700, color: C.exito })}
  ${texto(295, 122, 'periodo de oscilación', { tam: 12 })}

  ${rect(105, 10, 190, 50, { rx: 10, color: C.borde, dash: true })}
  ${texto(200, 30, 'Variables controladas', { tam: 11, peso: 700, color: C.sub })}
  ${texto(200, 48, 'masa de la bola · ángulo inicial', { tam: 11, color: C.sub })}
  ${linea(200, 60, 200, 78, { punteada: true, color: C.borde })}
`)

// ---------- PC-RAZ-019: diagrama de cuerpo libre del carro ----------
items['PC-RAZ-019'] = svg('0 0 400 200', `
  ${rect(160, 100, 80, 36, { rx: 8 })}
  <circle cx="180" cy="140" r="10" fill="none" stroke="${C.texto}" stroke-width="2" />
  <circle cx="220" cy="140" r="10" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${linea(240, 118, 300, 118, { flecha: true, ancho: 3, color: C.accent })}
  ${texto(270, 105, 'Fuerza del motor', { tam: 11, color: C.accent })}
  ${linea(160, 118, 100, 118, { flecha: true, ancho: 3, color: C.warning })}
  ${texto(130, 105, 'Fricción + aire', { tam: 11, color: C.warning })}
  ${linea(200, 40, 260, 40, { flecha: true, color: C.sub })}
  ${texto(230, 28, 'v = 100 km/h (constante)', { tam: 11, color: C.sub })}
  ${texto(200, 180, 'fuerzas de igual magnitud → fuerza neta = 0', { tam: 11, color: C.sub })}
`)

// ---------- PC-GRUPO-009: bloque con fricción balanceada ----------
items['PC-GRUPO-009'] = svg('0 0 400 180', `
  ${linea(30, 140, 370, 140, { color: C.borde, ancho: 3 })}
  ${rect(160, 95, 80, 45, { rx: 6 })}
  ${linea(245, 117, 305, 117, { flecha: true, ancho: 3, color: C.accent })}
  ${texto(275, 105, 'F aplicada', { tam: 11, color: C.accent })}
  ${linea(155, 117, 95, 117, { flecha: true, ancho: 3, color: C.warning })}
  ${texto(125, 105, 'Fricción', { tam: 11, color: C.warning })}
  ${linea(200, 40, 260, 40, { flecha: true, color: C.sub })}
  ${texto(230, 28, 'v constante →', { tam: 11, color: C.sub })}
  ${texto(200, 165, 'flechas de igual magnitud → fuerza neta = 0', { tam: 11, color: C.sub })}
`)

// ---------- PC-GRUPO-018: diagrama de fases CO2 ----------
items['PC-GRUPO-018'] = svg('0 0 400 260', `
  ${linea(60, 20, 60, 220, { flecha: true })}
  ${texto(30, 40, 'P (atm)', { anchor: 'start', tam: 12, color: C.sub })}
  ${linea(60, 220, 380, 220, { flecha: true })}
  ${texto(360, 240, 'T (°C)', { tam: 12, color: C.sub })}

  <path d="M60,190 C110,160 140,120 170,60" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${texto(90, 150, 'sólido', { tam: 12 })}
  <path d="M170,60 C220,90 260,150 300,220" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${texto(230, 90, 'líquido', { tam: 12 })}
  <path d="M170,60 C190,120 200,170 210,220" fill="none" stroke="${C.texto}" stroke-width="2" stroke-dasharray="4,4" />
  ${texto(310, 170, 'gas', { tam: 12 })}

  <circle cx="170" cy="60" r="4" fill="${C.accent}" />
  ${texto(170, 45, 'punto triple: 5,11 atm, −56,6 °C', { tam: 10, color: C.accent })}

  ${linea(60, 165, 380, 165, { color: C.exito, punteada: true, ancho: 2 })}
  ${texto(360, 158, '1 atm', { tam: 11, color: C.exito, anchor: 'end' })}
  ${linea(100, 165, 270, 165, { flecha: true, color: C.exito, ancho: 3 })}
  ${texto(60, 250, 'a 1 atm: sólido → gas directo (sublimación), sin pasar por líquido', { tam: 10, color: C.exito, anchor: 'start' })}
`)

// ---------- PC-GRUPO-041: nave espacial, ley de inercia ----------
items['PC-GRUPO-041'] = svg('0 0 400 200', `
  ${[...Array(18)].map(() => `<circle cx="${Math.random() * 400 | 0}" cy="${Math.random() * 160 | 0}" r="1" fill="${C.faint}" />`).join('\n  ')}
  <path d="M150,100 L230,90 L260,100 L230,110 Z" fill="none" stroke="${C.texto}" stroke-width="2" />
  <circle cx="160" cy="100" r="6" fill="none" stroke="${C.texto}" stroke-width="2" />
  ${texto(200, 70, 'motores apagados', { tam: 11, color: C.sub })}
  ${linea(265, 100, 340, 100, { flecha: true, ancho: 3, color: C.accent })}
  ${texto(300, 130, 'v = 20.000 km/h constante', { tam: 11, color: C.accent })}
  ${texto(200, 175, 'sin fuerza neta (vacío, sin fricción) → ninguna otra flecha de fuerza', { tam: 10, color: C.sub })}
`)

// ---------- PC-GRUPO-044: Bohr H vs Li ----------
items['PC-GRUPO-044'] = svg('0 0 400 220', `
  ${texto(100, 20, 'Hidrógeno (Z=1)', { peso: 700 })}
  <circle cx="100" cy="110" r="8" fill="${C.texto}" />
  ${circulo(100, 110, 60, { color: C.borde })}
  <circle cx="160" cy="110" r="5" fill="${C.accent}" />
  ${texto(100, 190, 'modelo de Bohr aplica bien', { tam: 11, color: C.exito })}

  ${texto(300, 20, 'Litio (Z=3)', { peso: 700 })}
  <circle cx="300" cy="110" r="10" fill="${C.texto}" />
  ${circulo(300, 110, 35, { color: C.borde })}
  ${circulo(300, 110, 60, { color: C.borde })}
  <circle cx="335" cy="110" r="5" fill="${C.warning}" />
  <circle cx="300" cy="50" r="5" fill="${C.warning}" />
  <circle cx="265" cy="130" r="5" fill="${C.warning}" />
  ${linea(335, 110, 300, 50, { color: C.warning, punteada: true, ancho: 1 })}
  ${linea(300, 50, 265, 130, { color: C.warning, punteada: true, ancho: 1 })}
  ${texto(300, 190, '3 electrones interactúan entre sí', { tam: 11, color: C.warning })}
`)

// ---------- PC-GRUPO-046: efecto fotoeléctrico ----------
items['PC-GRUPO-046'] = svg('0 0 400 220', `
  ${rect(170, 20, 20, 170, { relleno: C.borde, color: C.borde })}
  ${texto(180, 205, 'placa metálica', { tam: 11, color: C.sub })}

  ${linea(40, 60, 165, 60, { flecha: true, color: C.sub })}
  ${texto(100, 48, 'frecuencia baja', { tam: 11, color: C.sub })}
  ${texto(100, 80, '(cualquier intensidad)', { tam: 10, color: C.faint })}
  ${texto(140, 100, '✗ sin emisión', { tam: 11, color: C.warning })}

  ${linea(40, 150, 165, 150, { flecha: true, color: C.accent, ancho: 3 })}
  ${texto(100, 138, 'frecuencia > umbral', { tam: 11, color: C.accent })}
  ${linea(195, 150, 260, 130, { flecha: true, color: C.exito, ancho: 2 })}
  ${texto(300, 122, 'e⁻ emitido', { tam: 11, color: C.exito })}
`)

// ---------- PC-GRUPO-048: satélite, radiación ----------
items['PC-GRUPO-048'] = svg('0 0 400 200', `
  <circle cx="60" cy="60" r="30" fill="${C.warning}" opacity="0.85" />
  ${texto(60, 105, 'Sol', { tam: 11, color: C.sub })}
  <path d="M100,70 q15,-10 30,0 q15,10 30,0 q15,-10 30,0 q15,10 30,0" fill="none" stroke="${C.warning}" stroke-width="2" />
  ${linea(255, 70, 300, 100, { flecha: true, color: C.warning })}
  ${texto(190, 55, 'radiación electromagnética (ondas)', { tam: 10, color: C.sub })}
  ${rect(300, 95, 60, 30, { rx: 4 })}
  ${texto(330, 145, 'satélite', { tam: 11, color: C.sub })}
  ${texto(200, 185, 'vacío del espacio: sin medio material entre el Sol y el satélite', { tam: 10, color: C.faint })}
`)

// ---------- PC-GRUPO-054: orbitales moleculares O2 ----------
items['PC-GRUPO-054'] = svg('0 0 400 240', `
  ${texto(120, 20, 'Diagrama de OM del O₂', { peso: 700, tam: 12 })}
  ${['σ2p','π2p (a)','π2p (b)','π2p* (a)','π2p* (b)','σ2p*'].map((et,i) => {
    const y = 200 - i * 28
    return `${linea(60, y, 110, y)}${texto(85, y - 6, et, { tam: 9, color: C.sub })}`
  }).join('\n  ')}
  <circle cx="72" cy="88" r="4" fill="${C.warning}" />
  <circle cx="72" cy="116" r="4" fill="${C.warning}" />
  ${texto(150, 100, '2 electrones desapareados', { tam: 10, color: C.warning, anchor: 'start' })}
  ${texto(150, 114, '(uno en cada π2p*, Hund)', { tam: 10, color: C.warning, anchor: 'start' })}

  ${texto(320, 20, 'Lewis simple', { peso: 700, tam: 12 })}
  ${linea(290, 110, 350, 110, { ancho: 4 })}
  <circle cx="290" cy="100" r="2" fill="${C.texto}" /><circle cx="290" cy="120" r="2" fill="${C.texto}" />
  <circle cx="350" cy="100" r="2" fill="${C.texto}" /><circle cx="350" cy="120" r="2" fill="${C.texto}" />
  ${texto(320, 145, 'O=O (todos apareados)', { tam: 10, color: C.sub })}
`)

// ================= estructura_quimica =================

function atomo(cx, cy, r, simbolo, color = C.texto) {
  return `${circulo(cx, cy, r, { color })}${texto(cx, cy + 4, simbolo, { tam: 12, peso: 700 })}`
}

// ---------- PC-QUI-031: ciclohexano vs ciclohexeno + Br2 ----------
function anillo(cx, cy, r, dobleEn) {
  const pts = [...Array(6)].map((_, i) => {
    const ang = (Math.PI / 3) * i - Math.PI / 2
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)]
  })
  let s = `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${C.texto}" stroke-width="2" />`
  if (dobleEn !== undefined) {
    const [x1, y1] = pts[dobleEn]
    const [x2, y2] = pts[(dobleEn + 1) % 6]
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
    const dx = (cx - mx) * 0.18, dy = (cy - my) * 0.18
    s += `<line x1="${x1 + dx}" y1="${y1 + dy}" x2="${x2 + dx}" y2="${y2 + dy}" stroke="${C.accent}" stroke-width="2" />`
  }
  return s
}
items['PC-QUI-031'] = svg('0 0 400 200', `
  ${anillo(90, 100, 45)}
  ${texto(90, 165, 'ciclohexano (sin C=C)', { tam: 11 })}

  ${anillo(260, 100, 45, 0)}
  ${texto(260, 165, 'ciclohexeno (1 doble enlace)', { tam: 11 })}
  ${linea(180, 60, 220, 60, { flecha: true, color: C.warning })}
  ${texto(200, 48, '+ Br₂', { tam: 11, color: C.warning })}
  ${texto(200, 185, 'el Br₂ se adiciona solo al doble enlace → decolora rápido', { tam: 10, color: C.warning })}
`)

// ---------- PC-QUI-033: CH4 / NH3 / H2O ángulos ----------
function centralConEnlaces(cx, cy, angulos, longitudes, etiquetas, paresLibres = 0) {
  let s = atomo(cx, cy, 14, '')
  angulos.forEach((ang, i) => {
    const rad = (ang * Math.PI) / 180
    const len = longitudes ?? 55
    const x2 = cx + len * Math.cos(rad)
    const y2 = cy + len * Math.sin(rad)
    s += linea(cx, cy, x2, y2, { ancho: 2 })
    s += atomo(x2, y2, 11, etiquetas[i], C.sub)
  })
  for (let i = 0; i < paresLibres; i++) {
    const ang = (-90 - i * 40) * (Math.PI / 180)
    s += `<circle cx="${cx + 22 * Math.cos(ang) - 5}" cy="${cy + 22 * Math.sin(ang)}" r="2.2" fill="${C.warning}" /><circle cx="${cx + 22 * Math.cos(ang) + 5}" cy="${cy + 22 * Math.sin(ang)}" r="2.2" fill="${C.warning}" />`
  }
  return s
}
items['PC-QUI-033'] = svg('0 0 420 220', `
  ${centralConEnlaces(70, 110, [-125, -55, 125, 55], 50, ['H', 'H', 'H', 'H'])}
  ${texto(70, 25, 'CH₄ · 109,5°', { peso: 700, tam: 12 })}
  ${texto(70, 195, 'tetraédrica, 0 pares libres', { tam: 10, color: C.sub })}

  ${centralConEnlaces(210, 110, [-140, -40, 90], 50, ['H', 'H', 'H'], 1)}
  ${texto(210, 25, 'NH₃ · ~107°', { peso: 700, tam: 12 })}
  ${texto(210, 195, 'piramidal, 1 par libre', { tam: 10, color: C.warning })}

  ${centralConEnlaces(350, 110, [-160, -20], 50, ['H', 'H'], 2)}
  ${texto(350, 25, 'H₂O · ~104,5°', { peso: 700, tam: 12 })}
  ${texto(350, 195, 'angular, 2 pares libres', { tam: 10, color: C.warning })}
`)

// ---------- PC-QUI-034: hibridaciones sp3/sp2/sp ----------
items['PC-QUI-034'] = svg('0 0 420 200', `
  ${centralConEnlaces(70, 100, [-125, -55, 125, 55], 45, ['H', 'H', 'H', 'H'])}
  ${texto(70, 20, 'sp³ · 109,5°', { peso: 700 })}
  ${texto(70, 175, 'ej. CH₄', { tam: 11, color: C.sub })}

  ${centralConEnlaces(210, 100, [-150, -30, 90], 45, ['C', 'H', 'H'])}
  ${texto(210, 20, 'sp² · 120°', { peso: 700 })}
  ${texto(210, 175, 'ej. C₂H₄ (eteno)', { tam: 11, color: C.sub })}

  ${centralConEnlaces(350, 100, [0, 180], 45, ['C', 'H'])}
  ${texto(350, 20, 'sp · 180°', { peso: 700 })}
  ${texto(350, 175, 'ej. C₂H₂ (etino)', { tam: 11, color: C.sub })}
`)

// ---------- PC-QUI-035: BF3 vs NF3 ----------
items['PC-QUI-035'] = svg('0 0 400 220', `
  ${centralConEnlaces(110, 110, [-150, -30, 90], 55, ['F', 'F', 'F'])}
  ${texto(110, 25, 'BF₃ · 120°', { peso: 700 })}
  ${texto(110, 195, 'trigonal plana, sin par libre en B', { tam: 10, color: C.sub })}

  ${centralConEnlaces(300, 110, [-140, -40, 90], 55, ['F', 'F', 'F'], 1)}
  ${texto(300, 25, 'NF₃ · <109,5°', { peso: 700 })}
  ${texto(300, 195, 'piramidal, 1 par libre en N', { tam: 10, color: C.warning })}
`)

// ---------- PC-QUI-036: agua, dominios vs geometría molecular ----------
items['PC-QUI-036'] = svg('0 0 400 220', `
  ${centralConEnlaces(110, 110, [-160, -20], 55, ['H', 'H'], 2)}
  ${texto(110, 25, 'Dominios de electrones', { peso: 700, tam: 12 })}
  ${texto(110, 195, 'tetraédrica (4 dominios: 2 enlaces + 2 pares libres)', { tam: 10, color: C.sub })}

  ${centralConEnlaces(300, 110, [-160, -20], 55, ['H', 'H'])}
  ${texto(300, 25, 'Geometría molecular', { peso: 700, tam: 12 })}
  ${texto(300, 195, 'angular (solo se nombran los átomos, no los pares libres)', { tam: 10, color: C.accent })}
`)

// ---------- PC-GRUPO-049: transferencia de protón NH3+HCl ----------
items['PC-GRUPO-049'] = svg('0 0 400 200', `
  ${atomo(90, 100, 16, 'N')}
  <circle cx="60" cy="80" r="9" fill="none" stroke="${C.sub}" stroke-width="2" /><text x="60" y="84" text-anchor="middle" font-size="10" fill="${C.sub}">H</text>
  <circle cx="60" cy="120" r="9" fill="none" stroke="${C.sub}" stroke-width="2" /><text x="60" y="124" text-anchor="middle" font-size="10" fill="${C.sub}">H</text>
  <circle cx="120" cy="65" r="9" fill="none" stroke="${C.sub}" stroke-width="2" /><text x="120" y="69" text-anchor="middle" font-size="10" fill="${C.sub}">H</text>
  ${texto(90, 145, 'NH₃', { tam: 12, peso: 700 })}

  ${atomo(300, 100, 14, 'Cl')}
  <circle cx="255" cy="100" r="9" fill="none" stroke="${C.sub}" stroke-width="2" /><text x="255" y="104" text-anchor="middle" font-size="10" fill="${C.sub}">H</text>
  ${linea(264, 100, 286, 100, { ancho: 2 })}
  ${texto(280, 145, 'HCl', { tam: 12, peso: 700 })}

  <path d="M255,100 Q200,60 130,80" fill="none" stroke="${C.accent}" stroke-width="2.5" marker-end="url(#flecha)" />
  ${texto(190, 55, 'H⁺ se transfiere (sin agua)', { tam: 11, color: C.accent })}
  ${texto(200, 185, 'NH₃ + HCl → NH₄Cl (sólido) — ácido/base de Brønsted-Lowry', { tam: 10, color: C.sub })}
`, { markerColor: C.accent })

// ---------- PC-GRUPO-050: [Co(NH3)6]3+ octaédrico vs CH4 ----------
items['PC-GRUPO-050'] = svg('0 0 420 220', `
  ${texto(120, 20, '[Co(NH₃)₆]³⁺ · octaédrica', { peso: 700, tam: 12 })}
  ${atomo(120, 115, 16, 'Co')}
  ${[[-90],[90],[0],[180],[45,1],[225,1]].map((a)=>{
    const ang=(a[0]*Math.PI)/180
    const len = a[1] ? 45 : 60
    const x2=120+len*Math.cos(ang), y2=115+len*Math.sin(ang)
    return `${linea(120,115,x2,y2,{ancho:2, punteada: !!a[1]})}${atomo(x2,y2,10,'N',C.sub)}`
  }).join('\n  ')}
  ${texto(120, 195, 'geometría de coordinación (metal de transición)', { tam: 10, color: C.warning })}

  ${texto(320, 20, 'CH₄ · tetraédrica', { peso: 700, tam: 12 })}
  ${centralConEnlaces(320, 115, [-125, -55, 125, 55], 45, ['H', 'H', 'H', 'H'])}
  ${texto(320, 195, 'VSEPR aplica directo (elemento representativo)', { tam: 10, color: C.exito })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
