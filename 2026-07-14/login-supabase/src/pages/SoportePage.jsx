import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from 'react-i18next'
import { useFormato } from '../lib/useFormato'

export default function SoportePage({ session }) {
  const { t } = useTranslation()
  const { formatDate } = useFormato()
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [noLeidos, setNoLeidos] = useState(0)
  const [pestana, setPestana] = useState('mensajes')
  const [asunto, setAsunto] = useState('')
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  // Se guarda la clave del mensaje (no el texto) para que cambie con el idioma
  const [error, setError] = useState('')       // clave de traducción o texto de Supabase
  const [exito, setExito] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)

    // Conversación completa: lo que el usuario escribió (remitente
    // = 'usuario') y lo que el admin le respondió (remitente = 'admin').
    // El campo respuesta_sugerida NUNCA se selecciona aquí — es solo
    // para uso interno del administrador.
    const { data: msgs } = await supabase
      .from('mensajes')
      .select('id, asunto, contenido, leido, created_at, remitente')
      .eq('usuario_id', session.user.id)
      .order('created_at', { ascending: false })

    if (msgs) {
      setMensajes(msgs)
      setNoLeidos(msgs.filter(m => !m.leido && m.remitente === 'admin').length)
    }

    setCargando(false)
  }

  async function marcarLeido(id) {
    await supabase.from('mensajes').update({ leido: true }).eq('id', id)
    cargarDatos()
  }

  async function marcarTodosLeidos() {
    await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('usuario_id', session.user.id)
      .eq('leido', false)
    cargarDatos()
  }

  async function enviarMensaje(e) {
    e.preventDefault()
    setError('')
    setExito(false)

    if (!asunto || !contenido) {
      setError('support.required')
      return
    }

    setEnviando(true)
    const { error } = await supabase.from('mensajes').insert({
      usuario_id: session.user.id,
      admin_id: null,
      remitente: 'usuario',
      asunto,
      contenido,
      leido: true, // el propio usuario ya lo "leyó", es quien lo escribió
    })
    setEnviando(false)

    if (error) {
      setError(error.message)
    } else {
      setExito(true)
      setAsunto('')
      setContenido('')
      setTimeout(() => {
        setPestana('mensajes')
        cargarDatos()
      }, 800)
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-info fw-bold m-0">{t('support.title')}</h2>
          {noLeidos > 0 && (
            <small className="text-warning">{t(noLeidos === 1 ? 'support.unread_one' : 'support.unread', { n: noLeidos })}</small>
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
            {t('support.tabConversation')}
            {noLeidos > 0 && <span className="badge bg-warning text-dark ms-2">{noLeidos}</span>}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${pestana === 'nuevo' ? 'active text-info' : 'text-secondary'}`}
            onClick={() => setPestana('nuevo')}
          >
            {t('support.tabSend')}
          </button>
        </li>
      </ul>

      {/* Conversación */}
      {pestana === 'mensajes' && (
        <>
          {noLeidos > 0 && (
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-outline-info btn-sm" onClick={marcarTodosLeidos}>
                {t('support.markAll')}
              </button>
            </div>
          )}

          {cargando ? (
            <p className="text-secondary">{t('support.loading')}</p>
          ) : mensajes.length === 0 ? (
            <div className="card bg-dark border-secondary p-5 text-center" style={{ borderRadius: '16px' }}>
              <p className="text-secondary mb-0">{t('support.emptyTitle')}</p>
              <small className="text-muted">{t('support.emptyHint')}</small>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {mensajes.map((m) => (
                <div
                  key={m.id}
                  className={`card bg-dark p-4 border-opacity-50 ${m.leido ? 'border-secondary' : 'border-info'}`}
                  style={{ borderRadius: '16px', cursor: !m.leido && m.remitente === 'admin' ? 'pointer' : 'default' }}
                  onClick={() => !m.leido && m.remitente === 'admin' && marcarLeido(m.id)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <h5 className={`fw-bold m-0 ${m.leido ? 'text-secondary' : 'text-white'}`}>
                      {!m.leido && m.remitente === 'admin' && '🔔 '}{m.asunto}
                    </h5>
                    <div className="d-flex gap-2 align-items-center">
                      <span className={`badge ${m.remitente === 'usuario' ? 'bg-secondary' : (m.leido ? 'bg-secondary' : 'bg-info text-dark')}`}>
                        {m.remitente === 'usuario' ? t('support.you') : (m.leido ? t('support.read') : t('support.new'))}
                      </span>
                      <small className="text-secondary">{formatDate(m.created_at)}</small>
                    </div>
                  </div>
                  <p className={`m-0 ${m.leido ? 'text-muted' : 'text-secondary'}`}>{m.contenido}</p>
                  {!m.leido && m.remitente === 'admin' && (
                    <small className="text-info mt-2">{t('support.clickToRead')}</small>
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
          <h5 className="text-white mb-3">{t('support.sendTitle')}</h5>
          {error && (
            <div className="alert alert-danger py-2 small">
              {error.startsWith('support.') ? t(error) : error}
            </div>
          )}
          {exito && <div className="alert alert-success py-2 small">{t('support.sent')}</div>}
          <form onSubmit={enviarMensaje}>
            <div className="mb-3">
              <label className="form-label text-white fw-light">{t('support.subject')}</label>
              <input
                type="text"
                className="form-control bg-black border-secondary text-white"
                placeholder={t('support.subjectPh')}
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-white fw-light">{t('support.message')}</label>
              <textarea
                className="form-control bg-black border-secondary text-white"
                rows={5}
                placeholder={t('support.messagePh')}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-info fw-bold w-100" disabled={enviando}>
              {enviando ? t('support.sending') : t('support.sendBtn')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}