import { useState } from 'react'

function formatearMonto(valor) {
  const soloNumeros = valor.replace(/\D/g, '')
  return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function parsearMonto(valor) {
  return Number(valor.replace(/\./g, ''))
}

export default function FormularioPresupuesto({ onAgregarPresupuesto }) {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [montoTexto, setMontoTexto] = useState('')
  const [error, setError] = useState('')

  const handleMonto = (e) => setMontoTexto(formatearMonto(e.target.value))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const monto = parsearMonto(montoTexto)

    if (!fechaInicio || !fechaFin || !montoTexto || monto <= 0) {
      setError('Todos los campos son obligatorios y el monto debe ser mayor a 0.')
      return
    }
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio.')
      return
    }

    onAgregarPresupuesto({
      periodo: `${fechaInicio} al ${fechaFin}`,
      monto_limite: monto,
    })

    setFechaInicio(''); setFechaFin(''); setMontoTexto('')
  }

  return (
    <div className="card bg-dark border-info border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
      <h5 className="text-white mb-3">➕ Nuevo Presupuesto</h5>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Fecha de inicio</label>
            <input type="date" className="form-control bg-black border-secondary text-white" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Fecha de fin</label>
            <input type="date" className="form-control bg-black border-secondary text-white" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)} required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Monto límite ($)</label>
            <input type="text" inputMode="numeric" className="form-control bg-black border-secondary text-white" placeholder="Ej. 1.500.000" value={montoTexto} onChange={handleMonto} required />
          </div>
        </div>
        {fechaInicio && fechaFin && (
          <div className="mt-3 px-3 py-2 rounded" style={{ backgroundColor: '#1a2a3a', border: '1px solid #0dcaf0' }}>
            <small className="text-info">📅 Periodo: <strong>{fechaInicio}</strong> al <strong>{fechaFin}</strong></small>
          </div>
        )}
        <button type="submit" className="btn btn-info fw-bold w-100 mt-3">
          Guardar Presupuesto
        </button>
      </form>
    </div>
  )
}
