import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Productos({ session }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Formulario (creación / edición)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [editingId, setEditingId] = useState(null) // null = creando, id = editando

  const cargarProductos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setProductos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const limpiarFormulario = () => {
    setNombre('')
    setDescripcion('')
    setPrecio('')
    setEditingId(null)
  }

  // CREATE y UPDATE usan el mismo formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (editingId) {
      // UPDATE
      const { error } = await supabase
        .from('productos')
        .update({ nombre, descripcion, precio: Number(precio) })
        .eq('id', editingId)

      if (error) {
        setErrorMsg(error.message)
        return
      }
    } else {
      // CREATE
      const { error } = await supabase.from('productos').insert({
        nombre,
        descripcion,
        precio: Number(precio),
        user_id: session.user.id,
      })

      if (error) {
        setErrorMsg(error.message)
        return
      }
    }

    limpiarFormulario()
    cargarProductos()
  }

  const handleEditar = (producto) => {
    setEditingId(producto.id)
    setNombre(producto.nombre)
    setDescripcion(producto.descripcion || '')
    setPrecio(producto.precio)
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este producto?')
    if (!confirmar) return

    const { error } = await supabase.from('productos').delete().eq('id', id)

    if (error) {
      setErrorMsg(error.message)
      return
    }
    cargarProductos()
  }

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <h2>Mis Productos</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descripción</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div>
          <label>Precio</label>
          <input
            type="number"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>

        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        <button type="submit">
          {editingId ? 'Guardar cambios' : 'Crear producto'}
        </button>
        {editingId && (
          <button type="button" onClick={limpiarFormulario}>
            Cancelar edición
          </button>
        )}
      </form>

      {loading ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>Aún no tienes productos registrados.</p>
      ) : (
        <table width="100%" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th align="left">Nombre</th>
              <th align="left">Descripción</th>
              <th align="left">Precio</th>
              <th align="left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{p.nombre}</td>
                <td>{p.descripcion}</td>
                <td>${Number(p.precio).toFixed(2)}</td>
                <td>
                  <button onClick={() => handleEditar(p)}>Editar</button>{' '}
                  <button onClick={() => handleEliminar(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}