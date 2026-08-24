import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminSoportePage({ session }) {
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [asunto, setAsunto] = useState('')
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    const { data: us } = await supabase
      .from('usuarios_info')
      .select('id, email, rol')
      .neq('id', session.user.id)

    const { data: msgs } = await supabase
      .from('mensajes')
      .select('id, asunto, contenido, leido, created_at, usuario_id')
      .order('created_at', { ascending: false })

    if (us) setUsuarios(us)
    if (msgs && us) {
      const mensajesConEmail = msgs.map(m => ({
        ...m,
        emailUsuario: us.find(u => u.id === m.usuario_id)?.email || m.usuario_id
      }))
      setHistorial(mensajesConEmail)
    }
    setCargando(false)
  }

  async function enviarMensaje(e) {
    e.preventDefault()
    setError('')
    setExito('')

    if (!usuarioSeleccionado || !asunto || !contenido) {
      setError('Todos los campos son obligatorios.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.from('mensajes').insert({
      admin_id: session.user.id,
      usuario_id: usuarioSeleccionado,
      asunto,
      contenido,
    })
    setEnviando(false)

    if (error) {
      setError(error.message)
    } else {
      setExito('✅ Mensaje enviado correctamente.')
      setAsunto('')
      setContenido('')
      setUsuarioSeleccionado('')
      cargarDatos()
    }
  }

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-4">💬 Soporte y Sugerencias</h2>

      {/* Formulario */}
      <div className="card bg-dark border-danger border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
        <h5 className="text-white mb-3">✉️ Enviar mensaje a usuario</h5>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        {exito && <div className="alert alert-success py-2 small">{exito}</div>}
        <form onSubmit={enviarMensaje}>
          <div className="mb-3">
            <label className="form-label text-white fw-light">Usuario destinatario</label>
            <select
              className="form-select bg-black border-secondary text-white"
              value={usuarioSeleccionado}
              onChange={(e) => setUsuarioSeleccionado(e.target.value)}
              required
            >
              <option value="">-- Selecciona un usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.email} ({u.rol})</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label text-white fw-light">Asunto</label>
            <input
              type="text"
              className="form-control bg-black border-secondary text-white"
              placeholder="Ej. Recordatorio, Sugerencia, Alerta..."
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-white fw-light">Mensaje</label>
            <textarea
              className="form-control bg-black border-secondary text-white"
              rows={4}
              placeholder="Escribe aquí tu mensaje o sugerencia para el usuario..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-danger fw-bold w-100" disabled={enviando}>
            {enviando ? 'Enviando...' : '📤 Enviar mensaje'}
          </button>
        </form>
      </div>

      {/* Historial */}
      <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
        <h5 className="text-white mb-3">📋 Historial de mensajes enviados ({historial.length})</h5>
        {cargando ? (
          <p className="text-secondary">Cargando...</p>
        ) : historial.length === 0 ? (
          <p className="text-secondary">No hay mensajes enviados aún.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {historial.map((m) => (
              <div key={m.id} className={`card bg-dark p-3 border-opacity-25 ${m.leido ? 'border-secondary' : 'border-warning'}`} style={{ borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-white fw-bold">{m.asunto}</span>
                  <div className="d-flex gap-2 align-items-center">
                    <span className={`badge ${m.leido ? 'bg-secondary' : 'bg-warning text-dark'}`}>
                      {m.leido ? '✅ Leído' : '🔔 No leído'}
                    </span>
                    <small className="text-secondary">{new Date(m.created_at).toLocaleDateString('es-CO')}</small>
                  </div>
                </div>
                <small className="text-info mb-2">Para: {m.emailUsuario}</small>
                <p className="text-secondary small m-0">{m.contenido}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
