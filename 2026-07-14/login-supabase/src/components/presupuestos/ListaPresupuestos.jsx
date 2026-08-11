import BarraProgreso from './BarraProgreso'

export default function ListaPresupuestos({ presupuestos, onEliminar }) {
  if (presupuestos.length === 0) {
    return (
      <div className="card bg-dark border-secondary p-4 text-center text-secondary">
        No hay presupuestos registrados aún.
      </div>
    )
  }

  return (
    <div className="row g-4">
      {presupuestos.map((item) => {
        const restante = Number(item.monto_limite) - Number(item.gasto_acumulado)

        return (
          <div key={item.id_presupuesto} className="col-12 col-md-6">
            <div className="card bg-dark border-info border-opacity-25 p-4 h-100" style={{ borderRadius: '16px' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="text-white fw-bold m-0">{item.periodo}</h5>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onEliminar(item.id_presupuesto)}
                >
                  Eliminar
                </button>
              </div>

              <BarraProgreso
                asignado={Number(item.monto_limite)}
                gastado={Number(item.gasto_acumulado)}
              />

              <div className="mt-2 text-end small fw-semibold">
                {restante >= 0 ? (
                  <span className="text-success">
                    Disponible: $ {restante.toLocaleString('es-CO')}
                  </span>
                ) : (
                  <span className="text-danger">
                    Excedido por: $ {Math.abs(restante).toLocaleString('es-CO')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
