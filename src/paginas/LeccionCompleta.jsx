import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme.js'
import { numeroFrances } from '../engine/numerosFrances.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { FraseConTokens } from '../componentes/FraseConTokens.jsx'
import { LeyendaFrances, useLeyendaFrances } from '../componentes/LeyendaFrances.jsx'
import { IconoChevronIzquierdo, IconoPlay, IconoPausa, IconoBurbuja, IconoDocumento } from '../componentes/iconos.jsx'
import '../estilos/frances.css'
import './LeccionCompleta.css'

// Lección 2 real del libro (Le café), transcrita del PDF fuente — mismo
// contenido que las tarjetas FR-L02-* del repaso, pero aquí como diálogo
// corrido con línea por línea, en vez de tarjetas SRS sueltas. Sin audio
// real conectado todavía (decisión ya tomada con el usuario: "audio
// después") — el botón ▶ simula 1.8s de reproducción con un pulso, igual
// que el mockup de Claude Design. Cuando se conecte el audio real de
// Assimil, este es el punto exacto donde entra un <audio> por línea.
const LECCION = {
  numero: 2,
  tituloFr: 'Le café',
  tituloEs: 'El café',
  lineas: [
    {
      tokens: [
        { isWord: true, w: 'Monsieur,' }, { isWord: true, w: 'madame,' }, { isWord: true, w: 'vous' }, { isNote: true, w: 'désirez', n: 1 }, { isWord: true, w: '?' },
      ],
      fonetica: '[muh-syuh ma-dam, voo day-zee-ray]',
    },
    {
      tokens: [
        { isWord: true, w: 'Deux' }, { isWord: true, w: 'cafés' }, { isWord: true, w: 'et' }, { isWord: true, w: 'deux' },
        { isWord: true, w: 'croissants,' }, { isNote: true, w: "s'il vous plaît", n: 2 }, { isWord: true, w: '?' },
      ],
      fonetica: '[duh ka-fay ay duh krwa-sahn, seel voo play]',
    },
    {
      tokens: [
        { isWord: true, w: 'Non,' }, { isWord: true, w: 'je' }, { isWord: true, w: 'préfère' }, { isWord: true, w: 'une' },
        { isWord: true, w: 'tartine' }, { isWord: true, w: 'beurrée' }, { isWord: true, w: 'pour' }, { isWord: true, w: 'le' },
        { isNote: true, w: 'petit-déjeuner', n: 3 }, { isWord: true, w: '.' },
      ],
      fonetica: '[non, zhuh pray-fair ewn tar-teen buh-ray poor luh puh-tee day-zhuh-nay]',
    },
  ],
  pronunciacionNotas: [
    'expressos se pronuncia con e cerrada, sin acentuar la "o" final: [ex-sprɛ-so], no [es-pre-so].',
    'La liaison en des_expressos, deux_expressos: la "s" final se enlaza con la vocal siguiente y suena [z].',
  ],
  notas: [
    { numero: 1, headword: 'vous désirez', texto: 'así de simple se pregunta en un café o restaurante — la forma afirmativa con entonación ascendente, sin invertir el orden de las palabras.' },
    { numero: 2, headword: "s'il vous plaît", texto: '"por favor" — a pesar de su traducción literal tan formal, es una expresión de lo más cotidiana.' },
    { numero: 3, headword: 'petit-déjeuner', texto: 'literalmente "pequeño almuerzo" — le déjeuner solo es el almuerzo.' },
  ],
  traduccion: [
    '— Caballero, señora, ¿qué desean?',
    '— Dos cafés y dos croissants, por favor.',
    '— No, prefiero una tostada con mantequilla para el desayuno.',
  ],
}

const DURACION_SIMULACION_MS = 1800

export function LeccionCompleta({ perfil, onCambiarPerfil, onVolver }) {
  const { dark, toggle } = useTheme()
  const leyenda = useLeyendaFrances(true)
  const [playingIndex, setPlayingIndex] = useState(null)
  const [traduccionAbierta, setTraduccionAbierta] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function reproducir(i) {
    clearTimeout(timeoutRef.current)
    setPlayingIndex(i)
    timeoutRef.current = setTimeout(() => setPlayingIndex(null), DURACION_SIMULACION_MS)
  }

  const numFr = numeroFrances(LECCION.numero)

  return (
    <div className="leccion-completa">
      <div className="leccion-completa-topbar">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="leccion-completa-num">L{LECCION.numero}</div>
        <div className="leccion-completa-titulos">
          <div className="leccion-completa-titulo-fr">{LECCION.tituloFr}</div>
          <div className="leccion-completa-titulo-es">{LECCION.tituloEs}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div className="leccion-completa-contador">Lección {LECCION.numero} de 49</div>
        <button type="button" className="boton-icono repaso-boton-ayuda-fr" onClick={leyenda.abrir}>
          ?
        </button>
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="leccion-completa-cuerpo">
        <section>
          <div className="leccion-completa-seccion-titulo">
            <span className="leccion-completa-icono-seccion">
              <IconoPlay size={9} color="white" />
            </span>
            Diálogo
          </div>

          <div className="leccion-completa-lineas">
            {LECCION.lineas.map((linea, i) => {
              const playing = playingIndex === i
              return (
                <div key={i} className={`leccion-completa-linea${playing ? ' leccion-completa-linea--activa' : ''}`}>
                  <button
                    type="button"
                    className={`leccion-completa-play${playing ? ' leccion-completa-play--activo' : ''}`}
                    onClick={() => reproducir(i)}
                  >
                    {playing ? <IconoPausa size={10} color="var(--fr-accent)" /> : <IconoPlay size={9} color="var(--fr-accent)" />}
                  </button>
                  <div className="leccion-completa-linea-contenido">
                    <FraseConTokens tokens={linea.tokens} tamano={16} />
                    <div className="leccion-completa-linea-fonetica">{linea.fonetica}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="leccion-completa-fin-bloque">
            <span className="leccion-completa-cuadro-fin" />
          </div>
        </section>

        <section>
          <div className="leccion-completa-seccion-titulo">
            <span className="leccion-completa-icono-seccion">
              <IconoBurbuja size={13} color="white" />
            </span>
            Pronunciación
          </div>
          <div className="leccion-completa-caja">
            {LECCION.pronunciacionNotas.map((texto, i) => (
              <div key={i} className="leccion-completa-caja-linea">
                {texto}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="leccion-completa-seccion-titulo">
            <span className="leccion-completa-icono-seccion">
              <IconoDocumento size={11} color="white" />
            </span>
            Notas
          </div>
          <div className="leccion-completa-notas">
            {LECCION.notas.map((nota) => (
              <div key={nota.numero} className="leccion-completa-nota">
                <span className="leccion-completa-nota-num">{nota.numero}</span>
                <div className="leccion-completa-nota-texto">
                  <b>{nota.headword}</b> — {nota.texto}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <button type="button" className="leccion-completa-boton-traduccion" onClick={() => setTraduccionAbierta((v) => !v)}>
            {traduccionAbierta ? 'Ocultar traducción completa' : 'Ver traducción completa'}
          </button>
          {traduccionAbierta && (
            <div className="leccion-completa-caja" style={{ marginTop: 12 }}>
              {LECCION.traduccion.map((linea, i) => (
                <div key={i} className="leccion-completa-caja-linea">
                  {linea}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="leccion-completa-pie">
          <div className="leccion-completa-pie-num">{LECCION.numero}</div>
          <div className="leccion-completa-pie-palabra">
            {numFr.palabra} {numFr.fonetica}
          </div>
        </div>
      </div>

      <LeyendaFrances abierta={leyenda.abierta} onCerrar={leyenda.cerrar} />
    </div>
  )
}
