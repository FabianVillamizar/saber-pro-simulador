import { useEffect, useState } from 'react'
import { leerJSON, escribirJSON } from '../engine/storage.js'

function preferenciaSistemaOscura() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  const [dark, setDark] = useState(() => leerJSON('tema-oscuro', null) ?? preferenciaSistemaOscura())

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    escribirJSON('tema-oscuro', dark)
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}
