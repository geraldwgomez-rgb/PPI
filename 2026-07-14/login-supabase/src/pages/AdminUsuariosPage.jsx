import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from 'react-i18next'
import { useFormato } from '../lib/useFormato'

export default function AdminUsuariosPage({ session }) {
  const { t } = useTranslation()
  const { formatDate } = useFormato()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    setCargando(true)
    const { data, error } = await supabase.rpc('obtener_usuarios')
    if (error) console.error(error)
    else setUsuarios(data)
    setCargando(false)
  }

  async function cambiarRol(id, rolActual) {
    const nuevoRol = rolActual === 'administrador' ? 'usuario' : 'administrador'
    const confirmar = window.confirm(t('users.confirmRole', { role: t(`role.${nuevoRol}`), interpolation: { escapeValue: false } }))
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
      alert(t('users.alertSelf'))
      return
    }
    const confirmar = window.confirm(t('users.confirmDelete', { email, interpolation: { escapeValue: false } }))
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
      <h2 className="text-danger fw-bold mb-4">{t('users.title')}</h2>

      <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white m-0">{t(usuarios.length === 1 ? 'users.total_one' : 'users.total', { n: usuarios.length })}</h5>
        </div>

        {cargando ? (
          <p className="text-secondary">{t('users.loading')}</p>
        ) : (
          <table className="table table-dark table-bordered table-hover align-middle">
            <thead>
              <tr>
                <th className="text-danger">{t('users.colEmail')}</th>
                <th className="text-danger">{t('users.colRole')}</th>
                <th className="text-danger">{t('users.colRegistered')}</th>
                <th className="text-danger text-center">{t('users.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const esYo = u.id === session?.user?.id
                return (
                  <tr key={u.id}>
                    <td className="text-white">{u.email}</td>
                    <td>
                      <span className={`badge ${u.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                        {t(`role.${u.rol}`)}
                      </span>
                    </td>
                    <td className="text-secondary small">{formatDate(u.created_at)}</td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => cambiarRol(u.id, u.rol)}
                          disabled={esYo}
                          title={esYo ? t('users.cantChangeOwn') : ''}
                        >
                          {t('users.changeRole')}
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => eliminarUsuario(u.id, u.email)}
                          disabled={eliminando === u.id || esYo}
                          title={esYo ? t('users.cantDeleteOwn') : ''}
                        >
                          {eliminando === u.id ? t('users.deleting') : t('users.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}