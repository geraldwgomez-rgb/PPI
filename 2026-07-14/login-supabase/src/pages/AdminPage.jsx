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
