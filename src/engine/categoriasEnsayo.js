// Categorías de anotación de los ensayos modelo de Comunicación Escrita
// (ver Downloads/Modulos/COMUNICACION ESCRITA/Ensayos Modelo.dc.html) y la
// postura que puede tomar un ensayo. Los colores se generan por hue en vez
// de estar fijos, igual que el resto del sistema de diseño (color-mix
// sobre --accent) — aquí no hay un token CSS por categoría porque son 5
// categorías + 3 posturas, así que se calculan con la misma fórmula oklch
// que usó el mockup original.
export const CATEGORIAS_ENSAYO = {
  conector: { label: 'Conector', hue: 250 },
  vocabulario_clave: { label: 'Vocabulario clave', hue: 300 },
  estructura: { label: 'Estructura', hue: 150 },
  recurso_estilistico: { label: 'Recurso estilístico', hue: 55 },
  contraargumento_reconocido: { label: 'Contraargumento reconocido', hue: 20 },
}

export const POSTURAS_ENSAYO = {
  a_favor: { label: 'A favor', hue: 150 },
  en_contra: { label: 'En contra', hue: 20 },
  termino_medio: { label: 'Término medio', hue: 250 },
}

export function colorPorHue(hue, dark) {
  return dark ? `oklch(76% 0.13 ${hue})` : `oklch(48% 0.16 ${hue})`
}

// Parte un ensayo modelo en párrafos y cada párrafo en una lista de
// tokens (texto plano u "objetivo de anotación"), buscando cada
// `anotacion.fragmento` dentro del párrafo por coincidencia literal de
// texto — igual que el prototipo original. Devuelve datos puros (sin
// handlers de React) para que el componente decida cómo pintar/interactuar
// con cada token.
export function tokenizarParrafos(texto, anotaciones) {
  let globalId = 0
  return texto.split('\n\n').map((paraText) => {
    const matches = []
    anotaciones.forEach((a) => {
      const idx = paraText.indexOf(a.fragmento)
      if (idx !== -1) matches.push({ ...a, idx })
    })
    matches.sort((a, b) => a.idx - b.idx)

    const tokens = []
    let cursor = 0
    matches.forEach((m) => {
      if (m.idx > cursor) tokens.push({ id: null, texto: paraText.slice(cursor, m.idx) })
      tokens.push({ id: globalId++, texto: m.fragmento, categoria: m.categoria, nota: m.nota })
      cursor = m.idx + m.fragmento.length
    })
    if (cursor < paraText.length) tokens.push({ id: null, texto: paraText.slice(cursor) })
    return tokens
  })
}
