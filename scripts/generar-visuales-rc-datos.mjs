// Fase 3 de la auditoría de Razonamiento Cuantitativo (2026-09-06): agrega
// visuales NATIVOS a las tarjetas de concepto de álgebra y contexto
// aplicado que se benefician de uno. Nada de SVG dibujados a mano: solo
// `grafica_datos_estructurados` (Chart.js, ver GraficaDatos.jsx) y
// `tabla_filas` (tabla HTML nativa, ver TablaDatos.jsx), ambos temables y
// sin problemas de licencia. Cada tarjeta parchada ya describe en su prosa
// el escenario que el visual representa.
//
// Antes: álgebra 10/52 (19%), contexto 5/29 (17%) — el verificador avisa
// por debajo del 30%. Después: álgebra 18/52 (35%), contexto 9/29 (31%).
//
// Correr:  node scripts/generar-visuales-rc-datos.mjs [--dry]
import { readFileSync, writeFileSync } from 'node:fs'

const base = new URL('../src/data/razonamiento-cuantitativo/', import.meta.url)
const DRY = process.argv.includes('--dry')

// id -> campos a fusionar en la tarjeta. `visual_posicion: 'reverso'` para
// no revelar la respuesta de un cloze/pregunta antes de tiempo.
const PATCH = {
  // ---- álgebra: gráficas ----
  'RC-ALG-052': {
    tipo_visual: 'grafica_datos',
    visual_posicion: 'reverso',
    grafica_datos_estructurados: {
      tipoGrafico: 'lineas',
      ejeX: 'Años',
      ejeY: 'Habitantes',
      series: [
        { nombre: 'Ciudad A (+5.000 por año)', datos: [0, 5, 10, 15, 20, 25, 30].map((y) => ({ x: y, y: 100000 + 5000 * y })) },
        { nombre: 'Ciudad B (+5% por año)', datos: [0, 5, 10, 15, 20, 25, 30].map((y) => ({ x: y, y: Math.round(100000 * 1.05 ** y) })) },
      ],
    },
  },
  // ---- contexto aplicado: gráfica ----
  'RC-CTX-006': {
    tipo_visual: 'grafica_datos',
    visual_posicion: 'reverso',
    grafica_datos_estructurados: {
      tipoGrafico: 'lineas',
      ejeX: 'Años',
      ejeY: 'Monto ($)',
      series: [
        { nombre: 'Interés simple', datos: Array.from({ length: 11 }, (_, t) => ({ x: t, y: Math.round(5000000 * (1 + 0.06 * t)) })) },
        { nombre: 'Interés compuesto', datos: Array.from({ length: 11 }, (_, t) => ({ x: t, y: Math.round(5000000 * 1.06 ** t) })) },
      ],
    },
  },
  // ---- álgebra: tablas ----
  'RC-ALG-007': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['Fracción', 'Producto cruzado', '¿Mayor?'],
      filas: [
        ['5/8', '5 × 11 = 55', ''],
        ['7/11', '7 × 8 = 56', 'sí, 56 > 55'],
      ],
    },
  },
  'RC-ALG-023': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['Tramo', 'Distancia', 'Tiempo', 'Velocidad'],
      filas: [
        ['1', '5 km', '20 min', '15 km/h'],
        ['2', '5 km', '30 min', '10 km/h'],
        ['Total', '10 km', '50 min', '12 km/h'],
      ],
    },
  },
  'RC-ALG-042': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['Forma de describir el cambio de 20% a 25%', 'Cálculo', 'Resultado'],
      filas: [
        ['Puntos porcentuales', '25 − 20', '5 puntos'],
        ['Cambio relativo', '5 ÷ 20', '25%'],
      ],
    },
  },
  'RC-ALG-045': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['Paso', 'Cálculo', 'Precio'],
      filas: [
        ['Inicial', '', '$100'],
        ['Descuento 10%', '100 × 0,90', '$90'],
        ['Descuento 5% sobre $90', '90 × 0,95', '$85,50'],
        ['Un solo descuento del 15%', '100 × 0,85', '$85'],
      ],
    },
  },
  'RC-ALG-048': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['Pareja', 'Suma'],
      filas: [
        ['1 + 100', '101'],
        ['2 + 99', '101'],
        ['3 + 98', '101'],
        ['…', '…'],
        ['50 + 51', '101'],
        ['50 parejas × 101', '5.050'],
      ],
    },
  },
  'RC-ALG-049': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['', 'Progresión aritmética', 'Progresión geométrica'],
      filas: [
        ['Cada término', 'suma una diferencia d constante', 'multiplica por una razón r constante'],
        ['Término n', 'a₁ + (n − 1) · d', 'a₁ · r elevado a (n − 1)'],
        ['Ejemplo', '2, 5, 8, 11, 14, …', '2, 6, 18, 54, 162, …'],
      ],
    },
  },
  'RC-ALG-051': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['Secuencia', 'Resta de términos', 'División de términos', 'Tipo'],
      filas: [
        ['4, 8, 12, 16', '+4 constante', 'no constante', 'aritmética'],
        ['3, 6, 12, 24', 'no constante', '× 2 constante', 'geométrica'],
      ],
    },
  },
  // ---- contexto aplicado: tablas ----
  'RC-CTX-003': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['Año', 'Cambio', 'Salario'],
      filas: [
        ['Inicial', '', '$2.000.000'],
        ['1', '+10%', '$2.200.000'],
        ['2', '−5%', '$2.090.000'],
        ['3', '+8%', '$2.257.200'],
      ],
    },
  },
  'RC-CTX-013': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['Mes', 'Ventas de helado', 'Ahogamientos', 'Temperatura'],
      filas: [
        ['Enero', 'Bajas', 'Pocos', 'Fría'],
        ['Julio', 'Altas', 'Muchos', 'Calurosa'],
      ],
    },
  },
  'RC-CTX-028': {
    tipo_visual: 'tabla',
    visual_posicion: 'reverso',
    tabla_filas: {
      columnas: ['', 'Sin el alimento', 'Con el alimento'],
      filas: [
        ['Riesgo absoluto', '1 en 50.000 (0,002%)', '2 en 50.000 (0,004%)'],
        ['Riesgo relativo', 'referencia', 'el doble'],
      ],
    },
  },
}

// Referencia a la figura en la prosa de la tarjeta (se añade al final del
// campo indicado si aún no está). "never add one 'por colocar'".
const REFERENCIA = {
  'RC-ALG-052': ['regla', ' La gráfica muestra cómo la ciudad B, que al principio va pareja, termina despegándose de la A.'],
  'RC-CTX-006': ['regla', ' En la gráfica, las dos curvas arrancan juntas y la del interés compuesto se va separando cada año.'],
  'RC-ALG-007': ['regla', ' La tabla compara los dos productos cruzados: 55 frente a 56.'],
  'RC-ALG-023': ['regla', ' La tabla separa los dos tramos y la fila Total trae el cálculo correcto.'],
  'RC-ALG-042': ['regla', ' La tabla contrasta las dos formas de describir el mismo cambio.'],
  'RC-ALG-045': ['regla', ' La tabla compara los dos descuentos sucesivos, $85,50, con un único descuento del 15%, $85.'],
  'RC-ALG-048': ['regla', ' La tabla muestra el emparejamiento: 50 parejas que suman 101.'],
  'RC-ALG-049': ['regla', ' La tabla pone lado a lado la progresión aritmética y la geométrica.'],
  'RC-ALG-051': ['regla', ' La tabla muestra la prueba rápida: resta constante o división constante.'],
  'RC-CTX-003': ['regla', ' La tabla sigue el salario año por año; sumar 10 − 5 + 8 = 13% daría $2.260.000, no $2.257.200.'],
  'RC-CTX-013': ['regla', ' La columna de temperatura de la tabla es la variable de confusión que explica las otras dos.'],
  'RC-CTX-028': ['regla', ' La tabla muestra que "el doble" lleva el riesgo de 0,002% a 0,004%.'],
}

const ARCHIVOS = { 'RC-ALG': 'rc_conceptos_algebra_calculo', 'RC-CTX': 'rc_conceptos_contexto_aplicado' }

const porArchivo = {}
for (const id of Object.keys(PATCH)) {
  ;(porArchivo[ARCHIVOS[id.slice(0, 6)]] ??= []).push(id)
}

let hechos = 0
for (const [archivo, ids] of Object.entries(porArchivo)) {
  const ruta = new URL(`${archivo}.json`, base)
  const arr = JSON.parse(readFileSync(ruta, 'utf8'))
  const encontrados = new Set()
  for (const c of arr) {
    if (!PATCH[c.id]) continue
    encontrados.add(c.id)
    const yaTenia = ['grafica_datos_estructurados', 'tabla_filas', 'imagen'].some((k) => c[k] !== undefined)
    if (yaTenia) {
      console.log(`SALTA ${c.id}: ya tiene un canal de datos, no se toca`)
      continue
    }
    Object.assign(c, PATCH[c.id])
    const ref = REFERENCIA[c.id]
    if (ref) {
      const [campo, texto] = ref
      if (typeof c[campo] === 'string' && !c[campo].includes(texto.trim().slice(0, 24))) c[campo] = c[campo].trimEnd() + texto
    }
    hechos++
    console.log(`${c.id}  ${c.tipo_visual.padEnd(13)} ${c.visual_posicion}`)
  }
  for (const id of ids) if (!encontrados.has(id)) console.log(`AVISO: ${id} no está en ${archivo}`)
  if (!DRY) writeFileSync(ruta, JSON.stringify(arr, null, 2) + '\n')
}
console.log(`\n${hechos}/${Object.keys(PATCH).length} tarjetas con visual nativo${DRY ? '  (dry run)' : ' — escrito'}`)
