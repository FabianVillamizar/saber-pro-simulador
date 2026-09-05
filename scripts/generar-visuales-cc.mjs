// Genera a mano (sin librerías de gráficas) los SVG de diagrama_esquematico
// de Competencias Ciudadanas: estructuras institucionales, no datos
// cuantitativos, así que no aplica un Chart.js nativo (ver
// Rubrica_Imagenes_Diosgenina.md — SVG a mano es la opción correcta cuando
// lo que hay que mostrar es una forma/jerarquía, no una serie de datos ni
// un objeto fotografiable). Los colores usan var(--...) literal para que,
// al inyectarse inline en el DOM (ver VisualSvg.jsx), se pinten con el tema
// activo de la app. Mismo patrón que scripts/generar-visuales-rc-contexto.mjs.
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR_SALIDA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/assets/visuals/competencias-ciudadanas')
mkdirSync(DIR_SALIDA, { recursive: true })

const C = {
  texto: 'var(--text)',
  sub: 'var(--text-sub)',
  faint: 'var(--text-faint)',
  accent: 'var(--cc-accent)',
  exito: 'var(--exito)',
  warning: 'var(--warning)',
  borde: 'var(--border)',
  surface: 'var(--surface-alt)',
}

function svg(viewBox, body, { markerColor = C.accent } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <defs>
    <marker id="flecha-cc" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="${markerColor}" />
    </marker>
  </defs>
${body}
</svg>`
}

function linea(x1, y1, x2, y2, { color = C.texto, ancho = 2, punteada = false, flecha = false } = {}) {
  const dash = punteada ? ' stroke-dasharray="5,5"' : ''
  const marker = flecha ? ' marker-end="url(#flecha-cc)"' : ''
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round"${dash}${marker} />`
}

function curva(x1, y1, x2, y2, cx, cy, { color = C.accent, ancho = 1.6, flecha = true } = {}) {
  const marker = flecha ? ' marker-end="url(#flecha-cc)"' : ''
  return `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="${ancho}"${marker} />`
}

function texto(x, y, contenido, { color = C.texto, tam = 12, peso = 500, anchor = 'middle', estilo = 'normal' } = {}) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${tam}" font-weight="${peso}" text-anchor="${anchor}" font-style="${estilo}">${contenido}</text>`
}

function rect(x, y, w, h, { rx = 10, relleno = 'none', color = C.texto, ancho = 2, dash = false } = {}) {
  const dasharray = dash ? ' stroke-dasharray="4,4"' : ''
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${dasharray} />`
}

const items = {}

// ---------- CC-CON-009: organigrama de las 3 ramas + controles recíprocos ----------
// Tres cajas al mismo nivel (ninguna rama subordina a otra, ver
// CC-R-equilibrio-poderes), unidas abajo a una caja punteada de "órganos
// autónomos" (art. 113), y tres flechas curvas rotuladas con un control
// recíproco concreto tomado de la propia explicación de la tarjeta.
items['CC-CON-009'] = svg('0 0 520 400', `
  ${texto(260, 26, 'Estado colombiano', { peso: 800, tam: 16 })}
  ${texto(260, 44, 'ramas del poder público', { tam: 12, color: C.sub })}

  ${rect(20, 64, 150, 74, { relleno: C.surface, color: C.texto })}
  ${texto(95, 92, 'Rama Ejecutiva', { peso: 700, tam: 13 })}
  ${texto(95, 111, 'Presidente,', { tam: 11, color: C.sub })}
  ${texto(95, 125, 'ministerios', { tam: 11, color: C.sub })}

  ${rect(185, 64, 150, 74, { relleno: C.surface, color: C.texto })}
  ${texto(260, 92, 'Rama Legislativa', { peso: 700, tam: 13 })}
  ${texto(260, 111, 'Senado,', { tam: 11, color: C.sub })}
  ${texto(260, 125, 'Cámara', { tam: 11, color: C.sub })}

  ${rect(350, 64, 150, 74, { relleno: C.surface, color: C.texto })}
  ${texto(425, 92, 'Rama Judicial', { peso: 700, tam: 13 })}
  ${texto(425, 111, 'Cortes,', { tam: 11, color: C.sub })}
  ${texto(425, 125, 'jurisdicciones', { tam: 11, color: C.sub })}

  ${curva(260, 138, 165, 138, 212, 168, { flecha: true })}
  ${texto(212, 190, 'cita a ministros', { tam: 12, color: C.accent, peso: 600 })}
  ${texto(212, 206, 'control político', { tam: 10, color: C.faint, estilo: 'italic' })}

  ${curva(425, 138, 320, 138, 372, 168, { flecha: true })}
  ${texto(372, 190, 'revisa sus decretos', { tam: 12, color: C.accent, peso: 600 })}
  ${texto(372, 206, 'de constitucionalidad', { tam: 10, color: C.faint, estilo: 'italic' })}

  ${curva(95, 138, 185, 220, 70, 235, { flecha: true })}
  ${texto(115, 258, 'puede objetar', { tam: 12, color: C.accent, peso: 600 })}
  ${texto(115, 274, 'un proyecto de ley', { tam: 10, color: C.faint, estilo: 'italic' })}

  ${linea(95, 138, 95, 300, { color: C.borde })}
  ${linea(260, 138, 260, 300, { color: C.borde })}
  ${linea(425, 138, 425, 300, { color: C.borde })}
  ${linea(95, 300, 425, 300, { color: C.borde })}
  ${linea(260, 300, 260, 320, { color: C.borde })}

  ${rect(140, 320, 240, 62, { relleno: 'none', color: C.faint, dash: true })}
  ${texto(260, 345, 'Órganos autónomos', { tam: 12, peso: 600, color: C.sub })}
  ${texto(260, 361, 'e independientes (art. 113)', { tam: 12, peso: 600, color: C.sub })}
  ${texto(260, 376, 'Ministerio Público, Contraloría', { tam: 10, color: C.faint })}

  ${texto(260, 393, 'separación + colaboración armónica + controles recíprocos', { tam: 10.5, color: C.faint, estilo: 'italic' })}
`)

// ---------- CC-CON-058: pirámide de jerarquía normativa ----------
// Trapecio de 3 niveles apilados, de más angosto (arriba, más autoridad) a
// más ancho (abajo). Nivel superior incluye el bloque de constitucionalidad
// como aclaración, no como nivel propio, para no sobrecargar la figura.
function nivelTrapecio(yTop, yBot, xTopIn, xTopOut, xBotIn, xBotOut, relleno) {
  return `<path d="M${xTopIn},${yTop} L${xTopOut},${yTop} L${xBotOut},${yBot} L${xBotIn},${yBot} Z" fill="${relleno}" stroke="${C.texto}" stroke-width="1.5" />`
}
items['CC-CON-058'] = svg('0 0 480 360', `
  ${texto(240, 26, 'Jerarquía normativa colombiana', { peso: 800, tam: 15 })}

  ${nivelTrapecio(50, 130, 195, 285, 130, 350, 'color-mix(in oklch, var(--cc-accent) 55%, transparent)')}
  ${texto(240, 84, 'Constitución', { peso: 700, tam: 14, color: C.texto })}
  ${texto(240, 103, '+ bloque de constitucionalidad', { tam: 11, color: C.texto })}

  ${nivelTrapecio(130, 224, 130, 350, 65, 415, 'color-mix(in oklch, var(--cc-accent) 30%, transparent)')}
  ${texto(240, 168, 'Leyes', { peso: 700, tam: 14 })}
  ${texto(240, 187, 'estatutaria · orgánica · ordinaria', { tam: 11, color: C.sub })}
  ${texto(240, 204, 'mayor a menor exigencia de trámite', { tam: 10, color: C.faint })}

  ${nivelTrapecio(224, 298, 65, 415, 25, 455, 'color-mix(in oklch, var(--cc-accent) 12%, transparent)')}
  ${texto(240, 252, 'Decretos reglamentarios', { peso: 700, tam: 14 })}
  ${texto(240, 271, 'expedidos por el Presidente', { tam: 11, color: C.sub })}
  ${texto(240, 287, 'para precisar cómo se aplica una ley', { tam: 10, color: C.faint })}

  ${texto(240, 328, 'una norma inferior no puede contradecir', { tam: 11, color: C.faint, estilo: 'italic' })}
  ${texto(240, 344, 'a ninguna de las superiores', { tam: 11, color: C.faint, estilo: 'italic' })}
`)

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
