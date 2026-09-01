// Genera a mano (sin librerías) los SVG de diagrama_esquematico del módulo
// Habilidades de Laboratorio. Mismos principios que generar-visuales-pc.mjs:
// colores en var(--...) para que VisualSvg.jsx los pinte con el tema activo,
// viewBox pensado para renderizar a ~420 px de ancho (ver VisualSvg.css).
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DIR_SALIDA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/assets/visuals/habilidades-laboratorio',
)
mkdirSync(DIR_SALIDA, { recursive: true })

const C = {
  texto: 'var(--text)',
  sub: 'var(--text-sub)',
  faint: 'var(--text-faint)',
  accent: 'var(--accent)', // "duro" en las matrices HSAB
  exito: 'var(--exito)', // "frontera"
  warning: 'var(--warning)', // "blando"
  borde: 'var(--border)',
  sup: 'var(--surface-alt)',
}

function svg(viewBox, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
  <defs>
    <marker id="hl-flecha" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 Z" fill="${C.sub}" />
    </marker>
    <marker id="hl-flecha-ac" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 Z" fill="${C.accent}" />
    </marker>
  </defs>
${body}
</svg>`
}

function t(x, y, s, { color = C.texto, tam = 12, peso = 500, anchor = 'middle' } = {}) {
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${tam}" font-weight="${peso}" text-anchor="${anchor}">${s}</text>`
}

function caja(x, y, w, h, { color = C.borde, relleno = 'none', rx = 7, ancho = 1.6, dash = false } = {}) {
  const d = dash ? ' stroke-dasharray="4,4"' : ''
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${relleno}" stroke="${color}" stroke-width="${ancho}"${d} />`
}

function flecha(x1, y1, x2, y2, { color = 'sub', ancho = 1.8, dash = false } = {}) {
  const marker = color === 'accent' ? 'hl-flecha-ac' : 'hl-flecha'
  const stroke = color === 'accent' ? C.accent : C.sub
  const d = dash ? ' stroke-dasharray="5,4"' : ''
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${ancho}" stroke-linecap="round"${d} marker-end="url(#${marker})" />`
}

const items = {}

/* ------------------------------------------------------------------ *
 * HL-LLE-012 — Selectividad HSAB: el átomo donador del extractante   *
 * y el metal objetivo tienen que coincidir en dureza/blandura.      *
 * ------------------------------------------------------------------ */
{
  const fila = (y, ext, don, metal, tipo, col) => `
    <rect x="12" y="${y}" width="196" height="36" rx="6" fill="none" stroke="${col}" stroke-width="1.6" />
    ${t(21, y + 15, ext, { anchor: 'start', tam: 10.5, peso: 700 })}
    ${t(21, y + 29, 'donador ' + don, { anchor: 'start', tam: 9, color: C.sub })}
    <line x1="216" y1="${y + 18}" x2="252" y2="${y + 18}" stroke="${col}" stroke-width="2.2" marker-end="url(#hl-flecha)" />
    <circle cx="234" cy="${y + 18}" r="3.5" fill="${col}" />
    <rect x="260" y="${y}" width="168" height="36" rx="6" fill="none" stroke="${col}" stroke-width="1.6" />
    ${t(269, y + 15, metal, { anchor: 'start', tam: 10.5, peso: 700 })}
    ${t(269, y + 29, tipo, { anchor: 'start', tam: 9, color: C.sub })}`
  items['HL-LLE-012'] = svg('0 0 440 214', `
  ${t(220, 20, 'HSAB: el átomo donador y el metal coinciden en dureza', { tam: 11, peso: 700 })}
  ${t(120, 34, 'extractante', { tam: 9, color: C.faint })}
  ${t(344, 34, 'metal que extrae bien', { tam: 9, color: C.faint })}
  ${fila(42, 'Fosfato de tributilo', 'O fosforilo · duro', 'UO₂²⁺ · Th⁴⁺ · Ln³⁺', 'duros · baja polarizabilidad', C.accent)}
  ${fila(88, 'Ditizona', 'N, S · blando', 'Hg²⁺ · Ag⁺ · Pb²⁺', 'blandos · muy polarizables', C.warning)}
  ${fila(134, 'Oximas (LIX)', 'O, N · frontera', 'Cu²⁺', 'frontera duro–blando', C.exito)}
  ${t(220, 188, 'Duro con duro, blando con blando: la selectividad se predice,', { tam: 9, color: C.faint })}
  ${t(220, 201, 'no se memoriza reactivo por reactivo.', { tam: 9, color: C.faint })}
  `)
}

/* ------------------------------------------------------------------ *
 * HL-LLE-021 — Escalera de lavados en el ORDEN correcto:            *
 * agua/HCl para bases, NaHCO₃ (débil) antes de NaOH (fuerte)        *
 * para separar el ácido carboxílico del fenol.                     *
 * ------------------------------------------------------------------ */
{
  const paso = (y, reactivo, sacaTxt, recuperaTxt) => `
    ${flecha(150, y - 8, 150, y + 12)}
    ${t(158, y + 6, 'lavar con ' + reactivo, { anchor: 'start', tam: 10, peso: 600, color: C.accent })}
    <rect x="14" y="${y + 16}" width="150" height="40" rx="6" fill="none" stroke="${C.accent}" stroke-width="1.6" />
    ${t(22, y + 32, 'fase acuosa', { anchor: 'start', tam: 10, peso: 700 })}
    ${t(22, y + 47, sacaTxt, { anchor: 'start', tam: 9, color: C.sub })}
    ${flecha(166, y + 36, 210, y + 36, { color: 'accent' })}
    ${t(216, y + 33, 'acidificar →', { anchor: 'start', tam: 9, color: C.sub })}
    ${t(216, y + 45, recuperaTxt, { anchor: 'start', tam: 9.5, peso: 700, color: C.accent })}`
  items['HL-LLE-021'] = svg('0 0 440 330', `
  ${caja(60, 12, 200, 40, { color: C.texto })}
  ${t(160, 28, 'Fase orgánica (éter)', { tam: 10.5, peso: 700 })}
  ${t(160, 43, 'amina · ácido carboxílico · fenol · neutro', { tam: 9, color: C.sub })}
  ${paso(66, 'HCl diluido', 'amina protonada (sal)', 'amina')}
  ${paso(140, 'NaHCO₃ (base débil)', 'solo el carboxilato', 'ácido carboxílico')}
  ${paso(214, 'NaOH (base fuerte)', 'fenolato', 'fenol')}
  ${flecha(150, 278, 150, 296)}
  ${caja(60, 300, 200, 26, { color: C.texto })}
  ${t(160, 317, 'orgánico → evaporar → compuesto neutro', { tam: 9.5, peso: 600 })}
  `)
}

/* ------------------------------------------------------------------ *
 * HL-LLE-026 — Emulsión = atrapamiento cinético. El reparto ya      *
 * ocurrió; falta que las gotitas coalescan.                        *
 * ------------------------------------------------------------------ */
{
  const vialBox = (x) => `<rect x="${x}" y="26" width="98" height="116" rx="8" fill="${C.sup}" stroke="${C.borde}" stroke-width="1.6" />`
  const gotas = (x, pares) =>
    pares
      .map(([cx, cy, r]) => `<circle cx="${x + cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.accent}" stroke-width="1.6" />`)
      .join('\n    ')
  items['HL-LLE-026'] = svg('0 0 440 196', `
  ${vialBox(18)}
  ${gotas(18, [[26, 46, 7], [62, 42, 5], [42, 68, 9], [72, 74, 6], [30, 98, 6], [60, 106, 8], [78, 120, 5], [36, 128, 7]])}
  ${t(67, 158, 'emulsión', { tam: 10, peso: 700 })}
  ${t(67, 170, 'gotitas finas estabilizadas', { tam: 8.5, color: C.sub })}
  ${flecha(120, 84, 166, 84)}
  ${t(143, 77, 'coalescen', { tam: 8.5, color: C.faint })}

  ${vialBox(170)}
  ${gotas(170, [[36, 54, 14], [68, 62, 11], [46, 102, 16], [72, 118, 10]])}
  ${t(219, 158, 'gotas más grandes', { tam: 10, peso: 700 })}
  ${t(219, 170, 'y menos numerosas', { tam: 8.5, color: C.sub })}
  ${flecha(272, 84, 318, 84)}
  ${t(295, 77, 'separan', { tam: 8.5, color: C.faint })}

  <rect x="322" y="26" width="98" height="116" rx="8" fill="${C.sup}" stroke="${C.borde}" stroke-width="1.6" />
  <rect x="323" y="27" width="96" height="62" fill="${C.accent}" opacity="0.12" />
  <rect x="323" y="91" width="96" height="50" fill="${C.warning}" opacity="0.14" />
  <path d="M322 90 h98" stroke="${C.sub}" stroke-width="1.4" />
  ${t(371, 158, 'dos capas limpias', { tam: 10, peso: 700 })}
  ${t(371, 170, 'el reparto ya estaba hecho', { tam: 8.5, color: C.sub })}

  ${t(220, 189, 'Reposo, salmuera o centrífuga solo aceleran la coalescencia: es cinética, no termodinámica.', { tam: 8.5, color: C.faint })}
  `)
}

/* ------------------------------------------------------------------ *
 * HL-LLE-029 — Soxhlet: ciclo vaporización → condensación →          *
 * goteo sobre el sólido → sifón de vuelta al balón.                 *
 * ------------------------------------------------------------------ */
// Nota: HL-LLE-029 (Soxhlet) usa una imagen raster provista por el usuario
// (src/assets/raster/habilidades-laboratorio/hl-lle-029-soxhlet.jpg) en vez
// de un SVG dibujado a mano — el diagrama etiquetado es más claro que las
// iteraciones a mano. Rótulos en inglés en la fuente.

let ok = 0
for (const [id, contenido] of Object.entries(items)) {
  writeFileSync(path.join(DIR_SALIDA, `${id}.svg`), contenido, 'utf8')
  ok++
}
console.log(`Generados ${ok} SVGs en ${DIR_SALIDA}`)
