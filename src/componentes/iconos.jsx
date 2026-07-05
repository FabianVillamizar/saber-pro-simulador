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

export function IconoSonidoMudo({ size = 17, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18">
      <path d="M2 7 H5 L9 3.5 V14.5 L5 11 H2 Z" fill={color} />
      <line x1="12" y1="7" x2="16" y2="11" stroke={color} strokeWidth="1.4" />
      <line x1="16" y1="7" x2="12" y2="11" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}
