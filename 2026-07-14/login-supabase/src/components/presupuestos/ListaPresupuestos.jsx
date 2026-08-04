import React from 'react'
import BarraProgreso from './BarraProgreso'

export default function ListaPresupuestos({ presupuestos, onEliminar }) {
  if (presupuestos.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-gray-500 text-sm">
        No hay presupuestos registrados.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {presupuestos.map((item) => {
        const restante = Number(item.monto_limite) - Number(item.gasto_acumulado)
        
        return (
          <div key={item.id_presupuesto} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-800">{item.periodo}</h3>
                <button
                  onClick={() => onEliminar(item.id_presupuesto)}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold"
                >
                  Eliminar
                </button>
              </div>

              <BarraProgreso 
                asignado={Number(item.monto_limite)} 
                gastado={Number(item.gasto_acumulado)} 
              />
            </div>

            <div className="mt-2 text-xs text-right font-medium">
              {restante >= 0 ? (
                <span className="text-gray-500">Disponible: ${restante.toLocaleString()}</span>
              ) : (
                <span className="text-red-500">Excedido por: ${Math.abs(restante).toLocaleString()}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}