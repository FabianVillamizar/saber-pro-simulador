import { useEffect, useState } from 'react'
import { leerJSON, escribirJSON } from '../engine/storage.js'
import { IconoPlay, IconoBurbuja, IconoDocumento } from './iconos.jsx'
import './LeyendaFrances.css'

const CLAVE_VISTA = 'frances:leyenda-vista'

// Se auto-abre una sola vez por dispositivo (no por perfil — es un
// componente de ayuda, no de datos de usuario, ver README de diseño) la
// primera vez que se monta en cualquier pantalla de francés, salvo que ya
// se haya marcado "No volver a mostrar". El botón "?" de cada pantalla
// reabre el mismo modal manualmente en cualquier momento.
// `activo` deja el hook seguro de llamar siempre (regla de hooks) incluso
// en pantallas compartidas con otros módulos — RepasoConceptos.jsx la usa
// para todos los módulos pero solo debe auto-abrirse en francés.
export function useLeyendaFrances(activo = true) {
  const [abierta, setAbierta] = useState(false)

  useEffect(() => {
    if (activo && !leerJSON(CLAVE_VISTA, false)) setAbierta(true)
  }, [activo])

  return {
    abierta,
    abrir: () => setAbierta(true),
    cerrar: (noVolverAMostrar) => {
      if (noVolverAMostrar) escribirJSON(CLAVE_VISTA, true)
      setAbierta(false)
    },
  }
}

export function LeyendaFrances({ abierta, onCerrar }) {
  const [noVolverAMostrar, setNoVolverAMostrar] = useState(false)

  if (!abierta) return null

  return (
    <div className="leyenda-fr-overlay" onClick={() => onCerrar(noVolverAMostrar)}>
      <div className="leyenda-fr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="leyenda-fr-titulo">Cómo leer las tarjetas</div>
        <div className="leyenda-fr-sub">El código visual del método Assimil, explicado una vez.</div>

        <div className="leyenda-fr-filas">
          <div className="leyenda-fr-fila">
            <div className="leyenda-fr-icono">
              <span className="leyenda-fr-liaison-demo">
                a<span style={{ display: 'inline-block', width: 4 }} />b
                <svg width="20" height="9" viewBox="0 0 20 9" className="leyenda-fr-liaison-arco">
                  <path d="M2 2 Q10 9 18 2" fill="none" stroke="var(--fr-accent)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </div>
            <div className="leyenda-fr-texto">
              El <b>trazo curvo</b> bajo dos palabras marca una <b>liaison</b>: se pronuncian como una sola palabra.
            </div>
          </div>

          <div className="leyenda-fr-fila">
            <div className="leyenda-fr-icono">
              <span className="leyenda-fr-num-demo">1</span>
            </div>
            <div className="leyenda-fr-texto">
              Un <b>número en círculo</b> remite a la nota con esa misma numeración, más abajo.
            </div>
          </div>

          <div className="leyenda-fr-fila">
            <div className="leyenda-fr-icono">
              <span className="leyenda-fr-negrita-demo">Aa</span>
            </div>
            <div className="leyenda-fr-texto">
              <b>Negrita</b> = la palabra o frase francesa que se está enseñando en ese punto.
            </div>
          </div>

          <div className="leyenda-fr-fila">
            <div className="leyenda-fr-icono">
              <span className="leyenda-fr-cursiva-demo">Aa</span>
            </div>
            <div className="leyenda-fr-texto">
              Un párrafo entero en <b className="leyenda-fr-cursiva-demo-inline">cursiva cálida</b> es una nota de cultura e historia.
            </div>
          </div>

          <div className="leyenda-fr-fila">
            <div className="leyenda-fr-iconos-seccion">
              <span className="leyenda-fr-circulo-seccion">
                <IconoPlay size={8} color="white" />
              </span>
              <span className="leyenda-fr-circulo-seccion">
                <IconoBurbuja size={11} color="white" />
              </span>
              <span className="leyenda-fr-circulo-seccion">
                <IconoDocumento size={10} color="white" />
              </span>
              <span className="leyenda-fr-cuadro-fin" />
            </div>
            <div className="leyenda-fr-texto">
              Íconos de sección: <b>diálogo</b>, <b>pronunciación</b>, <b>notas</b>, y un cuadrito que cierra el bloque.
            </div>
          </div>
        </div>

        <label className="leyenda-fr-checkbox">
          <input
            type="checkbox"
            checked={noVolverAMostrar}
            onChange={(e) => setNoVolverAMostrar(e.target.checked)}
          />
          <span>No volver a mostrar</span>
        </label>

        <button type="button" className="leyenda-fr-boton" onClick={() => onCerrar(noVolverAMostrar)}>
          Entendido
        </button>
      </div>
    </div>
  )
}
