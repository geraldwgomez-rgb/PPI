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

          {/* Rutas comunes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/usuarios" element={<UsuariosPage session={session} />} />

          {/* Rutas solo USUARIO */}
          {rol === 'usuario' && (
            <>
              <Route path="/gastos" element={<GastosPage session={session} />} />
              <Route path="/ingresos" element={<IngresosPage session={session} />} />
              <Route path="/presupuestos" element={<PresupuestosPage session={session} />} />
              <Route path="/productos" element={<ProductosPage session={session} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}

          {/* Rutas solo ADMINISTRADOR */}
          {rol === 'administrador' && (
            <>
              <Route path="/admin" element={<AdminPage session={session} />} />
              <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
              <Route path="/admin/reportes" element={<AdminReportesPage />} />
              <Route path="/cuentas" element={<CuentasPage session={session} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
