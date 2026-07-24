import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProductosPage({ session }) {
  const [productos, setProductos] = useState([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerProductos()
  }, [])

  async function obtenerProductos() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('user_id', session.user.id)
    if (error) console.error(error)
    else setProductos(data)
  }

  async function guardarProducto(e) {
    e.preventDefault()
    setError('')
    setCargando(true)

    if (editandoId) {
      // UPDATE
      const { error } = await supabase
        .from('productos')
        .update({ nombre, descripcion })
        .eq('id', editandoId)
      if (error) { setError(error.message) }
      else { setEditandoId(null); setNombre(''); setDescripcion(''); obtenerProductos() }
    } else {
      // INSERT
      const { error } = await supabase
        .from('productos')
        .insert({ nombre, descripcion, user_id: session.user.id })
      if (error) { setError(error.message) }
      else { setNombre(''); setDescripcion(''); obtenerProductos() }
    }

    setCargando(false)
  }

  function editarProducto(p) {
    setEditandoId(p.id)
    setNombre(p.nombre)
    setDescripcion(p.descripcion || '')
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setNombre('')
    setDescripcion('')
    setError('')
  }

  async function eliminarProducto(id) {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este producto?')
    if (!confirmar) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (error) console.error(error)
    else obtenerProductos()
  }

  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">Mis Productos</h2>

      <div className="card bg-dark border-info border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
        <h5 className="text-white mb-3">{editandoId ? '✏️ Editar producto' : '➕ Nuevo producto'}</h5>
        <form onSubmit={guardarProducto}>
          <div className="mb-3">
            <label className="form-label text-white fw-light">Nombre</label>
            <input
              type="text"
              className="form-control bg-black border-secondary text-white"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-white fw-light">Descripción</label>
            <input
              type="text"
              className="form-control bg-black border-secondary text-white"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-info fw-bold" disabled={cargando}>
              {cargando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Agregar producto'}
            </button>
            {editandoId && (
              <button type="button" className="btn btn-secondary" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <ul className="list-group">
        {productos.length === 0 && (
          <p className="text-secondary">No tienes productos aún.</p>
        )}
        {productos.map((p) => (
          <li key={p.id} className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
            <span><strong>{p.nombre}</strong> — {p.descripcion}</span>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-info btn-sm" onClick={() => editarProducto(p)}>
                Editar
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarProducto(p.id)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
