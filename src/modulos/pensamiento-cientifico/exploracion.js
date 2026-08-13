// Nombres legibles de los 31 bloques del núcleo común (razonamiento
// científico transversal, aplica a cualquier ciencia) y los 14 bloques de
// temas de química del núcleo específico, más los 3 bloques de "método
// científico aplicado a química" que rompen a propósito la retícula de
// química (son los mismos 3 conceptos del núcleo común, en contexto
// químico — ver `METODO_QUIMICA` más abajo).

export const NOMBRES_BLOQUE_COMUN = {
  confusion_exactitud_precision: 'Exactitud vs. precisión',
  correlacion_causalidad: 'Correlación no es causalidad',
  variable_de_confusion_no_controlada: 'Variable de confusión no controlada',
  variable_confundida: 'Variable independiente, dependiente y controlada',
  'diseño_no_controlado': 'Diseño no controlado',
  modelo_fuera_de_dominio: 'Un modelo fuera de su dominio',
  incertidumbre_mal_atribuida: 'A qué se debe la incertidumbre',
  evidencia_insuficiente_o_irrelevante: 'Evidencia relevante vs. solo relacionada',
  sobregeneralizacion_de_un_metodo: 'Sobregeneralizar un método',
  equilibrio_confundido_con_reposo: 'Equilibrio no es reposo',
  brecha_de_datos_ignorada: 'La brecha de datos que falta medir',
  proporcionalidad_directa_vs_inversa: 'Proporcionalidad directa vs. inversa',
  lectura_invertida_grafica: 'Lectura invertida de una gráfica',
  que_es_un_modelo_cientifico: 'Qué es (y no es) un modelo científico',
  ventajas_y_limitaciones_de_un_modelo: 'Ventajas y límites de un modelo',
  formulacion_de_hipotesis_falsable: 'Hipótesis falsable vs. no falsable',
  prediccion_vs_explicacion: 'Predecir sin explicar',
  integracion_patrones_transversales: 'Integrar varios patrones a la vez',
  medidas_tendencia_central_y_dispersion: 'Media, mediana y dispersión',
  correlacion_entre_variables_e_interpretacion: 'Leer un diagrama de dispersión',
  'diseño_de_experimento_controlado': 'Diseñar un experimento controlado',
  variable_de_confusion_y_como_controlarla: 'Cómo controlar una variable de confusión',
  validez_interna_vs_externa: 'Validez interna vs. externa',
  sesgos_de_muestreo_comunes: 'Sesgos de muestreo comunes',
  replica_experimental_que_significa_realmente: 'Qué es replicar de verdad',
  objetivo_de_un_protocolo_experimental: 'El objetivo real de un protocolo',
  'tamaño_de_muestra_y_reduccion_de_incertidumbre': 'Tamaño de muestra y su límite',
  cegamiento_experimental: 'Cegamiento experimental',
  estudio_observacional_vs_experimental: 'Observacional vs. experimental',
  aleatorizacion_de_sujetos: 'Aleatorización de sujetos',
  representar_datos_en_grafica_o_tabla: 'Elegir tabla o gráfica',
}

export const NOMBRES_BLOQUE_QUIMICA = {
  estequiometria_y_balance_de_ecuaciones: 'Estequiometría y balance',
  gases_ideales_leyes_de_boyle_y_gay_lussac: 'Gases ideales',
  equilibrio_quimico_le_chatelier: 'Equilibrio y Le Chatelier',
  cinetica_de_reaccion_y_efecto_catalitico: 'Cinética y catálisis',
  termoquimica_y_calorimetria: 'Termoquímica y calorimetría',
  redox_y_balanceo_de_ecuaciones: 'Redox y su balanceo',
  estados_de_oxidacion_e_interpretacion_de_datos_relativos: 'Estados de oxidación',
  reactividad_alcanos_alquinos_alquenos_frente_a_oxidantes: 'Reactividad orgánica básica',
  geometria_molecular_y_angulos_de_enlace: 'Geometría molecular',
  acido_base_y_procedimientos_de_laboratorio: 'Ácido-base en el laboratorio',
  solubilidad_y_recristalizacion: 'Solubilidad y recristalización',
  espectroscopia_e_intensidad_de_senal_basica: 'Espectroscopía básica',
  nanomateriales_y_confinamiento_cuantico: 'Nanomateriales y confinamiento',
  soluciones_y_propiedades_coligativas: 'Soluciones y propiedades coligativas',
}

// Orden de lectura de las 14 casillas de química: agrupadas por afinidad
// temática (no es el orden de creación del dato fuente), pero SIN cadena de
// dependencia entre ellas — se verificó con script contra `prereqs` reales
// y las 60 tarjetas de química no tienen ni un solo prerrequisito que cruce
// de un bloque a otro (a diferencia de Razonamiento Cuantitativo, donde sí
// los hay). Los 14 bloques son honestamente 14 puntos de entrada
// independientes hoy; el mockup mostraba flechas de dependencia entre
// casillas ("Redox depende de Estados de oxidación", etc.) que no existen
// en el dato real, así que esta vista no las dibuja.
export const ORDEN_CASILLAS_QUIMICA = [
  'estequiometria_y_balance_de_ecuaciones',
  'gases_ideales_leyes_de_boyle_y_gay_lussac',
  'termoquimica_y_calorimetria',
  'equilibrio_quimico_le_chatelier',
  'cinetica_de_reaccion_y_efecto_catalitico',
  'solubilidad_y_recristalizacion',
  'soluciones_y_propiedades_coligativas',
  'acido_base_y_procedimientos_de_laboratorio',
  'redox_y_balanceo_de_ecuaciones',
  'estados_de_oxidacion_e_interpretacion_de_datos_relativos',
  'geometria_molecular_y_angulos_de_enlace',
  'reactividad_alcanos_alquinos_alquenos_frente_a_oxidantes',
  'espectroscopia_e_intensidad_de_senal_basica',
  'nanomateriales_y_confinamiento_cuantico',
]

// Los 3 bloques de método científico aplicado a química — mismos 3
// conceptos del núcleo común (ver HERRAMIENTAS, clave 'preguntas'), pero
// con ejemplos de química (MnO₂ como catalizador, transición de fase del
// Na₂SO₄, Rf de cromatografía). Los nombres se reutilizan de
// NOMBRES_BLOQUE_COMUN porque son el mismo concepto, no una variante.
export const METODO_QUIMICA = [
  'formulacion_de_hipotesis_falsable',
  'brecha_de_datos_ignorada',
  'objetivo_de_un_protocolo_experimental',
]

// Los 31 bloques del núcleo común agrupados en 6 "herramientas" reales —
// clustering verificado dos veces: (1) los tamaños suman exactamente 64
// (el total real de tarjetas del núcleo), y (2) los 9 prerrequisitos que sí
// cruzan de un bloque a otro dentro de este núcleo (verificados por script
// contra `prereqs`) caen todos DENTRO del mismo cluster, nunca entre
// clusters distintos — confirma que la agrupación semántica coincide con
// la estructura real de dependencias, no solo con el nombre del bloque.
// Los tamaños son deliberadamente desiguales (5 a 22): "diseño
// experimental y control de sesgo" es, de verdad, más de un tercio del
// núcleo — no se fuerza a 6 partes iguales.
export const HERRAMIENTAS = [
  {
    key: 'medicion',
    nombre: 'Medición, datos y su representación',
    paraQue: 'Para saber cuánto de un número es real, cómo resumirlo y cómo mostrarlo sin engañar.',
    bloques: [
      'confusion_exactitud_precision',
      'incertidumbre_mal_atribuida',
      'medidas_tendencia_central_y_dispersion',
      'tamaño_de_muestra_y_reduccion_de_incertidumbre',
      'representar_datos_en_grafica_o_tabla',
    ],
  },
  {
    key: 'diseno',
    nombre: 'Diseño experimental y control de sesgo',
    paraQue: 'Para construir una prueba que de verdad pueda salir mal, y reconocer cuando no lo está.',
    bloques: [
      'variable_confundida',
      'variable_de_confusion_no_controlada',
      'variable_de_confusion_y_como_controlarla',
      'diseño_no_controlado',
      'diseño_de_experimento_controlado',
      'validez_interna_vs_externa',
      'sesgos_de_muestreo_comunes',
      'replica_experimental_que_significa_realmente',
      'cegamiento_experimental',
      'aleatorizacion_de_sujetos',
      'estudio_observacional_vs_experimental',
    ],
  },
  {
    key: 'correlacion',
    nombre: 'Correlación y causalidad',
    paraQue: 'Para no concluir que algo causa otra cosa solo porque cambian juntas.',
    bloques: ['correlacion_causalidad', 'correlacion_entre_variables_e_interpretacion'],
  },
  {
    key: 'modelos',
    nombre: 'Qué es un modelo científico',
    paraQue: 'Para saber qué puede y qué no puede decirte una representación simplificada de la realidad.',
    bloques: [
      'que_es_un_modelo_cientifico',
      'ventajas_y_limitaciones_de_un_modelo',
      'modelo_fuera_de_dominio',
      'equilibrio_confundido_con_reposo',
      'proporcionalidad_directa_vs_inversa',
      'prediccion_vs_explicacion',
    ],
  },
  {
    key: 'evidencia',
    nombre: 'Calidad de la evidencia',
    paraQue: 'Para separar lo que de verdad respalda una conclusión de lo que solo suena relacionado.',
    bloques: [
      'evidencia_insuficiente_o_irrelevante',
      'sobregeneralizacion_de_un_metodo',
      'lectura_invertida_grafica',
      'integracion_patrones_transversales',
    ],
  },
  {
    key: 'preguntas',
    nombre: 'Formular preguntas',
    paraQue: 'Para convertir una curiosidad o un protocolo en algo que un experimento pueda responder.',
    bloques: ['brecha_de_datos_ignorada', 'formulacion_de_hipotesis_falsable', 'objetivo_de_un_protocolo_experimental'],
  },
]

// El "grado" (1/2/3) de un bloque dentro de su herramienta se deriva en
// vivo de la dificultad real de sus tarjetas (baja/media/alta), no de una
// lista curada a mano aparte: se toma la dificultad más alta presente en
// el bloque, porque en los bloques con dificultad mixta (ej.
// "diseño_no_controlado": 1 media + 1 alta) la tarjeta más exigente es la
// que de verdad marca cuánto pide ese bloque.
const GRADO_POR_DIFICULTAD = { baja: 1, media: 2, alta: 3 }

export function gradoDeBloque(tarjetasBloque) {
  const grados = tarjetasBloque.map((t) => GRADO_POR_DIFICULTAD[t.dificultad] ?? 2)
  return Math.max(...grados)
}
