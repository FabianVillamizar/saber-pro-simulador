import { useLayoutEffect, useRef, useState } from 'react'
import './TarjetaFlip.css'

const ALTURA_MINIMA = 300
// Tope de seguridad, no un límite de diseño: con esto la tarjeta crece con
// su contenido y es la página la que hace scroll normal, en vez de atrapar
// el contenido en una caja pequeña con su propio scroll interno.
const ALTURA_MAXIMA = 1600
// `.tarjeta-flip-cara` tiene `border: 1px solid` (arriba + abajo = 2px) y
// box-sizing: border-box, pero `scrollHeight` excluye el borde. Si se
// aplica esa medida tal cual como la nueva altura del contenedor, cada
// vuelta del ResizeObserver mide 2px menos que la anterior y la tarjeta se
// va achicando sin parar (esto es lo que se veía como "vibración" al
// pasar de una tarjeta grande a una pequeña). Hay que sumar de vuelta el
// borde para que la medición converja en vez de decaer.
const COMPENSACION_BORDE = 2

// Flip 3D genérico (perspective + preserve-3d + backface-visibility)
// usado por la Tarjeta de Repaso. La cara oculta recibe pointer-events:none
// para que los clics no se cuelen a través de la tarjeta volteada.
//
// La altura se mide del contenido real (scrollHeight) de ambas caras en
// vez de usar un valor fijo: con tarjetas de Pensamiento Científico (visual
// + 4 secciones en el reverso) una altura fija recortaba el contenido y
// obligaba a hacer scroll dentro de una caja pequeña. Se usa el máximo de
// las dos caras para que voltear no cambie la altura de la tarjeta, con un
// tope (ALTURA_MAXIMA) y scroll de respaldo solo para el caso extremo de
// una tarjeta excepcionalmente larga.
export function TarjetaFlip({ volteada, onClick, frente, reverso }) {
  const frenteRef = useRef(null)
  const reversoRef = useRef(null)
  const [altura, setAltura] = useState(ALTURA_MINIMA)

  useLayoutEffect(() => {
    if (!volteada) {
      if (reversoRef.current) reversoRef.current.scrollTop = 0
      if (frenteRef.current) frenteRef.current.scrollTop = 0
    }
  }, [volteada])

  useLayoutEffect(() => {
    function medir() {
      const alturaFrente = (frenteRef.current?.scrollHeight ?? 0) + COMPENSACION_BORDE
      const alturaReverso = (reversoRef.current?.scrollHeight ?? 0) + COMPENSACION_BORDE
      const necesaria = Math.min(Math.max(ALTURA_MINIMA, alturaFrente, alturaReverso), ALTURA_MAXIMA)
      // Evita un setState (y por tanto un nuevo render) cuando la altura
      // medida no cambió realmente: sin este guard, cualquier redondeo de
      // subpíxel dispararía el ResizeObserver otra vez de forma innecesaria.
      setAltura((actual) => (Math.abs(actual - necesaria) < 1 ? actual : necesaria))
    }

    medir()
    const observer = new ResizeObserver(medir)
    if (frenteRef.current) observer.observe(frenteRef.current)
    if (reversoRef.current) observer.observe(reversoRef.current)
    return () => observer.disconnect()
  }, [frente, reverso])

  return (
    <div className="tarjeta-flip-escenario" onClick={onClick}>
      <div
        className="tarjeta-flip-interior"
        style={{ height: altura, transform: volteada ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div ref={frenteRef} className="tarjeta-flip-cara" style={{ pointerEvents: volteada ? 'none' : 'auto' }}>
          {frente}
        </div>
        <div
          ref={reversoRef}
          className="tarjeta-flip-cara tarjeta-flip-cara--reverso"
          style={{ pointerEvents: volteada ? 'auto' : 'none' }}
        >
          {reverso}
        </div>
      </div>
    </div>
  )
}
