import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">
      <Link className="sidebar__link" to="/">Dashboard</Link>
      <Link className="sidebar__link" to="/usuarios">Usuarios</Link>
      <Link className="sidebar__link" to="/gastos">Gastos</Link>
      <Link className="sidebar__link" to="/ingresos">Ingresos</Link>
      <Link className="sidebar__link" to="/presupuestos">Presupuestos</Link>
      <Link className="sidebar__link" to="/productos">Productos</Link>

    </aside>
  )
}

export default Sidebar
