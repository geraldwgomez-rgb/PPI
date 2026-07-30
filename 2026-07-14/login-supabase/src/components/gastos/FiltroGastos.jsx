import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function FiltroGastos({ onFiltrar }) {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    fechaInicio: '',
    fechaFin: '',
    montoMax: ''
  })
  const [categorias, setCategorias] = useState([])

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

  const handleChange = (e) => {
    const { name, value } = e.target
    const nuevosFiltros = { ...filtros, [name]: value }
    setFiltros(nuevosFiltros)
    if (onFiltrar) onFiltrar(nuevosFiltros)
  }

  const handleReset = () => {
    const filtrosLimpios = {
      busqueda: '',
      categoria: '',
      fechaInicio: '',
      fechaFin: '',
      montoMax: ''
    }
    setFiltros(filtrosLimpios)
    if (onFiltrar) onFiltrar(filtrosLimpios)
  }

  return (
    <div className="card bg-dark border-secondary p-4 mb-4" style={{ borderRadius: '16px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-white m-0">🔍 Filtrar Gastos</h5>
        <button type="button" className="btn btn-link text-info small p-0" onClick={handleReset}>
          Limpiar filtros
        </button>
      </div>

      <div className="row g-3">

        {/* Búsqueda */}
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label text-white fw-light small">Buscar concepto</label>
          <input
            type="text"
            name="busqueda"
            className="form-control bg-black border-secondary text-white"
            placeholder="Ej: Mercado, Netflix..."
            value={filtros.busqueda}
            onChange={handleChange}
          />
        </div>

        {/* Categoría */}
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label text-white fw-light small">Categoría</label>
          <select
            name="categoria"
            className="form-select bg-black border-secondary text-white"
            value={filtros.categoria}
            onChange={handleChange}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label text-white fw-light small">Fecha desde</label>
          <input
            type="date"
            name="fechaInicio"
            className="form-control bg-black border-secondary text-white"
            value={filtros.fechaInicio}
            onChange={handleChange}
          />
        </div>

        {/* Fecha hasta */}
        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label text-white fw-light small">Fecha hasta</label>
          <input
            type="date"
            name="fechaFin"
            className="form-control bg-black border-secondary text-white"
            value={filtros.fechaFin}
            onChange={handleChange}
          />
        </div>

        {/* Monto máximo */}
        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label text-white fw-light small">Monto máximo ($)</label>
          <input
            type="number"
            name="montoMax"
            className="form-control bg-black border-secondary text-white"
            placeholder="Ej: 500000"
            value={filtros.montoMax}
            onChange={handleChange}
          />
        </div>

      </div>
    </div>
  )
}
