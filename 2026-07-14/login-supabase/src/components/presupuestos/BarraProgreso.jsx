export default function BarraProgreso({ asignado, gastado }) {
  const porcentaje = asignado > 0 ? Math.min((gastado / asignado) * 100, 100) : 0
  const excedido = gastado > asignado

  const colorBarra = excedido ? 'bg-danger' : porcentaje > 80 ? 'bg-warning' : 'bg-success'

  return (
    <div className="my-2">
      <div className="d-flex justify-content-between small fw-semibold mb-1 text-secondary">
        <span>{porcentaje.toFixed(1)}% utilizado</span>
        <span>$ {gastado.toLocaleString('es-CO')} / $ {asignado.toLocaleString('es-CO')}</span>
      </div>
      <div className="progress" style={{ height: '10px', backgroundColor: '#333' }}>
        <div
          className={`progress-bar ${colorBarra}`}
          style={{ width: `${porcentaje}%`, transition: 'width 0.3s ease' }}
        />
      </div>
    </div>
  )
}
