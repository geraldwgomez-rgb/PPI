# Documentación del Código — Sistema SMC

> Documentación completa del código del proyecto **Sistema SMC** (gestión financiera con React + Supabase), organizada por capas: componentes React, lógica JavaScript, estilos CSS y backend/SQL.

---

## 1. React (Componentes / JSX)

### 1.1 `App.jsx`
**Ruta:** `src/App.jsx`
**Función:** Componente raíz. Maneja la sesión de Supabase, obtiene el rol del usuario (`usuario` o `administrador`) y define las rutas de la aplicación con `react-router-dom`, mostrando un set de rutas distinto según el rol.

```jsx
import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import Layout from './components/layout/Layout'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsuariosPage from './pages/UsuariosPage'
import GastosPage from './pages/GastosPage'
import IngresosPage from './pages/IngresosPage'
import PresupuestosPage from './pages/PresupuestosPage'
import ProductosPage from './pages/ProductosPage'
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

  if (verIndex && !session) return <IndexPage onEntrar={() => setVerIndex(false)} />
  if (!session) return <LoginPage onLogin={setSession} onVolver={() => setVerIndex(true)} />
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
              <Route path="/productos" element={<ProductosPage session={session} />} />
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
  { to: '/productos', emoji: '📦', label: 'Productos' },
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
**Función:** Panel principal (home) del administrador. Muestra estadísticas globales del sistema: tarjetas con total de usuarios, ingresos, gastos y balance; un gráfico de barras comparativo (ingresos/gastos/balance); dos gráficos de torta (gastos e ingresos por categoría) con `recharts`; y una tabla con todos los usuarios registrados.

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORES = ['#0dcaf0', '#20c997', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#0d6efd', '#d63384']

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

  if (cargando) return <p className="text-secondary text-center mt-5">Cargando panel admin...</p>

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-1">⚙️ Panel Administrador</h2>
      <p className="text-secondary mb-4">Estadísticas globales del sistema SMC</p>

      {/* TARJETAS */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-3">
          <div className="card bg-dark border-info border-opacity-50 p-4 text-center" style={{ borderRadius: '16px' }}>
            <p className="text-secondary small mb-1">👥 Total Usuarios</p>
            <h3 className="text-info fw-bold">{stats.totalUsuarios}</h3>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card bg-dark border-success border-opacity-50 p-4 text-center" style={{ borderRadius: '16px' }}>
            <p className="text-secondary small mb-1">💰 Total Ingresos</p>
            <h3 className="text-success fw-bold">$ {stats.totalIngresos.toLocaleString('es-CO')}</h3>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card bg-dark border-danger border-opacity-50 p-4 text-center" style={{ borderRadius: '16px' }}>
            <p className="text-secondary small mb-1">💸 Total Gastos</p>
            <h3 className="text-danger fw-bold">$ {stats.totalGastos.toLocaleString('es-CO')}</h3>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className={`card bg-dark p-4 text-center border-opacity-50 ${stats.balance >= 0 ? 'border-warning' : 'border-secondary'}`} style={{ borderRadius: '16px' }}>
            <p className="text-secondary small mb-1">⚖️ Balance Global</p>
            <h3 className={`fw-bold ${stats.balance >= 0 ? 'text-warning' : 'text-secondary'}`}>
              $ {stats.balance.toLocaleString('es-CO')}
            </h3>
          </div>
        </div>
      </div>

      {/* GRÁFICO BARRAS */}
      <div className="card bg-dark border-secondary p-4 mb-4" style={{ borderRadius: '16px' }}>
        <h5 className="text-white mb-3">📊 Comparativa global</h5>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparativa}>
            <XAxis dataKey="name" stroke="#8b92a0" />
            <YAxis stroke="#8b92a0" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`} contentStyle={{ backgroundColor: '#1F232C', border: '1px solid #2A2F3A' }} />
            <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
              {comparativa.map((entry, index) => (
                <Cell key={index} fill={entry.name === 'Ingresos' ? '#20c997' : entry.name === 'Gastos' ? '#dc3545' : '#ffc107'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRÁFICOS TORTA */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">💸 Gastos por categoría</h5>
            {gastosPorCategoria.length === 0 ? (
              <p className="text-secondary text-center">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={gastosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {gastosPorCategoria.map((_, i) => (<Cell key={i} fill={COLORES[i % COLORES.length]} />))}
                  </Pie>
                  <Tooltip formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`} contentStyle={{ backgroundColor: '#1F232C', border: '1px solid #2A2F3A' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">💰 Ingresos por categoría</h5>
            {ingresosPorCategoria.length === 0 ? (
              <p className="text-secondary text-center">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={ingresosPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {ingresosPorCategoria.map((_, i) => (<Cell key={i} fill={COLORES[i % COLORES.length]} />))}
                  </Pie>
                  <Tooltip formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`} contentStyle={{ backgroundColor: '#1F232C', border: '1px solid #2A2F3A' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
        <h5 className="text-white mb-3">👥 Usuarios registrados</h5>
        <table className="table table-dark table-bordered table-hover align-middle">
          <thead>
            <tr>
              <th className="text-danger">ID</th>
              <th className="text-danger">Rol</th>
              <th className="text-danger">Registrado</th>
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

## 2. JavaScript (Lógica de negocio)

Esta sección documenta las funciones más relevantes fuera del renderizado JSX, es decir, la lógica pura de cada página.

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

## 3. CSS (Estilos)

### 3.1 `index.css`
**Ruta:** `src/index.css`
**Función:** Hoja de estilos global del sistema, con tema oscuro. Define variables CSS (`:root`) para colores de fondo, bordes, texto y acentos (verde para ingresos/éxito, rojo para gastos/error, amarillo para alertas), tipografías, radios de borde y sombras; además del reset básico, layout general (sidebar + contenido), tarjetas, tablas, formularios, botones, badges, modal, barra de progreso, scrollbar personalizada y ajustes responsive.

```css
/* ============================================================
   SISTEMA SMC – index.css
   Tema oscuro para sistema de control financiero
   ============================================================ */

:root {
  /* Fondos */
  --bg-primary: #0F1115;
  --bg-secondary: #171A21;
  --bg-tertiary: #1F232C;
  --bg-hover: #262B35;

  /* Bordes */
  --border: #2A2F3A;
  --border-light: #353B47;

  /* Texto */
  --text-primary: #E8EAED;
  --text-secondary: #8B92A0;
  --text-muted: #5C6370;

  /* Acentos */
  --accent: #34D399;        /* ingresos / éxito / acción principal */
  --accent-hover: #2BBF8A;
  --accent-soft: rgba(52, 211, 153, 0.12);

  --danger: #F87171;        /* gastos / eliminar / error */
  --danger-hover: #EF5454;
  --danger-soft: rgba(248, 113, 113, 0.12);

  --warning: #FBBF24;       /* alertas de presupuesto */
  --warning-soft: rgba(251, 191, 36, 0.12);

  /* Tipografía */
  --font-display: 'Outfit', 'Segoe UI', sans-serif;
  --font-body: 'Inter', 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* Radios y sombras */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-card: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.5);

  /* Transición estándar */
  --transition: 150ms ease;
}

/* ============================================================
   RESET BÁSICO
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
   TIPOGRAFÍA
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
   LAYOUT GENERAL
   ============================================================ */

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 24px 32px;
  background-color: var(--bg-primary);
}

/* ============================================================
   HEADER
   ============================================================ */

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

/* ============================================================
   SIDEBAR / MENÚ
   ============================================================ */

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
}

/* ============================================================
   FOOTER
   ============================================================ */

.footer {
  padding: 16px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  border-top: 1px solid var(--border);
}

/* ============================================================
   TARJETAS (cards)
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

/* ============================================================
   TABLA
   ============================================================ */

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
   FORMULARIOS
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

/* ============================================================
   BOTONES
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
  color: #0F1115;
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
   BADGES (gasto/ingreso, estado)
   ============================================================ */

.badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.badge--ingreso {
  background-color: var(--accent-soft);
  color: var(--accent);
}

.badge--gasto {
  background-color: var(--danger-soft);
  color: var(--danger);
}

.badge--alerta {
  background-color: var(--warning-soft);
  color: var(--warning);
}

/* ============================================================
   MODAL
   ============================================================ */

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
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
   BARRA DE PROGRESO (presupuesto)
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
   SCROLLBAR (estética oscura)
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
   ACCESIBILIDAD
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
}

/* ============================================================
   RESPONSIVE
   ============================================================ */

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .main-content {
    padding: 16px;
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
| `/productos` | usuario | `ProductosPage` |
| `/usuarios` | usuario | `UsuariosPage` |
| `/soporte` | usuario | `SoportePage` |
| `/` | administrador | `AdminPage` |
| `/admin/usuarios` | administrador | `AdminUsuariosPage` |
| `/admin/reportes` | administrador | `AdminReportesPage` |
| `/admin/soporte` | administrador | `AdminSoportePage` |
| `/cuentas` | administrador | `CuentasPage` |
| `/usuarios` | administrador | `UsuariosPage` |