import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function FormularioGasto({ session, onGastoAgregado }) {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [tipo, setTipo] = useState('FIJO')
  const [fecha, setFecha] = useState('')
  const [idCategoria, setIdCategoria] = useState('')
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    async function cargarCategorias() {
      const { data } = await supabase
        .from('categoria')
        .select('id_categoria, nombre')
        .in('tipo_movimiento', ['GASTO', 'AMBOS'])
      if (data) setCategorias(data)
    }
    cargarCategorias()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!descripcion || !monto || !fecha) {
      setError('Todos los campos son obligatorios y el monto debe ser mayor a 0.')
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
      cedula_usuario: session.user.email,
      id_categoria: idCategoria || null,
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
      setIdCategoria('')
      if (onGastoAgregado) onGastoAgregado()
    }
  }

  return (
    <div className="card bg-dark border-info border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
      <h5 className="text-white mb-3">➕ Nuevo Gasto</h5>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-white fw-light">Nombre del Gasto</label>
          <input type="text" className="form-control bg-black border-secondary text-white" placeholder="Ej. Mercado, Netflix, Arriendo..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label text-white fw-light">Monto ($)</label>
          <input type="number" className="form-control bg-black border-secondary text-white" placeholder="Ej. 150000" value={monto} onChange={(e) => setMonto(e.target.value)} min="1" required />
        </div>
        <div className="mb-3">
          <label className="form-label text-white fw-light">Tipo</label>
          <select className="form-select bg-black border-secondary text-white" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="FIJO">Fijo</option>
            <option value="EXTRAORDINARIO">Extraordinario</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label text-white fw-light">Categoría</label>
          <select className="form-select bg-black border-secondary text-white" value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)}>
            <option value="">-- Selecciona una categoría --</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="form-label text-white fw-light">Fecha</label>
          <input type="date" className="form-control bg-black border-secondary text-white" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-info fw-bold w-100" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Añadir Gasto'}
        </button>
      </form>
    </div>
  )
}
