import { adaptersIngles } from '../modulos/ingles/adapters.js'

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
    disponible: false,
    adapters: {},
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
    disponible: false,
    adapters: {},
  },
}
