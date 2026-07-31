import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ListaCategorias({ recargar, onEditar }) {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerCategorias()
  }, [recargar])

  async function obtenerCategorias() {
    setCargando(true)
    const { data, error } = await supabase
      .from('categoria')
      .select('*')
      .order('nombre', { ascending: true })
    if (error) console.error(error)
    else setCategorias(data)
    setCargando(false)
  }

  async function eliminarCategoria(id) {
    const confirmar = window.confirm('¿Seguro que deseas eliminar esta categoría?')
    if (!confirmar) return
    const { error } = await supabase
      .from('categoria')
      .delete()
      .eq('id_categoria', id)
    if (error) console.error(error)
    else obtenerCategorias()
  }

  if (cargando) return <p className="text-secondary">Cargando categorías...</p>

  return (
    <div>
      <h4 className="text-info mb-3">Lista de Categorías ({categorias.length})</h4>
      {categorias.length === 0 ? (
        <p className="text-secondary">No hay categorías registradas aún.</p>
      ) : (
        <table className="table table-dark table-bordered table-hover">
          <thead>
            <tr>
              <th className="text-info">Nombre</th>
              <th className="text-info">Tipo</th>
              <th className="text-info text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id_categoria}>
                <td>{c.nombre}</td>
                <td>
                  <span className={`badge ${
                    c.tipo_movimiento === 'GASTO' ? 'bg-danger' :
                    c.tipo_movimiento === 'INGRESO' ? 'bg-success' :
                    'bg-secondary'
                  }`}>
                    {c.tipo_movimiento}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={() => onEditar(c)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => eliminarCategoria(c.id_categoria)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
