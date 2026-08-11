import { estadoDeGrupo } from '../../engine/srs.js'

// Nombres legibles de cada `subtema` — el dato fuente solo trae la clave
// snake_case. Dos subtemas (`lectura_activa_hacerse_preguntas` y
// `como_detectar_el_proposito_del_texto`) existen con el mismo nombre en
// dos competencias distintas (tarjetas distintas, mismo tema general) — no
// es un choque, comparten la misma etiqueta a propósito.
export const NOMBRES_SUBTEMA = {
  // identificación local — figuras retóricas (25 subtemas)
  metafora: 'Metáfora',
  simil_o_comparacion: 'Símil (comparación)',
  metafora_vs_simil: 'Metáfora vs. símil',
  metonimia: 'Metonimia',
  sinecdoque: 'Sinécdoque',
  metonimia_vs_sinecdoque: 'Metonimia vs. sinécdoque',
  hiperbole: 'Hipérbole',
  ironia: 'Ironía',
  ironia_vs_sarcasmo: 'Ironía vs. sarcasmo',
  personificacion_o_prosopopeya: 'Personificación (prosopopeya)',
  apostrofe_retorico: 'Apóstrofe retórico',
  personificacion_vs_apostrofe_retorico: 'Personificación vs. apóstrofe',
  paradoja: 'Paradoja',
  oximoron: 'Oxímoron',
  oximoron_vs_paradoja: 'Oxímoron vs. paradoja',
  antitesis: 'Antítesis',
  anafora: 'Anáfora',
  aliteracion: 'Aliteración',
  eufemismo: 'Eufemismo',
  hiperbaton: 'Hipérbaton',
  simbolo_y_alegoria: 'Símbolo y alegoría',
  simbolo_vs_alegoria: 'Símbolo vs. alegoría',
  pregunta_retorica: 'Pregunta retórica',
  epiteto: 'Epíteto',
  epiteto_vs_metafora: 'Epíteto vs. metáfora',
  onomatopeya: 'Onomatopeya',
  gradacion_o_climax: 'Gradación (clímax)',
  metaficcion: 'Metaficción',

  // identificación local — fuera de figuras (5, algunos compartidos)
  diferencia_entre_hecho_y_opinion: 'Hecho vs. opinión',
  lectura_activa_hacerse_preguntas: 'Lectura activa: hacerse preguntas',
  que_hacer_cuando_no_se_entiende_una_frase: 'Qué hacer si no se entiende una frase',
  como_detectar_el_proposito_del_texto: 'Detectar el propósito del texto',

  // comprensión global (20)
  que_es_la_idea_principal_de_un_parrafo: 'Idea principal de un párrafo',
  donde_suele_aparecer_la_tesis: 'Dónde aparece la tesis',
  como_resumir_un_parrafo_en_una_sola_frase: 'Resumir un párrafo en una frase',
  como_identificar_quien_habla_en_el_texto: 'Identificar quién habla',
  diferencia_entre_resumir_y_opinar_sobre_un_texto: 'Resumir vs. opinar',
  como_distinguir_dos_conceptos_relacionados: 'Distinguir dos conceptos relacionados',
  tesis_y_argumentos_de_soporte: 'Tesis y argumentos de soporte',
  tesis_y_su_antitesis_a_nivel_textual: 'Tesis y su antítesis',
  tipos_de_audiencia_de_un_texto: 'Tipos de audiencia',
  voces_e_interlocutores_en_el_texto: 'Voces e interlocutores',
  tipologia_textual: 'Tipología textual',
  textos_continuos_y_discontinuos: 'Textos continuos y discontinuos',
  estrategias_discursivas_comparacion_ejemplificacion_refutacion_concesion: 'Estrategias discursivas',
  funcion_del_titulo_y_los_parrafos_en_el_sentido_global: 'Función del título y los párrafos',
  relacion_causa_efecto_en_un_texto: 'Relación causa-efecto',
  como_extraer_conclusiones_no_explicitas: 'Extraer conclusiones no explícitas',
  conectores_y_su_funcion_en_el_sentido_global: 'Conectores y su función',
  funcion_poetica_del_lenguaje: 'Función poética del lenguaje',

  // reflexión y evaluación (13)
  anticipacion_narrativa_o_foreshadowing: 'Anticipación narrativa (foreshadowing)',
  proporcion_relativa_vs_valor_absoluto: 'Proporción relativa vs. valor absoluto',
  supuestos_no_explicitos_de_un_autor: 'Supuestos no explícitos',
  tipos_de_falacias_comunes: 'Tipos de falacias comunes',
  tecnicas_de_persuasion_o_entretenimiento: 'Técnicas de persuasión o entretenimiento',
  como_elaborar_una_hipotesis_de_sentido_con_informacion_fragmentaria: 'Hipótesis con información fragmentaria',
  diferencia_entre_hecho_y_opinion_en_contexto_argumentativo: 'Hecho vs. opinión en contexto argumentativo',
  como_valorar_la_intencion_del_autor: 'Valorar la intención del autor',
  como_imaginar_situaciones_hipoteticas_a_partir_del_texto: 'Situaciones hipotéticas a partir del texto',
  como_detectar_sesgo_o_parcialidad_del_autor: 'Detectar sesgo o parcialidad',
  como_evaluar_la_suficiencia_de_la_evidencia: 'Evaluar la suficiencia de la evidencia',
  relacion_del_texto_con_el_contexto_cotidiano: 'Relación con el contexto cotidiano',
  racionalizacion_de_una_creencia_previa: 'Racionalización de una creencia previa',
}

export const NOMBRES_CATEGORIA_CULTURA = {
  mitologia_grecolatina: 'Mitología grecolatina',
  referencias_biblicas: 'Referencias bíblicas',
  filosofia: 'Filosofía',
  literatura_universal: 'Literatura universal',
  literatura_colombiana_latinoamericana: 'Literatura colombiana y latinoamericana',
  expresiones_de_origen_literario: 'Expresiones de origen literario',
}

// Los únicos 4 subtemas de identificación local que no son una figura
// retórica — el resto (28 subtemas, 48 de 54 tarjetas) sí lo son. Usado
// para calcular "X de Y son figuras retóricas" en vivo en vez de dejarlo
// como texto fijo que se desactualizaría si el mazo crece.
export const SUBTEMAS_NO_FIGURA_IDENTIFICACION_LOCAL = [
  'diferencia_entre_hecho_y_opinion',
  'lectura_activa_hacerse_preguntas',
  'que_hacer_cuando_no_se_entiende_una_frase',
  'como_detectar_el_proposito_del_texto',
]

// Posición de cada competencia en el mismo eje "lo dicho / lo inferido"
// que ordena los subtemas de comprensión global y reflexión — un juicio de
// contenido sobre qué tan literal es la competencia en conjunto, no un
// promedio de la dificultad de sus tarjetas (ver nota en POSICION_SUBTEMA).
export const MARGEN_POSICION_COMPETENCIA = {
  identificacion_local: 15,
  comprension_global: 45,
  reflexion_evaluacion: 80,
}

export const DESCRIPCION_COMPETENCIA = {
  identificacion_local:
    'No es una jerarquía sino una red de vecinos: casi todo el mazo son figuras retóricas, y la dificultad real no está en definirlas por separado sino en no confundir las que se parecen.',
  comprension_global:
    'Aquí el texto todavía manda, pero hay que reconstruir cómo está armado. Cada subtema se sitúa según cuánto exige del lector: reconocer un conector es señalar, inferir la tesis implícita ya es aportar.',
  reflexion_evaluacion:
    'Trece subtemas que no clusterizan en nada limpio, y casi ninguna tarjeta de entrada. Se muestran repartidos en el mismo eje, casi todos del lado de lo inferido.',
}

// Posición de cada subtema en el eje "lo que el texto dice" (bajo) → "lo
// que el lector infiere/evalúa" (alto), 10-90. Es un juicio de contenido
// (qué tanto exige inferencia más allá de lo escrito), no una fórmula
// sobre dificultad — un subtema puede ser difícil y seguir siendo
// mayormente localización (una figura retórica sutil sigue estando en el
// texto), así que dificultad y posición en el eje son ejes distintos a
// propósito. Solo aplica a comprensión global y reflexión/evaluación:
// identificación local usa la vista de pares, no el eje.
export const POSICION_SUBTEMA = {
  // comprensión global
  que_es_la_idea_principal_de_un_parrafo: 25,
  donde_suele_aparecer_la_tesis: 20,
  como_resumir_un_parrafo_en_una_sola_frase: 30,
  lectura_activa_hacerse_preguntas: 40,
  como_identificar_quien_habla_en_el_texto: 20,
  diferencia_entre_resumir_y_opinar_sobre_un_texto: 55,
  como_detectar_el_proposito_del_texto: 60,
  como_distinguir_dos_conceptos_relacionados: 50,
  tesis_y_argumentos_de_soporte: 30,
  tesis_y_su_antitesis_a_nivel_textual: 45,
  tipos_de_audiencia_de_un_texto: 65,
  voces_e_interlocutores_en_el_texto: 35,
  tipologia_textual: 35,
  textos_continuos_y_discontinuos: 25,
  estrategias_discursivas_comparacion_ejemplificacion_refutacion_concesion: 55,
  funcion_del_titulo_y_los_parrafos_en_el_sentido_global: 50,
  relacion_causa_efecto_en_un_texto: 45,
  como_extraer_conclusiones_no_explicitas: 75,
  conectores_y_su_funcion_en_el_sentido_global: 20,
  funcion_poetica_del_lenguaje: 65,

  // reflexión y evaluación
  anticipacion_narrativa_o_foreshadowing: 70,
  proporcion_relativa_vs_valor_absoluto: 60,
  supuestos_no_explicitos_de_un_autor: 85,
  tipos_de_falacias_comunes: 75,
  tecnicas_de_persuasion_o_entretenimiento: 70,
  como_elaborar_una_hipotesis_de_sentido_con_informacion_fragmentaria: 90,
  diferencia_entre_hecho_y_opinion_en_contexto_argumentativo: 55,
  como_valorar_la_intencion_del_autor: 80,
  como_imaginar_situaciones_hipoteticas_a_partir_del_texto: 88,
  como_detectar_sesgo_o_parcialidad_del_autor: 78,
  como_evaluar_la_suficiencia_de_la_evidencia: 72,
  relacion_del_texto_con_el_contexto_cotidiano: 65,
  racionalizacion_de_una_creencia_previa: 85,
}

// Frecuencia real de cada patrón de trampa en los distractores de las 122
// preguntas de práctica (ver reporte.js DESCRIPCIONES_PATRON/ETIQUETAS_PATRON
// para el vocabulario compartido con Resultado.jsx). "Información no
// presente" por sí sola es casi la mitad de las 366 trampas clasificadas —
// es el eje del módulo, no una trampa más entre ocho, así que se muestra
// siempre visible en vez de detrás de un toggle (a diferencia de
// Competencias Ciudadanas).
export const TRAMPAS = [
  { patron: 'informacion_no_presente', nombre: 'Información no presente', n: 169 },
  { patron: 'inversion_causal', nombre: 'Inversión causal', n: 68 },
  { patron: 'confusion_tesis_antitesis', nombre: 'Confusión tesis/antítesis', n: 38 },
  { patron: 'enfoque_parcial', nombre: 'Enfoque parcial', n: 27 },
  { patron: 'sobreinterpretacion', nombre: 'Sobreinterpretación', n: 25 },
  { patron: 'fuera_de_alcance_pregunta', nombre: 'Fuera de alcance', n: 17 },
  { patron: 'generalizacion_indebida', nombre: 'Generalización indebida', n: 17 },
  { patron: 'confusion_figura_retorica', nombre: 'Confusión de figura', n: 5 },
]

// Deriva los pares de figuras que se confunden entre sí directamente de
// los prerrequisitos reales (no de una lista curada a mano): cualquier
// tarjeta de identificación local cuyo `subtema` contenga "_vs_" es una
// tarjeta de distinción, y sus prerrequisitos ya apuntan a los subtemas
// que hay que dominar antes. Cuando esos prerrequisitos resuelven a un
// solo subtema (ver `ironia_vs_sarcasmo`/`simbolo_vs_alegoria`: no existe
// un subtema "sarcasmo" separado, la distinción se enseña dentro de las
// propias tarjetas de "ironía"), el par se muestra como un único
// fundamento en vez de forzar dos lados que el dato no tiene.
export function paresIdentificacionLocal(tarjetas, estadosSRS, tarjetasPorId) {
  const vsCards = tarjetas.filter((t) => t.subtema.includes('_vs_'))
  return vsCards.map((vsCard) => {
    const subtemasPrereq = new Set()
    for (const id of vsCard.prereqs ?? []) {
      const previa = tarjetasPorId.get(id)
      if (previa) subtemasPrereq.add(previa.subtema)
    }
    const lados = [...subtemasPrereq].map((subtema) => {
      const tarjetasLado = tarjetas.filter((t) => t.subtema === subtema)
      return {
        subtema,
        nombre: NOMBRES_SUBTEMA[subtema] ?? subtema,
        estado: estadoDeGrupo(tarjetasLado, estadosSRS),
      }
    })
    const ambosDominados = lados.every((l) => l.estado === 'dominado')
    return {
      id: vsCard.id,
      subtema: vsCard.subtema,
      nombre: NOMBRES_SUBTEMA[vsCard.subtema] ?? vsCard.subtema,
      lados,
      esParUnico: lados.length === 1,
      disponible: estadoDeGrupo([vsCard], estadosSRS) !== 'bloqueado',
      ambosDominados,
    }
  })
}
