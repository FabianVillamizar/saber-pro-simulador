import { prerequisitosCumplidos } from '../../engine/srs.js'

// Nombres legibles de cada `bloque` — el dato fuente solo trae la clave
// snake_case (ver bitácora del 2026-08-11, "Auditoría de progresión de
// dificultad" y el prompt de exploración de Competencias Ciudadanas).
// Cubre los 66 bloques reales de las 4 competencias.
export const NOMBRES_BLOQUE = {
  // argumentacion (10)
  estructura_del_argumento: 'Estructura del argumento',
  premisas_implicitas_o_supuestos_no_explicitos: 'Premisas implícitas',
  condiciones_necesarias_vs_suficientes: 'Condiciones necesarias vs. suficientes',
  generalizacion_indebida_muestra_no_representativa: 'Generalización indebida',
  informacion_insuficiente_para_sostener_una_conclusion: 'Información insuficiente',
  credibilidad_y_pertinencia_de_fuentes: 'Credibilidad de fuentes',
  coherencia_e_incoherencia_entre_enunciados: 'Coherencia entre enunciados',
  tipos_de_falacias_comunes: 'Tipos de falacias comunes',
  refutar_vs_sustentar_un_argumento: 'Refutar vs. sustentar',
  funcion_de_los_contraejemplos: 'Función de los contraejemplos',

  // multiperspectivismo (8)
  diferencia_entre_posicion_e_interes: 'Posición vs. interés',
  postura_explicita_vs_implicita: 'Postura explícita vs. implícita',
  acuerdos_y_desacuerdos_parciales: 'Acuerdos y desacuerdos parciales',
  interseccion_de_intereses: 'Intersección de intereses',
  cosmovision_reflejada_en_comportamiento_o_argumento: 'Cosmovisión en el argumento',
  rol_institucional_vs_opinion_personal: 'Rol institucional vs. opinión personal',
  cambio_de_postura_ante_nueva_evidencia: 'Cambio de postura ante evidencia',
  tension_entre_derechos_constitucionales_legitimos: 'Tensión entre derechos legítimos',

  // pensamiento_sistemico (7)
  dimensiones_de_un_problema_con_ejemplos_que_las_distingan: 'Dimensiones de un problema',
  relaciones_entre_dimensiones: 'Relaciones entre dimensiones',
  transferibilidad_de_una_solucion_a_otro_contexto: 'Transferibilidad de una solución',
  consecuencias_deseadas_vs_no_deseadas: 'Consecuencias deseadas vs. no deseadas',
  dimension_desatendida_en_una_solucion_parcial: 'Dimensión desatendida',
  tradeoffs_entre_dimensiones: 'Tradeoffs entre dimensiones',
  escala_temporal_de_las_consecuencias: 'Escala temporal de las consecuencias',

  // conocimientos (41)
  jerarquia_normativa_aplicada: 'Jerarquía normativa aplicada',
  jerarquia_de_leyes: 'Jerarquía de leyes',
  bloque_de_constitucionalidad: 'Bloque de constitucionalidad',
  control_de_constitucionalidad_vs_tramite_legislativo: 'Control de constitucionalidad vs. trámite',
  mecanismos_de_reforma_constitucional: 'Mecanismos de reforma constitucional',
  estado_laico_como_principio_jurisprudencial: 'Estado laico',
  neutralidad_estatal_frente_a_religiones: 'Neutralidad estatal frente a religiones',
  estado_social_de_derecho_vs_estado_de_derecho: 'Estado social de derecho vs. Estado de derecho',
  por_que_la_constitucion_1991_reemplazo_a_la_de_1886: 'Por qué la Constitución de 1991 reemplazó a la de 1886',
  rama_ejecutiva_funciones: 'Rama ejecutiva',
  rama_legislativa_funciones: 'Rama legislativa',
  rama_judicial_estructura: 'Rama judicial',
  ministerio_publico_vs_organos_control: 'Ministerio público vs. órganos de control',
  equilibrio_de_poderes: 'Equilibrio de poderes',
  estados_de_excepcion: 'Estados de excepción',
  democracia_representativa_y_participativa_coexisten: 'Democracia representativa y participativa',
  funciones_del_congreso_mas_alla_de_legislar: 'Funciones del Congreso más allá de legislar',
  asambleas_departamentales_y_concejos_municipales: 'Asambleas y concejos municipales',
  derechos_fundamentales_con_ejemplos: 'Derechos fundamentales',
  derechos_sociales_economicos_culturales_con_ejemplos: 'Derechos sociales, económicos y culturales',
  derechos_colectivos_y_ambientales_con_ejemplos: 'Derechos colectivos y ambientales',
  derechos_fundamentales_por_conexidad: 'Derechos fundamentales por conexidad',
  mecanismos_de_proteccion_de_derechos: 'Mecanismos de protección de derechos',
  vulneracion_directa_vs_disfrazada: 'Vulneración directa vs. disfrazada',
  vulneracion_de_multiples_derechos_simultanea: 'Vulneración de múltiples derechos',
  deberes_ciudadanos_articulo_95: 'Deberes ciudadanos (art. 95)',
  deber_de_solidaridad_social_en_escenarios_de_omision: 'Deber de solidaridad social',
  eleccion_procurador_general: 'Elección del Procurador General',
  eleccion_contralor_general: 'Elección del Contralor General',
  eleccion_defensor_del_pueblo: 'Elección del Defensor del Pueblo',
  eleccion_fiscal_general: 'Elección del Fiscal General',
  comparacion_cruzada_elecciones: 'Comparación cruzada entre cargos',
  requisitos_y_periodos_cargos_eleccion: 'Requisitos y periodos de los cargos',
  voto_como_mecanismo_base: 'El voto como mecanismo base',
  plebiscito_quien_convoca_y_su_limite: 'Plebiscito: quién convoca y su límite',
  referendo_tipos_y_convocatoria: 'Referendo: tipos y convocatoria',
  consulta_popular_nacional_vs_territorial: 'Consulta popular nacional vs. territorial',
  cabildo_abierto_quien_lo_solicita: 'Cabildo abierto',
  revocatoria_del_mandato_alcance: 'Revocatoria del mandato',
  iniciativa_popular_legislativa: 'Iniciativa popular legislativa',
  comparacion_mecanismos_participacion_origen: 'Comparación de mecanismos de participación',
}

export const DESCRIPCION_COMPETENCIA = {
  conocimientos: 'Derecho constitucional aplicado, organizado en 5 capas: cada una se apoya en la anterior.',
  argumentacion: 'Estructura del argumento y las fallas más comunes al construirlo o evaluarlo.',
  multiperspectivismo: 'Distinguir posición de interés, y reconocer cuándo dos derechos legítimos chocan sin que uno gane siempre.',
  pensamiento_sistemico: 'Ver un problema en todas sus dimensiones, no solo la que una solución parcial atendió.',
}

// Único de las 4 competencias con este tratamiento: "conocimientos" tiene
// 41 bloques (los otros 3 tienen 7-10) sin ninguna subdivisión en el dato
// fuente. Esta agrupación en 5 capas es curación propia (no viene del
// contenido original) pensada para que se lea de abajo hacia arriba, igual
// que la jerarquía normativa que el propio bloque 1 enseña. Verificado
// contra los datos reales: cubre los 41 bloques exactos, sin huecos ni
// sobrantes (ver bitácora). 2 de las ~30 dependencias reales cruzan capas
// "hacia arriba" (una tarjeta de la capa 1 depende de una de la capa 5, y
// una de la capa 2 depende de una de la capa 4) — son dependencias
// legítimas del contenido, no un error de esta agrupación; el hint
// "Requiere: X" de cada bloque sigue siendo preciso aunque apunte a una
// capa superior en esos dos casos puntuales.
export const CAPAS_CONOCIMIENTOS = [
  {
    nivel: 1,
    nombre: 'Jerarquía normativa y principios',
    bloques: [
      'jerarquia_normativa_aplicada',
      'jerarquia_de_leyes',
      'bloque_de_constitucionalidad',
      'control_de_constitucionalidad_vs_tramite_legislativo',
      'mecanismos_de_reforma_constitucional',
      'estado_laico_como_principio_jurisprudencial',
      'neutralidad_estatal_frente_a_religiones',
      'estado_social_de_derecho_vs_estado_de_derecho',
      'por_que_la_constitucion_1991_reemplazo_a_la_de_1886',
    ],
  },
  {
    nivel: 2,
    nombre: 'Ramas del poder y equilibrio',
    bloques: [
      'rama_ejecutiva_funciones',
      'rama_legislativa_funciones',
      'rama_judicial_estructura',
      'ministerio_publico_vs_organos_control',
      'equilibrio_de_poderes',
      'estados_de_excepcion',
      'democracia_representativa_y_participativa_coexisten',
      'funciones_del_congreso_mas_alla_de_legislar',
      'asambleas_departamentales_y_concejos_municipales',
    ],
  },
  {
    nivel: 3,
    nombre: 'Derechos, deberes y su protección',
    bloques: [
      'derechos_fundamentales_con_ejemplos',
      'derechos_sociales_economicos_culturales_con_ejemplos',
      'derechos_colectivos_y_ambientales_con_ejemplos',
      'derechos_fundamentales_por_conexidad',
      'mecanismos_de_proteccion_de_derechos',
      'vulneracion_directa_vs_disfrazada',
      'vulneracion_de_multiples_derechos_simultanea',
      'deberes_ciudadanos_articulo_95',
      'deber_de_solidaridad_social_en_escenarios_de_omision',
    ],
  },
  {
    nivel: 4,
    nombre: 'Elección de altos cargos',
    bloques: [
      'eleccion_procurador_general',
      'eleccion_contralor_general',
      'eleccion_defensor_del_pueblo',
      'eleccion_fiscal_general',
      'comparacion_cruzada_elecciones',
      'requisitos_y_periodos_cargos_eleccion',
    ],
  },
  {
    nivel: 5,
    nombre: 'Participación ciudadana',
    bloques: [
      'voto_como_mecanismo_base',
      'plebiscito_quien_convoca_y_su_limite',
      'referendo_tipos_y_convocatoria',
      'consulta_popular_nacional_vs_territorial',
      'cabildo_abierto_quien_lo_solicita',
      'revocatoria_del_mandato_alcance',
      'iniciativa_popular_legislativa',
      'comparacion_mecanismos_participacion_origen',
    ],
  },
]

// "Modo trampas": bloques cuyo `error_comun` describe explícitamente un
// error de razonamiento (no solo un dato factual) — verificado leyendo las
// tarjetas reales, no adivinado por el nombre del bloque. A diferencia del
// "patrón de trampa" que ya existe por pregunta de examen
// (`distractor.patron_trampa`, ver reporte.js), este es un filtro sobre
// tarjetas de concepto: no cruza con el historial de errores del
// simulacro (ese cruce viviría en Resultado.jsx / patronesPerfil.js, y
// haría falta enlazar cada tarjeta a los patron_trampa de examen que
// enseña — trabajo de curación aparte, no incluido en esta pasada).
export const TRAMPA_POR_COMPETENCIA = {
  conocimientos: {
    etiqueta: 'Vulneración disfrazada',
    bloques: ['vulneracion_directa_vs_disfrazada', 'jerarquia_normativa_aplicada', 'control_de_constitucionalidad_vs_tramite_legislativo'],
  },
  argumentacion: {
    etiqueta: '8 falacias con nombre propio',
    bloques: ['tipos_de_falacias_comunes', 'generalizacion_indebida_muestra_no_representativa', 'informacion_insuficiente_para_sostener_una_conclusion', 'credibilidad_y_pertinencia_de_fuentes'],
  },
  multiperspectivismo: {
    etiqueta: 'Prioridad automática entre derechos',
    bloques: ['tension_entre_derechos_constitucionales_legitimos', 'diferencia_entre_posicion_e_interes', 'rol_institucional_vs_opinion_personal'],
  },
  pensamiento_sistemico: {
    etiqueta: 'Solución parcial',
    bloques: ['dimension_desatendida_en_una_solucion_parcial', 'transferibilidad_de_una_solucion_a_otro_contexto', 'consecuencias_deseadas_vs_no_deseadas'],
  },
}

function repeticiones(estadosSRS, id) {
  return estadosSRS[id]?.repeticiones ?? 0
}

export function porcentajeDominio(tarjetas, estadosSRS) {
  if (tarjetas.length === 0) return 0
  const dominadas = tarjetas.filter((t) => repeticiones(estadosSRS, t.id) >= 1).length
  return Math.round((dominadas / tarjetas.length) * 100)
}

// Estado agregado de un grupo de tarjetas (un bloque, o una capa entera):
// "bloqueado" si ninguna tarjeta del grupo tiene sus prerrequisitos
// cumplidos todavía; "dominado" si todas las disponibles ya se acertaron
// al menos una vez; "activo" si algunas sí y otras no; "nuevo" si hay
// disponibles pero ninguna se ha intentado.
export function estadoDeGrupo(tarjetas, estadosSRS) {
  const disponibles = tarjetas.filter((t) => prerequisitosCumplidos(t, estadosSRS))
  if (disponibles.length === 0) return 'bloqueado'
  const vistas = disponibles.filter((t) => repeticiones(estadosSRS, t.id) >= 1)
  if (vistas.length === disponibles.length) return 'dominado'
  if (vistas.length > 0) return 'activo'
  return 'nuevo'
}

// Para un bloque bloqueado, qué otro bloque hay que resolver primero —
// mira los prerrequisitos sin cumplir de sus tarjetas y prioriza un bloque
// distinto al propio (más informativo que "te falta una tarjeta tuya").
export function bloqueRequerido(tarjetas, estadosSRS, tarjetasPorId, bloquePropio) {
  for (const t of tarjetas) {
    if (prerequisitosCumplidos(t, estadosSRS)) continue
    for (const id of t.prereqs ?? []) {
      if (repeticiones(estadosSRS, id) >= 1) continue
      const previa = tarjetasPorId.get(id)
      if (previa && previa.bloque !== bloquePropio) return previa.bloque
    }
  }
  return null
}
