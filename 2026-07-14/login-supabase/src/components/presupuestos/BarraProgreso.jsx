import React from 'react'

export default function BarraProgreso({ asignado, gastado }) {
  const porcentaje = asignado > 0 ? Math.min((gastado / asignado) * 100, 100) : 0
  const excedido = gastado > asignado

  return (
    <div className="w-full my-2">
      <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
        <span>{porcentaje.toFixed(1)}% utilizado</span>
        <span>${gastado.toLocaleString()} / ${asignado.toLocaleString()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${
            excedido ? 'bg-red-500' : porcentaje > 80 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>
    </div>
  )
}