import { adaptersIngles } from '../modulos/ingles/adapters.js'
import { adaptersCompetenciasCiudadanas } from '../modulos/competencias-ciudadanas/adapters.js'
import { adaptersPensamientoCientifico } from '../modulos/pensamiento-cientifico/adapters.js'
import { adaptersDiosgenina } from '../modulos/diosgenina/adapters.js'
import { adaptersLecturaCritica } from '../modulos/lectura-critica/adapters.js'
import { adaptersRazonamientoCuantitativo } from '../modulos/razonamiento-cuantitativo/adapters.js'

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
    disponible: true,
    // Igual que CC/LC/PC: todavía no hay distribución de simulacro ni
    // escala de resultado diseñadas para este módulo (ver
    // saber_pro_resultado_scope en memoria) — solo repaso de conceptos y
    // práctica por sub-categoría por ahora.
    soportaSimulacro: false,
    // Las 3 competencias oficiales ICFES de RC (viven en `pregunta.parte`,
    // ver adapters/contextoRC.js).
    categorias: {
      interpretacion_representacion: 'Interpretación y representación',
      formulacion_ejecucion: 'Formulación y ejecución',
      argumentacion: 'Argumentación',
    },
    // Eje ortogonal a `categorias`, mismo mecanismo que Pensamiento
    // Científico usa para núcleo común/específico: el área de contenido
    // matemático (`contenido` en los datos fuente, tanto en tarjetas de
    // concepto como en preguntas). `PracticaPorParte.jsx` solo muestra el
    // selector cuando este mapa está presente.
    nucleos: {
      algebra_calculo: 'Álgebra y cálculo',
      contexto_aplicado: 'Contexto aplicado',
      estadistica: 'Estadística',
      geometria: 'Geometría',
    },
    adapters: adaptersRazonamientoCuantitativo,
  },
  'lectura-critica': {
    id: 'lectura-critica',
    nombre: 'Lectura Crítica',
    monograma: 'LC',
    descripcion: 'Análisis e interpretación de textos.',
    disponible: true,
    // Igual que CC/PC/diosgenina: todavía no hay distribución de simulacro
    // ni escala de resultado diseñadas para este módulo (ver
    // saber_pro_resultado_scope en memoria) — solo repaso de conceptos y
    // práctica por sub-categoría por ahora.
    soportaSimulacro: false,
    // Las 3 competencias oficiales del núcleo de Lectura Crítica del ICFES.
    categorias: {
      identificacion_local: 'Identificación local',
      comprension_global: 'Comprensión global',
      reflexion_evaluacion: 'Reflexión y evaluación',
    },
    // Eje ortogonal a `categorias`, reutilizando el mismo mecanismo que
    // Pensamiento Científico usa para núcleo común/específico (ver
    // `nucleo` en engine/adapters/lecturaCritica.js): aquí no separa
    // núcleos temáticos del examen, separa las tres experiencias de
    // lectura del módulo (texto literario, texto informativo, elemento
    // discontinuo), pero el filtro y el conteo por parte funcionan igual.
    nucleos: {
      continuo_literario: 'Textos literarios',
      continuo_informativo: 'Textos informativos',
      discontinuo: 'Elementos discontinuos',
    },
    adapters: adaptersLecturaCritica,
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
  frances: {
    id: 'frances',
    nombre: 'Français · Método Assimil',
    monograma: 'FR',
    descripcion: 'Fase receptiva del método Assimil (lecciones 1-49): diálogos, gramática, pronunciación y cultura.',
    disponible: true,
    // Sin simulacro ni preguntas de práctica: Assimil no produce un
    // formato de opción múltiple, así que forzarlo sería artificial. El
    // único modo es "Repaso de conceptos" (ver ModuloHub.jsx, que además
    // oculta "Práctica por sub-categoría" cuando preguntas.length === 0).
    soportaSimulacro: false,
    // Título real de cada lección del libro, usado como badge en la
    // tarjeta de repaso ("Lección 3 · Présentations" en vez de un
    // "Parte N" genérico). "0" son los conceptos de la introducción
    // (pronunciación, acentos, liaison) que no pertenecen a ninguna
    // lección numerada. Solo hay tarjetas reales para 0-7 por ahora
    // (piloto); el resto del índice ya queda listo para cuando se agregue
    // el contenido de las lecciones 8-49.
    // El título de la lección 25 no se pudo leer del PDF fuente (falla de
    // OCR) y se reconstruyó por contexto a partir del título de la 26
    // ("...(suite)") — vale la pena confirmarlo contra el libro físico.
    categorias: {
      '0': 'Introducción y pronunciación',
      '1': 'Comment allez-vous ?',
      '2': 'Le café',
      '3': 'Présentations',
      '4': "L'heure",
      '5': 'Je cherche le métro',
      '6': "À l'hôtel",
      '7': 'Révision',
      '8': 'Une visite',
      '9': 'À la mairie',
      '10': "C'est très simple !",
      '11': 'Au marché (Première partie)',
      '12': 'Au marché (Deuxième partie)',
      '13': 'Un cadeau',
      '14': 'Révision',
      '15': 'Un tour dans Paris (Première partie)',
      '16': 'Un tour dans Paris (Deuxième partie)',
      '17': 'Quels sont vos projets ?',
      '18': 'Prenons rendez-vous avec le banquier',
      '19': 'Un bel endroit pour une fête',
      '20': 'Un monde idéal',
      '21': 'Révision',
      '22': 'Réfléchissez, choisissez, jouez',
      '23': 'Comment réussir au loto',
      '24': 'Je ne vais pas bien du tout',
      '25': 'Déjeunons ensemble (Première partie)',
      '26': 'Déjeunons ensemble (suite)',
      '27': '"Hôtel complet"',
      '28': 'Révision',
      '29': 'Comment vas-tu ?',
      '30': "J'ai un truc à te demander",
      '31': "J'en ai besoin rapidement",
      '32': 'Je ne peux plus continuer comme ça',
      '33': "Je n'ai rien dans ma garde-robe",
      '34': 'Les randonneurs',
      '35': 'Révision',
      '36': "J'espère que je n'ai rien oublié",
      '37': "J'ai réfléchi à la question du loyer",
      '38': 'C\'est de la part de qui ?',
      '39': 'Le septième art',
      '40': 'Tu es si impatient !',
      '41': 'Un accueil désagréable',
      '42': 'Révision',
      '43': 'Le foot féminin',
      '44': 'Perturbations dans les transports',
      '45': "Il n'y a pas de métiers inutiles",
      '46': "Depuis, je n'ai aucune nouvelle",
      '47': 'Un déménagement',
      '48': 'Ça ne me dit rien',
      '49': 'Révision',
    },
    adapters: {},
  },
  diosgenina: {
    id: 'diosgenina',
    nombre: 'Pharmactive · Diosgenina Fase 1',
    monograma: 'DG',
    descripcion: 'Perfilaje fitoquímico de ñame — Semillero Pharmactive, Fase 1.',
    disponible: true,
    // Sin distribución de simulacro definida (igual que CC y PC) — solo
    // repaso de conceptos y práctica por sub-categoría por ahora.
    soportaSimulacro: false,
    // Mismo vocabulario de afirmaciones que Pensamiento Científico: las
    // preguntas de diosgenina evalúan las mismas 5 competencias científicas
    // genéricas, no una taxonomía propia.
    categorias: {
      adquirir_interpretar: 'Adquirir e interpretar',
      analizar_concluir: 'Analizar y concluir',
      comprender_modelos: 'Comprender modelos',
      establecer_estrategias: 'Establecer estrategias',
      plantear_preguntas: 'Plantear preguntas',
    },
    adapters: adaptersDiosgenina,
  },
}
