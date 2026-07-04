import { normalizeBank } from './normalize.js'

const modules = import.meta.glob('../data/ingles/*.json', { eager: true })

const tarjetasConcepto = []
const itemsCrudos = []

for (const [rutaArchivo, modulo] of Object.entries(modules)) {
  const datos = modulo.default ?? modulo
  const destino = /\/ing-(voc|gra|cul)-/.test(rutaArchivo) ? tarjetasConcepto : itemsCrudos
  destino.push(...datos)
}

export { tarjetasConcepto }
export const preguntasIngles = normalizeBank(itemsCrudos)
