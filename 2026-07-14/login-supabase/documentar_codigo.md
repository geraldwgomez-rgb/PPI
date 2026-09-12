# Documentación del Código — Sistema SMC

> Documentación completa del código del proyecto **Sistema SMC** (gestión financiera con React + Supabase), organizada por capas: componentes React, lógica JavaScript, estilos CSS y backend/SQL.
>
> **Identidad visual actual:** dashboard oscuro estilo "orbital" — azul marino profundo (`--bg-primary: #0A0E14`) con acentos cian/teal (`--accent: #22D3EE`), tarjetas con resplandor sutil, fondo animado (crossfade + Ken Burns) o partículas según la página, grid + viñeta para profundidad, e intro tipo Netflix con las siglas "SMC" al cargar la app y al iniciar sesión.

---

## 1. React (Componentes / JSX)

### 1.1 `App.jsx`
**Ruta:** `src/App.jsx`
**Función:** Componente raíz. Maneja la sesión de Supabase, obtiene el rol del usuario (`usuario` o `administrador`), muestra el **intro tipo Netflix** (`IntroSplash`) al cargar la app y también justo después de un login exitoso, y define las rutas de la aplicación con `react-router-dom` según el rol.

```jsx
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import Layout from './components/layout/Layout'
import IntroSplash from './components/IntroSplash'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsuariosPage from './pages/UsuariosPage'
import GastosPage from './pages/GastosPage'
import IngresosPage from './pages/IngresosPage'
import PresupuestosPage from './pages/PresupuestosPage'
import CuentasPage from './pages/CuentasPage'
import AdminPage from './pages/AdminPage'
import AdminUsuariosPage from './pages/AdminUsuariosPage'
import AdminReportesPage from './pages/AdminReportesPage'
import AdminSoportePage from './pages/AdminSoportePage'
import SoportePage from './pages/SoportePage'
import './index.css'

function App() {
  const [session, setSession] = useState(null)
  const [rol, setRol] = useState(null)
  const [verIndex, setVerIndex] = useState(true)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) { setVerIndex(false); obtenerRol(session.user.id) }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) { setVerIndex(false); obtenerRol(session.user.id) }
      else { setRol(null) }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function obtenerRol(userId) {
    const { data } = await supabase
      .from('roles')
      .select('rol')
      .eq('id', userId)
      .single()
    if (data) setRol(data.rol)
  }

  // Se llama cuando el login (o registro) es exitoso: guarda la
  // sesión y vuelve a mostrar el intro antes de entrar al dashboard.
  function handleLoginSuccess(newSession) {
    setSession(newSession)
    setShowIntro(true)
  }

  // Intro tipo Netflix: se muestra al cargar la app por primera vez,
  // y también cada vez que se inicia sesión exitosamente.
  if (showIntro) {
    return <IntroSplash onFinish={() => setShowIntro(false)} />
  }

  if (verIndex && !session) return <IndexPage onEntrar={() => setVerIndex(false)} />
  if (!session) return <LoginPage onLogin={handleLoginSuccess} onVolver={() => setVerIndex(true)} />
  if (!rol) return <p className="text-white text-center mt-5">Cargando...</p>

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout session={session} rol={rol} />}>

          {/* Rutas USUARIO */}
          {rol === 'usuario' && (
            <>
              <Route path="/" element={<DashboardPage session={session} />} />
              <Route path="/gastos" element={<GastosPage session={session} />} />
              <Route path="/ingresos" element={<IngresosPage session={session} />} />
              <Route path="/presupuestos" element={<PresupuestosPage session={session} />} />
              <Route path="/usuarios" element={<UsuariosPage session={session} />} />
              <Route path="/soporte" element={<SoportePage session={session} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}

          {/* Rutas ADMINISTRADOR */}
          {rol === 'administrador' && (
            <>
              <Route path="/" element={<AdminPage />} />
              <Route path="/admin/usuarios" element={<AdminUsuariosPage session={session} />} />
              <Route path="/admin/reportes" element={<AdminReportesPage />} />
              <Route path="/admin/soporte" element={<AdminSoportePage session={session} />} />
              <Route path="/cuentas" element={<CuentasPage />} />
              <Route path="/usuarios" element={<UsuariosPage session={session} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

---

### 1.2 `Sidebar.jsx`
**Ruta:** `src/components/layout/Sidebar.jsx`
**Función:** Menú lateral de navegación. Muestra enlaces distintos según el rol (`LINKS_USUARIO` / `LINKS_ADMIN`) e incluye un buscador que filtra las opciones en tiempo real.

```jsx
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS_USUARIO = [
  { to: '/', emoji: '📊', label: 'Mi Resumen' },
  { to: '/gastos', emoji: '💸', label: 'Gastos' },
  { to: '/ingresos', emoji: '💰', label: 'Ingresos' },
  { to: '/presupuestos', emoji: '📋', label: 'Presupuestos' },
  { to: '/soporte', emoji: '💬', label: 'Soporte' },
  { to: '/usuarios', emoji: '👤', label: 'Perfil' },
]

const LINKS_ADMIN = [
  { to: '/', emoji: '⚙️', label: 'Panel Admin' },
  { to: '/cuentas', emoji: '🏦', label: 'Cuentas' },
  { to: '/admin/usuarios', emoji: '👥', label: 'Usuarios' },
  { to: '/admin/reportes', emoji: '📈', label: 'Reportes' },
  { to: '/admin/soporte', emoji: '💬', label: 'Soporte' },
  { to: '/usuarios', emoji: '👤', label: 'Mi Perfil' },
]

function Sidebar({ rol }) {
  const [busqueda, setBusqueda] = useState('')
  const links = rol === 'administrador' ? LINKS_ADMIN : LINKS_USUARIO
  const linksFiltrados = links.filter(link =>
    link.label.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <aside className="sidebar">
      <div className="px-3 pb-2">
        <span className={`badge w-100 py-1 ${rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
          {rol === 'administrador' ? '⚙️ Administrador' : '👤 Usuario'}
        </span>
      </div>
      <div style={{ padding: '0 8px 12px' }}>
        <input
          type="text"
          className="form-control bg-black border-secondary text-white"
          placeholder="🔍 Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ fontSize: '13px' }}
        />
      </div>
      {linksFiltrados.length === 0 ? (
        <p className="text-muted small px-3">Sin resultados</p>
      ) : (
        linksFiltrados.map((link) => (
          <NavLink
            key={link.to + link.label}
            to={link.to}
            onClick={() => setBusqueda('')}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            {link.emoji} {link.label}
          </NavLink>
        ))
      )}
    </aside>
  )
}

export default Sidebar
```

---

### 1.3 `AdminReportesPage.jsx`
**Ruta:** `src/pages/AdminReportesPage.jsx`
**Función:** Panel de administrador para generar reportes financieros en PDF por usuario y mes. Muestra un selector de usuario y mes, una vista previa con totales, y un botón para descargar el PDF (la lógica del PDF se detalla en la sección 2).

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function getMesesDesde(fechaRegistro) {
  const meses = []
  const inicio = new Date(fechaRegistro)
  const hoy = new Date()
  let actual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  while (actual <= hoy) {
    meses.push({
      valor: `${actual.getFullYear()}-${String(actual.getMonth() + 1).padStart(2, '0')}`,
      label: actual.toLocaleString('es-CO', { month: 'long', year: 'numeric' })
    })
    actual.setMonth(actual.getMonth() + 1)
  }
  return meses.reverse()
}

export default function AdminReportesPage() {
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [meses, setMeses] = useState([])
  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual)
  const [generando, setGenerando] = useState(false)
  const [preview, setPreview] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarUsuarios() {
      const { data } = await supabase
        .from('usuarios_info')
        .select('id, email, rol, created_at')
      if (data) setUsuarios(data)
      setCargando(false)
    }
    cargarUsuarios()
  }, [])

  function handleUsuarioChange(e) {
    const id = e.target.value
    setUsuarioSeleccionado(id)
    setPreview(null)

    if (id) {
      const usuario = usuarios.find(u => u.id === id)
      if (usuario) {
        const mesesDisponibles = getMesesDesde(usuario.created_at)
        setMeses(mesesDisponibles)
        setMesSeleccionado(mesesDisponibles[0]?.valor || mesActual)
      }
    } else {
      setMeses([])
    }
  }

  async function generarReporte() {
    // Ver sección 2.2 "Generación de PDF" para el detalle completo
    // de la consulta de datos y construcción del documento.
  }

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-4">📈 Reportes</h2>

      <div className="card bg-dark border-secondary p-4 mb-4" style={{ borderRadius: '16px' }}>
        <h5 className="text-white mb-3">⚙️ Configurar reporte</h5>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label text-white fw-light">Usuario</label>
            <select className="form-select bg-black border-secondary text-white" value={usuarioSeleccionado} onChange={handleUsuarioChange}>
              <option value="">-- Selecciona un usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.email} ({u.rol})</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label text-white fw-light">Mes</label>
            <select
              className="form-select bg-black border-secondary text-white"
              value={mesSeleccionado}
              onChange={(e) => { setMesSeleccionado(e.target.value); setPreview(null) }}
              disabled={!usuarioSeleccionado}
            >
              {meses.length === 0
                ? <option value="">-- Selecciona un usuario primero --</option>
                : meses.map((m) => (<option key={m.valor} value={m.valor}>{m.label}</option>))
              }
            </select>
          </div>
        </div>

        <button className="btn btn-danger fw-bold w-100 mt-4" onClick={generarReporte} disabled={generando || !usuarioSeleccionado}>
          {generando ? 'Generando PDF...' : '📄 Generar y descargar PDF'}
        </button>
      </div>

      {preview && (
        <div className="card bg-dark border-info border-opacity-25 p-4" style={{ borderRadius: '16px' }}>
          <h5 className="text-white mb-3">👁️ Vista previa — {preview.labelMes}</h5>
          <p className="text-secondary small mb-3">Usuario: <strong className="text-white">{preview.emailUsuario}</strong></p>
          <div className="row g-3 mb-3">
            <div className="col-4">
              <div className="card bg-dark border-success border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                <small className="text-secondary">Ingresos</small>
                <div className="text-success fw-bold">$ {preview.totalIngresos.toLocaleString('es-CO')}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="card bg-dark border-danger border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                <small className="text-secondary">Gastos</small>
                <div className="text-danger fw-bold">$ {preview.totalGastos.toLocaleString('es-CO')}</div>
              </div>
            </div>
            <div className="col-4">
              <div className={`card bg-dark p-3 text-center border-opacity-50 ${preview.balance >= 0 ? 'border-info' : 'border-warning'}`} style={{ borderRadius: '12px' }}>
                <small className="text-secondary">Balance</small>
                <div className={`fw-bold ${preview.balance >= 0 ? 'text-info' : 'text-warning'}`}>$ {preview.balance.toLocaleString('es-CO')}</div>
              </div>
            </div>
          </div>
          <p className="text-secondary small">
            📊 {preview.ingresos?.length || 0} ingresos · {preview.gastos?.length || 0} gastos · {preview.presupuestos?.length || 0} presupuestos
          </p>
        </div>
      )}
    </div>
  )
}
```

---

### 1.4 `AdminSoportePage.jsx`
**Ruta:** `src/pages/AdminSoportePage.jsx`
**Función:** Vista de administrador del módulo de Soporte. Permite enviar un mensaje/sugerencia a un usuario específico (asunto + contenido) y muestra un historial de todos los mensajes enviados, marcando si fueron leídos.

```jsx
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
```

---

### 1.5 `SoportePage.jsx`
**Ruta:** `src/pages/SoportePage.jsx`
**Función:** Vista de usuario del módulo de Soporte. Lista los mensajes recibidos del administrador, indica cuántos están sin leer y permite marcarlos como leídos (uno por uno o todos a la vez).

```jsx
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
```

---

### 1.6 `AdminUsuariosPage.jsx`
**Ruta:** `src/pages/AdminUsuariosPage.jsx`
**Función:** Panel de administrador para gestionar usuarios. Muestra una tabla con todos los usuarios (email, rol, fecha de registro) y permite cambiar el rol de un usuario o eliminarlo por completo (con borrado en cascada de sus datos). El propio admin no puede cambiarse el rol ni eliminarse a sí mismo.

```jsx
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
      .rpc('obtener_usuarios')
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
```

---

### 1.7 `FiltroGastos.jsx`
**Ruta:** `src/components/FiltroGastos.jsx` (componente reutilizable)
**Función:** Barra de filtros para la lista de gastos. Permite filtrar por texto libre, categoría, rango de fechas y monto máximo. Cada cambio dispara `onFiltrar` con el objeto de filtros actualizado, y un botón "Limpiar filtros" restablece todo a su estado inicial.

```jsx
import { useState } from 'react'

const CATEGORIAS = [
  'Alimentación',
  'Arriendo / Vivienda',
  'Servicios públicos',
  'Transporte',
  'Salud',
  'Educación',
  'Ropa y calzado',
  'Entretenimiento / Ocio',
  'Tecnología',
  'Deudas / Créditos',
  'Ahorro',
  'Inversiones',
  'Mascotas',
  'Belleza / Cuidado personal',
  'Otros',
]

export default function FiltroGastos({ onFiltrar }) {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    fechaInicio: '',
    fechaFin: '',
    montoMax: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const nuevosFiltros = { ...filtros, [name]: value }
    setFiltros(nuevosFiltros)
    if (onFiltrar) onFiltrar(nuevosFiltros)
  }

  const handleReset = () => {
    const filtrosLimpios = {
      busqueda: '',
      categoria: '',
      fechaInicio: '',
      fechaFin: '',
      montoMax: ''
    }
    setFiltros(filtrosLimpios)
    if (onFiltrar) onFiltrar(filtrosLimpios)
  }

  return (
    <div className="card bg-dark border-secondary p-4 mb-4" style={{ borderRadius: '16px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-white m-0">🔍 Filtrar Gastos</h5>
        <button type="button" className="btn btn-link text-info small p-0" onClick={handleReset}>
          Limpiar filtros
        </button>
      </div>

      <div className="row g-3">

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label text-white fw-light small">Buscar concepto</label>
          <input
            type="text"
            name="busqueda"
            className="form-control bg-black border-secondary text-white"
            placeholder="Ej: Mercado, Netflix..."
            value={filtros.busqueda}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label text-white fw-light small">Categoría</label>
          <select
            name="categoria"
            className="form-select bg-black border-secondary text-white"
            value={filtros.categoria}
            onChange={handleChange}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label text-white fw-light small">Fecha desde</label>
          <input
            type="date"
            name="fechaInicio"
            className="form-control bg-black border-secondary text-white"
            value={filtros.fechaInicio}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label text-white fw-light small">Fecha hasta</label>
          <input
            type="date"
            name="fechaFin"
            className="form-control bg-black border-secondary text-white"
            value={filtros.fechaFin}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label text-white fw-light small">Monto máximo ($)</label>
          <input
            type="number"
            name="montoMax"
            className="form-control bg-black border-secondary text-white"
            placeholder="Ej: 500000"
            value={filtros.montoMax}
            onChange={handleChange}
          />
        </div>

      </div>
    </div>
  )
}
```

---

### 1.8 `AdminPage.jsx`
**Ruta:** `src/pages/AdminPage.jsx`
**Función:** Panel principal (home) del administrador, con la estética "Portal Contable y Financiero SMC": hero header con eyebrow, 4 tarjetas KPI (`.kpi-card`) para Usuarios/Ingresos/Gastos/Balance, gráfico de barras comparativo, dos gráficos de torta (gastos e ingresos por categoría) con `recharts` recoloreados a la paleta cian/teal, y tabla de usuarios registrados.

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORES = ['#22D3EE', '#2DD4A8', '#FBBF24', '#FF5C7A', '#A78BFA', '#FD7E14', '#60A5FA', '#F472B6']

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalGastos: 0,
    totalIngresos: 0,
    balance: 0,
  })
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [ingresosPorCategoria, setIngresosPorCategoria] = useState([])
  const [comparativa, setComparativa] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)

    const { data: roles } = await supabase.from('roles').select('id, rol, created_at')
    const { data: gastos } = await supabase.from('gastos').select('monto, categoria_nombre')
    const { data: ingresos } = await supabase.from('ingresos').select('monto, categoria_nombre')

    const sumGastos = gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0
    const sumIngresos = ingresos?.reduce((acc, i) => acc + Number(i.monto), 0) || 0

    setStats({
      totalUsuarios: roles?.length || 0,
      totalGastos: sumGastos,
      totalIngresos: sumIngresos,
      balance: sumIngresos - sumGastos,
    })

    setUsuarios(roles || [])

    const mapGastos = {}
    gastos?.forEach((g) => {
      const cat = g.categoria_nombre || 'Sin categoría'
      mapGastos[cat] = (mapGastos[cat] || 0) + Number(g.monto)
    })
    setGastosPorCategoria(Object.entries(mapGastos).map(([name, value]) => ({ name, value })))

    const mapIngresos = {}
    ingresos?.forEach((i) => {
      const cat = i.categoria_nombre || 'Sin categoría'
      mapIngresos[cat] = (mapIngresos[cat] || 0) + Number(i.monto)
    })
    setIngresosPorCategoria(Object.entries(mapIngresos).map(([name, value]) => ({ name, value })))

    setComparativa([
      { name: 'Ingresos', monto: sumIngresos },
      { name: 'Gastos', monto: sumGastos },
      { name: 'Balance', monto: sumIngresos - sumGastos },
    ])

    setCargando(false)
  }

  if (cargando) return <p className="text-secondary text-center mt-5">Cargando panel admin...</p>

  return (
    <div className="container py-4">

      {/* ==================== HERO / ENCABEZADO DEL PORTAL ==================== */}
      <section className="hero-header">
        <p className="hero-header__eyebrow">PANEL ADMINISTRADOR // SISTEMA SMC</p>
        <h1>Portal Contable y Financiero SMC</h1>
        <p>Estadísticas globales del sistema — control de ingresos, gastos y usuarios en tiempo real.</p>
      </section>

      {/* ==================== KPI CARDS ==================== */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="kpi-card h-100">
            <div className="kpi-card__label">Total Usuarios</div>
            <div className="kpi-card__value kpi-card__value--accent">{stats.totalUsuarios}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card h-100">
            <div className="kpi-card__label">Total Ingresos</div>
            <div className="kpi-card__value kpi-card__value--success">$ {stats.totalIngresos.toLocaleString('es-CO')}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card h-100">
            <div className="kpi-card__label">Total Gastos</div>
            <div className="kpi-card__value kpi-card__value--danger">$ {stats.totalGastos.toLocaleString('es-CO')}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card h-100">
            <div className="kpi-card__label">Balance Global</div>
            <div className={`kpi-card__value ${stats.balance >= 0 ? 'kpi-card__value--accent' : 'kpi-card__value--danger'}`}>
              $ {stats.balance.toLocaleString('es-CO')}
            </div>
            <div className={`kpi-card__delta ${stats.balance >= 0 ? 'kpi-card__delta--up' : 'kpi-card__delta--down'}`}>
              {stats.balance >= 0 ? '▲ Positivo' : '▼ Negativo'}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== GRÁFICO DE FLUJO (comparativa) ==================== */}
      <div className="card mb-4">
        <p className="eyebrow mb-1">FLUJO DE EFECTIVO</p>
        <h5 className="text-white mb-3">Comparativa global — Ingresos, Gastos y Balance</h5>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparativa}>
            <XAxis dataKey="name" stroke="#565F6E" />
            <YAxis stroke="#565F6E" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`}
              contentStyle={{ backgroundColor: '#10141C', border: '1px solid #1E2530', borderRadius: '8px' }}
            />
            <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
              {comparativa.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.name === 'Ingresos' ? '#2DD4A8' : entry.name === 'Gastos' ? '#FF5C7A' : '#22D3EE'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ==================== COMPOSICIÓN (tortas) ==================== */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <p className="eyebrow mb-1">COMPOSICIÓN</p>
            <h5 className="text-white mb-3">Gastos por categoría</h5>
            {gastosPorCategoria.length === 0 ? (
              <p className="text-secondary text-center">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={gastosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {gastosPorCategoria.map((_, i) => (<Cell key={i} fill={COLORES[i % COLORES.length]} />))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`}
                    contentStyle={{ backgroundColor: '#10141C', border: '1px solid #1E2530', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <p className="eyebrow mb-1">COMPOSICIÓN</p>
            <h5 className="text-white mb-3">Ingresos por categoría</h5>
            {ingresosPorCategoria.length === 0 ? (
              <p className="text-secondary text-center">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={ingresosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {ingresosPorCategoria.map((_, i) => (<Cell key={i} fill={COLORES[i % COLORES.length]} />))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`}
                    contentStyle={{ backgroundColor: '#10141C', border: '1px solid #1E2530', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ==================== TABLA (últimos movimientos / usuarios) ==================== */}
      <div className="card">
        <p className="eyebrow mb-1">REGISTRO</p>
        <h5 className="text-white mb-3">Usuarios registrados</h5>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Rol</th>
              <th>Registrado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="text-secondary small">{u.id}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: u.rol === 'administrador' ? 'var(--danger-soft)' : 'var(--accent-soft)',
                      color: u.rol === 'administrador' ? 'var(--danger)' : 'var(--accent)',
                    }}
                  >
                    {u.rol}
                  </span>
                </td>
                <td className="text-secondary small">
                  {new Date(u.created_at).toLocaleDateString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

### 1.9 `CuentasPage.jsx`
**Ruta:** `src/pages/CuentasPage.jsx`
**Función:** Panel de administrador para inspeccionar la cuenta de cualquier usuario. Muestra una lista de usuarios a la izquierda; al seleccionar uno, carga su detalle (gastos e ingresos) con tarjetas de resumen (ingresos/gastos/balance) y pestañas para alternar entre las tablas de gastos e ingresos.

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function CuentasPage() {
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [gastos, setGastos] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [pestana, setPestana] = useState('gastos')
  const [cargando, setCargando] = useState(true)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    setCargando(true)
    const { data, error } = await supabase
      .rpc('obtener_usuarios')
    if (error) console.error(error)
    else setUsuarios(data)
    setCargando(false)
  }

  async function verDetalle(usuario) {
    setUsuarioSeleccionado(usuario)
    setCargandoDetalle(true)
    setPestana('gastos')

    const { data: g } = await supabase
      .from('gastos')
      .select('id_gasto, descripcion, categoria_nombre, tipo, monto, fecha')
      .eq('user_id', usuario.id)
      .order('fecha', { ascending: false })

    const { data: i } = await supabase
      .from('ingresos')
      .select('id_ingreso, descripcion, categoria_nombre, tipo, monto, fecha')
      .eq('user_id', usuario.id)
      .order('fecha', { ascending: false })

    setGastos(g || [])
    setIngresos(i || [])
    setCargandoDetalle(false)
  }

  const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const totalIngresos = ingresos.reduce((acc, i) => acc + Number(i.monto), 0)
  const balance = totalIngresos - totalGastos

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-4">🏦 Control de Cuentas</h2>

      <div className="row g-4">

        {/* LISTA DE USUARIOS */}
        <div className="col-12 col-md-4">
          <div className="card bg-dark border-secondary p-3" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">👥 Usuarios ({usuarios.length})</h5>
            {cargando ? (
              <p className="text-secondary">Cargando...</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {usuarios.map((u) => (
                  <button
                    key={u.id}
                    className={`btn text-start p-3 ${usuarioSeleccionado?.id === u.id ? 'btn-info text-dark' : 'btn-outline-secondary text-white'}`}
                    style={{ borderRadius: '10px' }}
                    onClick={() => verDetalle(u)}
                  >
                    <div className="fw-bold small">{u.email}</div>
                    <div className="d-flex gap-2 mt-1">
                      <span className={`badge ${u.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                        {u.rol}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>
                        {new Date(u.created_at).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DETALLE DEL USUARIO */}
        <div className="col-12 col-md-8">
          {!usuarioSeleccionado ? (
            <div className="card bg-dark border-secondary p-4 text-center" style={{ borderRadius: '16px', minHeight: '200px' }}>
              <p className="text-secondary mt-4">👈 Selecciona un usuario para ver su detalle</p>
            </div>
          ) : (
            <div className="card bg-dark border-danger border-opacity-25 p-4" style={{ borderRadius: '16px' }}>

              {/* Header usuario */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="text-white fw-bold m-0">{usuarioSeleccionado.email}</h5>
                  <span className={`badge ${usuarioSeleccionado.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                    {usuarioSeleccionado.rol}
                  </span>
                </div>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setUsuarioSeleccionado(null)}>
                  ✕ Cerrar
                </button>
              </div>

              {/* Tarjetas resumen */}
              {!cargandoDetalle && (
                <div className="row g-3 mb-3">
                  <div className="col-4">
                    <div className="card bg-dark border-success border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">Ingresos</small>
                      <div className="text-success fw-bold">$ {totalIngresos.toLocaleString('es-CO')}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card bg-dark border-danger border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">Gastos</small>
                      <div className="text-danger fw-bold">$ {totalGastos.toLocaleString('es-CO')}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className={`card bg-dark p-3 text-center border-opacity-50 ${balance >= 0 ? 'border-info' : 'border-warning'}`} style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">Balance</small>
                      <div className={`fw-bold ${balance >= 0 ? 'text-info' : 'text-warning'}`}>
                        $ {balance.toLocaleString('es-CO')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestañas */}
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button className={`nav-link ${pestana === 'gastos' ? 'active text-danger' : 'text-secondary'}`} onClick={() => setPestana('gastos')}>
                    💸 Gastos ({gastos.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${pestana === 'ingresos' ? 'active text-success' : 'text-secondary'}`} onClick={() => setPestana('ingresos')}>
                    💰 Ingresos ({ingresos.length})
                  </button>
                </li>
              </ul>

              {cargandoDetalle ? (
                <p className="text-secondary">Cargando datos...</p>
              ) : (
                <>
                  {pestana === 'gastos' && (
                    gastos.length === 0 ? (
                      <p className="text-secondary">Sin gastos registrados.</p>
                    ) : (
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table table-dark table-bordered table-hover table-sm align-middle">
                          <thead>
                            <tr>
                              <th className="text-danger">Descripción</th>
                              <th className="text-danger">Categoría</th>
                              <th className="text-danger">Monto</th>
                              <th className="text-danger">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gastos.map((g) => (
                              <tr key={g.id_gasto}>
                                <td>{g.descripcion}</td>
                                <td><span className="badge bg-secondary">{g.categoria_nombre || '—'}</span></td>
                                <td className="text-danger fw-bold">$ {Number(g.monto).toLocaleString('es-CO')}</td>
                                <td>{new Date(g.fecha).toLocaleDateString('es-CO')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {pestana === 'ingresos' && (
                    ingresos.length === 0 ? (
                      <p className="text-secondary">Sin ingresos registrados.</p>
                    ) : (
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table table-dark table-bordered table-hover table-sm align-middle">
                          <thead>
                            <tr>
                              <th className="text-success">Descripción</th>
                              <th className="text-success">Categoría</th>
                              <th className="text-success">Monto</th>
                              <th className="text-success">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingresos.map((i) => (
                              <tr key={i.id_ingreso}>
                                <td>{i.descripcion}</td>
                                <td><span className="badge bg-secondary">{i.categoria_nombre || '—'}</span></td>
                                <td className="text-success fw-bold">$ {Number(i.monto).toLocaleString('es-CO')}</td>
                                <td>{new Date(i.fecha).toLocaleDateString('es-CO')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### 1.10 `IndexPage.jsx`
**Ruta:** `src/pages/IndexPage.jsx`
**Función:** Página principal (landing) antes de iniciar sesión. Navbar con pills de estado ("● SISTEMA ACTIVO", "V1.0") y tabs que hacen scroll a cada sección (Introducción, El Problema, Objetivos, Fundadores). Hero con `.hero-header` (eyebrow + título), 4 tarjetas `.kpi-card` decorativas (módulos, stack, equipo, ubicación), sección "El Problema" en `.glow-card` con resplandor rojo, "Objetivos" y "Fundadores" con tarjetas `.glow-card` con resplandor cian. Fondo animado con `bg-slideshow--principal`.

```jsx
function IndexPage({ onEntrar }) {
  return (
    <>
      {/* FONDO ANIMADO (crossfade + Ken Burns) */}
      <div className="bg-slideshow bg-slideshow--principal">
        <div className="bg-slideshow__layer"></div>
        <div className="bg-slideshow__layer"></div>
      </div>
      <div className="bg-slideshow__overlay"></div>

      <div style={{ minHeight: '100vh' }}>

        {/* ==================== NAVBAR ==================== */}
        <nav
          className="navbar navbar-expand-lg navbar-dark px-4"
          style={{ backgroundColor: 'rgba(16, 20, 28, 0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="container-fluid">
            <h1 className="navbar-brand fw-bold text-info fs-4 m-0 d-flex align-items-center gap-2">
              Sistema SMC
            </h1>

            {/* Pills de estado, estilo "LIVE ONLINE / SYS V4.2" */}
            <div className="d-none d-lg-flex align-items-center gap-2 ms-3">
              <span className="badge" style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>
                ● SISTEMA ACTIVO
              </span>
              <span className="badge font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                V1.0
              </span>
            </div>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              {/* Tabs de navegación a cada sección */}
              <div className="navbar-nav mx-auto d-flex flex-row gap-4">
                <a href="#introduccion" className="nav-link text-secondary small text-uppercase" style={{ letterSpacing: '0.06em' }}>Introducción</a>
                <a href="#problema" className="nav-link text-secondary small text-uppercase" style={{ letterSpacing: '0.06em' }}>El Problema</a>
                <a href="#objetivos" className="nav-link text-secondary small text-uppercase" style={{ letterSpacing: '0.06em' }}>Objetivos</a>
                <a href="#fundadores" className="nav-link text-secondary small text-uppercase" style={{ letterSpacing: '0.06em' }}>Fundadores</a>
              </div>

              <div className="navbar-nav ms-auto">
                <button
                  className="btn btn-outline-info me-2"
                  onClick={onEntrar}
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container py-5">

          {/* ==================== HERO / INTRODUCCIÓN ==================== */}
          <section id="introduccion" className="hero-header">
            <p className="eyebrow mb-2">SISTEMA SMC // GESTIÓN CONTABLE INTELIGENTE</p>
            <h1>INTRODUCCIÓN</h1>
            <p className="lead fw-normal mb-3" style={{ maxWidth: '760px', color: 'rgba(232,237,242,0.85)' }}>
              La aplicación busca resolver problemas en cuanto a la <strong style={{ color: 'var(--text-primary)' }}>administración contable</strong> de las empresas,
              mediante un sistema el cual realizará el seguimiento a los ingresos y gastos teniendo en cuenta los gastos
              fijos, variables, impuestos e inversiones.
            </p>
            <p style={{ maxWidth: '760px' }}>
              Nuestro objetivo es brindar una oportunidad para que los comercios en Colombia tengan un mejor futuro,
              logrando expandirse y crecer monetariamente a través de operaciones estadísticas precisas.
            </p>
          </section>

          {/* ==================== TARJETAS DE MÉTRICAS (decorativas) ==================== */}
          <div className="row g-3 mb-5">
            <div className="col-6 col-md-3">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Módulos activos</div>
                <div className="kpi-card__value kpi-card__value--accent">12+</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Stack tecnológico</div>
                <div className="kpi-card__value" style={{ fontSize: '18px' }}>React + Supabase</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Equipo</div>
                <div className="kpi-card__value kpi-card__value--success">6 devs</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Base</div>
                <div className="kpi-card__value" style={{ fontSize: '18px' }}>Medellín, CO</div>
              </div>
            </div>
          </div>

          <hr className="my-5" style={{ borderColor: 'var(--border)', opacity: 0.5 }} />

          {/* ==================== EL PROBLEMA ==================== */}
          <section id="problema" className="row justify-content-center mb-5">
            <div className="col-md-10 text-center">
              <p className="eyebrow mb-2">DIAGNÓSTICO</p>
              <h2 className="section-title mb-4" style={{ color: 'var(--danger)' }}>EL PROBLEMA</h2>
              <div className="glow-card text-start" style={{ borderColor: 'rgba(255, 92, 122, 0.3)', boxShadow: '0 0 16px rgba(255, 92, 122, 0.15), var(--shadow-card)' }}>
                <p className="fs-5 fw-light fst-italic mb-3">
                  "Muchos microempresarios en Colombia no conocen la importancia de un orden financiero,
                  lo que provoca pérdidas de dinero y cierres prematuros."
                </p>
                <p className="m-0">
                  Nuestra aplicación soluciona esta brecha informativa, proporcionando un sistema de seguimiento
                  robusto que informa y previene la insolvencia.
                </p>
              </div>
            </div>
          </section>

          {/* ==================== OBJETIVOS ==================== */}
          <section id="objetivos">
            <div className="mt-5 p-3 rounded-pill text-center mb-3" style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--border-glow)' }}>
              <h2 className="section-title m-0">OBJETIVOS</h2>
            </div>

            <div className="card mb-5">
              <h3 className="text-info mb-3">Objetivo General</h3>
              <p className="mb-4">Diseñar y crear una aplicación web que permita registrar, controlar y analizar los ingresos y gastos de los usuarios.</p>

              <h3 className="text-info mb-3">Objetivos Específicos</h3>
              <ul className="text-secondary m-0">
                <li>Identificar los diferentes tipos de aplicaciones contables e identificar el funcionamiento y las variables</li>
                <li>Crear y diseñar el modelo de datos para la aplicación contable</li>
                <li>Diseñar y crear el sistema contable</li>
                <li>Realizar pruebas al sistema contable</li>
                <li>Documentar el desarrollo del sistema y elaborar manuales de usuario</li>
              </ul>
            </div>
          </section>

          {/* ==================== FUNDADORES ==================== */}
          <section id="fundadores">
            <div className="mt-5 p-3 rounded-pill text-center mb-4" style={{ backgroundColor: 'var(--accent)' }}>
              <h2 className="fw-bolder m-0" style={{ color: '#06131A' }}>FUNDADORES</h2>
            </div>

            <div className="row g-4 mb-4">

              {/* Yulian */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, background: 'linear-gradient(45deg, #0d6efd, var(--accent))', border: '2px solid var(--accent)' }}>
                    <span className="text-white small">Foto Yulian</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Yulian Monsalve</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>Frontend & Backend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Residente en Carpinelo, Medellín. Especialista en HTML y CSS con visión en lógica de Backend.
                    Su enfoque es la funcionalidad robusta y la profesionalización tecnológica.
                  </p>
                </div>
              </div>

              {/* Sarai */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, background: 'linear-gradient(45deg, #6610f2, #d63384)', border: '2px solid #d63384' }}>
                    <span className="text-white small">Foto Sarai</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Sarai Cardona</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'rgba(214, 51, 132, 0.15)', color: '#d63384' }}>Frontend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Residente de Santo Domingo, Medellín. Especialista en diseño visual. Se enfoca en crear
                    experiencias impactantes, creativas y fáciles de usar para el usuario final.
                  </p>
                </div>
              </div>

              {/* Daniel */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, backgroundColor: '#ff2626', border: '2px dashed var(--border-light)' }}>
                    <span className="text-white small">Foto Daniel</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Daniel Gomez</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>Frontend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Daniel Gómez Ortiz, residente en Santo Domingo, Medellín. Se especializa en diseño visual
                    y calidad. Busca que su trabajo sea detallado y del agrado de los clientes.
                  </p>
                </div>
              </div>

              {/* Gerald */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, backgroundColor: '#4d9fdd', border: '2px dashed var(--border-light)' }}>
                    <span className="text-white small">Foto Gerald</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Gerald Williams</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'rgba(104, 14, 207, 0.15)', color: '#a25bf0' }}>Frontend & Backend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Desarrollador Backend Jr. en Medellín. Especialista en administración de bases de datos y Node.js.
                    Enfocado en crear sistemas escalables y eficientes.
                  </p>
                </div>
              </div>

            </div>

            <div className="row g-4 mb-5 justify-content-center">
              {/* Juan Jose */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, backgroundColor: '#0d6efd', border: '2px dashed var(--border-light)' }}>
                    <span className="text-white small">Foto Juan Jose</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Juan Jose Gaviria</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'rgba(104, 14, 207, 0.15)', color: '#a25bf0' }}>Frontend & Backend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Residente del Carpinelo, Medellín, Colombia. Desarrollador Backend Jr. especialista en
                    Node.js y bases de datos. Enfocado en construir sistemas robustos y eficientes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== BOTÓN ENTRAR ==================== */}
          <div className="text-center mt-4 mb-5">
            <button
              className="btn fw-bold px-5 py-3"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#06131A',
                letterSpacing: '1px',
                borderRadius: '50px',
                fontSize: '18px',
                boxShadow: 'var(--accent-glow)'
              }}
              onClick={onEntrar}
            >
              Entrar al Sistema →
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default IndexPage
```

---

### 1.11 `LoginPage.jsx`
**Ruta:** `src/pages/LoginPage.jsx`
**Función:** Formulario de inicio de sesión / registro contra Supabase Auth. Fondo de **partículas animadas** (`ParticlesBackground`, ver 1.14) en vez de fotos estáticas. Tarjeta con borde y resplandor cian (`var(--accent-glow)`), eyebrow "AUTENTICACIÓN SMC" y subtítulo. Al iniciar sesión con éxito llama a `onLogin(session)`, que en `App.jsx` dispara de nuevo el intro tipo Netflix antes de mostrar el dashboard.

```jsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ParticlesBackground from '../components/ParticlesBackground'

export default function LoginPage({ onLogin, onVolver }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setErrorMsg(error.message); return }
    if (data.session) { onLogin(data.session) }
    else if (isSignUp) { setErrorMsg('Revisa tu correo para confirmar la cuenta.') }
  }

  return (
    <>
      {/* FONDO: partículas animadas (puntos + líneas en movimiento) */}
      <ParticlesBackground particleCount={80} />
      <div className="bg-slideshow__overlay"></div>

      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-glow)',
                borderRadius: '20px',
                boxShadow: 'var(--accent-glow), var(--shadow-elevated)',
              }}
            >
              <div className="card-body">

                {/* Botón volver */}
                <button
                  type="button"
                  className="btn btn-link text-secondary p-0 mb-3 d-flex align-items-center gap-1"
                  onClick={onVolver}
                >
                  ← Volver al inicio
                </button>

                <p className="eyebrow text-center mb-1">AUTENTICACIÓN SMC</p>
                <h2 className="text-info fw-bold text-center mb-1">
                  {isSignUp ? 'Crear cuenta' : 'Iniciar Sesión'}
                </h2>
                <p className="text-secondary text-center small mb-4">
                  Accede a tu panel financiero
                </p>

                {errorMsg && (
                  <div className="alert alert-danger py-2 text-center small">{errorMsg}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-white fw-light">Correo</label>
                    <input
                      type="email"
                      className="form-control py-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-white fw-light">Contraseña</label>
                    <input
                      type="password"
                      className="form-control py-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="fw-bold py-2 text-uppercase"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#06131A',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--accent-glow)',
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Cargando...' : isSignUp ? 'Registrarme' : 'Ingresar'}
                    </button>
                  </div>
                  <div className="mt-4 text-center">
                    <button type="button" className="btn btn-link text-info small" onClick={() => setIsSignUp(!isSignUp)}>
                      {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

---

### 1.12 `DashboardPage.jsx`
**Ruta:** `src/pages/DashboardPage.jsx`
**Función:** Panel principal (home) del usuario normal, con la misma estética "Portal" que `AdminPage.jsx`: hero header con el selector de mes integrado, 3 tarjetas `.kpi-card` (Ingresos, Gastos, Balance del mes), gráfico de barras y dos tortas (gastos/ingresos por categoría) recoloreados. La lógica de carga de datos y cálculo de meses disponibles es la misma que en la versión original (ver 2.9 y 2.10 más abajo).

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORES = ['#22D3EE', '#2DD4A8', '#FBBF24', '#FF5C7A', '#A78BFA', '#FD7E14', '#60A5FA', '#F472B6']

function getMesesDisponibles(fechaRegistro) {
  const meses = []
  const inicio = new Date(fechaRegistro)
  const hoy = new Date()
  let actual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  while (actual <= hoy) {
    meses.push({
      valor: `${actual.getFullYear()}-${String(actual.getMonth() + 1).padStart(2, '0')}`,
      label: actual.toLocaleString('es-CO', { month: 'long', year: 'numeric' })
    })
    actual.setMonth(actual.getMonth() + 1)
  }
  return meses.reverse()
}

export default function DashboardPage({ session }) {
  const [totalIngresos, setTotalIngresos] = useState(0)
  const [totalGastos, setTotalGastos] = useState(0)
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [ingresosPorCategoria, setIngresosPorCategoria] = useState([])
  const [comparativa, setComparativa] = useState([])
  const [cargando, setCargando] = useState(true)
  const [meses, setMeses] = useState([])

  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual)

  useEffect(() => {
    if (!session) return
    const fechaRegistro = session.user.created_at || new Date().toISOString()
    setMeses(getMesesDisponibles(fechaRegistro))
    cargarDatos(mesSeleccionado)
  }, [session])

  useEffect(() => {
    if (!session) return
    cargarDatos(mesSeleccionado)
  }, [mesSeleccionado])

  async function cargarDatos(mes) {
    setCargando(true)
    const [anio, mesNum] = mes.split('-').map(Number)
    const primerDia = new Date(anio, mesNum - 1, 1).toISOString().split('T')[0]
    const ultimoDia = new Date(anio, mesNum, 0).toISOString().split('T')[0]

    const { data: ingresos } = await supabase
      .from('ingresos')
      .select('monto, categoria_nombre')
      .eq('user_id', session.user.id)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)

    const { data: gastos } = await supabase
      .from('gastos')
      .select('monto, categoria_nombre')
      .eq('user_id', session.user.id)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)

    const sumIngresos = ingresos?.reduce((acc, i) => acc + Number(i.monto), 0) || 0
    const sumGastos = gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0

    setTotalIngresos(sumIngresos)
    setTotalGastos(sumGastos)

    const mapGastos = {}
    gastos?.forEach((g) => {
      const cat = g.categoria_nombre || 'Sin categoría'
      mapGastos[cat] = (mapGastos[cat] || 0) + Number(g.monto)
    })
    setGastosPorCategoria(Object.entries(mapGastos).map(([name, value]) => ({ name, value })))

    const mapIngresos = {}
    ingresos?.forEach((i) => {
      const cat = i.categoria_nombre || 'Sin categoría'
      mapIngresos[cat] = (mapIngresos[cat] || 0) + Number(i.monto)
    })
    setIngresosPorCategoria(Object.entries(mapIngresos).map(([name, value]) => ({ name, value })))

    setComparativa([
      { name: 'Ingresos', monto: sumIngresos },
      { name: 'Gastos', monto: sumGastos },
      { name: 'Balance', monto: sumIngresos - sumGastos },
    ])

    setCargando(false)
  }

  const balance = totalIngresos - totalGastos
  const labelMes = meses.find(m => m.valor === mesSeleccionado)?.label || mesSeleccionado

  return (
    <div className="container py-4">

      {/* ==================== HERO / ENCABEZADO DEL PORTAL ==================== */}
      <section className="hero-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <p className="hero-header__eyebrow">MI PORTAL // SISTEMA SMC</p>
            <h1 className="mb-1">Mi Resumen Financiero</h1>
            <p className="m-0">
              Resumen de <strong style={{ color: '#fff' }}>{labelMes}</strong>
            </p>
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '200px' }}
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            {meses.map((m) => (
              <option key={m.valor} value={m.valor}>{m.label}</option>
            ))}
          </select>
        </div>
      </section>

      {cargando ? (
        <p className="text-secondary text-center mt-5">Cargando datos...</p>
      ) : (
        <>
          {/* ==================== KPI CARDS ==================== */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Total Ingresos</div>
                <div className="kpi-card__value kpi-card__value--success">$ {totalIngresos.toLocaleString('es-CO')}</div>
                <div className="kpi-card__delta">{ingresosPorCategoria.length} categorías</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Total Gastos</div>
                <div className="kpi-card__value kpi-card__value--danger">$ {totalGastos.toLocaleString('es-CO')}</div>
                <div className="kpi-card__delta">{gastosPorCategoria.length} categorías</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Balance</div>
                <div className={`kpi-card__value ${balance >= 0 ? 'kpi-card__value--accent' : 'kpi-card__value--danger'}`}>
                  $ {balance.toLocaleString('es-CO')}
                </div>
                <div className={`kpi-card__delta ${balance >= 0 ? 'kpi-card__delta--up' : 'kpi-card__delta--down'}`}>
                  {balance >= 0 ? '▲ Positivo' : '▼ Negativo'}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== GRÁFICO DE FLUJO ==================== */}
          <div className="card mb-4">
            <p className="eyebrow mb-1">FLUJO DE EFECTIVO</p>
            <h5 className="text-white mb-3">Comparativa del mes</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparativa}>
                <XAxis dataKey="name" stroke="#565F6E" />
                <YAxis stroke="#565F6E" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`}
                  contentStyle={{ backgroundColor: '#10141C', border: '1px solid #1E2530', borderRadius: '8px' }}
                />
                <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
                  {comparativa.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.name === 'Ingresos' ? '#2DD4A8' : entry.name === 'Gastos' ? '#FF5C7A' : '#22D3EE'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ==================== COMPOSICIÓN (tortas) ==================== */}
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="card h-100">
                <p className="eyebrow mb-1">COMPOSICIÓN</p>
                <h5 className="text-white mb-3">Gastos por categoría</h5>
                {gastosPorCategoria.length === 0 ? (
                  <p className="text-secondary text-center">Sin gastos este mes</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={gastosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {gastosPorCategoria.map((_, i) => (<Cell key={i} fill={COLORES[i % COLORES.length]} />))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`}
                        contentStyle={{ backgroundColor: '#10141C', border: '1px solid #1E2530', borderRadius: '8px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card h-100">
                <p className="eyebrow mb-1">COMPOSICIÓN</p>
                <h5 className="text-white mb-3">Ingresos por categoría</h5>
                {ingresosPorCategoria.length === 0 ? (
                  <p className="text-secondary text-center">Sin ingresos este mes</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={ingresosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {ingresosPorCategoria.map((_, i) => (<Cell key={i} fill={COLORES[i % COLORES.length]} />))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`}
                        contentStyle={{ backgroundColor: '#10141C', border: '1px solid #1E2530', borderRadius: '8px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

---

### 1.13 `Layout.jsx`
**Ruta:** `src/components/layout/Layout.jsx`
**Función:** Layout de la app interna (después de iniciar sesión). Envuelve `Sidebar` + `Header` + `main-content` (rutas vía `Outlet`) + `Footer`, con el fondo animado `bg-slideshow--app` detrás de todo.

```jsx
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

function Layout({ session, rol }) {
  return (
    <>
      {/* FONDO ANIMADO (crossfade + Ken Burns) */}
      <div className="bg-slideshow bg-slideshow--app">
        <div className="bg-slideshow__layer"></div>
        <div className="bg-slideshow__layer"></div>
      </div>
      <div className="bg-slideshow__overlay"></div>

      <div className="app-layout">
        <Sidebar rol={rol} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header session={session} />
          <main className="main-content">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}

export default Layout
```

---

### 1.14 `ParticlesBackground.jsx`
**Ruta:** `src/components/ParticlesBackground.jsx`
**Función:** Componente reutilizable de fondo animado con partículas (puntos que se mueven y se conectan con líneas cuando están cerca, efecto "constelación"), dibujado en un `<canvas>` a pantalla completa con JavaScript puro (sin librerías externas). Usado actualmente en `LoginPage.jsx`. Respeta `prefers-reduced-motion`.

```jsx
import { useEffect, useRef } from 'react'

/**
 * Fondo de partículas animadas (puntos que se mueven y se conectan
 * con líneas cuando están cerca). Se dibuja en un <canvas> a pantalla
 * completa, detrás de todo el contenido (position: fixed, z-index bajo).
 *
 * Uso:
 *   <ParticlesBackground />
 *   <ParticlesBackground color="34, 211, 238" particleCount={80} />
 */
export default function ParticlesBackground({
  particleCount = 70,
  color = '34, 211, 238', // rgb de --accent, sin paréntesis (para armar rgba)
  linkDistance = 130,
  speed = 0.35,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let width = window.innerWidth
    let height = window.innerHeight

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    function createParticles() {
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.6 + 0.6,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)

      // Líneas entre partículas cercanas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < linkDistance) {
            const opacity = 1 - dist / linkDistance
            ctx.strokeStyle = `rgba(${color}, ${opacity * 0.25})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Partículas (puntos)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, 0.85)`
        ctx.fill()

        if (!prefersReducedMotion) {
          p.x += p.vx
          p.y += p.vy

          if (p.x < 0 || p.x > width) p.vx *= -1
          if (p.y < 0 || p.y > height) p.vy *= -1
        }
      })

      if (!prefersReducedMotion) {
        animationId = requestAnimationFrame(draw)
      }
    }

    resize()
    createParticles()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [particleCount, color, linkDistance, speed])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        backgroundColor: 'var(--bg-primary)',
      }}
    />
  )
}
```

---

### 1.15 `IntroSplash.jsx`
**Ruta:** `src/components/IntroSplash.jsx`
**Función:** Intro tipo Netflix. Las siglas **S · M · C** aparecen una por una con brillo cian (fase `enter`), pulsan (fase `hold`), y luego cada letra se desintegra volando en una dirección aleatoria con rotación y blur (fase `exit`) antes de llamar a `onFinish()`. Se muestra desde `App.jsx` al cargar la app y tras un login exitoso. Salta la animación si `prefers-reduced-motion` está activo.

```jsx
import { useEffect, useState } from 'react'

/**
 * Intro tipo Netflix: las siglas "SMC" aparecen con brillo,
 * pulsan un momento, y luego se desintegran (cada letra vuela
 * en una dirección aleatoria y se desvanece) antes de dar paso
 * al sistema.
 *
 * Fases: enter (0.9s) -> hold (1.3s) -> exit (1s) -> onFinish()
 */
export default function IntroSplash({ onFinish }) {
  const [phase, setPhase] = useState('enter')

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      onFinish()
      return
    }

    const t1 = setTimeout(() => setPhase('hold'), 900)
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    const t3 = setTimeout(() => onFinish(), 3200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onFinish])

  const letters = ['S', 'M', 'C']

  return (
    <div className={`intro-splash intro-splash--${phase}`}>
      <div className="intro-splash__logo">
        {letters.map((l, i) => (
          <span
            key={i}
            className="intro-splash__letter"
            style={{
              '--i': i,
              '--dx': `${(Math.random() - 0.5) * 320}px`,
              '--dy': `${(Math.random() - 0.5) * 240}px`,
              '--rot': `${(Math.random() - 0.5) * 100}deg`,
            }}
          >
            {l}
          </span>
        ))}
      </div>
      <p className="intro-splash__tagline">Sistema de Gestión Contable</p>
    </div>
  )
}
```

---

## 2. JavaScript (Lógica de negocio)

Esta sección documenta las funciones más relevantes fuera del renderizado JSX, es decir, la lógica pura de cada página o componente.

### 2.1 `getMesesDesde(fechaRegistro)` — en `AdminReportesPage.jsx`
Genera un arreglo de meses disponibles entre la fecha de registro de un usuario y el mes actual, en formato `{ valor: 'YYYY-MM', label: 'mes año' }`, para poblar el selector de mes del reporte.

```js
function getMesesDesde(fechaRegistro) {
  const meses = []
  const inicio = new Date(fechaRegistro)
  const hoy = new Date()
  let actual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  while (actual <= hoy) {
    meses.push({
      valor: `${actual.getFullYear()}-${String(actual.getMonth() + 1).padStart(2, '0')}`,
      label: actual.toLocaleString('es-CO', { month: 'long', year: 'numeric' })
    })
    actual.setMonth(actual.getMonth() + 1)
  }
  return meses.reverse()
}
```

### 2.2 `generarReporte()` — en `AdminReportesPage.jsx`
Función principal del reporte. Calcula el rango de fechas del mes seleccionado, consulta `gastos`, `ingresos` y `presupuesto` en Supabase filtrando por usuario y fechas, calcula totales y balance, actualiza la vista previa, y construye un PDF con `jsPDF` + `jspdf-autotable`: encabezado con nombre del sistema, tarjetas de resumen (ingresos/gastos/balance), y tres tablas (ingresos, gastos, presupuestos) con estilos de color por sección.

```js
async function generarReporte() {
  if (!usuarioSeleccionado) { alert('Selecciona un usuario primero.'); return }

  setGenerando(true)

  const [anio, mesNum] = mesSeleccionado.split('-').map(Number)
  const primerDia = new Date(anio, mesNum - 1, 1).toISOString().split('T')[0]
  const ultimoDia = new Date(anio, mesNum, 0).toISOString().split('T')[0]
  const labelMes = meses.find(m => m.valor === mesSeleccionado)?.label || mesSeleccionado
  const emailUsuario = usuarios.find(u => u.id === usuarioSeleccionado)?.email || ''

  const { data: gastos } = await supabase
    .from('gastos')
    .select('descripcion, categoria_nombre, tipo, monto, fecha')
    .eq('user_id', usuarioSeleccionado)
    .gte('fecha', primerDia)
    .lte('fecha', ultimoDia)
    .order('fecha', { ascending: true })

  const { data: ingresos } = await supabase
    .from('ingresos')
    .select('descripcion, categoria_nombre, tipo, monto, fecha')
    .eq('user_id', usuarioSeleccionado)
    .gte('fecha', primerDia)
    .lte('fecha', ultimoDia)
    .order('fecha', { ascending: true })

  const { data: presupuestos } = await supabase
    .from('presupuesto')
    .select('periodo, monto_limite, gasto_acumulado')
    .eq('user_id', usuarioSeleccionado)

  const totalGastos = gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0
  const totalIngresos = ingresos?.reduce((acc, i) => acc + Number(i.monto), 0) || 0
  const balance = totalIngresos - totalGastos

  setPreview({ gastos, ingresos, presupuestos, totalGastos, totalIngresos, balance, labelMes, emailUsuario })

  // Generar PDF
  const doc = new jsPDF()
  const azul = [13, 202, 240]
  const rojo = [220, 53, 69]
  const verde = [32, 201, 151]
  const gris = [100, 100, 100]

  doc.setFillColor(15, 17, 21)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(...azul)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Sistema SMC', 14, 18)
  doc.setFontSize(11)
  doc.setTextColor(200, 200, 200)
  doc.text(`Reporte financiero — ${labelMes}`, 14, 26)
  doc.text(`Usuario: ${emailUsuario}`, 14, 33)
  doc.setTextColor(...gris)
  doc.setFontSize(9)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 150, 33)

  doc.setFillColor(30, 35, 44)
  doc.rect(14, 45, 55, 22, 'F')
  doc.rect(77, 45, 55, 22, 'F')
  doc.rect(140, 45, 55, 22, 'F')

  doc.setFontSize(9)
  doc.setTextColor(...gris)
  doc.text('INGRESOS', 20, 52)
  doc.text('GASTOS', 83, 52)
  doc.text('BALANCE', 146, 52)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...verde)
  doc.text(`$ ${totalIngresos.toLocaleString('es-CO')}`, 20, 62)
  doc.setTextColor(...rojo)
  doc.text(`$ ${totalGastos.toLocaleString('es-CO')}`, 83, 62)
  doc.setTextColor(balance >= 0 ? azul[0] : 255, balance >= 0 ? azul[1] : 193, balance >= 0 ? azul[2] : 7)
  doc.text(`$ ${balance.toLocaleString('es-CO')}`, 146, 62)

  let y = 75

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...verde)
  doc.text('Ingresos', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Descripción', 'Categoría', 'Tipo', 'Monto', 'Fecha']],
    body: ingresos?.length > 0
      ? ingresos.map(i => [i.descripcion, i.categoria_nombre || '—', i.tipo, `$ ${Number(i.monto).toLocaleString('es-CO')}`, new Date(i.fecha).toLocaleDateString('es-CO')])
      : [['Sin ingresos este mes', '', '', '', '']],
    styles: { fontSize: 9, cellPadding: 3, textColor: [220, 220, 220], fillColor: [25, 30, 40] },
    headStyles: { fillColor: [32, 201, 151], textColor: [0, 0, 0], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [30, 36, 48] },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...rojo)
  doc.text('Gastos', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Descripción', 'Categoría', 'Tipo', 'Monto', 'Fecha']],
    body: gastos?.length > 0
      ? gastos.map(g => [g.descripcion, g.categoria_nombre || '—', g.tipo, `$ ${Number(g.monto).toLocaleString('es-CO')}`, new Date(g.fecha).toLocaleDateString('es-CO')])
      : [['Sin gastos este mes', '', '', '', '']],
    styles: { fontSize: 9, cellPadding: 3, textColor: [220, 220, 220], fillColor: [25, 30, 40] },
    headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [30, 36, 48] },
    margin: { left: 14, right: 14 },
  })

  y = doc.lastAutoTable.finalY + 10
  if (y > 240) { doc.addPage(); y = 20 }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...azul)
  doc.text('Presupuestos', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Periodo', 'Límite', 'Gastado', 'Disponible']],
    body: presupuestos?.length > 0
      ? presupuestos.map(p => {
          const disponible = Number(p.monto_limite) - Number(p.gasto_acumulado)
          return [p.periodo, `$ ${Number(p.monto_limite).toLocaleString('es-CO')}`, `$ ${Number(p.gasto_acumulado).toLocaleString('es-CO')}`, `$ ${disponible.toLocaleString('es-CO')}`]
        })
      : [['Sin presupuestos registrados', '', '', '']],
    styles: { fontSize: 9, cellPadding: 3, textColor: [220, 220, 220], fillColor: [25, 30, 40] },
    headStyles: { fillColor: [13, 110, 253], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [30, 36, 48] },
    margin: { left: 14, right: 14 },
  })

  doc.setFontSize(8)
  doc.setTextColor(...gris)
  doc.text('Sistema SMC — Reporte generado automáticamente', 14, 290)
  doc.save(`reporte_${emailUsuario}_${mesSeleccionado}.pdf`)
  setGenerando(false)
}
```

### 2.3 Funciones del módulo de Soporte

**`cargarDatos()` (admin)** — trae la lista de usuarios (excluyendo al propio admin) y el historial completo de mensajes, cruzando cada mensaje con el email del destinatario.

**`enviarMensaje(e)` (admin)** — valida que estén completos usuario, asunto y contenido; inserta el mensaje en la tabla `mensajes`; limpia el formulario y recarga el historial.

**`cargarMensajes()` (usuario)** — trae los mensajes del usuario logueado, ordenados por fecha descendente, y calcula cuántos no están leídos.

**`marcarLeido(id)` / `marcarTodosLeidos()` (usuario)** — actualizan el campo `leido` a `true` para un mensaje puntual o para todos los mensajes pendientes del usuario.

### 2.4 Funciones de `AdminUsuariosPage.jsx`

**`cargarUsuarios()`** — obtiene el listado de usuarios llamando a la función RPC `obtener_usuarios` de Supabase.

**`cambiarRol(id, rolActual)`** — alterna el rol entre `usuario` y `administrador` tras confirmación del admin, actualizando la tabla `roles`.

**`eliminarUsuario(id, email)`** — bloquea la autoeliminación del propio admin, pide confirmación, borra en cascada los registros del usuario en `gastos`, `ingresos`, `presupuesto` y `roles`, y finalmente elimina la cuenta de `auth.users` mediante la función RPC `eliminar_usuario`.

```js
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
```

### 2.5 Funciones de `FiltroGastos.jsx`

**`handleChange(e)`** — actualiza el estado `filtros` campo por campo y notifica el cambio al componente padre vía `onFiltrar`, permitiendo filtrado en tiempo real (sin botón "Aplicar").

**`handleReset()`** — restablece todos los filtros (`busqueda`, `categoria`, `fechaInicio`, `fechaFin`, `montoMax`) a su valor vacío y notifica al padre.

### 2.6 `cargarDatos()` — en `AdminPage.jsx`
Trae de Supabase los roles (para el total de usuarios), y todos los gastos e ingresos globales del sistema. Calcula los totales globales y el balance, agrupa gastos e ingresos por categoría (para los gráficos de torta) y arma el arreglo `comparativa` (ingresos/gastos/balance) para el gráfico de barras.

```js
async function cargarDatos() {
  setCargando(true)

  // Total usuarios
  const { data: roles } = await supabase.from('roles').select('id, rol, created_at')

  // Total gastos globales
  const { data: gastos } = await supabase.from('gastos').select('monto, categoria_nombre')

  // Total ingresos globales
  const { data: ingresos } = await supabase.from('ingresos').select('monto, categoria_nombre')

  const sumGastos = gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0
  const sumIngresos = ingresos?.reduce((acc, i) => acc + Number(i.monto), 0) || 0

  setStats({
    totalUsuarios: roles?.length || 0,
    totalGastos: sumGastos,
    totalIngresos: sumIngresos,
    balance: sumIngresos - sumGastos,
  })

  setUsuarios(roles || [])

  // Gastos por categoría
  const mapGastos = {}
  gastos?.forEach((g) => {
    const cat = g.categoria_nombre || 'Sin categoría'
    mapGastos[cat] = (mapGastos[cat] || 0) + Number(g.monto)
  })
  setGastosPorCategoria(Object.entries(mapGastos).map(([name, value]) => ({ name, value })))

  // Ingresos por categoría
  const mapIngresos = {}
  ingresos?.forEach((i) => {
    const cat = i.categoria_nombre || 'Sin categoría'
    mapIngresos[cat] = (mapIngresos[cat] || 0) + Number(i.monto)
  })
  setIngresosPorCategoria(Object.entries(mapIngresos).map(([name, value]) => ({ name, value })))

  setComparativa([
    { name: 'Ingresos', monto: sumIngresos },
    { name: 'Gastos', monto: sumGastos },
    { name: 'Balance', monto: sumIngresos - sumGastos },
  ])

  setCargando(false)
}
```

### 2.7 Funciones de `CuentasPage.jsx`

**`cargarUsuarios()`** — obtiene la lista de usuarios mediante la función RPC `obtener_usuarios`.

**`verDetalle(usuario)`** — al seleccionar un usuario en la lista, consulta sus gastos e ingresos (ordenados por fecha descendente) y resetea la pestaña activa a "gastos".

```js
async function verDetalle(usuario) {
  setUsuarioSeleccionado(usuario)
  setCargandoDetalle(true)
  setPestana('gastos')

  const { data: g } = await supabase
    .from('gastos')
    .select('id_gasto, descripcion, categoria_nombre, tipo, monto, fecha')
    .eq('user_id', usuario.id)
    .order('fecha', { ascending: false })

  const { data: i } = await supabase
    .from('ingresos')
    .select('id_ingreso, descripcion, categoria_nombre, tipo, monto, fecha')
    .eq('user_id', usuario.id)
    .order('fecha', { ascending: false })

  setGastos(g || [])
  setIngresos(i || [])
  setCargandoDetalle(false)
}
```

Los totales (`totalGastos`, `totalIngresos`, `balance`) se calculan directamente en el render, reduciendo los arreglos `gastos` e `ingresos` cargados.

### 2.8 Fix de llamadas RPC (script de mantenimiento)
Script usado para corregir un error donde `.rpc('obtener_usuarios')` no soportaba `.select('*')` ni `.order()` encadenados; se ejecutó sobre `CuentasPage.jsx`, `AdminPage.jsx`, `AdminUsuariosPage.jsx`, `AdminReportesPage.jsx` y `AdminSoportePage.jsx`.

```python
import re

files = [
    '/workspaces/PPI/2026-07-14/login-supabase/src/pages/CuentasPage.jsx',
    '/workspaces/PPI/2026-07-14/login-supabase/src/pages/AdminPage.jsx',
    '/workspaces/PPI/2026-07-14/login-supabase/src/pages/AdminUsuariosPage.jsx',
    '/workspaces/PPI/2026-07-14/login-supabase/src/pages/AdminReportesPage.jsx',
    '/workspaces/PPI/2026-07-14/login-supabase/src/pages/AdminSoportePage.jsx',
]

for f in files:
    try:
        with open(f, 'r') as file:
            content = file.read()
        # Eliminar .select('*') y .order(...) después de rpc
        content = re.sub(
            r"\.rpc\('obtener_usuarios'\)\s*\n?\s*\.select\([^)]+\)\s*\n?\s*\.order\([^)]+\)",
            ".rpc('obtener_usuarios')",
            content
        )
        with open(f, 'w') as file:
            file.write(content)
        print(f"✅ {f}")
    except Exception as e:
        print(f"❌ {f}: {e}")
```

---

### 2.9 `handleLoginSuccess(newSession)` — en `App.jsx`
Se pasa como `onLogin` a `LoginPage`. Guarda la sesión recibida y activa de nuevo `showIntro`, de modo que el intro tipo Netflix se reproduce una vez más justo después de autenticarse, antes de entrar al dashboard. Mientras el intro corre (~3.2s) el rol del usuario ya se está consultando en segundo plano vía el listener `onAuthStateChange`.

```js
function handleLoginSuccess(newSession) {
  setSession(newSession)
  setShowIntro(true)
}
```

### 2.10 Lógica de partículas — en `ParticlesBackground.jsx`
Sobre un `<canvas>` a pantalla completa: crea `particleCount` partículas con posición y velocidad aleatorias; en cada frame (`requestAnimationFrame`) dibuja líneas entre partículas cuya distancia es menor a `linkDistance` (opacidad proporcional a la cercanía), dibuja cada partícula como un punto, actualiza su posición y la hace rebotar en los bordes del viewport. Si `prefers-reduced-motion` está activo, dibuja un solo frame estático y no anima.

### 2.11 Fases del intro — en `IntroSplash.jsx`
Máquina de estados simple con `useState('enter')` y tres `setTimeout` encadenados: `enter` (0–0.9s, letras aparecen), `hold` (0.9–2.2s, pulso de brillo), `exit` (2.2–3.2s, cada letra recibe un `--dx`/`--dy`/`--rot` aleatorio vía inline style y la animación CSS `intro-letter-break` las dispersa). Al llegar a los 3.2s llama a `onFinish()`. Si `prefers-reduced-motion` está activo, llama a `onFinish()` de inmediato sin animar.

## 3. CSS (Estilos)

### 3.1 `index.css`
**Ruta:** `src/index.css`
**Función:** Hoja de estilos global, reorganizada en 17 secciones (ver índice al inicio del propio archivo). Identidad visual "orbital dashboard": azul marino profundo + acentos cian/teal. Incluye:

- **Tokens de diseño** (sección 1): variables de color/tipografía/radios, con el acento cambiado de verde a cian (`--accent: #22D3EE`).
- **Overrides de Bootstrap** (sección 2): remapea `--bs-info`, `--bs-primary`, `--bs-danger`, `--bs-dark`, etc. hacia la nueva paleta, para que clases como `text-info`, `border-info`, `btn-info`, `bg-dark` ya usadas en el JSX cambien de color automáticamente sin tocar los componentes.
- **Layout, tarjetas, tablas, formularios, botones, badges, modal, barra de progreso, scrollbar** (secciones 3–14): igual que antes, adaptado a la nueva paleta.
- **`.hero-header`** (sección 7): encabezado con imagen de fondo + overlay, usado en `AdminPage`, `DashboardPage` e `IndexPage`.
- **`.kpi-card`** (sección 6): tarjeta de métrica con borde superior cian, usada en los 3 dashboards.
- **`.glow-card`**: tarjeta con resplandor cian sutil, usada en `IndexPage` (El Problema, Fundadores).
- **Fondos animados `.bg-slideshow`** (sección 15): crossfade + Ken Burns entre 2 imágenes por página (`--principal`, `--login` ya no se usa tras cambiar el login a partículas, `--app`), con overlay de viñeta + grid sutil cian para dar profundidad (capas de `repeating-linear-gradient` + `radial-gradient` + `linear-gradient`, todo en el mismo elemento `.bg-slideshow__overlay` para no tocar el JSX).
- **Intro Splash** (sección 17.5, nueva): estilos de `.intro-splash`, `.intro-splash__letter` (animaciones `intro-letter-in`, `intro-letter-pulse`, `intro-letter-break`) y `.intro-splash__tagline`.
- **Accesibilidad y Responsive** (secciones 16–17): `prefers-reduced-motion`, breakpoints para tablets/móviles/pantallas grandes, ajustes de Ken Burns y del intro en pantallas chicas.

```css
/* ============================================================
   SISTEMA SMC – index.css
   Identidad visual: dashboard oscuro estilo "orbital" —
   azul marino profundo + acentos cian/teal, tarjetas con
   resplandor sutil, headers con imagen de fondo + overlay.

   ÍNDICE
   1. Tokens de diseño (variables)
   2. Overrides de Bootstrap (para que text-info, bg-dark,
      btn-info, badge, etc. hereden la nueva paleta sin
      tocar el JSX)
   3. Reset básico
   4. Tipografía
   5. Layout general (sidebar, header, footer, main-content)
   6. Tarjetas (card, kpi-card, glow-card)
   7. Header tipo "hero" con imagen de fondo (portal / landing)
   8. Tablas
   9. Formularios
   10. Botones
   11. Badges
   12. Modal
   13. Barra de progreso
   14. Scrollbar
   15. Fondos animados (crossfade + Ken Burns)
   16. Accesibilidad
   17. Responsive
   ============================================================ */


/* ============================================================
   1. TOKENS DE DISEÑO
   ============================================================ */

:root {
  /* Fondos */
  --bg-primary: #0A0E14;      /* azul marino casi negro */
  --bg-secondary: #10141C;    /* tarjetas */
  --bg-tertiary: #161B26;     /* inputs, filas alternas */
  --bg-hover: #1C222F;

  /* Bordes */
  --border: #1E2530;
  --border-light: #2A3242;
  --border-glow: rgba(34, 211, 238, 0.35); /* borde con resplandor cian */

  /* Texto */
  --text-primary: #E8EDF2;
  --text-secondary: #8B96A5;
  --text-muted: #565F6E;

  /* Acento principal: cian/teal (antes verde) */
  --accent: #22D3EE;
  --accent-hover: #0FB8D4;
  --accent-soft: rgba(34, 211, 238, 0.12);
  --accent-glow: 0 0 16px rgba(34, 211, 238, 0.25);

  /* Positivo (ingresos, variaciones +) */
  --success: #2DD4A8;
  --success-soft: rgba(45, 212, 168, 0.12);

  /* Negativo (gastos, variaciones -) */
  --danger: #FF5C7A;
  --danger-hover: #E4415F;
  --danger-soft: rgba(255, 92, 122, 0.12);

  /* Alertas */
  --warning: #FBBF24;
  --warning-soft: rgba(251, 191, 36, 0.12);

  /* Tipografía */
  --font-display: 'Outfit', 'Segoe UI', sans-serif;
  --font-body: 'Inter', 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* Radios y sombras */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.5);
  --shadow-elevated: 0 12px 40px rgba(0, 0, 0, 0.6);

  --transition: 150ms ease;
}


/* ============================================================
   2. OVERRIDES DE BOOTSTRAP
   Redirige las clases de Bootstrap que ya usas en el JSX
   (text-info, border-info, bg-dark, btn-info, badge bg-danger…)
   hacia la nueva paleta cian/teal, sin tocar los componentes.
   ============================================================ */

:root,
[data-bs-theme="dark"] {
  --bs-primary: var(--accent);
  --bs-primary-rgb: 34, 211, 238;

  --bs-info: var(--accent);
  --bs-info-rgb: 34, 211, 238;

  --bs-success: var(--success);
  --bs-success-rgb: 45, 212, 168;

  --bs-danger: var(--danger);
  --bs-danger-rgb: 255, 92, 122;

  --bs-warning: var(--warning);
  --bs-warning-rgb: 251, 191, 36;

  --bs-dark: var(--bg-secondary);
  --bs-dark-rgb: 16, 20, 28;

  --bs-body-bg: var(--bg-primary);
  --bs-body-color: var(--text-primary);
  --bs-border-color: var(--border);
}

/* Bootstrap usa .bg-dark / .border-info / .text-info como
   utilidades — al quedar las variables remapeadas arriba,
   estas ya toman el color correcto automáticamente. Reforzamos
   los casos donde Bootstrap no usa variable sino color fijo: */

.bg-dark {
  background-color: var(--bg-secondary) !important;
}

.text-info {
  color: var(--accent) !important;
}

.border-info {
  border-color: var(--accent) !important;
}

.btn-outline-info {
  color: var(--accent);
  border-color: var(--accent);
}

.btn-outline-info:hover {
  background-color: var(--accent);
  border-color: var(--accent);
  color: #06131A;
}

.btn-info {
  background-color: var(--accent);
  border-color: var(--accent);
  color: #06131A;
}

.btn-info:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}


/* ============================================================
   3. RESET BÁSICO
   ============================================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  color-scheme: dark;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}


/* ============================================================
   4. TIPOGRAFÍA
   ============================================================ */

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

h1 { font-size: 28px; }
h2 { font-size: 22px; }
h3 { font-size: 18px; }

/* Títulos tipo "sección" en mayúsculas con tracking amplio,
   como INTRODUCCIÓN / EL PROBLEMA / OBJETIVOS en la referencia */
.section-title {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--accent);
}

/* Etiqueta pequeña tipo "MISSION TELEMETRY // ..." de la referencia */
.eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

p {
  color: var(--text-secondary);
}

.text-muted {
  color: var(--text-muted);
}

.font-mono {
  font-family: var(--font-mono);
}


/* ============================================================
   5. LAYOUT GENERAL
   ============================================================ */

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 24px 32px;
  background-color: transparent;
}

/* HEADER (barra superior de la app interna) */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.header__logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary);
}

/* SIDEBAR / MENÚ */
.sidebar {
  width: 240px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.sidebar__link:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
  text-decoration: none;
}

.sidebar__link--active {
  background-color: var(--accent-soft);
  color: var(--accent);
  box-shadow: inset 2px 0 0 var(--accent);
}

/* FOOTER */
.footer {
  padding: 16px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  border-top: 1px solid var(--border);
}


/* ============================================================
   6. TARJETAS
   ============================================================ */

.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-card);
}

.card--accent {
  border-left: 3px solid var(--accent);
}

.card--danger {
  border-left: 3px solid var(--danger);
}

/* Tarjeta de métrica (las 4 tarjetas superiores del portal:
   Ingresos, Gastos, Balance, Variación) */
.kpi-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-top: 2px solid var(--accent);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  box-shadow: var(--shadow-card);
}

.kpi-card__label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.kpi-card__value {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.kpi-card__value--accent { color: var(--accent); }
.kpi-card__value--success { color: var(--success); }
.kpi-card__value--danger { color: var(--danger); }

.kpi-card__delta {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.kpi-card__delta--up { color: var(--success); }
.kpi-card__delta--down { color: var(--danger); }

/* Tarjeta con resplandor (para destacar algo puntual, ej. un
   total muy importante o una alerta activa) */
.glow-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-md);
  box-shadow: var(--accent-glow), var(--shadow-card);
  padding: 20px;
}


/* ============================================================
   7. HEADER TIPO "HERO" (imagen de fondo + overlay)
   Para el título del portal (después del login) y para
   secciones de landing que quieras destacar con foto.
   Es independiente de .bg-slideshow (ese es de página completa;
   este es para un bloque puntual, ej. el encabezado del portal).
   ============================================================ */

.hero-header {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  padding: 40px 32px;
  margin-bottom: 24px;
  background-size: cover;
  background-position: center;
  isolation: isolate;
}

.hero-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10, 14, 20, 0.55) 0%,
    rgba(10, 14, 20, 0.9) 100%
  );
  z-index: -1;
}

.hero-header__eyebrow {
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  margin-bottom: 8px;
}

.hero-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.hero-header p {
  color: rgba(232, 237, 242, 0.75);
  max-width: 640px;
}


/* ============================================================
   8. TABLA
   ============================================================ */

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 14px;
}

tbody tr {
  transition: var(--transition);
}

tbody tr:hover {
  background-color: var(--bg-tertiary);
}


/* ============================================================
   9. FORMULARIOS
   ============================================================ */

label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

input,
select,
textarea {
  width: 100%;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  transition: var(--transition);
}

input::placeholder,
textarea::placeholder {
  color: var(--text-muted);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.form-group {
  margin-bottom: 16px;
}

/* Bootstrap: .form-control / .form-select ya vienen con fondo
   claro por defecto — los alineamos al tema oscuro */
.form-control,
.form-select {
  background-color: var(--bg-tertiary) !important;
  border-color: var(--border) !important;
  color: var(--text-primary) !important;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px var(--accent-soft) !important;
}


/* ============================================================
   10. BOTONES
   ============================================================ */

button {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 18px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background-color: var(--accent);
  color: #06131A;
}

.btn-primary:hover {
  background-color: var(--accent-hover);
}

.btn-danger {
  background-color: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn-danger:hover {
  background-color: var(--danger-soft);
}

.btn-secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background-color: var(--bg-hover);
}


/* ============================================================
   11. BADGES
   ============================================================ */

.badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.badge--ingreso {
  background-color: var(--success-soft);
  color: var(--success);
}

.badge--gasto {
  background-color: var(--danger-soft);
  color: var(--danger);
}

.badge--alerta {
  background-color: var(--warning-soft);
  color: var(--warning);
}

/* Badges de Bootstrap (bg-danger, bg-primary, etc.) heredan
   la paleta nueva vía las variables --bs-* de la sección 2 */


/* ============================================================
   12. MODAL
   ============================================================ */

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-elevated);
}


/* ============================================================
   13. BARRA DE PROGRESO (presupuesto)
   ============================================================ */

.progress-track {
  width: 100%;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--accent);
  border-radius: 20px;
  transition: width 300ms ease;
}

.progress-fill--warning {
  background-color: var(--warning);
}

.progress-fill--danger {
  background-color: var(--danger);
}


/* ============================================================
   14. SCROLLBAR
   ============================================================ */

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}


/* ============================================================
   15. FONDOS ANIMADOS (crossfade + Ken Burns)
   Página principal, Login y App interna.

   Coloca las 6 imágenes en: public/assets/backgrounds/
   principal-1.png, principal-2.png
   login-1.png, login-2.png
   app-1.png, app-2.png
   ============================================================ */

.bg-slideshow {
  position: fixed;
  inset: 0;
  z-index: -2;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.bg-slideshow__layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  animation-name: bg-crossfade, bg-kenburns;
  animation-timing-function: ease-in-out, ease-in-out;
  animation-iteration-count: infinite, infinite;
  animation-duration: 18s, 18s; /* 9s por imagen */
  will-change: opacity, transform;
}

.bg-slideshow__layer:nth-child(1) {
  animation-delay: 0s, 0s;
}

.bg-slideshow__layer:nth-child(2) {
  animation-delay: 9s, 9s;
}

/* Viñeta + grid sutil, para dar profundidad sobre las fotos de fondo
   (capas apiladas: grid horizontal, grid vertical, viñeta radial,
   degradado oscuro para legibilidad — todo en el mismo elemento) */
.bg-slideshow__overlay {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(34, 211, 238, 0.035) 0px,
      rgba(34, 211, 238, 0.035) 1px,
      transparent 1px,
      transparent 42px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(34, 211, 238, 0.035) 0px,
      rgba(34, 211, 238, 0.035) 1px,
      transparent 1px,
      transparent 42px
    ),
    radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(10, 14, 20, 0.45) 75%,
      rgba(10, 14, 20, 0.7) 100%
    ),
    linear-gradient(
      180deg,
      rgba(10, 14, 20, 0.7) 0%,
      rgba(10, 14, 20, 0.85) 100%
    );
}

@keyframes bg-crossfade {
  0%    { opacity: 0; }
  8%    { opacity: 1; }
  42%   { opacity: 1; }
  50%   { opacity: 0; }
  100%  { opacity: 0; }
}

@keyframes bg-kenburns {
  0%    { transform: scale(1); }
  50%   { transform: scale(1.08); }
  100%  { transform: scale(1); }
}

/* 1) Página principal (IndexPage) */
.bg-slideshow--principal .bg-slideshow__layer:nth-child(1) {
  background-image: url('/assets/backgrounds/principal-1.png');
}
.bg-slideshow--principal .bg-slideshow__layer:nth-child(2) {
  background-image: url('/assets/backgrounds/principal-2.png');
}

/* 2) Login (LoginPage) */
.bg-slideshow--login .bg-slideshow__layer:nth-child(1) {
  background-image: url('/assets/backgrounds/login-1.png');
}
.bg-slideshow--login .bg-slideshow__layer:nth-child(2) {
  background-image: url('/assets/backgrounds/login-2.png');
}

/* 3) App interna (Layout) */
.bg-slideshow--app .bg-slideshow__layer:nth-child(1) {
  background-image: url('/assets/backgrounds/app-1.png');
}
.bg-slideshow--app .bg-slideshow__layer:nth-child(2) {
  background-image: url('/assets/backgrounds/app-2.png');
}

.bg-slideshow--app + .bg-slideshow__overlay {
  background:
    repeating-linear-gradient(
      0deg,
      rgba(34, 211, 238, 0.03) 0px,
      rgba(34, 211, 238, 0.03) 1px,
      transparent 1px,
      transparent 42px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(34, 211, 238, 0.03) 0px,
      rgba(34, 211, 238, 0.03) 1px,
      transparent 1px,
      transparent 42px
    ),
    radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(10, 14, 20, 0.6) 75%,
      rgba(10, 14, 20, 0.85) 100%
    ),
    linear-gradient(
      180deg,
      rgba(10, 14, 20, 0.88) 0%,
      rgba(10, 14, 20, 0.94) 100%
    );
}


/* ============================================================
   16. ACCESIBILIDAD
   ============================================================ */

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }

  .bg-slideshow__layer:nth-child(1) {
    opacity: 1;
  }

  .intro-splash__letter,
  .intro-splash__tagline {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}


/* ============================================================
   17.5. INTRO SPLASH (animación tipo Netflix, antes de entrar)
   ============================================================ */

.intro-splash {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, #10141C 0%, #0A0E14 100%);
  transition: opacity 0.6s ease;
}

.intro-splash--exit {
  opacity: 0;
  pointer-events: none;
}

.intro-splash__logo {
  display: flex;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 88px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.intro-splash__letter {
  display: inline-block;
  color: var(--accent);
  text-shadow: 0 0 30px rgba(34, 211, 238, 0.6), 0 0 60px rgba(34, 211, 238, 0.3);
  opacity: 0;
  transform: translateY(40px) scale(0.8);
  animation: intro-letter-in 0.7s ease forwards;
  animation-delay: calc(var(--i) * 0.15s);
}

@keyframes intro-letter-in {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.intro-splash--hold .intro-splash__letter {
  animation: intro-letter-pulse 1.2s ease-in-out infinite;
}

@keyframes intro-letter-pulse {
  0%, 100% { text-shadow: 0 0 30px rgba(34, 211, 238, 0.6), 0 0 60px rgba(34, 211, 238, 0.3); }
  50%      { text-shadow: 0 0 46px rgba(34, 211, 238, 0.9), 0 0 90px rgba(34, 211, 238, 0.5); }
}

.intro-splash--exit .intro-splash__letter {
  animation: intro-letter-break 1s ease forwards;
}

@keyframes intro-letter-break {
  to {
    opacity: 0;
    transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.4);
    filter: blur(4px);
  }
}

.intro-splash__tagline {
  margin-top: 18px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-muted);
  opacity: 0;
  animation: intro-tagline-in 0.6s ease forwards;
  animation-delay: 0.7s;
}

.intro-splash--exit .intro-splash__tagline {
  animation: intro-tagline-out 0.5s ease forwards;
}

@keyframes intro-tagline-in { to { opacity: 1; } }
@keyframes intro-tagline-out { to { opacity: 0; } }

@media (max-width: 480px) {
  .intro-splash__logo { font-size: 52px; gap: 6px; }
  .intro-splash__tagline { font-size: 10px; letter-spacing: 0.2em; }
}


/* ============================================================
   17. RESPONSIVE
   ============================================================ */

@media (max-width: 1024px) {
  .main-content { padding: 20px 24px; }
  .card, .kpi-card { padding: 16px; }
  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  .hero-header { padding: 28px 24px; }
  .hero-header h1 { font-size: 26px; }
}

@media (max-width: 768px) {
  .app-layout { flex-direction: column; }

  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding: 12px 8px;
    gap: 6px;
  }

  .sidebar__link {
    flex-shrink: 0;
    white-space: nowrap;
    font-size: 13px;
    padding: 8px 10px;
  }

  .main-content { padding: 16px; }

  .header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }

  table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
  }

  thead th, tbody td { padding: 10px 12px; font-size: 13px; }

  .modal-content { max-width: 92vw; padding: 18px; }

  @keyframes bg-kenburns {
    0%    { transform: scale(1); }
    50%   { transform: scale(1.04); }
    100%  { transform: scale(1); }
  }
}

@media (max-width: 480px) {
  body { font-size: 14px; }
  h1 { font-size: 20px; }
  h2 { font-size: 18px; }
  h3 { font-size: 16px; }
  .main-content { padding: 12px; }
  .card, .kpi-card { padding: 14px; border-radius: var(--radius-sm); }
  .header__logo { font-size: 16px; }
  button { font-size: 13px; padding: 9px 14px; }
  .hero-header { padding: 20px 16px; border-radius: var(--radius-md); }
  .hero-header h1 { font-size: 22px; }
}

@media (min-width: 1440px) {
  .main-content { padding: 32px 48px; }
  .container { max-width: 1200px; }
}

@media (max-width: 900px) and (orientation: landscape) {
  .sidebar { padding: 8px 6px; }
  .sidebar__link { padding: 6px 8px; }
}

@supports (-webkit-touch-callout: none) {
  .bg-slideshow {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}
```

---

## 4. Backend / SQL (Supabase)

### 4.1 Tabla `mensajes` y políticas de seguridad (RLS)
Soporta el módulo de Soporte: cada mensaje lo crea un admin dirigido a un usuario, con estado de lectura.

```sql
CREATE TABLE public.mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  usuario_id uuid NOT NULL REFERENCES auth.users(id),
  asunto text NOT NULL,
  contenido text NOT NULL,
  leido boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- Admin puede crear mensajes
CREATE POLICY "admin crea mensajes" ON mensajes
FOR INSERT WITH CHECK (
  (SELECT rol FROM roles WHERE id = auth.uid()) = 'administrador'
);

-- Admin puede ver todos los mensajes
CREATE POLICY "admin ve todos los mensajes" ON mensajes
FOR SELECT USING (
  (SELECT rol FROM roles WHERE id = auth.uid()) = 'administrador'
);

-- Usuario solo ve sus propios mensajes
CREATE POLICY "usuario ve sus mensajes" ON mensajes
FOR SELECT USING (usuario_id = auth.uid());

-- Usuario puede marcar como leído
CREATE POLICY "usuario marca leido" ON mensajes
FOR UPDATE USING (usuario_id = auth.uid());
```

### 4.2 Corrección de vistas con `SECURITY DEFINER`
Se recrearon las vistas con `security_invoker = true` para resolver las advertencias de seguridad de Supabase (las vistas ejecutan con los permisos del usuario que consulta, no con los del creador).

```sql
-- Corregir vistas con SECURITY DEFINER
CREATE OR REPLACE VIEW public.v_gastos_por_categoria
WITH (security_invoker = true) AS
SELECT
  u.cedula,
  u.nombre || ' ' || u.apellido AS usuario,
  c.nombre AS categoria,
  SUM(g.monto) AS total_gastado
FROM gastos g
JOIN usuario u ON g.cedula_usuario = u.cedula
LEFT JOIN categoria c ON g.id_categoria = c.id_categoria
GROUP BY u.cedula, u.nombre, u.apellido, c.nombre;

CREATE OR REPLACE VIEW public.v_balance_usuario
WITH (security_invoker = true) AS
SELECT
  u.cedula,
  u.nombre || ' ' || u.apellido AS usuario,
  COALESCE(SUM(i.monto), 0) AS total_ingresos,
  COALESCE((SELECT SUM(monto) FROM gastos WHERE cedula_usuario = u.cedula), 0) AS total_gastos,
  COALESCE(SUM(i.monto), 0) - COALESCE((SELECT SUM(monto) FROM gastos WHERE cedula_usuario = u.cedula), 0) AS balance
FROM usuario u
LEFT JOIN ingresos i ON i.cedula_usuario = u.cedula
GROUP BY u.cedula, u.nombre, u.apellido;

-- Corregir vista usuarios_info
CREATE OR REPLACE VIEW public.usuarios_info
WITH (security_invoker = true) AS
SELECT
  u.id,
  u.email,
  u.created_at,
  r.rol
FROM auth.users u
JOIN public.roles r ON u.id = r.id;
```

---

## 5. Resumen de rutas de la aplicación

| Ruta | Rol | Componente |
|---|---|---|
| `/` | usuario | `DashboardPage` |
| `/gastos` | usuario | `GastosPage` |
| `/ingresos` | usuario | `IngresosPage` |
| `/presupuestos` | usuario | `PresupuestosPage` |
| `/usuarios` | usuario | `UsuariosPage` |
| `/soporte` | usuario | `SoportePage` |
| `/` | administrador | `AdminPage` |
| `/admin/usuarios` | administrador | `AdminUsuariosPage` |
| `/admin/reportes` | administrador | `AdminReportesPage` |
| `/admin/soporte` | administrador | `AdminSoportePage` |
| `/cuentas` | administrador | `CuentasPage` |
| `/usuarios` | administrador | `UsuariosPage` |