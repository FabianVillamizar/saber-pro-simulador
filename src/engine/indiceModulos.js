import { adaptersIngles, enlazarTeoriaIngles } from '../modulos/ingles/adapters.js'
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
    // Usada solo por QuizRapido.jsx como filtro/badge (los 362 ítems de
    // ing_quiz_rapido.json, uno por cada tarjeta cloze, cargan `categoria`
    // con el mismo valor que `tipo` en las tarjetas de concepto) — Repaso
    // de conceptos y Escribe la Respuesta ya filtraban por `tipo`/`nivel_mcer`
    // directamente sobre las tarjetas, sin pasar por este mapa.
    categorias: {
      vocabulario: 'Vocabulario',
      gramatica: 'Gramática',
      cultura_general: 'Cultura general',
    },
    adapters: adaptersIngles,
    // Puente pregunta -> teoría de Parte 4 (ver enlazarTeoriaIngles en
    // modulos/ingles/adapters.js): opcional, como `categorias`/`nucleos` —
    // loadModulos.js lo llama después de armar `preguntas` y
    // `tarjetasConcepto` solo si el módulo lo define.
    enlazarTeoria: enlazarTeoriaIngles,
  },
  'razonamiento-cuantitativo': {
    id: 'razonamiento-cuantitativo',
    nombre: 'Razonamiento Cuantitativo',
    monograma: 'RC',
    descripcion: 'Interpretación de datos, proporcionalidad y modelación.',
    disponible: true,
    // Primer módulo (además de Inglés) con Simulacro completo real: 30
    // preguntas en la proporción real por competencia (ver
    // engine/simulacro.js `DISTRIBUCION_RC`) — el Resultado no usa una
    // escala de niveles oficial (RC no tiene un marco externo publicado
    // como el CEFR de Inglés), solo el puntaje /300 aproximado más un
    // descriptor de desempeño no-oficial (ver Resultado.jsx).
    soportaSimulacro: true,
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
    // Tercer módulo (después de Inglés y RC) con Simulacro completo real:
    // 30 preguntas en la proporción real por competencia (ver
    // engine/simulacro.js `DISTRIBUCION_LC`) — mismo patrón que RC: el
    // Resultado no usa una escala de niveles oficial (no existe un marco
    // externo publicado por el ICFES para Lectura Crítica genérica, a
    // diferencia del CEFR de Inglés), solo el puntaje /300 aproximado más
    // un descriptor de desempeño no-oficial (ver Resultado.jsx).
    soportaSimulacro: true,
    // Las 3 competencias oficiales del núcleo de Lectura Crítica del ICFES,
    // más `cultura_general` (referencias mitológicas/históricas, sin
    // competencia ICFES propia) usada solo como filtro/badge de
    // QuizRapido.jsx — el banco de examen (`preguntas`) nunca la usa, así
    // que no aparece como pestaña en Práctica por sub-categoría.
    categorias: {
      identificacion_local: 'Identificación local',
      comprension_global: 'Comprensión global',
      reflexion_evaluacion: 'Reflexión y evaluación',
      cultura_general: 'Cultura general',
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
    disponible: true,
    // Único módulo sin ítems de opción múltiple: el ICFES evalúa un
    // ensayo argumentativo completo, no hay "banco de preguntas" que
    // adaptar. `preguntas` queda siempre vacío (sin adapters), así que
    // ModuloHub.jsx ya oculta "Práctica por sub-categoría" y "Simulacro
    // completo" con las mismas condiciones que usa para cualquier otro
    // módulo — no hace falta un flag nuevo para eso. Lo que sí es propio
    // de este módulo son sus dos pantallas de ensayo (Ensayos Modelo /
    // Practicar Ensayo), gateadas directamente por `moduloId ===
    // 'comunicacion-escrita'` en ModuloHub.jsx, igual que Français hace
    // con sus propios modos.
    soportaSimulacro: false,
    adapters: {},
    // Los 6 dominios temáticos de los 22 temas de ensayo (`modulo.temasEnsayo`,
    // ver loadModulos.js) — no son una taxonomía ICFES oficial, son solo la
    // agrupación editorial de los temas de práctica.
    dominios: {
      salud_y_bioetica: 'Salud y bioética',
      tecnologia_y_sociedad: 'Tecnología y sociedad',
      medio_ambiente: 'Medio ambiente',
      educacion: 'Educación',
      economia_y_trabajo: 'Economía y trabajo',
      convivencia_y_ciudadania: 'Convivencia y ciudadanía',
    },
    // A diferencia de PC/RC (donde `categorias` mapea una `competencia_asociada`
    // que sí trae cada tarjeta), las 55 tarjetas de concepto de este módulo no
    // tienen `competencia_asociada` — solo el `bloque` granular (23 valores
    // distintos, ver ce_conceptos_skl_tanda{1,2}.json). RepasoConceptos.jsx
    // busca `modulo.categorias?.[tarjeta.bloque]` como segundo intento antes
    // de mostrar el bloque crudo, así que este mapa agrupa los 23 bloques en
    // los ejes reales de la rúbrica ICFES (pertinencia / planteamiento
    // definido / organización / forma de expresión / complejizar el
    // planteamiento) más un eje no oficial de estrategia de examen — mejor
    // señal de progreso que 23 micro-categorías sueltas, y mismo agrupamiento
    // que usa el panel de progreso de Practicar Ensayo para sugerir qué
    // repasar (ver PracticarEnsayo.jsx).
    categorias: {
      que_cuenta_como_impertinencia: 'Pertinencia',
      como_evitar_impertinencia: 'Pertinencia',
      planteamiento_directo_desde_la_introduccion: 'Planteamiento definido',
      posiciones_validas: 'Planteamiento definido',
      estructura_introduccion: 'Planteamiento definido',
      argumentativo_vs_expositivo: 'Organización',
      desarrollo_de_un_argumento: 'Organización',
      estructura_desarrollo: 'Organización',
      estructura_conclusion: 'Organización',
      unidad_tematica_sin_digresiones: 'Organización',
      complejizar_el_planteamiento: 'Complejizar el planteamiento',
      recursos_estilisticos_argumentativos: 'Complejizar el planteamiento',
      cohesion_por_referencia: 'Forma de expresión',
      conectores_de_adicion: 'Forma de expresión',
      conectores_de_contraste: 'Forma de expresión',
      conectores_de_causa_efecto: 'Forma de expresión',
      conectores_de_conclusion: 'Forma de expresión',
      registro_formal_vs_coloquial: 'Forma de expresión',
      errores_ortograficos_frecuentes: 'Forma de expresión',
      puntuacion_que_afecta_sentido: 'Forma de expresión',
      gestion_del_tiempo: 'Estrategia de examen',
      extension_apropiada: 'Estrategia de examen',
      auto_revision_antes_de_entregar: 'Estrategia de examen',
    },
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
      // Dos claves extra, aparte de las lecciones numeradas del curso
      // Assimil: agrupan el banco de "Quiz rápido" (fr_quiz_rapido.json)
      // por tema de clase real (con tutor), no por lección del libro. Solo
      // se usan como etiqueta de filtro/badge dentro de QuizRapido.jsx —
      // MapaDelCurso y RepasoConceptos acceden a `categorias` únicamente
      // por número de lección (String(n)), así que estas dos claves no
      // interfieren con esa lógica.
      'clase-loisirs': 'Loisirs, sports y verbos (jouer/faire/aller)',
      'clase-profesiones': 'Profesiones y restauration rapide',
      'clase-petits-boulots': 'Petits boulots y jobs de rêve',
      'clase-gustos-y-preposiciones': 'Gustos, faire/jouer y preposiciones',
    },
    // El Quiz Rápido de Français activa la capa "Reglas en contexto"
    // (token `[[id-regla|texto]]` → popover con la regla / conjugación),
    // cuyo rulebook vive en src/data/frances/fr_reglas.json. Es seguro:
    // este módulo no escribe montos de dinero en enunciados/explicación, y
    // los ítems previos no traen `$` ni `**` que el render de fórmulas
    // pudiera reinterpretar (ver la bitácora del módulo, sección 20).
    renderizaFormulas: true,
    // Acento carmesí propio del módulo para el disparador y el popover de
    // "Reglas en contexto" (en vez del teal general). Lo consume
    // <ReglasProvider acento={...}> vía data-acento en TextoConReglas.css.
    acentoReglas: 'fr',
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
    // Dos usos distintos del mismo campo `categorias`, igual que ya pasa en
    // otros módulos (ver saber_pro_module_architecture): las 15 preguntas de
    // examen (`dio_items`) usan el mismo vocabulario de afirmaciones que
    // Pensamiento Científico (5 competencias científicas genéricas, no una
    // taxonomía propia) por su campo `afirmacion`; las 100 tarjetas de
    // teoría (`dio_fqt`...`dio_est`) agrupan por su campo `bloque` — los 9
    // bloques del protocolo real del semillero, en el orden en que
    // aparecen en el pipeline (no alfabético). RepasoConceptos usa esta
    // misma tabla para el badge de categoría de las tarjetas.
    categorias: {
      adquirir_interpretar: 'Adquirir e interpretar',
      analizar_concluir: 'Analizar y concluir',
      comprender_modelos: 'Comprender modelos',
      establecer_estrategias: 'Establecer estrategias',
      plantear_preguntas: 'Plantear preguntas',
      FQT: 'Fisicoquímica transversal',
      HID: 'Hidrólisis ácida',
      ELL: 'Extracción líquido-líquido',
      SER: 'Secado, evaporación, redisolución',
      TLC: 'Cromatografía en capa fina',
      ESP: 'Colorimetría y espectrofotometría',
      HPL: 'HPLC',
      PFT: 'Perfilaje fitoquímico',
      EST: 'Estadística',
    },
    adapters: adaptersDiosgenina,
  },
  inorganica: {
    id: 'inorganica',
    nombre: 'Inorgánica · Posgrado',
    monograma: 'IQ',
    descripcion: 'Relectura experta de Inorgánica rumbo a un posgrado en química de materiales.',
    disponible: true,
    // Autoestudio de posgrado, no hay examen oficial que simular ni banco
    // de opción múltiple todavía (ver la bitácora del módulo) — igual que
    // Français, `preguntas` queda vacío y no aplica Simulacro.
    soportaSimulacro: false,
    // Un solo tema por ahora (Teoría de Grupos y Simetría Molecular);
    // cada tema nuevo que Fabián vaya subiendo a Guías/ agrega su propia
    // entrada aquí, mismo patrón por bloque que ya usa Diosgenina.
    categorias: {
      teoria_grupos: 'Teoría de Grupos y Simetría Molecular',
    },
    // Igual que Habilidades de Laboratorio: este módulo escribe LaTeX
    // inline ($C_{3v}$, $\hat{C}_n$, matrices) en enunciados/opciones/
    // explicación de Quiz Rápido, no solo en tarjetas de concepto, y no
    // tiene montos de dinero en esos campos, así que el render con
    // fórmulas es seguro de activar. También habilita la capa "Reglas en
    // contexto" (token `[[id-regla|texto]]` → popover), cuyo rulebook vive
    // en src/data/inorganica/iq_reglas.json (ver la bitácora del módulo).
    renderizaFormulas: true,
    adapters: {},
  },
  'habilidades-laboratorio': {
    id: 'habilidades-laboratorio',
    nombre: 'Habilidades de Laboratorio',
    monograma: 'HL',
    descripcion: 'Repaso semanal del semillero Pharmactive: cada técnica de laboratorio derivada desde primeros principios.',
    disponible: true,
    // Semillero académico, no examen oficial — igual que Inorgánica/Français,
    // `preguntas` queda vacío y no aplica Simulacro (ver bitácora del módulo).
    soportaSimulacro: false,
    // Cada técnica que el semillero repase agrega su propia entrada aquí,
    // mismo patrón por bloque que ya usan Diosgenina e Inorgánica. La clave
    // alimenta el badge por tarjeta (RepasoConceptos), el filtro de chips y
    // el diagnóstico por técnica (QuizRapido), y el selector de técnica
    // (ExploracionHabilidadesLaboratorio).
    categorias: {
      lle: 'Extracción Líquido-Líquido',
      cf: 'Determinación de Constantes Físicas',
    },
    // Este módulo escribe símbolos matemáticos inline ($K_D$, $V_{ac}$,
    // etc.) en enunciados/opciones de Quiz Rápido y Lápiz y papel, no solo
    // en tarjetas de concepto. Otros módulos (RC, Diosgenina) usan "$" para
    // montos de dinero en esos mismos campos ("$102", "$1.000.000"), y un
    // "$...$" sin escapar ahí rompería el render si QuizRapido.jsx/
    // PracticarLapizPapel.jsx trataran cualquier "$" como delimitador de
    // fórmula — por eso el render con TextoConFormulas en esos dos
    // componentes es opt-in por módulo, no global. Activar esta bandera
    // solo si el módulo nuevo de verdad usa LaTeX inline fuera de las
    // tarjetas de concepto (que sí usan TextoConFormulas siempre, ver
    // RepasoConceptos.jsx) y no tiene montos de dinero en esos campos.
    renderizaFormulas: true,
    adapters: {},
  },
}
