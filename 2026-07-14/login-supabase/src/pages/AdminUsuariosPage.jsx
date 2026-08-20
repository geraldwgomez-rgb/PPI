import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminUsuariosPage({ session }) {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    setCargando(true)
    const { data, error } = await supabase
      .from('usuarios_info')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setUsuarios(data)
    setCargando(false)
  }

  async function cambiarRol(id, rolActual) {
    const nuevoRol = rolActual === 'administrador' ? 'usuario' : 'administrador'
    const confirmar = window.confirm(`¿Cambiar rol a "${nuevoRol}"?`)
    if (!confirmar) return
    const { error } = await supabase
      .from('roles')
      .update({ rol: nuevoRol })
      .eq('id', id)
    if (error) console.error(error)
    else cargarUsuarios()
  }

  async function eliminarUsuario(id, email) {
    if (id === session?.user?.id) {
      alert('No puedes eliminarte a ti mismo.')
      return
    }
    const confirmar = window.confirm(`¿Seguro que deseas eliminar al usuario "${email}"? Esta acción no se puede deshacer.`)
    if (!confirmar) return

    setEliminando(id)

    // Eliminar datos del usuario en cascada
    await supabase.from('gastos').delete().eq('user_id', id)
    await supabase.from('ingresos').delete().eq('user_id', id)
    await supabase.from('presupuesto').delete().eq('user_id', id)
    await supabase.from('roles').delete().eq('id', id)

    // Eliminar de auth.users usando función de admin
    const { error } = await supabase.rpc('eliminar_usuario', { uid: id })
    if (error) console.error('Error al eliminar usuario auth:', error)

    setEliminando(null)
    cargarUsuarios()
  }

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-4">👥 Gestión de Usuarios</h2>

      <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white m-0">Total: {usuarios.length} usuarios</h5>
        </div>

        {cargando ? (
          <p className="text-secondary">Cargando usuarios...</p>
        ) : (
          <table className="table table-dark table-bordered table-hover align-middle">
            <thead>
              <tr>
                <th className="text-danger">Email</th>
                <th className="text-danger">Rol</th>
                <th className="text-danger">Registrado</th>
                <th className="text-danger text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="text-white">{u.email}</td>
                  <td>
                    <span className={`badge ${u.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="text-secondary small">
                    {new Date(u.created_at).toLocaleDateString('es-CO')}
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => cambiarRol(u.id, u.rol)}
                        disabled={u.id === session?.user?.id}
                        title={u.id === session?.user?.id ? 'No puedes cambiar tu propio rol' : ''}
                      >
                        Cambiar rol
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => eliminarUsuario(u.id, u.email)}
                        disabled={eliminando === u.id || u.id === session?.user?.id}
                        title={u.id === session?.user?.id ? 'No puedes eliminarte a ti mismo' : ''}
                      >
                        {eliminando === u.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
