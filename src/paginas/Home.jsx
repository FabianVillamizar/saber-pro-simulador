import { useEffect, useState } from 'react'
import { listarModulos } from '../engine/loadModulos.js'
import { useModulo } from '../hooks/useModulo.js'
import { useTheme } from '../hooks/useTheme.js'
import { leerJSON } from '../engine/storage.js'
import { calcularRacha, calcularRachaMasLarga, leerProgreso } from '../engine/progreso.js'
import { diferenciaDias, fechaDesdeClave, FECHA_EXAMEN } from '../engine/fecha.js'
import { claveSRS } from '../engine/clavesPerfil.js'
import { estaLista } from '../engine/srs.js'
import { calcularDominio } from '../engine/dominio.js'
import { ThemeToggle } from '../componentes/ThemeToggle.jsx'
import { SelectorPerfil } from '../componentes/SelectorPerfil.jsx'
import { PanelProgreso } from '../componentes/PanelProgreso.jsx'
import { Marca } from '../componentes/Marca.jsx'
import { Heatmap } from '../componentes/Heatmap.jsx'
import { AnilloProgreso } from '../componentes/AnilloProgreso.jsx'
import { IconoCalendario, IconoFlechaDerecha, IconoEngranaje } from '../componentes/iconos.jsx'
import './Home.css'

function etiquetaRelativa(clave) {
  if (!clave) return null
  const dias = diferenciaDias(fechaDesdeClave(clave), new Date())
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  return `hace ${dias} días`
}

function ultimaRevisionDe(estadosSRS) {
  const fechas = Object.values(estadosSRS)
    .map((e) => e.ultimaRevision)
    .filter(Boolean)
    .sort()
  return fechas.at(-1) ?? null
}

export function Home({ perfil, onCambiarPerfil, onAbrirModulo, onIrADirecto, onIrAAjustes }) {
  const { dark, toggle } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { modulo: ingles } = useModulo('ingles')

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  const progreso = leerProgreso(perfil.id)
  const streakCount = calcularRacha(progreso)
  const bestStreak = calcularRachaMasLarga(progreso)
  const daysToExam = diferenciaDias(new Date(), FECHA_EXAMEN)

  const estadosSRS = leerJSON(claveSRS(perfil.id, 'ingles'), {})
  const dominioIngles = ingles ? calcularDominio(ingles.tarjetasConcepto, estadosSRS) : null
  const pendientesIngles = ingles
    ? ingles.tarjetasConcepto.filter((t) => estaLista(estadosSRS[t.id])).length
    : 0
  const ultimaRevision = etiquetaRelativa(ultimaRevisionDe(estadosSRS))

  const modulos = listarModulos()
  const disponibles = modulos.filter((m) => m.disponible)
  const overallAvg = disponibles.length
    ? Math.round(
        disponibles.reduce((suma, m) => suma + (m.id === 'ingles' ? (dominioIngles?.pct ?? 0) : 0), 0) /
          disponibles.length
      )
    : 0

  const hayPendientes = pendientesIngles > 0
  const totalTarjetasIngles = ingles?.tarjetasConcepto.length ?? 0
  const ctaProgresoPct = totalTarjetasIngles
    ? Math.round(((totalTarjetasIngles - pendientesIngles) / totalTarjetasIngles) * 100)
    : 0

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <Marca texto="Saber Pro" grande />
        <div className="dashboard-header-derecha">
          <div className="dashboard-chip">
            <IconoCalendario color="var(--text-sub)" />
            {daysToExam} días para el examen
          </div>
          <button type="button" className="boton-icono" onClick={onIrAAjustes} title="Ajustes" aria-label="Ajustes">
            <IconoEngranaje color="var(--text-sub)" />
          </button>
          <SelectorPerfil perfil={perfil} onClick={onCambiarPerfil} />
          <ThemeToggle dark={dark} onToggle={toggle} />
        </div>
      </header>

      <div className="dashboard-saludo">
        <h1>Hola, {perfil.nombre}</h1>
        <p>Sigue así — cada tarjeta cuenta para el 6 de septiembre.</p>
      </div>

      <div
        className="dashboard-mount"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(10px)' }}
      >
        <section className="tarjeta-racha">
          <div className="tarjeta-racha-numero">
            <div className="tarjeta-racha-cifra">{streakCount}</div>
            <div className="tarjeta-racha-etiqueta">{streakCount === 1 ? 'día seguido' : 'días seguidos'} de estudio</div>
            <div className="tarjeta-racha-mejor">Racha más larga: {bestStreak} días</div>
          </div>
          <div className="tarjeta-racha-heatmap">
            <Heatmap progreso={progreso} />
          </div>
        </section>

        {ingles && (
          <section className={`cta-continuar${hayPendientes ? '' : ' cta-continuar--aldia'}`}>
            <div>
              <div className="cta-eyebrow">{hayPendientes ? 'Continúa donde quedaste' : 'Vas al día'}</div>
              <div className="cta-titulo">Inglés · Repaso de tarjetas</div>
              <div className="cta-meta">
                {hayPendientes
                  ? `${pendientesIngles} tarjeta${pendientesIngles === 1 ? '' : 's'} lista${pendientesIngles === 1 ? '' : 's'} para repasar hoy`
                  : 'No tienes tarjetas pendientes — practica una parte para reforzar'}
              </div>
              <div className="cta-barra">
                <div className="cta-barra-relleno" style={{ width: `${ctaProgresoPct}%` }} />
              </div>
            </div>
            <button
              type="button"
              className="cta-boton"
              onClick={() => onIrADirecto(hayPendientes ? 'repaso' : 'practica-parte', 'ingles')}
            >
              {hayPendientes ? 'Continuar estudiando' : 'Practicar por parte'}
              <IconoFlechaDerecha size={15} color="#fff" />
            </button>
          </section>
        )}

        <div className="dashboard-modulos-header">
          <div className="dashboard-modulos-titulo">Tus módulos</div>
          <div className="dashboard-modulos-avg">{overallAvg}% promedio general</div>
        </div>

        <div className="dashboard-modulos-grid">
          {modulos.map((m) => {
            const esIngles = m.id === 'ingles'
            const pct = esIngles ? (dominioIngles?.pct ?? 0) : 0
            return (
              <article
                key={m.id}
                className={`modulo-tarjeta${m.disponible ? '' : ' modulo-tarjeta--bloqueada'}`}
                onClick={() => m.disponible && onAbrirModulo(m.id)}
              >
                <div className="modulo-tarjeta-monograma">{m.monograma}</div>
                <div className="modulo-tarjeta-info">
                  <div className="modulo-tarjeta-nombre">{m.nombre}</div>
                  <div className="modulo-tarjeta-meta">
                    {m.disponible
                      ? `${dominioIngles?.hechas ?? 0}/${dominioIngles?.total ?? 0} tarjetas${ultimaRevision ? ` · ${ultimaRevision}` : ''}`
                      : 'Próximamente'}
                  </div>
                </div>
                {m.disponible && <AnilloProgreso porcentaje={pct} />}
              </article>
            )
          })}
        </div>

        <PanelProgreso />
      </div>
    </div>
  )
}
