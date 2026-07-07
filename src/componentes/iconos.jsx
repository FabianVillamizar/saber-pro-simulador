// Iconos de línea mínimos, construidos a mano con formas primitivas
// (círculo/rect/línea) — traducción literal de los SVG inline de los
// mockups .dc.html. `color` acepta cualquier valor CSS (incluye var(--x)).

export function IconoSol({ size = 17, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="4" fill={color} />
      <line x1="9" y1="0.5" x2="9" y2="2.5" stroke={color} strokeWidth="1.4" />
      <line x1="9" y1="15.5" x2="9" y2="17.5" stroke={color} strokeWidth="1.4" />
      <line x1="0.5" y1="9" x2="2.5" y2="9" stroke={color} strokeWidth="1.4" />
      <line x1="15.5" y1="9" x2="17.5" y2="9" stroke={color} strokeWidth="1.4" />
      <line x1="2.8" y1="2.8" x2="4.2" y2="4.2" stroke={color} strokeWidth="1.4" />
      <line x1="13.8" y1="13.8" x2="15.2" y2="15.2" stroke={color} strokeWidth="1.4" />
      <line x1="13.8" y1="4.2" x2="15.2" y2="2.8" stroke={color} strokeWidth="1.4" />
      <line x1="2.8" y1="15.2" x2="4.2" y2="13.8" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

export function IconoLuna({ size = 17, color = 'currentColor', colorRecorte = 'var(--surface)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="7" fill={color} />
      <circle cx="13" cy="5.5" r="6" fill={colorRecorte} />
    </svg>
  )
}

export function IconoReloj({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill="none" stroke={color} strokeWidth="1.4" />
      <line x1="7" y1="7" x2="7" y2="3.3" stroke={color} strokeWidth="1.4" />
      <line x1="7" y1="7" x2="9.6" y2="8.2" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

export function IconoChevronIzquierdo({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <line x1="10" y1="2" x2="4" y2="8" stroke={color} strokeWidth="1.6" />
      <line x1="4" y1="8" x2="10" y2="14" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}

export function IconoFlechaDerecha({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15">
      <line x1="2" y1="7.5" x2="12" y2="7.5" stroke={color} strokeWidth="1.6" />
      <line x1="8" y1="3.5" x2="12" y2="7.5" stroke={color} strokeWidth="1.6" />
      <line x1="8" y1="11.5" x2="12" y2="7.5" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}

export function IconoAdvertencia({ size = 18, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="8" fill={color} />
      <rect x="8.1" y="4.5" width="1.8" height="5.5" rx="0.9" fill="white" />
      <circle cx="9" cy="12.7" r="1.1" fill="white" />
    </svg>
  )
}

export function IconoBombilla({ size = 17, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="8" fill={color} />
      <circle cx="9" cy="7.6" r="3.4" fill="none" stroke="white" strokeWidth="1.3" />
      <line x1="7.6" y1="11.6" x2="10.4" y2="11.6" stroke="white" strokeWidth="1.2" />
      <line x1="7.9" y1="13.2" x2="10.1" y2="13.2" stroke="white" strokeWidth="1.1" />
      <line x1="9" y1="4.2" x2="9" y2="3.2" stroke="white" strokeWidth="1.1" />
    </svg>
  )
}

export function IconoCalendario({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
      <rect x="1" y="2.5" width="12" height="10" rx="1.5" fill="none" stroke={color} strokeWidth="1.3" />
      <line x1="1" y1="5.5" x2="13" y2="5.5" stroke={color} strokeWidth="1.3" />
    </svg>
  )
}

export function IconoFlechaCircular({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <path d="M2 7 A5 5 0 1 1 4 10.5" fill="none" stroke={color} strokeWidth="1.4" />
      <line x1="2" y1="7" x2="2" y2="3.5" stroke={color} strokeWidth="1.4" />
      <line x1="2" y1="7" x2="4.8" y2="7.4" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

export function IconoEngranaje({ size = 17, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="3" fill="none" stroke={color} strokeWidth="1.4" />
      <line x1="9" y1="1.5" x2="9" y2="3.5" stroke={color} strokeWidth="1.4" />
      <line x1="9" y1="14.5" x2="9" y2="16.5" stroke={color} strokeWidth="1.4" />
      <line x1="1.5" y1="9" x2="3.5" y2="9" stroke={color} strokeWidth="1.4" />
      <line x1="14.5" y1="9" x2="16.5" y2="9" stroke={color} strokeWidth="1.4" />
      <line x1="3.6" y1="3.6" x2="5" y2="5" stroke={color} strokeWidth="1.4" />
      <line x1="13" y1="13" x2="14.4" y2="14.4" stroke={color} strokeWidth="1.4" />
      <line x1="13" y1="5" x2="14.4" y2="3.6" stroke={color} strokeWidth="1.4" />
      <line x1="3.6" y1="14.4" x2="5" y2="13" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

export function IconoSonido({ size = 17, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18">
      <path d="M2 7 H5 L9 3.5 V14.5 L5 11 H2 Z" fill={color} />
      <path d="M12 6.5 A4 4 0 0 1 12 11.5" fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}

export function IconoCheck({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <path
        d="M2.5 7.2 L5.5 10.2 L11.5 3.8"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconoX({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <line x1="3" y1="3" x2="11" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="11" y1="3" x2="3" y2="11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconoImagen({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <rect x="1.5" y="3" width="17" height="14" rx="2.5" fill="none" stroke={color} strokeWidth="1.4" />
      <circle cx="6.5" cy="8" r="1.6" fill="none" stroke={color} strokeWidth="1.3" />
      <path d="M2.5 14.5 L7.5 10 L11 12.8 L14 9.5 L17.5 13.5" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconoSonidoMudo({ size = 17, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18">
      <path d="M2 7 H5 L9 3.5 V14.5 L5 11 H2 Z" fill={color} />
      <line x1="12" y1="7" x2="16" y2="11" stroke={color} strokeWidth="1.4" />
      <line x1="16" y1="7" x2="12" y2="11" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}
