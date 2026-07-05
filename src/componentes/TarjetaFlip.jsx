import './TarjetaFlip.css'

// Flip 3D genérico (perspective + preserve-3d + backface-visibility)
// usado por la Tarjeta de Repaso. La cara oculta recibe pointer-events:none
// para que los clics no se cuelen a través de la tarjeta volteada.
export function TarjetaFlip({ volteada, onClick, frente, reverso, alturaPx = 340 }) {
  return (
    <div className="tarjeta-flip-escenario" onClick={onClick}>
      <div
        className="tarjeta-flip-interior"
        style={{ height: alturaPx, transform: volteada ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="tarjeta-flip-cara" style={{ pointerEvents: volteada ? 'none' : 'auto' }}>
          {frente}
        </div>
        <div
          className="tarjeta-flip-cara tarjeta-flip-cara--reverso"
          style={{ pointerEvents: volteada ? 'auto' : 'none' }}
        >
          {reverso}
        </div>
      </div>
    </div>
  )
}
