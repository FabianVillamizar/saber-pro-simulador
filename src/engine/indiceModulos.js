import { adaptersIngles } from '../modulos/ingles/adapters.js'
import { adaptersCompetenciasCiudadanas } from '../modulos/competencias-ciudadanas/adapters.js'
import { adaptersPensamientoCientifico } from '../modulos/pensamiento-cientifico/adapters.js'

// Índice central de módulos del examen. Agregar un módulo nuevo es:
//   1. Copiar sus JSON a src/data/<id>/.
//   2. Crear src/modulos/<id>/adapters.js con su mapa tipo -> adaptador.
//   3. Agregar una entrada aquí.
// El motor (normalize.js, loadModulos.js) y la UI que consuma
// listarModulos()/cargarModulo() no cambian.
export const indiceModulos = {
  ingles: {
    id: 'ingles',
    nombre: 'Inglés',
    monograma: 'IN',
    descripcion: 'Comprensión lectora y uso del idioma, niveles A1–B2.',
    disponible: true,
    soportaSimulacro: true,
    adapters: adaptersIngles,
  },
  'razonamiento-cuantitativo': {
    id: 'razonamiento-cuantitativo',
    nombre: 'Razonamiento Cuantitativo',
    monograma: 'RC',
    descripcion: 'Interpretación de datos, proporcionalidad y modelación.',
    disponible: false,
    adapters: {},
  },
  'lectura-critica': {
    id: 'lectura-critica',
    nombre: 'Lectura Crítica',
    monograma: 'LC',
    descripcion: 'Análisis e interpretación de textos.',
    disponible: false,
    adapters: {},
  },
  'competencias-ciudadanas': {
    id: 'competencias-ciudadanas',
    nombre: 'Competencias Ciudadanas',
    monograma: 'CC',
    descripcion: 'Convivencia, participación y pensamiento sistémico.',
    disponible: true,
    // Sin distribución de simulacro definida todavía (ver
    // saber_pro_resultado_scope en memoria): la práctica por sub-categoría
    // y el repaso de conceptos sí usan datos reales, pero "Simulacro
    // completo" se queda oculto para este módulo hasta que se diseñe su
    // propia proporción de preguntas y escala de resultado.
    soportaSimulacro: false,
    // Orden y etiqueta de despliegue de cada sub-categoría (`pregunta.parte`
    // en las preguntas normalizadas). Un módulo sin `categorias` (Inglés)
    // cae al comportamiento numérico "Parte N" de siempre.
    categorias: {
      conocimientos: 'Conocimientos',
      argumentacion: 'Argumentación',
      multiperspectivismo: 'Multiperspectivismo',
      pensamiento_sistemico: 'Pensamiento Sistémico',
    },
    adapters: adaptersCompetenciasCiudadanas,
  },
  'comunicacion-escrita': {
    id: 'comunicacion-escrita',
    nombre: 'Comunicación Escrita',
    monograma: 'CE',
    descripcion: 'Producción de textos argumentativos.',
    disponible: false,
    adapters: {},
  },
  'pensamiento-cientifico': {
    id: 'pensamiento-cientifico',
    nombre: 'Pensamiento Científico',
    monograma: 'PC',
    descripcion: 'Indagación y razonamiento científico.',
    disponible: true,
    // Igual que Competencias Ciudadanas: todavía no hay distribución de
    // simulacro ni escala de resultado diseñadas para este módulo (dos
    // núcleos con proporción real 30/20 en el examen real, sin definir
    // acá) — ver saber_pro_resultado_scope en memoria.
    soportaSimulacro: false,
    // Las 5 "afirmaciones" son la taxonomía propia de los datos (adquirir
    // e interpretar información, analizar y concluir, etc.), no las 3
    // competencias oficiales del ICFES — se muestran tal cual como
    // sub-categoría de práctica y como segunda insignia en la tarjeta de
    // repaso.
    categorias: {
      adquirir_interpretar: 'Adquirir e interpretar',
      analizar_concluir: 'Analizar y concluir',
      comprender_modelos: 'Comprender modelos',
      establecer_estrategias: 'Establecer estrategias',
      plantear_preguntas: 'Plantear preguntas',
    },
    // Eje ortogonal a `categorias`: cada afirmación tiene ítems de ambos
    // núcleos en proporción pareja. `PracticaPorParte.jsx` solo muestra el
    // selector cuando este mapa está presente (Inglés/CC no lo tienen).
    nucleos: {
      comun: 'Núcleo común',
      especifico_quimica: 'Específico — Química',
    },
    adapters: adaptersPensamientoCientifico,
  },
}
