// Estructura curricular del "Mapa del Conocimiento" de Química — un
// proyecto aparte del Saber Pro (igual que Français o Diosgenina), para
// aprender química completa (las 8 ramas de una carrera) organizada por
// qué explica qué, no por materia. Ver bitácora del proyecto para el
// prompt de diseño completo.
//
// A diferencia de cualquier otro módulo de esta app, ninguna de estas
// tarjetas existe todavía — esto es la hoja de ruta curricular, decidida
// ahora para poder generar contenido real después dentro de una
// estructura ya pensada, no una lista de tarjetas ya construidas. Por eso
// cada unidad trae `estado: 'sin_construir'` en vez de un número de
// tarjetas o un porcentaje de dominio: mostrar cifras específicas (como
// "62 tarjetas" o "48% dominado") sin que exista ni una sola tarjeta real
// sería inventar un dato oficial-sonante, el mismo error que este proyecto
// ya decidió no cometer en el Resultado del Saber Pro.

export const RAMAS = [
  { key: 'cuantica', nombre: 'Cuántica', hue: 285 },
  { key: 'inorganica', nombre: 'Inorgánica', hue: 250 },
  { key: 'organica', nombre: 'Orgánica', hue: 205 },
  { key: 'fisicoquimica', nombre: 'Fisicoquímica', hue: 175 },
  { key: 'analitica', nombre: 'Analítica', hue: 145 },
  { key: 'bioquimica', nombre: 'Bioquímica', hue: 95 },
  { key: 'ambiental', nombre: 'Ambiental', hue: 55 },
  { key: 'materiales', nombre: 'Materiales', hue: 25 },
]

// Los 5 "estratos causales": no son niveles de dificultad sino niveles de
// explicación — cada uno responde por qué ocurre lo del estrato de
// arriba. El nivel 1 (cuántica) es la raíz: nada de lo que explica se
// deriva de otra rama. `nodos` son ejemplos representativos de qué tipo de
// pregunta viviría en ese estrato, no un índice completo de contenido.
export const ESTRATOS = [
  {
    nivel: 5,
    pregunta: '¿Qué significa este dato que acabo de medir?',
    meta: 'Instrumento y señal',
    ramas: ['analitica', 'ambiental', 'fisicoquimica'],
    nodos: [
      { nombre: 'Por qué un pico se ensancha en cromatografía', ramaKey: 'analitica', requiere: 'Difusión y transporte' },
      { nombre: 'Qué distingue ruido de señal en espectroscopía', ramaKey: 'analitica', requiere: 'Transiciones electrónicas' },
      { nombre: 'Cuándo un blanco de reactivo invalida la curva', ramaKey: 'analitica' },
      { nombre: 'Qué mide realmente un electrodo selectivo', ramaKey: 'ambiental', requiere: 'Equilibrio iónico' },
    ],
  },
  {
    nivel: 4,
    pregunta: '¿Por qué esta reacción sigue este camino y no otro?',
    meta: 'Mecanismo y catálisis',
    ramas: ['organica', 'bioquimica', 'inorganica'],
    nodos: [
      { nombre: 'Catálisis enzimática: por qué baja la barrera', ramaKey: 'bioquimica', requiere: 'Energía de activación' },
      { nombre: 'Control cinético vs. termodinámico', ramaKey: 'organica', explica: 'qué producto predomina' },
      { nombre: 'Efecto del disolvente sobre SN1 y SN2', ramaKey: 'organica', explica: 'la velocidad observada' },
      { nombre: 'Ciclos catalíticos en metales de transición', ramaKey: 'inorganica', requiere: 'Campo cristalino' },
    ],
  },
  {
    nivel: 3,
    pregunta: '¿Hacia dónde tiende el sistema y a qué velocidad?',
    meta: 'Energía, equilibrio y cinética',
    ramas: ['fisicoquimica', 'bioquimica'],
    nodos: [
      { nombre: 'Energía de activación y su medición', ramaKey: 'fisicoquimica', explica: 'la catálisis enzimática' },
      { nombre: 'Entropía como conteo de microestados', ramaKey: 'fisicoquimica', explica: 'la espontaneidad' },
      { nombre: 'Energía libre y espontaneidad', ramaKey: 'fisicoquimica', explica: 'el equilibrio químico' },
      { nombre: 'Acoplamiento energético en metabolismo', ramaKey: 'bioquimica', requiere: 'Energía libre' },
    ],
  },
  {
    nivel: 2,
    pregunta: '¿Por qué esta sustancia reacciona así?',
    meta: 'Estructura y reactividad',
    ramas: ['organica', 'inorganica'],
    nodos: [
      { nombre: 'Electronegatividad y polaridad de enlace', ramaKey: 'inorganica', explica: 'la solubilidad y los mecanismos' },
      { nombre: 'Efectos inductivo y resonante', ramaKey: 'organica', explica: 'la acidez relativa' },
      { nombre: 'Impedimento estérico', ramaKey: 'organica', explica: 'la ruta del mecanismo' },
      { nombre: 'Teoría de campo cristalino', ramaKey: 'inorganica', explica: 'el color y el magnetismo' },
    ],
  },
  {
    nivel: 1,
    pregunta: '¿Por qué existen los enlaces?',
    meta: 'Estructura electrónica',
    ramas: ['cuantica'],
    nodos: [
      { nombre: 'Orbitales atómicos y números cuánticos', ramaKey: 'cuantica', explica: 'la forma de los enlaces' },
      { nombre: 'Solapamiento y orbitales moleculares', ramaKey: 'cuantica', explica: 'la reactividad' },
      { nombre: 'Transiciones electrónicas', ramaKey: 'cuantica', explica: 'lo que ve el espectrómetro' },
      { nombre: 'Aproximación de Born-Oppenheimer', ramaKey: 'cuantica' },
    ],
  },
]

// Detalle por rama: pregunta rectora, descripción, y las unidades
// intermedias propuestas (4-5 por rama) con qué explica cada una y su
// dependencia cruzada real hacia otra rama, cuando la hay. `modos` son las
// categorías de razonamiento que tendrá cada unidad (predecir/diagnosticar/
// evaluar/interpretar, el mismo espíritu de las 60 tarjetas ya construidas
// de química ICFES) — sin conteo, porque no hay tarjetas escritas todavía.
export const UNIDADES_POR_RAMA = {
  cuantica: {
    preguntaRectora: '¿Por qué los átomos se unen y por qué solo de ciertas formas?',
    descripcion:
      'La raíz de todas las cadenas del mapa: aquí se justifica lo que las demás ramas usan como regla dada. Nada de lo que explica se puede derivar de otra rama.',
    unidades: [
      { nombre: 'Orbitales y números cuánticos', explica: 'Por qué los electrones solo ocupan ciertas regiones y no cualquiera.', modos: ['Interpretar', 'Predecir', 'Evaluar', 'Diagnosticar'] },
      { nombre: 'Orbitales moleculares', explica: 'Por qué un enlace estabiliza al conjunto y otro lo desestabiliza.', modos: ['Predecir', 'Interpretar', 'Evaluar', 'Diagnosticar'], depUnidad: 'Orbitales y números cuánticos', depRamaKey: 'cuantica' },
      { nombre: 'Transiciones electrónicas', explica: 'Por qué una sustancia absorbe justo ese color y no otro.', modos: ['Interpretar', 'Predecir', 'Diagnosticar', 'Evaluar'], depUnidad: 'Orbitales moleculares', depRamaKey: 'cuantica' },
      { nombre: 'Aproximaciones y sus límites', explica: 'Cuándo un modelo deja de ser válido y qué error introduce asumirlo.', modos: ['Evaluar', 'Diagnosticar', 'Interpretar', 'Predecir'] },
    ],
  },
  inorganica: {
    preguntaRectora: '¿Por qué esta sal es azul, esta otra paramagnética, y aquella insoluble?',
    descripcion:
      'La rama donde la estructura electrónica se vuelve propiedad observable. Casi todo lo que aquí se predice se justifica una capa más abajo, en cuántica.',
    unidades: [
      { nombre: 'Enlace iónico y covalente', explica: 'Por qué un compuesto conduce fundido y otro ni siquiera se disuelve.', modos: ['Predecir', 'Interpretar', 'Evaluar', 'Diagnosticar'], depUnidad: 'Orbitales moleculares', depRamaKey: 'cuantica' },
      { nombre: 'Campo cristalino y complejos', explica: 'El color y el magnetismo de un complejo a partir de su geometría.', modos: ['Predecir', 'Interpretar', 'Evaluar', 'Diagnosticar'], depUnidad: 'Transiciones electrónicas', depRamaKey: 'cuantica' },
      { nombre: 'Periodicidad y tendencias', explica: 'Por qué una propiedad crece en un grupo y decrece en el periodo.', modos: ['Predecir', 'Evaluar', 'Interpretar', 'Diagnosticar'] },
      { nombre: 'Sólidos y redes', explica: 'Por qué el defecto en una red cambia el comportamiento del material entero.', modos: ['Interpretar', 'Predecir', 'Diagnosticar', 'Evaluar'], depUnidad: 'Enlace iónico y covalente', depRamaKey: 'inorganica' },
      { nombre: 'Química de coordinación aplicada', explica: 'Por qué un ligando desplaza a otro y para qué sirve eso.', modos: ['Predecir', 'Evaluar', 'Diagnosticar', 'Interpretar'], depUnidad: 'Campo cristalino y complejos', depRamaKey: 'inorganica' },
    ],
  },
  organica: {
    preguntaRectora: '¿Por qué esta molécula reacciona por aquí y no por allá?',
    descripcion:
      'La rama más mecanicista: casi ninguna unidad pide recordar una reacción, piden justificar por qué el electrón se mueve en esa dirección.',
    unidades: [
      { nombre: 'Estructura y efectos electrónicos', explica: 'Por qué un ácido es más fuerte que otro casi idéntico.', modos: ['Predecir', 'Evaluar', 'Interpretar', 'Diagnosticar'], depUnidad: 'Orbitales moleculares', depRamaKey: 'cuantica' },
      { nombre: 'Estereoquímica', explica: 'Por qué dos moléculas con la misma fórmula hacen cosas distintas.', modos: ['Interpretar', 'Predecir', 'Diagnosticar', 'Evaluar'] },
      { nombre: 'Mecanismos de sustitución y eliminación', explica: 'Por qué cambiar el disolvente cambia el producto mayoritario.', modos: ['Predecir', 'Diagnosticar', 'Evaluar', 'Interpretar'], depUnidad: 'Cinética química', depRamaKey: 'fisicoquimica' },
      { nombre: 'Adición y química del carbonilo', explica: 'Por qué el mismo reactivo ataca a un carbonilo y no a un alqueno.', modos: ['Predecir', 'Interpretar', 'Diagnosticar', 'Evaluar'], depUnidad: 'Estructura y efectos electrónicos', depRamaKey: 'organica' },
      { nombre: 'Aromaticidad y sistemas conjugados', explica: 'Por qué un anillo resiste lo que una cadena equivalente no.', modos: ['Evaluar', 'Predecir', 'Interpretar', 'Diagnosticar'], depUnidad: 'Orbitales moleculares', depRamaKey: 'cuantica' },
    ],
  },
  fisicoquimica: {
    preguntaRectora: '¿Hacia dónde tiende un sistema, por qué, y qué tan rápido llega?',
    descripcion:
      'El puente del mapa: casi todas las cadenas causales de las otras ramas pasan por aquí. Nada de lo que explica es exclusivo suyo.',
    unidades: [
      { nombre: 'Termodinámica química', explica: 'Por qué una reacción ocurre sola y otra necesita que la empujes.', modos: ['Predecir', 'Evaluar', 'Interpretar', 'Diagnosticar'] },
      { nombre: 'Cinética química', explica: 'Por qué algo termodinámicamente favorable puede tardar años en pasar.', modos: ['Predecir', 'Diagnosticar', 'Interpretar', 'Evaluar'], depUnidad: 'Orbitales moleculares', depRamaKey: 'cuantica' },
      { nombre: 'Equilibrio y actividad', explica: 'Por qué la concentración deja de cambiar sin que la reacción se detenga.', modos: ['Predecir', 'Interpretar', 'Evaluar', 'Diagnosticar'] },
      { nombre: 'Electroquímica', explica: 'Cómo una diferencia de potencial se convierte en reacción y al revés.', modos: ['Predecir', 'Diagnosticar', 'Interpretar', 'Evaluar'], depUnidad: 'Termodinámica química', depRamaKey: 'fisicoquimica' },
      { nombre: 'Fenómenos de superficie', explica: 'Por qué lo que pasa en la interfase no sigue las reglas del seno del fluido.', modos: ['Interpretar', 'Predecir', 'Diagnosticar', 'Evaluar'], depUnidad: 'Equilibrio y actividad', depRamaKey: 'fisicoquimica' },
    ],
  },
  analitica: {
    preguntaRectora: '¿Qué me está diciendo realmente este instrumento, y cuánto puedo confiar en ello?',
    descripcion:
      'La rama que cierra el ciclo: convierte lo que las otras explican en un número medible. Su dificultad no es operar el equipo sino saber cuándo el número miente.',
    unidades: [
      { nombre: 'Separaciones y cromatografía', explica: 'Por qué dos sustancias salen en tiempos distintos y por qué el pico se ensancha.', modos: ['Diagnosticar', 'Interpretar', 'Predecir', 'Evaluar'], depUnidad: 'Fenómenos de superficie', depRamaKey: 'fisicoquimica' },
      { nombre: 'Espectroscopía', explica: 'Qué transición genera cada señal y qué la ensancha o desplaza.', modos: ['Interpretar', 'Diagnosticar', 'Evaluar', 'Predecir'], depUnidad: 'Transiciones electrónicas', depRamaKey: 'cuantica' },
      { nombre: 'Calibración y validación', explica: 'Por qué una curva perfecta puede dar un resultado sistemáticamente falso.', modos: ['Evaluar', 'Diagnosticar', 'Interpretar', 'Predecir'] },
      { nombre: 'Métodos electroquímicos', explica: 'Qué mide un electrodo y qué interferencia lo desvía.', modos: ['Diagnosticar', 'Interpretar', 'Evaluar', 'Predecir'], depUnidad: 'Electroquímica', depRamaKey: 'fisicoquimica' },
      { nombre: 'Tratamiento de error e incertidumbre', explica: 'Cuántas cifras de un resultado son reales y cuántas son decoración.', modos: ['Evaluar', 'Diagnosticar', 'Interpretar', 'Predecir'] },
    ],
  },
  bioquimica: {
    preguntaRectora: '¿Cómo logra una célula hacer en segundos lo que en el laboratorio tarda días?',
    descripcion:
      'La rama más dependiente del mapa: casi ninguna de sus explicaciones se sostiene sin la fisicoquímica que hay debajo.',
    unidades: [
      { nombre: 'Estructura de proteínas', explica: 'Por qué la secuencia determina la forma y la forma determina la función.', modos: ['Interpretar', 'Predecir', 'Evaluar', 'Diagnosticar'], depUnidad: 'Estructura y efectos electrónicos', depRamaKey: 'organica' },
      { nombre: 'Catálisis enzimática', explica: 'Cómo se baja una barrera energética sin cambiar el equilibrio.', modos: ['Predecir', 'Diagnosticar', 'Evaluar', 'Interpretar'], depUnidad: 'Cinética química', depRamaKey: 'fisicoquimica' },
      { nombre: 'Metabolismo y acoplamiento', explica: 'Cómo una reacción desfavorable se paga con otra que sí lo es.', modos: ['Predecir', 'Interpretar', 'Evaluar', 'Diagnosticar'], depUnidad: 'Termodinámica química', depRamaKey: 'fisicoquimica' },
      { nombre: 'Membranas y transporte', explica: 'Por qué algo cruza una membrana en contra de su gradiente.', modos: ['Predecir', 'Interpretar', 'Diagnosticar', 'Evaluar'], depUnidad: 'Equilibrio y actividad', depRamaKey: 'fisicoquimica' },
      { nombre: 'Ácidos nucleicos e información', explica: 'Cómo una secuencia química se comporta como instrucción.', modos: ['Interpretar', 'Evaluar', 'Predecir', 'Diagnosticar'] },
    ],
  },
  ambiental: {
    preguntaRectora: '¿Qué le pasa a esta sustancia una vez que sale al mundo real?',
    descripcion:
      'La rama donde los sistemas dejan de ser ideales: multifase, abiertos y con escalas de tiempo que van del segundo al siglo.',
    unidades: [
      { nombre: 'Equilibrio iónico en aguas naturales', explica: 'Por qué el pH de un río no se mueve aunque le caiga ácido.', modos: ['Predecir', 'Interpretar', 'Evaluar', 'Diagnosticar'], depUnidad: 'Equilibrio y actividad', depRamaKey: 'fisicoquimica' },
      { nombre: 'Química atmosférica', explica: 'Por qué un gas traza controla la química de toda una capa.', modos: ['Predecir', 'Interpretar', 'Evaluar', 'Diagnosticar'], depUnidad: 'Cinética química', depRamaKey: 'fisicoquimica' },
      { nombre: 'Transporte y destino de contaminantes', explica: 'Por qué algo se acumula en el sedimento y no en el agua.', modos: ['Predecir', 'Evaluar', 'Interpretar', 'Diagnosticar'], depUnidad: 'Fenómenos de superficie', depRamaKey: 'fisicoquimica' },
      { nombre: 'Escalas de tiempo y reversibilidad', explica: 'Por qué un daño de días tarda décadas en revertirse.', modos: ['Evaluar', 'Predecir', 'Interpretar', 'Diagnosticar'] },
    ],
  },
  materiales: {
    preguntaRectora: '¿Por qué este material se comporta distinto de la suma de sus componentes?',
    descripcion:
      'La rama más pequeña y la más transversal: todo lo que explica emerge de la escala, no de la composición.',
    unidades: [
      { nombre: 'Estructura cristalina y defectos', explica: 'Por qué una impureza en partes por millón cambia todo el material.', modos: ['Interpretar', 'Predecir', 'Diagnosticar', 'Evaluar'], depUnidad: 'Sólidos y redes', depRamaKey: 'inorganica' },
      { nombre: 'Polímeros', explica: 'Por qué la misma cadena da un plástico rígido o uno elástico.', modos: ['Predecir', 'Interpretar', 'Evaluar', 'Diagnosticar'], depUnidad: 'Estereoquímica', depRamaKey: 'organica' },
      { nombre: 'Nanomateriales y efectos de escala', explica: 'Por qué el oro deja de ser dorado cuando es suficientemente pequeño.', modos: ['Interpretar', 'Predecir', 'Evaluar', 'Diagnosticar'], depUnidad: 'Transiciones electrónicas', depRamaKey: 'cuantica' },
      { nombre: 'Caracterización de materiales', explica: 'Qué te dice —y qué no— un área superficial medida por BET.', modos: ['Diagnosticar', 'Evaluar', 'Interpretar', 'Predecir'], depUnidad: 'Fenómenos de superficie', depRamaKey: 'fisicoquimica' },
    ],
  },
}
