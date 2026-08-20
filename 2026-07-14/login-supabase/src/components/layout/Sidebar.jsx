import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS_USUARIO = [
  { to: '/',             emoji: '📊', label: 'Mi Resumen' },
  { to: '/gastos',       emoji: '💸', label: 'Gastos' },
  { to: '/ingresos',     emoji: '💰', label: 'Ingresos' },
  { to: '/presupuestos', emoji: '📋', label: 'Presupuestos' },
  { to: '/productos',    emoji: '📦', label: 'Productos' },
  { to: '/usuarios',     emoji: '👤', label: 'Perfil' },
]

const LINKS_ADMIN = [
  { to: '/',                emoji: '⚙️', label: 'Panel Admin' },
  { to: '/cuentas',         emoji: '🏦', label: 'Cuentas' },
  { to: '/admin/usuarios',  emoji: '👥', label: 'Usuarios' },
  { to: '/admin/reportes',  emoji: '📈', label: 'Reportes' },
  { to: '/usuarios',        emoji: '👤', label: 'Mi Perfil' },
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
