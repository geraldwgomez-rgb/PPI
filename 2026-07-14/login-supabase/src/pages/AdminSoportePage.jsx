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
  const [pestana, setPestana] = useState('mensajes')

  // Texto editable de cada respuesta sugerida, por id de mensaje
  const [respuestasEdit, setRespuestasEdit] = useState({})
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(null)

  // FAQ
  const [faqs, setFaqs] = useState([])
  const [faqPregunta, setFaqPregunta] = useState('')
  const [faqPalabras, setFaqPalabras] = useState('')
  const [faqRespuesta, setFaqRespuesta] = useState('')
  const [faqError, setFaqError] = useState('')
  const [guardandoFaq, setGuardandoFaq] = useState(false)

  useEffect(() => {
    cargarDatos()
    cargarFaqs()
  }, [])

  async function cargarDatos() {
    setCargando(true)
    const { data: us } = await supabase
      .from('usuarios_info')
      .select('id, email, rol')
      .neq('id', session.user.id)

    // Trae TODO: mensajes del admin, del usuario, y la sugerencia
    // automática (respuesta_sugerida) que dejó el trigger, si aplica.
    const { data: msgs } = await supabase
      .from('mensajes')
      .select('id, asunto, contenido, leido, created_at, usuario_id, remitente, respuesta_sugerida')
      .order('created_at', { ascending: false })

    if (us) setUsuarios(us)
    if (msgs && us) {
      const mensajesConEmail = msgs.map(m => ({
        ...m,
        emailUsuario: us.find(u => u.id === m.usuario_id)?.email || m.usuario_id
      }))
      setHistorial(mensajesConEmail)

      // Precarga el textarea de sugerencia con lo que propuso el
      // sistema, sin pisar lo que el admin ya esté editando
      setRespuestasEdit((prev) => {
        const nuevo = { ...prev }
        mensajesConEmail.forEach((m) => {
          if (m.remitente === 'usuario' && m.respuesta_sugerida && !(m.id in nuevo)) {
            nuevo[m.id] = m.respuesta_sugerida
          }
        })
        return nuevo
      })
    }
    setCargando(false)
  }

  async function cargarFaqs() {
    const { data } = await supabase
      .from('faq_soporte')
      .select('id, pregunta, palabras_clave, respuesta, activo, created_at')
      .order('created_at', { ascending: false })
    if (data) setFaqs(data)
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
      remitente: 'admin',
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

  // Envía la respuesta sugerida (editada o tal cual) como un
  // mensaje nuevo del admin hacia el usuario que preguntó.
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
      // Limpia la sugerencia usada y recarga
      setRespuestasEdit((prev) => {
        const nuevo = { ...prev }
        delete nuevo[mensajeUsuario.id]
        return nuevo
      })
      cargarDatos()
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

      {/* Pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${pestana === 'mensajes' ? 'active text-danger' : 'text-secondary'}`}
            onClick={() => setPestana('mensajes')}
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

      {pestana === 'mensajes' && (
        <>
          {/* Formulario para iniciar una conversación */}
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

          {/* Historial con respuestas sugeridas */}
          <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">📋 Historial completo ({historial.length})</h5>
            {cargando ? (
              <p className="text-secondary">Cargando...</p>
            ) : historial.length === 0 ? (
              <p className="text-secondary">No hay mensajes aún.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {historial.map((m) => {
                  const esPreguntaConSugerencia = m.remitente === 'usuario' && (m.id in respuestasEdit)
                  return (
                    <div key={m.id} className={`card bg-dark p-3 border-opacity-25 ${m.leido ? 'border-secondary' : 'border-warning'}`} style={{ borderRadius: '12px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-2">
                        <span className="text-white fw-bold">{m.asunto}</span>
                        <div className="d-flex gap-2 align-items-center">
                          <span className={`badge ${m.remitente === 'usuario' ? 'bg-primary' : 'bg-danger'}`}>
                            {m.remitente === 'usuario' ? '👤 Usuario' : '🛡️ Admin'}
                          </span>
                          <small className="text-secondary">{new Date(m.created_at).toLocaleDateString('es-CO')}</small>
                        </div>
                      </div>
                      <small className="text-info mb-2 d-block">Conversación con: {m.emailUsuario}</small>
                      <p className="text-secondary small m-0">{m.contenido}</p>

                      {esPreguntaConSugerencia && (
                        <div className="mt-3 p-3" style={{ backgroundColor: 'rgba(34, 211, 238, 0.06)', border: '1px dashed var(--border-glow)', borderRadius: '10px' }}>
                          <small className="text-info d-block mb-2">
                            🤖 El sistema detectó que esto coincide con una pregunta frecuente. Revisa/edita y envía:
                          </small>
                          <textarea
                            className="form-control bg-black border-secondary text-white mb-2"
                            rows={3}
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
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {pestana === 'faq' && (
        <>
          {/* Nueva FAQ */}
          <div className="card bg-dark border-danger border-opacity-50 p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-2">🤖 Nueva pregunta frecuente</h5>
            <p className="text-secondary small mb-3">
              Cuando un usuario escribe un mensaje que contiene alguna de las "palabras clave", el sistema te deja la respuesta lista para revisar y enviar — tú decides si la usas tal cual, la editas, o respondes algo distinto.
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

          {/* Lista de FAQ */}
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