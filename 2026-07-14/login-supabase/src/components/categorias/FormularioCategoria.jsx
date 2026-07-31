import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function FormularioCategoria({ onCategoriaGuardada, categoriaEditar, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [tipoMovimiento, setTipoMovimiento] = useState('GASTO')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Si viene una categoría a editar, llenamos el formulario
  useEffect(() => {
    if (categoriaEditar) {
      setNombre(categoriaEditar.nombre)
      setTipoMovimiento(categoriaEditar.tipo_movimiento)
    } else {
      setNombre('')
      setTipoMovimiento('GASTO')
    }
  }, [categoriaEditar])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('El nombre de la categoría es obligatorio.')
      return
    }

    setCargando(true)

    if (categoriaEditar) {
      // UPDATE
      const { error } = await supabase
        .from('categoria')
        .update({ nombre, tipo_movimiento: tipoMovimiento })
        .eq('id_categoria', categoriaEditar.id_categoria)
      if (error) { setError(error.message) }
      else {
        setNombre('')
        setTipoMovimiento('GASTO')
        if (onCategoriaGuardada) onCategoriaGuardada()
      }
    } else {
      // INSERT
      const { error } = await supabase
        .from('categoria')
        .insert({ nombre, tipo_movimiento: tipoMovimiento })
      if (error) { setError(error.message) }
      else {
        setNombre('')
        setTipoMovimiento('GASTO')
        if (onCategoriaGuardada) onCategoriaGuardada()
      }
    }

    setCargando(false)
  }

  return (
    <div className="card bg-dark border-info border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
      <h5 className="text-white mb-3">
        {categoriaEditar ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}
      </h5>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-white fw-light">Nombre</label>
          <input
            type="text"
            className="form-control bg-black border-secondary text-white"
            placeholder="Ej. Alimentación, Transporte..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label text-white fw-light">Tipo de movimiento</label>
          <select
            className="form-select bg-black border-secondary text-white"
            value={tipoMovimiento}
            onChange={(e) => setTipoMovimiento(e.target.value)}
          >
            <option value="GASTO">Gasto</option>
            <option value="INGRESO">Ingreso</option>
            <option value="AMBOS">Ambos</option>
          </select>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-info fw-bold" disabled={cargando}>
            {cargando ? 'Guardando...' : categoriaEditar ? 'Guardar cambios' : 'Agregar categoría'}
          </button>
          {categoriaEditar && (
            <button type="button" className="btn btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
