import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from './components/layout/Layout'

import DashboardPage from './pages/DashboardPage'
import UsuariosPage from './pages/UsuariosPage'
import GastosPage from './pages/GastosPage'
import IngresosPage from './pages/IngresosPage'
import PresupuestosPage from './pages/PresupuestosPage'
import LoginPage from './pages/LoginPage'
import RegistroPage from './pages/RegistroPage'

import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas sin layout (sin sidebar/header) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        {/* Rutas dentro del layout principal */}
        <Route element={<Layout />}>
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
