import { useState } from 'react'

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

export default function FiltroGastos({ onFiltrar }) {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    fechaInicio: '',
    fechaFin: '',
    montoMax: ''
  })

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

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label text-white fw-light small">Categoría</label>
          <select
            name="categoria"
            className="form-select bg-black border-secondary text-white"
            value={filtros.categoria}
            onChange={handleChange}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

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
