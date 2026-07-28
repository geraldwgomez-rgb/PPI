import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import './index.css'

function App() {
  const [session, setSession] = useState(null)
  const [verIndex, setVerIndex] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) setVerIndex(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setVerIndex(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (verIndex && !session) {
    return <IndexPage onEntrar={() => setVerIndex(false)} />
  }

  if (!session) {
    return <LoginPage onLogin={setSession} onVolver={() => setVerIndex(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout session={session} />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/gastos" element={<GastosPage />} />
          <Route path="/ingresos" element={<IngresosPage />} />
          <Route path="/presupuestos" element={<PresupuestosPage />} />
          <Route path="/productos" element={<ProductosPage session={session} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
