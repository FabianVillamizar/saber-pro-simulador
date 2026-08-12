// Nombres legibles de los 33 bloques reales de Razonamiento Cuantitativo,
// repartidos en 4 núcleos (`contenido` en el dato fuente, ver `nucleos` en
// indiceModulos.js). El dato fuente solo trae la clave MAYUSCULA-CON-GUIONES
// (ej. `FRACCIONES-PORCENTAJES`) — igual que `NOMBRES_BLOQUE` de
// Competencias Ciudadanas, pero en mayúsculas porque así llegaron los
// datos de RC (ver bitácora, "Auditoría de cobertura de temas — RC").
export const NOMBRES_BLOQUE = {
  // álgebra y cálculo (9)
  'FRACCIONES-PORCENTAJES': 'Fracciones y porcentajes',
  'NOTACION-CIENTIFICA': 'Notación científica',
  'RELACIONES-LINEALES': 'Relaciones lineales',
  'RAZON-CAMBIO': 'Razón de cambio',
  'REPARTO-PROPORCIONAL': 'Reparto proporcional',
  'OPTIMIZACION-RAZON': 'Optimización de razón',
  'CONVERSION-UNIDADES': 'Conversión de unidades',
  'PORCENTAJE-AVANZADO': 'Porcentaje avanzado',
  'SUCESIONES-SERIES': 'Sucesiones y series',

  // contexto aplicado (8)
  'VARIACIONES-SUCESIVAS': 'Variaciones sucesivas',
  'INTERES-SIMPLE-COMPUESTO': 'Interés simple y compuesto',
  'PROMEDIO-DE-PROMEDIOS': 'Promedio de promedios',
  'CORRELACION-CAUSALIDAD': 'Correlación y causalidad',
  'ESCALAS-ENGANOSAS': 'Escalas engañosas',
  'PROPORCIONALIDAD-DIRECTA-INVERSA': 'Proporcionalidad directa e inversa',
  'NOTACION-NUEVA-EN-PROBLEMA': 'Notación nueva en el problema',
  'RIESGO-RELATIVO-ABSOLUTO': 'Riesgo relativo vs. absoluto',

  // estadística (8)
  'REP-DATOS': 'Representación de datos',
  'CONJUNTOS': 'Conjuntos',
  'CONTEO': 'Conteo',
  'PROBABILIDAD': 'Probabilidad',
  'PROMEDIO-RANGO': 'Promedio y rango',
  'MUESTREO': 'Muestreo',
  'LECTURA-TABLA': 'Lectura de tabla',
  'EXTRAPOLACION': 'Extrapolación',

  // geometría (8)
  'TRIANGULOS-POLIGONOS': 'Triángulos y polígonos',
  'SOLIDOS': 'Sólidos',
  'PARALELISMO-ORTOGONALIDAD': 'Paralelismo y ortogonalidad',
  'DESIGUALDAD-TRIANGULAR': 'Desigualdad triangular',
  'COORDENADAS-CARTESIANAS': 'Coordenadas cartesianas',
  'SUFICIENCIA-DATOS': 'Suficiencia de datos',
  'ROTACION-ORIENTACION': 'Rotación y orientación',
  'ESPIRAL-RAICES': 'Espiral de raíces',
}

export const DESCRIPCION_NUCLEO = {
  algebra_calculo:
    'Puro cálculo y manipulación de fórmulas. Ningún bloque pasa de 7 tarjetas, pero casi todo cuelga de fracciones y porcentajes en la base: es el núcleo con el andamiaje más apretado de los cuatro.',
  contexto_aplicado:
    'Aquí no hay ecuación que aplicar: el ejercicio se gana leyendo. Solo 6 de 29 tarjetas traen fórmula, y apenas 1 es de dificultad baja — no existe rampa de entrada y la interfaz no finge una.',
  estadistica:
    'El núcleo más balanceado del módulo: ocho bloques de exactamente cinco tarjetas cada uno y la única distribución con una rampa de entrada real.',
  geometria:
    'Razonamiento espacial con bloques de tamaños desiguales: desde cinco tarjetas de triángulos, polígonos y sólidos hasta dos de desigualdad triangular y espiral de raíces, su incorporación más reciente.',
}

export const FIRMA_LABEL_NUCLEO = {
  algebra_calculo: '9 bloques encadenados · aplicar la fórmula correcta',
  contexto_aplicado: 'Sin fórmula fija · detectar la trampa',
  estadistica: '8 bloques de 5 · perfectamente parejo',
  geometria: '8 bloques desiguales · razonamiento espacial',
}

// Orden de lectura de los bloques dentro de cada núcleo — no es el orden
// del dato fuente (que es el de creación), sino una curación que agrupa
// cada bloque cerca de aquel del que depende (ver `dependenciasCruzadas`
// más abajo: los únicos cruces reales entre bloques del mismo núcleo,
// verificados con script contra `prereqs`, no adivinados como hacía el
// mockup). Los bloques sin dependencia cruzada se intercalan donde mejor
// se lee, no al final.
export const ORDEN_BLOQUES = {
  algebra_calculo: [
    'FRACCIONES-PORCENTAJES',
    'NOTACION-CIENTIFICA',
    'CONVERSION-UNIDADES',
    'RELACIONES-LINEALES',
    'RAZON-CAMBIO',
    'OPTIMIZACION-RAZON',
    'REPARTO-PROPORCIONAL',
    'PORCENTAJE-AVANZADO',
    'SUCESIONES-SERIES',
  ],
  contexto_aplicado: [
    'VARIACIONES-SUCESIVAS',
    'INTERES-SIMPLE-COMPUESTO',
    'CORRELACION-CAUSALIDAD',
    'ESCALAS-ENGANOSAS',
    'PROMEDIO-DE-PROMEDIOS',
    'PROPORCIONALIDAD-DIRECTA-INVERSA',
    'NOTACION-NUEVA-EN-PROBLEMA',
    'RIESGO-RELATIVO-ABSOLUTO',
  ],
  estadistica: ['REP-DATOS', 'LECTURA-TABLA', 'PROMEDIO-RANGO', 'CONJUNTOS', 'CONTEO', 'PROBABILIDAD', 'MUESTREO', 'EXTRAPOLACION'],
  geometria: [
    'TRIANGULOS-POLIGONOS',
    'SOLIDOS',
    'ROTACION-ORIENTACION',
    'PARALELISMO-ORTOGONALIDAD',
    'COORDENADAS-CARTESIANAS',
    'SUFICIENCIA-DATOS',
    'DESIGUALDAD-TRIANGULAR',
    'ESPIRAL-RAICES',
  ],
}

// Una fórmula representativa por bloque de álgebra y cálculo (el único
// núcleo cuyo layout de detalle — "cadena" — muestra una fórmula por
// fila). Tomadas literalmente de `formula_latex` de una tarjeta real de
// ese bloque (recortadas cuando el original incluye una nota aparte, ej.
// `CONVERSION-UNIDADES`, nunca inventadas), renderizadas con el mismo
// componente `Formula` (KaTeX) que ya usa Pensamiento Científico — el
// mockup las mostraba como texto plano porque su fórmula era decorativa,
// pero el dato real es LaTeX de verdad. `REPARTO-PROPORCIONAL` no tiene
// ninguna tarjeta con fórmula fija, así que queda sin entrada.
export const FORMULA_BLOQUE = {
  'FRACCIONES-PORCENTAJES': '\\%\\ de\\ C = C \\times \\dfrac{X}{100}',
  'NOTACION-CIENTIFICA': 'a \\times 10^{n}',
  'RELACIONES-LINEALES': 'y = mx + b',
  'RAZON-CAMBIO': 'v = \\dfrac{d}{t}',
  'OPTIMIZACION-RAZON': '\\text{costo por unidad} = \\dfrac{\\text{costo total}}{\\text{cantidad de unidades}}',
  'CONVERSION-UNIDADES': '\\dfrac{\\text{unidad nueva}}{\\text{unidad original}}',
  'PORCENTAJE-AVANZADO': '\\%\\ cambio = \\dfrac{\\text{nuevo} - \\text{viejo}}{\\text{viejo}} \\times 100',
  'SUCESIONES-SERIES': 'a_n = a_1 + (n-1)d',
}

// La trampa que enseña cada uno de los 8 bloques de contexto aplicado —
// una frase por bloque, parafraseada del `error_comun` real de sus
// tarjetas (no inventada): ver bitácora / los propios JSON fuente para el
// texto completo de cada `error_comun`.
export const TRAMPA_BLOQUE = {
  'VARIACIONES-SUCESIVAS': 'Se suman los porcentajes de cambios sucesivos (10% + 5%) en vez de encadenarlos multiplicando.',
  'INTERES-SIMPLE-COMPUESTO': 'Se aplica la fórmula de interés simple a una situación compuesta, o al revés, sin verificar cuál corresponde.',
  'PROMEDIO-DE-PROMEDIOS': 'Se promedian los promedios de varios grupos sin pesar por su tamaño, como si 5 personas contaran igual que 500.',
  'CORRELACION-CAUSALIDAD': 'Dos variables suben juntas y se concluye que una causa la otra, sin descartar una tercera variable.',
  'ESCALAS-ENGANOSAS': 'El eje truncado exagera visualmente una diferencia que es mínima en la escala real.',
  'PROPORCIONALIDAD-DIRECTA-INVERSA': 'Se asume que todo escala proporcionalmente cuando en realidad hay una cantidad fija que no cambia.',
  'NOTACION-NUEVA-EN-PROBLEMA': 'Se trata un símbolo definido en el propio problema como si fuera una operación estándar ya conocida.',
  'RIESGO-RELATIVO-ABSOLUTO': 'Un riesgo relativo grande ("el doble") se lee como riesgo absoluto alto sin conocer el valor base.',
}

// Dependencias cruzadas entre bloques de un mismo núcleo, calculadas en
// vivo desde `prereqs` reales (mismo principio que `paresIdentificacionLocal`
// de Lectura Crítica: derivar del dato, no de una lista curada a mano —
// el mockup sí inventó varias de estas relaciones bloque-a-bloque como
// placeholder). Ignora prerrequisitos dentro del mismo bloque (son la
// cadena normal de tarjetas, no información nueva para esta vista).
export function dependenciasCruzadas(tarjetasNucleo, tarjetasPorId) {
  const porBloque = new Map()
  const registro = (bloque) => {
    if (!porBloque.has(bloque)) porBloque.set(bloque, { dependeDe: new Set(), sostiene: new Set() })
    return porBloque.get(bloque)
  }
  for (const t of tarjetasNucleo) {
    registro(t.bloque)
    for (const id of t.prereqs ?? []) {
      const previa = tarjetasPorId.get(id)
      if (previa && previa.bloque !== t.bloque) {
        registro(t.bloque).dependeDe.add(previa.bloque)
        registro(previa.bloque).sostiene.add(t.bloque)
      }
    }
  }
  return porBloque
}
