import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { PATRON as PATRON_FORMULAS, renderizarFragmento } from './textoFragmentos.jsx'
import './TextoConReglas.css'

// Capa "Reglas en contexto" (piloto Inorgánica, ver la bitácora del
// módulo). Superset estricto de TextoConFormulas: además de `$...$`,
// `$$...$$` y `**negrita**`, reconoce el token `[[id-regla|texto visible]]`
// (o `[[id-regla]]`), lo pinta como un disparador subrayado, y al pasar el
// mouse (o tocar) abre un popover con la regla / ley / corolario / teorema
// / norma / definición que hay detrás — con matemática KaTeX.
//
// Es opt-in por módulo: sin un ReglasProvider con rulebook, un token
// `[[id|texto]]` degrada a `texto` plano y el resto se comporta
// exactamente igual que TextoConFormulas, así que sustituirlo en
// RepasoConceptos para PC/RC/Diosgenina (que no tienen rulebook) no
// cambia nada.

const PATRON_REGLAS = /(\[\[[^\]]+?\]\]|\$\$[^$]+?\$\$|\$[^$]+?\$|\*\*.+?\*\*)/g

const ETIQUETA_TIPO = {
  teorema: 'Teorema',
  ley: 'Ley',
  corolario: 'Corolario',
  regla: 'Regla',
  norma: 'Norma',
  principio: 'Principio',
  definicion: 'Definición',
}

const ContextoReglas = createContext(null)

function hoverDisponible() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches
}

// ---------- KaTeX ----------
function esc(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function katexInline(src) {
  if (!src) return { __html: '' }
  const partes = String(src).split('$')
  let out = ''
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 0) out += esc(partes[i])
    else {
      try {
        out += katex.renderToString(partes[i], { throwOnError: false, displayMode: false })
      } catch {
        out += esc(partes[i])
      }
    }
  }
  return { __html: out }
}
function katexBloque(src) {
  if (!src) return { __html: '' }
  try {
    return { __html: katex.renderToString(String(src), { throwOnError: false, displayMode: true }) }
  } catch {
    return { __html: esc(src) }
  }
}

// ---------- Provider + estado global del popover ----------
// Un solo popover abierto a la vez en toda la pantalla; hover previsualiza
// en desktop, clic/tap fija, clic-fuera y Esc cierran. `abierta` guarda
// { key, pinned, phase: 'in' | 'out' } — la fase 'out' mantiene el nodo
// montado ~170 ms para la animación de salida.
export function ReglasProvider({ reglas, children }) {
  const reglasPorId = useMemo(() => {
    const m = new Map()
    for (const r of reglas ?? []) m.set(r.id, r)
    return m
  }, [reglas])

  const [abierta, setAbierta] = useState(null)
  const abiertaRef = useRef(null)
  useEffect(() => {
    abiertaRef.current = abierta
  }, [abierta])

  const timers = useRef({ show: null, hide: null, dead: null })
  useEffect(() => {
    const t = timers.current
    return () => {
      clearTimeout(t.show)
      clearTimeout(t.hide)
      clearTimeout(t.dead)
    }
  }, [])

  const cerrar = useCallback(() => {
    clearTimeout(timers.current.show)
    clearTimeout(timers.current.hide)
    setAbierta((cur) => (!cur || cur.phase === 'out' ? cur : { ...cur, phase: 'out' }))
    clearTimeout(timers.current.dead)
    timers.current.dead = setTimeout(() => {
      setAbierta((cur) => (cur && cur.phase === 'out' ? null : cur))
    }, 170)
  }, [])

  const abrir = useCallback((key, pinned) => {
    clearTimeout(timers.current.dead)
    setAbierta({ key, pinned, phase: 'in' })
  }, [])

  const hoverEnter = useCallback(
    (key) => {
      if (!hoverDisponible()) return
      clearTimeout(timers.current.hide)
      const cur = abiertaRef.current
      if (cur && cur.key === key && cur.phase === 'in') return
      clearTimeout(timers.current.show)
      timers.current.show = setTimeout(() => abrir(key, false), 90)
    },
    [abrir],
  )

  const hoverLeave = useCallback(
    (key) => {
      clearTimeout(timers.current.show)
      const cur = abiertaRef.current
      if (!cur || cur.pinned || cur.key !== key) return
      clearTimeout(timers.current.hide)
      timers.current.hide = setTimeout(cerrar, 150)
    },
    [cerrar],
  )

  const fijar = useCallback(
    (key) => {
      clearTimeout(timers.current.show)
      clearTimeout(timers.current.hide)
      const cur = abiertaRef.current
      if (cur && cur.key === key && cur.pinned && cur.phase === 'in') {
        cerrar()
      } else {
        abrir(key, true)
      }
    },
    [abrir, cerrar],
  )

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') cerrar()
    }
    function onDown(e) {
      const t = e.target
      if (t && t.closest && (t.closest('[data-pop]') || t.closest('[data-trig]'))) return
      cerrar()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown, true)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown, true)
    }
  }, [cerrar])

  const valor = useMemo(
    () => ({ reglasPorId, abierta, hoverEnter, hoverLeave, fijar, cerrar }),
    [reglasPorId, abierta, hoverEnter, hoverLeave, fijar, cerrar],
  )

  return <ContextoReglas.Provider value={valor}>{children}</ContextoReglas.Provider>
}

// ---------- posicionamiento del popover ----------
// El popover se monta en un portal a <body> con `position: fixed`, para
// escapar el `overflow: hidden` de la hoja de cuaderno (`.qr-sheet`) y de
// cualquier otro ancestro recortante. La lógica de anclaje sigue el
// `place()` de la maqueta de Claude Design (Vistas HTML/Quiz Rápido -
// Reglas.dc.html), adaptada a coordenadas de viewport:
//   1) debajo del disparador (por defecto);
//   2) volteado hacia arriba, si no cabe debajo y sí cabe mejor arriba;
//   3) max-height + scroll interno, si no entra completo por ningún lado.
// El borde izquierdo nunca cruza el margen rojo de la hoja
// (`[data-reglas-margin]`); el derecho deja 12 px de aire contra la hoja.
function posicionar(wrap, anchor) {
  if (!wrap || !anchor) return
  const card = wrap.querySelector('[data-card]')
  const caret = wrap.querySelector('[data-caret]')
  if (!card) return

  card.style.maxHeight = ''
  card.style.overflowY = ''
  wrap.style.left = '0px'
  wrap.style.top = '0px'

  const t = anchor.getBoundingClientRect()
  const boundsEl = anchor.closest('[data-reglas-bounds]')
  const b = boundsEl
    ? boundsEl.getBoundingClientRect()
    : { left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight }
  const marginEl = boundsEl && boundsEl.querySelector('[data-reglas-margin]')
  const leftLimit = Math.max(8, (marginEl ? marginEl.getBoundingClientRect().right : b.left) + 6)
  const rightLimit = Math.min(window.innerWidth - 8, b.right - 12)

  const cardW = card.offsetWidth
  const gap = 11

  let left = t.left - 10
  if (left + cardW > rightLimit) left = rightLimit - cardW
  if (left < leftLimit) left = leftLimit

  const cardH = card.scrollHeight
  const roomAbajo = window.innerHeight - 8 - t.bottom
  const roomArriba = t.top - 8
  const flip = cardH + gap > roomAbajo && roomArriba > roomAbajo
  const room = flip ? roomArriba : roomAbajo
  if (cardH + gap > room) {
    card.style.maxHeight = Math.round(Math.max(room - gap - 4, 140)) + 'px'
    card.style.overflowY = 'auto'
  }

  const alturaReal = Math.min(cardH, room - gap - 4 > 140 ? room - gap - 4 : cardH)
  const top = flip ? Math.max(8, t.top - gap - alturaReal) : t.bottom + gap

  wrap.style.left = Math.round(left) + 'px'
  wrap.style.top = Math.round(top) + 'px'
  const origenX = Math.round(t.left + t.width / 2 - left)
  wrap.style.transformOrigin = `${origenX}px ${flip ? 'bottom' : 'top'}`

  if (caret) {
    const cx = Math.max(12, Math.min(cardW - 21, t.left + t.width / 2 - left - 4.5))
    caret.style.left = Math.round(cx) + 'px'
    if (flip) {
      caret.style.top = 'auto'
      caret.style.bottom = '-4px'
      caret.dataset.lado = 'abajo'
    } else {
      caret.style.top = '-4px'
      caret.style.bottom = 'auto'
      caret.dataset.lado = 'arriba'
    }
  }
}

// ---------- popover ----------
function ReglaPopover({ regla, anchor, pinned, saliendo, onCerrar }) {
  const wrapRef = useRef(null)
  const desarrollo = regla.variante === 'desarrollo'

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || !anchor) return
    let raf = 0
    const reposicionar = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => posicionar(wrap, anchor))
    }
    reposicionar()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(reposicionar) : null
    ro?.observe(wrap)
    window.addEventListener('resize', reposicionar)
    window.addEventListener('scroll', reposicionar, true)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reposicionar)
    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', reposicionar)
      window.removeEventListener('scroll', reposicionar, true)
    }
  }, [regla, desarrollo, anchor])

  const tabla = desarrollo ? regla.tabla : null

  // Portal a <body>: `.qr-sheet` tiene `overflow: hidden` (para la espiral
  // y los renglones), así que un popover posicionado dentro de la hoja se
  // recorta. Fuera del <p>/<div> de la app, además, ya no hay problema de
  // <div> dentro de <p>. Todo el subárbol queda igual como <span> para no
  // depender de eso.
  return createPortal(
    <span
      ref={wrapRef}
      data-pop
      className={`rc-pop-wrap${saliendo ? ' rc-pop-wrap--saliendo' : ''}`}
    >
      <span data-card className="rc-pop" data-tipo={regla.tipo}>
        <span className="rc-pop-cabecera">
          <span className="rc-pop-badge">{ETIQUETA_TIPO[regla.tipo] ?? regla.tipo}</span>
          {pinned && <span className="rc-pop-fijado" title="fijado" aria-hidden="true" />}
          {desarrollo && onCerrar && (
            <button type="button" className="rc-pop-cerrar" aria-label="cerrar" onClick={onCerrar}>
              ×
            </button>
          )}
        </span>
        <span className="rc-pop-titulo" dangerouslySetInnerHTML={katexInline(regla.titulo)} />
        <span className="rc-pop-cuerpo" dangerouslySetInnerHTML={katexInline(regla.cuerpo)} />
        {desarrollo && regla.formula && (
          <span className="rc-pop-formula" dangerouslySetInnerHTML={katexBloque(regla.formula)} />
        )}
        {tabla && (
          <span className="rc-pop-tabla-bloque">
            {tabla.titulo && <span className="rc-pop-tabla-titulo">{tabla.titulo}</span>}
            <span className="rc-pop-tabla-scroll">
              <span className="rc-pop-tabla">
                <span className="rc-pop-tr rc-pop-tr--cabecera">
                  {(tabla.encabezados ?? []).map((celda, i) => (
                    <span key={i} className="rc-pop-th" dangerouslySetInnerHTML={katexInline(celda)} />
                  ))}
                </span>
                {(tabla.filas ?? []).map((fila, i) => (
                  <span key={i} className="rc-pop-tr">
                    {fila.map((celda, j) => (
                      <span key={j} className="rc-pop-td" dangerouslySetInnerHTML={katexInline(celda)} />
                    ))}
                  </span>
                ))}
              </span>
            </span>
          </span>
        )}
        {regla.ejemplo && (
          <span className="rc-pop-ejemplo">
            <span className="rc-pop-ejemplo-marca">ej.</span>
            <span dangerouslySetInnerHTML={katexInline(regla.ejemplo)} />
          </span>
        )}
      </span>
      <span data-caret className="rc-pop-caret" data-lado="arriba" />
    </span>,
    document.body,
  )
}

// ---------- disparador ----------
function DisparadorRegla({ regla, texto, clave }) {
  const ctx = useContext(ContextoReglas)
  const { abierta, hoverEnter, hoverLeave, fijar, cerrar } = ctx
  const anclaRef = useRef(null)
  const activa = abierta && abierta.key === clave
  const visible = activa && abierta.phase === 'in'
  const saliendo = activa && abierta.phase === 'out'
  const fijada = !!(activa && abierta.pinned)

  return (
    <span
      ref={anclaRef}
      className={`rc-disp${fijada ? ' rc-disp--fijada' : ''}${visible ? ' rc-disp--activa' : ''}`}
      data-trig
      data-tipo={regla.tipo}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'touch') hoverEnter(clave)
      }}
      onPointerLeave={() => hoverLeave(clave)}
      onClick={(e) => {
        if (e.target.closest && e.target.closest('[data-pop]')) return
        fijar(clave)
      }}
    >
      {texto}
      <span className="rc-disp-punto" aria-hidden="true">
        ●
      </span>
      {(visible || saliendo) && (
        <ReglaPopover
          regla={regla}
          anchor={anclaRef.current}
          pinned={fijada}
          saliendo={saliendo}
          onCerrar={cerrar}
        />
      )}
    </span>
  )
}

// ---------- token ----------
// `[[id-regla|texto visible]]` o `[[id-regla]]`
function parsearToken(fragmento) {
  const interior = fragmento.slice(2, -2)
  const barra = interior.indexOf('|')
  if (barra === -1) return { id: interior.trim(), texto: interior.trim() }
  return { id: interior.slice(0, barra).trim(), texto: interior.slice(barra + 1).trim() }
}

function renderizarParrafo(parrafo, prefijo, reglasPorId, uid) {
  return parrafo
    .split(PATRON_REGLAS)
    .filter((p) => p !== '')
    .map((frag, i) => {
      const clave = `${prefijo}-${i}`
      if (frag.startsWith('[[') && frag.endsWith(']]')) {
        const { id, texto } = parsearToken(frag)
        const regla = reglasPorId && reglasPorId.get(id)
        if (regla) return <DisparadorRegla key={clave} regla={regla} texto={texto} clave={`${uid}-${clave}`} />
        return <span key={clave}>{texto}</span>
      }
      return renderizarFragmento(frag, clave)
    })
}

export function TextoConReglas({ texto }) {
  const ctx = useContext(ContextoReglas)
  const uid = useId()
  if (!texto) return null

  // Sin provider (o sin rulebook): degradar a exactamente TextoConFormulas
  // — se ignora `[[...]]` como token y se muestra el texto visible.
  const reglasPorId = ctx?.reglasPorId ?? null

  const parrafos = texto.split(/\n{2,}/)
  if (parrafos.length === 1) return renderizarParrafo(texto, 'p0', reglasPorId, uid)
  return parrafos.map((parrafo, i) => (
    <p key={i} style={{ margin: i === 0 ? 0 : '0.7em 0 0' }}>
      {renderizarParrafo(parrafo, `p${i}`, reglasPorId, uid)}
    </p>
  ))
}

// Reexport para call sites que solo quieren el patrón combinado.
export { PATRON_REGLAS, PATRON_FORMULAS }
