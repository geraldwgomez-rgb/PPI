import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SoportePage({ session }) {
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [noLeidos, setNoLeidos] = useState(0)
  const [pestana, setPestana] = useState('mensajes')
  const [asunto, setAsunto] = useState('')
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [adminId, setAdminId] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)

    // Obtener mensajes recibidos
    const { data: msgs } = await supabase
      .from('mensajes')
      .select('id, asunto, contenido, leido, created_at')
      .eq('usuario_id', session.user.id)
      .order('created_at', { ascending: false })

    // Obtener un admin para enviarle mensajes
    const { data: admins } = await supabase
      .from('roles')
      .select('id')
      .eq('rol', 'administrador')
      .limit(1)

    if (msgs) {
      setMensajes(msgs)
      setNoLeidos(msgs.filter(m => !m.leido).length)
    }
    if (admins && admins.length > 0) setAdminId(admins[0].id)

    setCargando(false)
  }

  async function marcarLeido(id) {
    await supabase.from('mensajes').update({ leido: true }).eq('id', id)
    cargarDatos()
  }

  async function marcarTodosLeidos() {
    await supabase.from('mensajes').update({ leido: true }).eq('usuario_id', session.user.id).eq('leido', false)
    cargarDatos()
  }

  async function enviarMensaje(e) {
    e.preventDefault()
    setError('')
    setExito('')

    if (!asunto || !contenido) {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (!adminId) {
      setError('No hay administradores disponibles en este momento.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.from('mensajes').insert({
      admin_id: session.user.id,
      usuario_id: adminId,
      asunto,
      contenido,
    })
    setEnviando(false)

    if (error) {
      setError(error.message)
    } else {
      setExito('✅ Mensaje enviado al equipo de soporte.')
      setAsunto('')
      setContenido('')
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-info fw-bold m-0">💬 Soporte</h2>
          {noLeidos > 0 && (
            <small className="text-warning">🔔 {noLeidos} mensaje{noLeidos > 1 ? 's' : ''} sin leer</small>
          )}
        </div>
      </div>

      {/* Pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${pestana === 'mensajes' ? 'active text-info' : 'text-secondary'}`}
            onClick={() => setPestana('mensajes')}
          >
            📥 Mensajes recibidos
            {noLeidos > 0 && <span className="badge bg-warning text-dark ms-2">{noLeidos}</span>}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${pestana === 'nuevo' ? 'active text-info' : 'text-secondary'}`}
            onClick={() => setPestana('nuevo')}
          >
            ✉️ Enviar mensaje
          </button>
        </li>
      </ul>

      {/* Mensajes recibidos */}
      {pestana === 'mensajes' && (
        <>
          {noLeidos > 0 && (
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-outline-info btn-sm" onClick={marcarTodosLeidos}>
                ✅ Marcar todos como leídos
              </button>
            </div>
          )}

          {cargando ? (
            <p className="text-secondary">Cargando mensajes...</p>
          ) : mensajes.length === 0 ? (
            <div className="card bg-dark border-secondary p-5 text-center" style={{ borderRadius: '16px' }}>
              <p className="text-secondary mb-0">📭 No tienes mensajes aún.</p>
              <small className="text-muted">Aquí aparecerán los mensajes del equipo SMC.</small>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {mensajes.map((m) => (
                <div
                  key={m.id}
                  className={`card bg-dark p-4 border-opacity-50 ${m.leido ? 'border-secondary' : 'border-info'}`}
                  style={{ borderRadius: '16px', cursor: !m.leido ? 'pointer' : 'default' }}
                  onClick={() => !m.leido && marcarLeido(m.id)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <h5 className={`fw-bold m-0 ${m.leido ? 'text-secondary' : 'text-white'}`}>
                      {!m.leido && '🔔 '}{m.asunto}
                    </h5>
                    <div className="d-flex gap-2 align-items-center">
                      <span className={`badge ${m.leido ? 'bg-secondary' : 'bg-info text-dark'}`}>
                        {m.leido ? 'Leído' : 'Nuevo'}
                      </span>
                      <small className="text-secondary">
                        {new Date(m.created_at).toLocaleDateString('es-CO')}
                      </small>
                    </div>
                  </div>
                  <p className={`m-0 ${m.leido ? 'text-muted' : 'text-secondary'}`}>{m.contenido}</p>
                  {!m.leido && (
                    <small className="text-info mt-2">👆 Haz clic para marcar como leído</small>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Enviar mensaje */}
      {pestana === 'nuevo' && (
        <div className="card bg-dark border-info border-opacity-50 p-4" style={{ borderRadius: '16px' }}>
          <h5 className="text-white mb-3">✉️ Enviar mensaje al equipo de soporte</h5>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {exito && <div className="alert alert-success py-2 small">{exito}</div>}
          <form onSubmit={enviarMensaje}>
            <div className="mb-3">
              <label className="form-label text-white fw-light">Asunto</label>
              <input
                type="text"
                className="form-control bg-black border-secondary text-white"
                placeholder="Ej. Tengo un problema con mis gastos..."
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-white fw-light">Mensaje</label>
              <textarea
                className="form-control bg-black border-secondary text-white"
                rows={5}
                placeholder="Describe tu problema o sugerencia con detalle..."
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-info fw-bold w-100" disabled={enviando}>
              {enviando ? 'Enviando...' : '📤 Enviar al soporte'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
