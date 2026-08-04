import React, { useState } from 'react'

export default function FormularioPresupuesto({ onAgregarPresupuesto }) {
  const [periodo, setPeriodo] = useState('')
  const [montoLimite, setMontoLimite] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!periodo.trim() || !montoLimite || Number(montoLimite) <= 0) return

    onAgregarPresupuesto({
      periodo: periodo.trim(),
      monto_limite: Number(montoLimite),
    })

    setPeriodo('')
    setMontoLimite('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <h2 className="text-base font-semibold mb-3 text-gray-700">Nuevo Presupuesto</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Periodo (ej. Enero 2026, Mensual)"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          placeholder="Monto límite"
          value={montoLimite}
          onChange={(e) => setMontoLimite(e.target.value)}
          className="w-full sm:w-44 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
        >
          Guardar
        </button>
      </div>
    </form>
  )
}