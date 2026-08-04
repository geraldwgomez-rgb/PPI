import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/',             emoji: '📊', label: 'Dashboard' },
  { to: '/gastos',       emoji: '💸', label: 'Gastos' },
  { to: '/ingresos',     emoji: '💰', label: 'Ingresos' },
  { to: '/presupuestos', emoji: '📋', label: 'Presupuestos' },
  { to: '/cuentas',      emoji: '🏦', label: 'Cuentas' },
  { to: '/productos',    emoji: '📦', label: 'Productos' },
  { to: '/usuarios',     emoji: '👤', label: 'Perfil' },
]

function Sidebar() {
  const [busqueda, setBusqueda] = useState('')

  const linksFiltrados = LINKS.filter(link =>
    link.label.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <aside className="sidebar">

      {/* Buscador */}
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

      {/* Links filtrados */}
      {linksFiltrados.length === 0 ? (
        <p className="text-muted small px-3">Sin resultados</p>
      ) : (
        linksFiltrados.map((link) => (
          <NavLink
            key={link.to}
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
