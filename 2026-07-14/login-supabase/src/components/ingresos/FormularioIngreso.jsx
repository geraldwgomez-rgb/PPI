import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const CATEGORIAS = [
  'Salario', 'Ventas', 'Freelance', 'Inversiones',
  'Arriendo', 'Préstamo recibido', 'Bonificación',
  'Herencia / Regalo', 'Dividendos', 'Otros',
]

const TIPOS = ['ORDINARIO', 'EXTRAORDINARIO', 'DIFERIDO', 'NO_OPERACIONAL']

function formatearMonto(valor) {
  const soloNumeros = valor.replace(/\D/g, '')
  return soloNumeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function parsearMonto(valor) {
  return Number(valor.replace(/\./g, ''))
}

export default function FormularioIngreso({ session, onIngresoAgregado }) {
  const [descripcion, setDescripcion] = useState('')
  const [montoTexto, setMontoTexto] = useState('')
  const [tipo, setTipo] = useState('ORDINARIO')
  const [fecha, setFecha] = useState('')
  const [categoria, setCategoria] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleMonto = (e) => setMontoTexto(formatearMonto(e.target.value))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const monto = parsearMonto(montoTexto)

    if (!descripcion || !montoTexto || !fecha || !categoria) {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (monto <= 0) {
      setError('El monto debe ser mayor a 0.')
      return
    }

    setCargando(true)
    const { error } = await supabase.from('ingresos').insert({
      descripcion, monto, tipo, fecha,
      user_id: session.user.id,
      categoria_nombre: categoria,
    })
    setCargando(false)

    if (error) { setError(error.message) }
    else {
      setDescripcion(''); setMontoTexto(''); setTipo('ORDINARIO')
      setFecha(''); setCategoria('')
      if (onIngresoAgregado) onIngresoAgregado()
    }
  }

  return (
    <div className="card bg-dark border-success border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
      <h5 className="text-white mb-3">➕ Nuevo Ingreso</h5>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label text-white fw-light">Descripción</label>
            <input type="text" className="form-control bg-black border-secondary text-white" placeholder="Ej. Salario junio, Venta producto..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label text-white fw-light">Categoría <span className="text-danger">*</span></label>
            <select className="form-select bg-black border-secondary text-white" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
              <option value="">-- Selecciona una categoría --</option>
              {CATEGORIAS.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Monto ($)</label>
            <input type="text" inputMode="numeric" className="form-control bg-black border-secondary text-white" placeholder="Ej. 2.500.000" value={montoTexto} onChange={handleMonto} required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Tipo</label>
            <select className="form-select bg-black border-secondary text-white" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Fecha</label>
            <input type="date" className="form-control bg-black border-secondary text-white" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
        </div>
        <button type="submit" className="btn btn-success fw-bold w-100 mt-4" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Añadir Ingreso'}
        </button>
      </form>
    </div>
  )
}
