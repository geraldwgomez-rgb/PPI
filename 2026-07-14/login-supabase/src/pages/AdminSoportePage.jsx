import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminSoportePage({ session }) {
  const [usuarios, setUsuarios] = useState([])
  const [todosLosMensajes, setTodosLosMensajes] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [cargandoConversacion, setCargandoConversacion] = useState(false)
  const [pestana, setPestana] = useState('conversaciones')

  // Formulario de nuevo mensaje dentro de la conversación abierta
  const [asunto, setAsunto] = useState('')
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // Respuestas sugeridas editables, por id de mensaje
  const [respuestasEdit, setRespuestasEdit] = useState({})
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(null)

  // Formulario de "Nuevo mensaje": se elige un usuario del desplegable
  // y se redacta el mensaje, sin necesidad de abrir la conversación.
  const [destinatarioId, setDestinatarioId] = useState('')
  const [asuntoNuevo, setAsuntoNuevo] = useState('')
  const [contenidoNuevo, setContenidoNuevo] = useState('')
  const [enviandoNuevo, setEnviandoNuevo] = useState(false)
  const [errorNuevo, setErrorNuevo] = useState('')
  const [exitoNuevo, setExitoNuevo] = useState('')

  // FAQ
  const [faqs, setFaqs] = useState([])
  const [faqPregunta, setFaqPregunta] = useState('')
  const [faqPalabras, setFaqPalabras] = useState('')
  const [faqRespuesta, setFaqRespuesta] = useState('')
  const [faqError, setFaqError] = useState('')
  const [guardandoFaq, setGuardandoFaq] = useState(false)

  useEffect(() => {
    cargarUsuariosYMensajes()
    cargarFaqs()
  }, [])

  async function cargarUsuariosYMensajes() {
    setCargando(true)

    // CORREGIDO: usuarios_info ahora es una función RPC (SECURITY DEFINER),
    // no una vista sobre auth.users, para evitar el 403 de permisos.
    // .rpc() no soporta .neq() encadenado, así que el usuario actual
    // se filtra después, en JS.
    const { data: usRaw } = await supabase.rpc('usuarios_info')
    const us = usRaw?.filter(u => u.id !== session.user.id) ?? null

    // Trae TODOS los mensajes de una vez (de todos los usuarios),
    // para poder armar la lista de conversaciones con su conteo
    // de no leídos y su último mensaje.
    const { data: msgs } = await supabase
      .from('mensajes')
      .select('id, asunto, contenido, leido, created_at, usuario_id, remitente, respuesta_sugerida')
      .order('created_at', { ascending: false })

    if (us) setUsuarios(us)
    if (msgs) setTodosLosMensajes(msgs)

    setCargando(false)
  }

  async function cargarFaqs() {
    const { data } = await supabase
      .from('faq_soporte')
      .select('id, pregunta, palabras_clave, respuesta, activo, created_at')
      .order('created_at', { ascending: false })
    if (data) setFaqs(data)
  }

  // Mensajes del usuario actualmente abierto, del más viejo al más nuevo (como un chat)
  const conversacionActual = usuarioSeleccionado
    ? todosLosMensajes
        .filter(m => m.usuario_id === usuarioSeleccionado.id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    : []

  // Cuántos mensajes sin leer tiene cada usuario (mensajes que el
  // usuario escribió y el admin todavía no ha abierto)
  function noLeidosDe(usuarioId) {
    return todosLosMensajes.filter(
      m => m.usuario_id === usuarioId && m.remitente === 'usuario' && !m.leido
    ).length
  }

  async function abrirConversacion(usuario) {
    setUsuarioSeleccionado(usuario)
    setAsunto('')
    setContenido('')
    setError('')

    // Precarga las respuestas sugeridas pendientes de esta conversación
    const pendientes = todosLosMensajes.filter(
      m => m.usuario_id === usuario.id && m.remitente === 'usuario' && m.respuesta_sugerida
    )
    setRespuestasEdit((prev) => {
      const nuevo = { ...prev }
      pendientes.forEach((m) => {
        if (!(m.id in nuevo)) nuevo[m.id] = m.respuesta_sugerida
      })
      return nuevo
    })

    // Marca como leídos (por el admin) los mensajes de ese usuario
    const idsNoLeidos = todosLosMensajes
      .filter(m => m.usuario_id === usuario.id && m.remitente === 'usuario' && !m.leido)
      .map(m => m.id)

    if (idsNoLeidos.length > 0) {
      setCargandoConversacion(true)
      await supabase.from('mensajes').update({ leido: true }).in('id', idsNoLeidos)
      await cargarUsuariosYMensajes()
      setCargandoConversacion(false)
    }
  }

  async function enviarMensajeNuevo(e) {
    e.preventDefault()
    setErrorNuevo('')
    setExitoNuevo('')

    if (!destinatarioId || !asuntoNuevo || !contenidoNuevo) {
      setErrorNuevo('Selecciona un usuario y completa asunto y mensaje.')
      return
    }

    setEnviandoNuevo(true)
    const { error } = await supabase.from('mensajes').insert({
      admin_id: session.user.id,
      usuario_id: destinatarioId,
      remitente: 'admin',
      asunto: asuntoNuevo,
      contenido: contenidoNuevo,
    })
    setEnviandoNuevo(false)

    if (error) {
      setErrorNuevo(error.message)
    } else {
      setExitoNuevo('✅ Mensaje enviado correctamente.')
      setDestinatarioId('')
      setAsuntoNuevo('')
      setContenidoNuevo('')
      cargarUsuariosYMensajes()
    }
  }

  async function enviarMensaje(e) {
    e.preventDefault()
    setError('')

    if (!asunto || !contenido) {
      setError('Completa asunto y mensaje.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.from('mensajes').insert({
      admin_id: session.user.id,
      usuario_id: usuarioSeleccionado.id,
      remitente: 'admin',
      asunto,
      contenido,
    })
    setEnviando(false)

    if (error) {
      setError(error.message)
    } else {
      setAsunto('')
      setContenido('')
      cargarUsuariosYMensajes()
    }
  }

  async function enviarRespuestaSugerida(mensajeUsuario) {
    const texto = (respuestasEdit[mensajeUsuario.id] || '').trim()
    if (!texto) return

    setEnviandoRespuesta(mensajeUsuario.id)
    const { error } = await supabase.from('mensajes').insert({
      admin_id: session.user.id,
      usuario_id: mensajeUsuario.usuario_id,
      remitente: 'admin',
      asunto: `Re: ${mensajeUsuario.asunto}`,
      contenido: texto,
    })
    setEnviandoRespuesta(null)

    if (!error) {
      setRespuestasEdit((prev) => {
        const nuevo = { ...prev }
        delete nuevo[mensajeUsuario.id]
        return nuevo
      })
      cargarUsuariosYMensajes()
    }
  }

  async function guardarFaq(e) {
    e.preventDefault()
    setFaqError('')

    if (!faqPregunta || !faqPalabras || !faqRespuesta) {
      setFaqError('Todos los campos son obligatorios.')
      return
    }

    setGuardandoFaq(true)
    const { error } = await supabase.from('faq_soporte').insert({
      pregunta: faqPregunta,
      palabras_clave: faqPalabras,
      respuesta: faqRespuesta,
      activo: true,
    })
    setGuardandoFaq(false)

    if (error) {
      setFaqError(error.message)
    } else {
      setFaqPregunta('')
      setFaqPalabras('')
      setFaqRespuesta('')
      cargarFaqs()
    }
  }

  async function alternarFaqActiva(id, activoActual) {
    await supabase.from('faq_soporte').update({ activo: !activoActual }).eq('id', id)
    cargarFaqs()
  }

  async function eliminarFaq(id) {
    const confirmar = window.confirm('¿Eliminar esta pregunta frecuente?')
    if (!confirmar) return
    await supabase.from('faq_soporte').delete().eq('id', id)
    cargarFaqs()
  }

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-4">💬 Soporte y Sugerencias</h2>

      {/* Pestañas principales */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${pestana === 'conversaciones' ? 'active text-danger' : 'text-secondary'}`}
            onClick={() => setPestana('conversaciones')}
          >
            📋 Conversaciones
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${pestana === 'faq' ? 'active text-danger' : 'text-secondary'}`}
            onClick={() => setPestana('faq')}
          >
            🤖 Preguntas frecuentes ({faqs.filter(f => f.activo).length} activas)
          </button>
        </li>
      </ul>

      {pestana === 'conversaciones' && (
        <>
          {/* NUEVO MENSAJE: se elige un usuario del desplegable y se redacta el mensaje */}
          <div className="card bg-dark border-danger border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">✉️ Nuevo mensaje</h5>
            {errorNuevo && <div className="alert alert-danger py-2 small">{errorNuevo}</div>}
            {exitoNuevo && <div className="alert alert-success py-2 small">{exitoNuevo}</div>}
            <form onSubmit={enviarMensajeNuevo}>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label text-white fw-light">Usuario</label>
                  <select
                    className="form-select bg-black border-secondary text-white"
                    value={destinatarioId}
                    onChange={(e) => setDestinatarioId(e.target.value)}
                  >
                    <option value="">-- Selecciona un usuario --</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.email} ({u.rol})</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-8">
                  <label className="form-label text-white fw-light">Asunto</label>
                  <input
                    type="text"
                    className="form-control bg-black border-secondary text-white"
                    placeholder="Asunto"
                    value={asuntoNuevo}
                    onChange={(e) => setAsuntoNuevo(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-white fw-light">Mensaje</label>
                  <textarea
                    className="form-control bg-black border-secondary text-white"
                    rows={3}
                    placeholder="Escribe tu mensaje..."
                    value={contenidoNuevo}
                    onChange={(e) => setContenidoNuevo(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-danger fw-bold mt-3" disabled={enviandoNuevo}>
                {enviandoNuevo ? 'Enviando...' : '📤 Enviar mensaje'}
              </button>
            </form>
          </div>

          <div className="row g-4">

          {/* LISTA DE USUARIOS */}
          <div className="col-12 col-md-4">
            <div className="card bg-dark border-secondary p-3" style={{ borderRadius: '16px' }}>
              <h5 className="text-white mb-3">👥 Usuarios ({usuarios.length})</h5>
              {cargando ? (
                <p className="text-secondary">Cargando...</p>
              ) : (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {usuarios.map((u) => {
                    const noLeidos = noLeidosDe(u.id)
                    return (
                      <button
                        key={u.id}
                        className={`btn text-start p-3 ${usuarioSeleccionado?.id === u.id ? 'btn-info text-dark' : 'btn-outline-secondary text-white'}`}
                        style={{ borderRadius: '10px' }}
                        onClick={() => abrirConversacion(u)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="fw-bold small">{u.email}</div>
                          {noLeidos > 0 && (
                            <span className="badge bg-warning text-dark">{noLeidos}</span>
                          )}
                        </div>
                        <span className={`badge mt-1 ${u.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                          {u.rol}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CONVERSACIÓN */}
          <div className="col-12 col-md-8">
            {!usuarioSeleccionado ? (
              <div className="card bg-dark border-secondary p-4 text-center" style={{ borderRadius: '16px', minHeight: '300px' }}>
                <p className="text-secondary mt-5">👈 Selecciona un usuario para ver su conversación</p>
              </div>
            ) : (
              <div className="card bg-dark border-danger border-opacity-25 p-4" style={{ borderRadius: '16px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="text-white fw-bold m-0">{usuarioSeleccionado.email}</h5>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setUsuarioSeleccionado(null)}>
                    ✕ Cerrar
                  </button>
                </div>

                {cargandoConversacion ? (
                  <p className="text-secondary">Actualizando...</p>
                ) : conversacionActual.length === 0 ? (
                  <p className="text-secondary text-center py-4">Todavía no hay mensajes con este usuario.</p>
                ) : (
                  <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {conversacionActual.map((m) => (
                      <div key={m.id}>
                        <div
                          className={`card p-3 ${m.remitente === 'usuario' ? 'bg-dark border-primary border-opacity-50' : 'bg-dark border-danger border-opacity-50'}`}
                          style={{ borderRadius: '12px', marginLeft: m.remitente === 'admin' ? '15%' : '0', marginRight: m.remitente === 'usuario' ? '15%' : '0' }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-2">
                            <span className={`badge ${m.remitente === 'usuario' ? 'bg-primary' : 'bg-danger'}`}>
                              {m.remitente === 'usuario' ? '👤 Usuario' : '🛡️ Tú (admin)'}
                            </span>
                            <small className="text-secondary">{new Date(m.created_at).toLocaleString('es-CO')}</small>
                          </div>
                          <p className="text-white fw-bold small m-0 mb-1">{m.asunto}</p>
                          <p className="text-secondary small m-0">{m.contenido}</p>
                        </div>

                        {/* Sugerencia automática debajo del mensaje del usuario que la generó */}
                        {m.remitente === 'usuario' && (m.id in respuestasEdit) && (
                          <div className="mt-2 p-3" style={{ backgroundColor: 'rgba(34, 211, 238, 0.06)', border: '1px dashed var(--border-glow)', borderRadius: '10px' }}>
                            <small className="text-info d-block mb-2">
                              🤖 Respuesta sugerida (coincide con una FAQ) — revisa/edita y envía:
                            </small>
                            <textarea
                              className="form-control bg-black border-secondary text-white mb-2"
                              rows={2}
                              value={respuestasEdit[m.id]}
                              onChange={(e) => setRespuestasEdit((prev) => ({ ...prev, [m.id]: e.target.value }))}
                            />
                            <button
                              className="btn btn-info btn-sm fw-bold"
                              onClick={() => enviarRespuestaSugerida(m)}
                              disabled={enviandoRespuesta === m.id}
                            >
                              {enviandoRespuesta === m.id ? 'Enviando...' : '✅ Enviar esta respuesta'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario para responder / iniciar */}
                <hr style={{ borderColor: 'var(--border)' }} />
                <h6 className="text-white mb-2">✉️ Escribir a {usuarioSeleccionado.email}</h6>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <form onSubmit={enviarMensaje}>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control bg-black border-secondary text-white"
                      placeholder="Asunto"
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <textarea
                      className="form-control bg-black border-secondary text-white"
                      rows={3}
                      placeholder="Escribe tu mensaje..."
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-danger fw-bold w-100" disabled={enviando}>
                    {enviando ? 'Enviando...' : '📤 Enviar'}
                  </button>
                </form>
              </div>
            )}
          </div>
          </div>
        </>
      )}

      {pestana === 'faq' && (
        <>
          <div className="card bg-dark border-danger border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-2">🤖 Nueva pregunta frecuente</h5>
            <p className="text-secondary small mb-3">
              Cuando un usuario escribe un mensaje que contiene alguna de las "palabras clave", el sistema te deja la respuesta lista para revisar y enviar dentro de la conversación.
            </p>
            {faqError && <div className="alert alert-danger py-2 small">{faqError}</div>}
            <form onSubmit={guardarFaq}>
              <div className="mb-3">
                <label className="form-label text-white fw-light">Pregunta (referencia interna)</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  placeholder="Ej. ¿Cómo registro un gasto?"
                  value={faqPregunta}
                  onChange={(e) => setFaqPregunta(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-white fw-light">Palabras clave (separadas por coma)</label>
                <input
                  type="text"
                  className="form-control bg-black border-secondary text-white"
                  placeholder="Ej. registrar gasto,como agrego un gasto,anadir gasto"
                  value={faqPalabras}
                  onChange={(e) => setFaqPalabras(e.target.value)}
                  required
                />
                <small className="text-muted">Si el mensaje del usuario contiene cualquiera de estas frases, se sugiere esta respuesta.</small>
              </div>
              <div className="mb-3">
                <label className="form-label text-white fw-light">Respuesta sugerida</label>
                <textarea
                  className="form-control bg-black border-secondary text-white"
                  rows={3}
                  placeholder="Escribe la respuesta que se te sugerirá cuando aplique..."
                  value={faqRespuesta}
                  onChange={(e) => setFaqRespuesta(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-danger fw-bold w-100" disabled={guardandoFaq}>
                {guardandoFaq ? 'Guardando...' : '💾 Guardar pregunta frecuente'}
              </button>
            </form>
          </div>

          <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">📚 Preguntas frecuentes configuradas ({faqs.length})</h5>
            {faqs.length === 0 ? (
              <p className="text-secondary">No has configurado ninguna pregunta frecuente todavía.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {faqs.map((f) => (
                  <div key={f.id} className={`card bg-dark p-3 border-opacity-25 ${f.activo ? 'border-success' : 'border-secondary'}`} style={{ borderRadius: '12px' }}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                      <span className="text-white fw-bold">{f.pregunta}</span>
                      <div className="d-flex gap-2">
                        <span className={`badge ${f.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {f.activo ? 'Activa' : 'Desactivada'}
                        </span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => alternarFaqActiva(f.id, f.activo)}>
                          {f.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarFaq(f.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <small className="text-info d-block mb-1">Palabras clave: {f.palabras_clave}</small>
                    <p className="text-secondary small m-0">{f.respuesta}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}