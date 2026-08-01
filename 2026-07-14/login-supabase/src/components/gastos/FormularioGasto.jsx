import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const CATEGORIAS = [
  'Alimentación',
  'Arriendo / Vivienda',
  'Servicios públicos',
  'Transporte',
  'Salud',
  'Educación',
  'Ropa y calzado',
  'Entretenimiento / Ocio',
  'Tecnología',
  'Deudas / Créditos',
  'Ahorro',
  'Inversiones',
  'Mascotas',
  'Belleza / Cuidado personal',
  'Otros',
]

export default function FormularioGasto({ session, onGastoAgregado }) {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [tipo, setTipo] = useState('FIJO')
  const [fecha, setFecha] = useState('')
  const [categoria, setCategoria] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!descripcion || !monto || !fecha || !categoria) {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (Number(monto) <= 0) {
      setError('El monto debe ser mayor a 0.')
      return
    }

    setCargando(true)

    const nuevoGasto = {
      descripcion,
      monto: Number(monto),
      tipo,
      fecha,
      user_id: session.user.id,
      categoria_nombre: categoria,
      id_categoria: null,
    }

    const { error } = await supabase.from('gastos').insert(nuevoGasto)
    setCargando(false)

    if (error) {
      setError(error.message)
    } else {
      setDescripcion('')
      setMonto('')
      setTipo('FIJO')
      setFecha('')
      setCategoria('')
      if (onGastoAgregado) onGastoAgregado()
    }
  }

  return (
    <div className="card bg-dark border-info border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
      <h5 className="text-white mb-3">➕ Nuevo Gasto</h5>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label text-white fw-light">Nombre del Gasto</label>
            <input type="text" className="form-control bg-black border-secondary text-white" placeholder="Ej. Mercado, Netflix, Arriendo..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label text-white fw-light">Categoría <span className="text-danger">*</span></label>
            <select className="form-select bg-black border-secondary text-white" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
              <option value="">-- Selecciona una categoría --</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Monto ($)</label>
            <input type="number" className="form-control bg-black border-secondary text-white" placeholder="Ej. 150000" value={monto} onChange={(e) => setMonto(e.target.value)} min="1" required />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Tipo</label>
            <select className="form-select bg-black border-secondary text-white" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="FIJO">Fijo</option>
              <option value="EXTRAORDINARIO">Extraordinario</option>
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label text-white fw-light">Fecha</label>
            <input type="date" className="form-control bg-black border-secondary text-white" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
        </div>

        <button type="submit" className="btn btn-info fw-bold w-100 mt-4" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Añadir Gasto'}
        </button>
      </form>
    </div>
  )
}
