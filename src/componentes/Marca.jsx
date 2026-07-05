import './Marca.css'

// Logo "S" + texto. `grande` es el tamaño del Dashboard (32px + wordmark
// "Saber Pro" en 17px); las demás pantallas usan el logo chico (30px) con
// el título de la pantalla en 15.5px en vez del wordmark de marca.
export function Marca({ texto, grande = false }) {
  return (
    <div className={`marca${grande ? ' marca--grande' : ''}`}>
      <div className="marca-logo">S</div>
      <div className="marca-texto">{texto}</div>
    </div>
  )
}
