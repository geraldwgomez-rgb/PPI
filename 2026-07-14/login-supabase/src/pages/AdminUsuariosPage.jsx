import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  async function obtenerUsuarios() {
    setCargando(true)
    const { data, error } = await supabase
      .from('roles')
      .select('id, rol, created_at')
    if (error) console.error(error)
    else setUsuarios(data)
    setCargando(false)
  }

  async function cambiarRol(id, rolActual) {
    const nuevoRol = rolActual === 'administrador' ? 'usuario' : 'administrador'
    const confirmar = window.confirm(`¿Cambiar rol a ${nuevoRol}?`)
    if (!confirmar) return
    const { error } = await supabase
      .from('roles')
      .update({ rol: nuevoRol })
      .eq('id', id)
    if (error) console.error(error)
    else obtenerUsuarios()
  }

  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">👥 Gestión de Usuarios</h2>
      <div className="card bg-dark border-info border-opacity-50 p-4" style={{ borderRadius: '16px' }}>
        {cargando ? (
          <p className="text-secondary">Cargando usuarios...</p>
        ) : (
          <table className="table table-dark table-bordered table-hover align-middle">
            <thead>
              <tr>
                <th className="text-info">ID Usuario</th>
                <th className="text-info">Rol</th>
                <th className="text-info">Registrado</th>
                <th className="text-info text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="text-secondary small">{u.id}</td>
                  <td>
                    <span className={`badge ${u.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="text-secondary small">
                    {new Date(u.created_at).toLocaleDateString('es-CO')}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => cambiarRol(u.id, u.rol)}
                    >
                      Cambiar rol
                    </button>
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
