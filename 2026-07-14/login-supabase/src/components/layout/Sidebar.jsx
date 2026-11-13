import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SelectorIdioma from '../SelectorIdioma'

const LINKS_USUARIO = [
  { to: '/', emoji: '📊', key: 'menu.mySummary' },
  { to: '/gastos', emoji: '💸', key: 'menu.expenses' },
  { to: '/ingresos', emoji: '💰', key: 'menu.income' },
  { to: '/presupuestos', emoji: '📋', key: 'menu.budgets' },
  { to: '/soporte', emoji: '💬', key: 'menu.support' },
  { to: '/usuarios', emoji: '👤', key: 'menu.profile' },
]

const LINKS_ADMIN = [
  { to: '/', emoji: '⚙️', key: 'menu.adminPanel' },
  { to: '/cuentas', emoji: '🏦', key: 'menu.accounts' },
  { to: '/admin/usuarios', emoji: '👥', key: 'menu.users' },
  { to: '/admin/reportes', emoji: '📈', key: 'menu.reports' },
  { to: '/admin/soporte', emoji: '💬', key: 'menu.support' },
  { to: '/usuarios', emoji: '👤', key: 'menu.myProfile' },
]

function Sidebar({ rol }) {
  const { t } = useTranslation()
  const [busqueda, setBusqueda] = useState('')
  const links = (rol === 'administrador' ? LINKS_ADMIN : LINKS_USUARIO).map((l) => ({
    ...l,
    label: t(l.key),
  }))
  const linksFiltrados = links.filter((link) =>
    link.label.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <aside className="sidebar">
      <div className="px-3 pb-2">
        <span className={`badge w-100 py-1 ${rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
          {rol === 'administrador' ? `⚙️ ${t('sidebar.badgeAdmin')}` : `👤 ${t('sidebar.badgeUser')}`}
        </span>
      </div>
      <div style={{ padding: '0 8px 12px' }}>
        <input
          type="text"
          className="form-control bg-black border-secondary text-white"
          placeholder={`🔍 ${t('sidebar.search')}`}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ fontSize: '13px' }}
        />
      </div>
      {linksFiltrados.length === 0 ? (
        <p className="text-muted small px-3">{t('sidebar.noResults')}</p>
      ) : (
        linksFiltrados.map((link) => (
          <NavLink
            key={link.to + link.key}
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

      <div className="sidebar__footer">
        <SelectorIdioma />
      </div>
    </aside>
  )
}

export default Sidebar