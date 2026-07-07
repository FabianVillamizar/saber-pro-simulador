import './TablaDatos.css'

export function TablaDatos({ datos }) {
  if (!datos) return null
  return (
    <div className="tabla-datos-envoltura">
      <table className="tabla-datos">
        <thead>
          <tr>
            {datos.columnas.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.filas.map((fila, i) => (
            <tr key={i}>
              {fila.map((celda, j) => (
                <td key={j}>{celda}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
