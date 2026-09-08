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