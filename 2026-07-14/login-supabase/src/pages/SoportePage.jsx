import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SoportePage({ session }) {
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [noLeidos, setNoLeidos] = useState(0)

  useEffect(() => {
    cargarMensajes()
  }, [])

  async function cargarMensajes() {
    setCargando(true)
    const { data } = await supabase
      .from('mensajes')
      .select('id, asunto, contenido, leido, created_at')
      .eq('usuario_id', session.user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setMensajes(data)
      setNoLeidos(data.filter(m => !m.leido).length)
    }
    setCargando(false)
  }

  async function marcarLeido(id) {
    await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('id', id)
    cargarMensajes()
  }

  async function marcarTodosLeidos() {
    await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('usuario_id', session.user.id)
      .eq('leido', false)
    cargarMensajes()
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-info fw-bold m-0">💬 Soporte y Mensajes</h2>
          {noLeidos > 0 && (
            <small className="text-warning">🔔 {noLeidos} mensaje{noLeidos > 1 ? 's' : ''} sin leer</small>
          )}
        </div>
        {noLeidos > 0 && (
          <button className="btn btn-outline-info btn-sm" onClick={marcarTodosLeidos}>
            ✅ Marcar todos como leídos
          </button>
        )}
      </div>

      {cargando ? (
        <p className="text-secondary">Cargando mensajes...</p>
      ) : mensajes.length === 0 ? (
        <div className="card bg-dark border-secondary p-5 text-center" style={{ borderRadius: '16px' }}>
          <p className="text-secondary mb-0">📭 No tienes mensajes aún.</p>
          <small className="text-muted">Aquí aparecerán los mensajes y sugerencias del equipo SMC.</small>
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
    </div>
  )
}
