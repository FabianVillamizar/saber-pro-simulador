import { useRef, useState } from 'react'
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
// corrido con línea por línea, en vez de tarjetas SRS sueltas.
//
// El audio real de Assimil es UN archivo por lección completa (no hay
// clips separados por línea), así que el reproductor es único para toda
// la lección en vez de un botón ▶ por línea — no hay forma de saber en
// qué segundo exacto empieza cada línea sin timestamps reales.
const LECCION = {
  numero: 2,
  audio: 'audio/frances/leccion-02.mp3',
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
        { isWord: true, w: 'Deux' }, { isNote: true, w: 'cafés', n: 2 }, { isWord: true, w: 'et' }, { isWord: true, w: 'deux' },
        { isWord: true, w: 'croissants,' }, { isNote: true, w: "s'il vous plaît", n: 3 }, { isWord: true, w: '?' },
      ],
      fonetica: '[duh ka-fay ay duh krwa-sahn, seel voo play]',
    },
    {
      tokens: [
        { isWord: true, w: 'Non,' }, { isWord: true, w: 'je' }, { isWord: true, w: 'préfère' }, { isWord: true, w: 'une' },
        { isWord: true, w: 'tartine' }, { isNote: true, w: 'beurrée', n: 4 }, { isWord: true, w: 'pour' }, { isWord: true, w: 'le' },
        { isNote: true, w: 'petit-déjeuner', n: 5 }, { isWord: true, w: '.' },
      ],
      fonetica: '[non, zhuh pray-fair ewn tar-teen buh-ray poor luh puh-tee day-zhuh-nay]',
    },
    {
      tokens: [
        { isWord: true, w: 'Donc,' }, { isLiaison: true, w1: 'deux', w2: 'expressos,' }, { isWord: true, w: 'un' },
        { isWord: true, w: 'croissant' }, { isWord: true, w: 'et' }, { isWord: true, w: 'une' }, { isNote: true, w: 'tartine', n: 6 }, { isWord: true, w: '?' },
      ],
      fonetica: '[dohnk duh-zex-pres-so, uhn krwa-sahn ay ewn tar-teen]',
    },
    {
      tokens: [
        { isWord: true, w: 'Oui,' }, { isWord: true, w: "c'est" }, { isWord: true, w: 'ça.' }, { isWord: true, w: 'Le' },
        { isWord: true, w: 'croissant' }, { isWord: true, w: 'est' }, { isWord: true, w: 'pour' }, { isWord: true, w: 'moi' },
        { isWord: true, w: 'et' }, { isWord: true, w: 'la' }, { isWord: true, w: 'tartine' }, { isWord: true, w: 'pour' }, { isWord: true, w: 'elle.' },
      ],
      fonetica: '[wee say sa. luh krwa-sahn ay poor mwah ay la tar-teen poor el]',
    },
  ],
  pronunciacionNotas: [
    'La "s" final de un sustantivo casi nunca se pronuncia, así que el plural suena igual que el singular. Lo mismo pasa con la "x" final de deux y la "z" final de désirez: quedan mudas — [duh] y [day-zee-ray].',
    'La liaison en deux_expressos: la "x" se enlaza con la vocal siguiente y suena como una "z" — [duh-zex-pres-so].',
    '"est" (es/está) y "et" (y) se pronuncian exactamente igual — [ay].',
  ],
  notas: [
    { numero: 1, headword: 'vous désirez', texto: 'así de simple se pregunta en un café o restaurante — la forma afirmativa con entonación ascendente, sin invertir el orden de las palabras.' },
    { numero: 2, headword: 'un café', texto: 'es tanto la bebida (un café) como el lugar donde se toma (una cafetería). Si pides "un café" en Francia, te traerán un expresso solo, sin leche — también llamado un expresso o un express.' },
    { numero: 3, headword: "s'il vous plaît", texto: '"por favor" — a pesar de su traducción literal tan formal, es una expresión de lo más cotidiana.' },
    { numero: 4, headword: 'beurrée', texto: 'viene de le beurre (mantequilla) y concuerda en género con tartine (femenino) — por eso lleva la -e extra. Más sobre la concordancia más adelante.' },
    { numero: 5, headword: 'petit-déjeuner', texto: 'literalmente "pequeño almuerzo" — le déjeuner solo es el almuerzo.' },
    { numero: 6, headword: 'une tartine', texto: 'todos los sustantivos franceses tienen género, masculino (un/le) o femenino (una/la) — apréndelo junto con cada palabra nueva. El francés tampoco distingue "un/uno" como artículo de "un" como número, así que un café puede significar "un café" o "un solo café" según el contexto.' },
  ],
  traduccion: [
    '— Caballero, señora, ¿qué desean?',
    '— Dos cafés y dos croissants, por favor.',
    '— No, prefiero una tostada con mantequilla para el desayuno.',
    '— Entonces, ¿dos expressos, un croissant y una tostada?',
    '— Sí, eso es. El croissant es para mí y la tostada para ella.',
  ],
}

function formatoTiempo(segundos) {
  if (!Number.isFinite(segundos)) return '0:00'
  const m = Math.floor(segundos / 60)
  const s = Math.floor(segundos % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function LeccionCompleta({ perfil, onCambiarPerfil, onVolver }) {
  const { dark, toggle } = useTheme()
  const leyenda = useLeyendaFrances(true)
  const [traduccionAbierta, setTraduccionAbierta] = useState(false)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [tiempoActual, setTiempoActual] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const audioRef = useRef(null)

  function alternarReproduccion() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play()
    else audio.pause()
  }

  function buscar(evento) {
    const audio = audioRef.current
    if (!audio || !duracion) return
    const rect = evento.currentTarget.getBoundingClientRect()
    const fraccion = Math.min(1, Math.max(0, (evento.clientX - rect.left) / rect.width))
    audio.currentTime = fraccion * duracion
  }

  const numFr = numeroFrances(LECCION.numero)
  const audioUrl = `${import.meta.env.BASE_URL}${LECCION.audio}`
  const progreso = duracion ? (tiempoActual / duracion) * 100 : 0

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

          <div className="leccion-completa-audio-bar">
            <button
              type="button"
              className={`leccion-completa-play${reproduciendo ? ' leccion-completa-play--activo' : ''}`}
              onClick={alternarReproduccion}
            >
              {reproduciendo ? <IconoPausa size={10} color="var(--fr-accent)" /> : <IconoPlay size={9} color="var(--fr-accent)" />}
            </button>
            <div className="leccion-completa-audio-progreso" onClick={buscar}>
              <div className="leccion-completa-audio-progreso-relleno" style={{ width: `${progreso}%` }} />
            </div>
            <div className="leccion-completa-audio-tiempo">
              {formatoTiempo(tiempoActual)} / {formatoTiempo(duracion)}
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              onPlay={() => setReproduciendo(true)}
              onPause={() => setReproduciendo(false)}
              onEnded={() => setReproduciendo(false)}
              onLoadedMetadata={(evento) => setDuracion(evento.currentTarget.duration)}
              onTimeUpdate={(evento) => setTiempoActual(evento.currentTarget.currentTime)}
            />
          </div>

          <div className="leccion-completa-lineas">
            {LECCION.lineas.map((linea, i) => (
              <div key={i} className="leccion-completa-linea">
                <div className="leccion-completa-linea-contenido">
                  <FraseConTokens tokens={linea.tokens} tamano={16} />
                  <div className="leccion-completa-linea-fonetica">{linea.fonetica}</div>
                </div>
              </div>
            ))}
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
