import { useState } from 'react'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { CATEGORIAS_ENSAYO, POSTURAS_ENSAYO, colorPorHue, tokenizarParrafos } from '../engine/categoriasEnsayo.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { IconoChevronIzquierdo } from '../componentes/iconos.jsx'
import './EnsayosModelo.css'

export function EnsayosModelo({ moduloId, perfil, onCambiarPerfil, onVolver }) {
  const { modulo, cargando, error } = useModulo(moduloId)
  const { dark, toggle } = useTheme()
  const [temaId, setTemaId] = useState(null)
  const [tokenActivo, setTokenActivo] = useState(null)
  const [categoriasVisibles, setCategoriasVisibles] = useState(() =>
    Object.fromEntries(Object.keys(CATEGORIAS_ENSAYO).map((k) => [k, true]))
  )

  if (cargando) return <div className="page estado-carga">Cargando…</div>
  if (error) return <div className="page estado-error">No se pudo cargar el módulo: {error.message}</div>

  const temaSeleccionadoId = temaId ?? modulo.temasEnsayo[0]?.id ?? null
  const tema = modulo.temasEnsayo.find((t) => t.id === temaSeleccionadoId) ?? null
  const modelo = modulo.ensayosModelo.find((m) => m.tema_id === temaSeleccionadoId) ?? null

  const dominioOrden = [...new Set(modulo.temasEnsayo.map((t) => t.dominio))]
  const grupos = dominioOrden.map((dominio) => ({
    dominio,
    etiqueta: modulo.dominios?.[dominio] ?? dominio,
    temas: modulo.temasEnsayo.filter((t) => t.dominio === dominio),
  }))

  const parrafos = modelo ? tokenizarParrafos(modelo.texto, modelo.anotaciones) : []
  const conteos = {}
  if (modelo) {
    for (const a of modelo.anotaciones) conteos[a.categoria] = (conteos[a.categoria] ?? 0) + 1
  }

  const postura = modelo ? POSTURAS_ENSAYO[modelo.postura] : null
  const posturaColor = postura ? colorPorHue(postura.hue, dark) : null

  return (
    <div className="page ensayos-modelo">
      <div className="barra-superior">
        <button type="button" className="boton-icono" onClick={onVolver}>
          <IconoChevronIzquierdo color="var(--text-sub)" />
        </button>
        <div className="ensayos-modelo-titulo">
          <div className="ensayos-modelo-titulo-modulo">{modulo.nombre}</div>
          <div className="ensayos-modelo-titulo-sub">Ensayos modelo</div>
        </div>
        <div style={{ flex: 1 }} />
        <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
        <ThemeToggle dark={dark} onToggle={toggle} />
      </div>

      <div className="ensayos-modelo-layout">
        <nav className="ensayos-modelo-selector">
          {grupos.map((grupo) => (
            <div key={grupo.dominio}>
              <div className="ensayos-modelo-grupo-label">{grupo.etiqueta}</div>
              <div className="ensayos-modelo-grupo-lista">
                {grupo.temas.map((t) => {
                  const tieneModelo = modulo.ensayosModelo.some((m) => m.tema_id === t.id)
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`ensayos-modelo-tema${t.id === temaSeleccionadoId ? ' ensayos-modelo-tema--activo' : ''}`}
                      onClick={() => {
                        setTemaId(t.id)
                        setTokenActivo(null)
                      }}
                    >
                      <div className="ensayos-modelo-tema-pregunta">{t.pregunta}</div>
                      {!tieneModelo && <div className="ensayos-modelo-tema-sin-modelo">Sin ensayo modelo aún</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="ensayos-modelo-cuerpo">
          {modelo ? (
            <div className="ensayos-modelo-tarjeta">
              <div className="ensayos-modelo-badges">
                <span className="ensayos-modelo-badge-postura" style={{ background: `color-mix(in oklch, ${posturaColor} ${dark ? 20 : 11}%, var(--surface))`, color: posturaColor }}>
                  {postura.label}
                </span>
                <span className="ensayos-modelo-badge-nivel">Nivel {modelo.nivel}</span>
              </div>
              <div className="ensayos-modelo-pregunta">{tema.pregunta}</div>
              <div className="ensayos-modelo-texto">
                {parrafos.map((tokens, i) => (
                  <p key={i}>
                    {tokens.map((tok, j) =>
                      tok.id === null || !categoriasVisibles[tok.categoria] ? (
                        <span key={j}>{tok.texto}</span>
                      ) : (
                        <TokenAnotado
                          key={j}
                          token={tok}
                          dark={dark}
                          activo={tokenActivo === tok.id}
                          onEnter={() => setTokenActivo(tok.id)}
                          onLeave={() => setTokenActivo((a) => (a === tok.id ? null : a))}
                          onClick={() => setTokenActivo((a) => (a === tok.id ? null : tok.id))}
                        />
                      )
                    )}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="ensayos-modelo-vacio">
              <div className="ensayos-modelo-vacio-titulo">Aún no hay un ensayo modelo para este tema</div>
              <div className="ensayos-modelo-vacio-sub">Elige otro tema de la lista para ver sus anotaciones.</div>
            </div>
          )}
        </div>

        <aside className="ensayos-modelo-leyenda">
          <div className="ensayos-modelo-grupo-label">Categorías</div>
          {Object.entries(CATEGORIAS_ENSAYO).map(([clave, def]) => (
            <label key={clave} className="ensayos-modelo-leyenda-item">
              <input
                type="checkbox"
                checked={categoriasVisibles[clave]}
                onChange={() => setCategoriasVisibles((c) => ({ ...c, [clave]: !c[clave] }))}
                style={{ accentColor: colorPorHue(def.hue, dark) }}
              />
              <span className="ensayos-modelo-leyenda-swatch" style={{ background: colorPorHue(def.hue, dark) }} />
              <span className="ensayos-modelo-leyenda-nombre">{def.label}</span>
              <span className="ensayos-modelo-leyenda-conteo">{conteos[clave] ?? 0}</span>
            </label>
          ))}
        </aside>
      </div>
    </div>
  )
}

function TokenAnotado({ token, dark, activo, onEnter, onLeave, onClick }) {
  const def = CATEGORIAS_ENSAYO[token.categoria]
  const color = colorPorHue(def.hue, dark)
  return (
    <span className="ensayos-modelo-token-envoltura">
      <span
        className="ensayos-modelo-token"
        style={{
          background: `color-mix(in oklch, ${color} ${dark ? 22 : 13}%, transparent)`,
          borderBottomColor: `color-mix(in oklch, ${color} 55%, transparent)`,
        }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        {token.texto}
      </span>
      {activo && (
        <span className="ensayos-modelo-tooltip">
          <span className="ensayos-modelo-tooltip-categoria" style={{ color }}>
            {def.label}
          </span>
          {token.nota}
        </span>
      )}
    </span>
  )
}
