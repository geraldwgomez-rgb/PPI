import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'

import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsuariosPage from './pages/UsuariosPage'
import GastosPage from './pages/GastosPage'
import IngresosPage from './pages/IngresosPage'
import PresupuestosPage from './pages/PresupuestosPage'

import './index.css'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!session) {
    return <LoginPage onLogin={setSession} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
