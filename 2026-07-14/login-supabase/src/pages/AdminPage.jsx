import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from 'react-i18next'
import { useFormato } from '../lib/useFormato'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORES = ['#22D3EE', '#2DD4A8', '#FBBF24', '#FF5C7A', '#A78BFA', '#FD7E14', '#60A5FA', '#F472B6']
const COLOR_BARRA = { income: '#2DD4A8', expenses: '#FF5C7A', balance: '#22D3EE' }

export default function AdminPage() {
  const { t } = useTranslation()
  const { formatNumber, formatDate } = useFormato()
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalGastos: 0,
    totalIngresos: 0,
    balance: 0,
  })
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [ingresosPorCategoria, setIngresosPorCategoria] = useState([])
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

    // Se agrupa por el nombre real; "Sin categoría" se traduce al dibujar
    const mapGastos = {}
    gastos?.forEach((g) => {
      const cat = g.categoria_nombre || ''
      mapGastos[cat] = (mapGastos[cat] || 0) + Number(g.monto)
    })
    setGastosPorCategoria(Object.entries(mapGastos).map(([name, value]) => ({ name, value })))

    const mapIngresos = {}
    ingresos?.forEach((i) => {
      const cat = i.categoria_nombre || ''
      mapIngresos[cat] = (mapIngresos[cat] || 0) + Number(i.monto)
    })
    setIngresosPorCategoria(Object.entries(mapIngresos).map(([name, value]) => ({ name, value })))

    setCargando(false)
  }

  if (cargando) return <p className="text-secondary text-center mt-5">{t('admin.loading')}</p>

  const nombrar = (lista) => lista.map((d) => ({ ...d, name: d.name || t('common.uncategorized') }))
  const gastosData = nombrar(gastosPorCategoria)
  const ingresosData = nombrar(ingresosPorCategoria)

  const comparativa = [
    { key: 'income', name: t('dashboard.income'), monto: stats.totalIngresos },
    { key: 'expenses', name: t('dashboard.expenses'), monto: stats.totalGastos },
    { key: 'balance', name: t('dashboard.balance'), monto: stats.balance },
  ]

  const estiloTooltip = { backgroundColor: '#10141C', border: '1px solid #1E2530', borderRadius: '8px' }
  const formatoMonto = (v) => `$ ${formatNumber(v)}`

  return (
    <div className="container py-4">

      {/* ==================== HERO / ENCABEZADO DEL PORTAL ==================== */}
      <section className="hero-header">
        <p className="hero-header__eyebrow">{t('admin.eyebrow')}</p>
        <h1>{t('admin.title')}</h1>
        <p>{t('admin.subtitle')}</p>
      </section>

      {/* ==================== KPI CARDS ==================== */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="kpi-card h-100">
            <div className="kpi-card__label">{t('admin.totalUsers')}</div>
            <div className="kpi-card__value kpi-card__value--accent">{stats.totalUsuarios}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card h-100">
            <div className="kpi-card__label">{t('admin.totalIncome')}</div>
            <div className="kpi-card__value kpi-card__value--success">$ {formatNumber(stats.totalIngresos)}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card h-100">
            <div className="kpi-card__label">{t('admin.totalExpenses')}</div>
            <div className="kpi-card__value kpi-card__value--danger">$ {formatNumber(stats.totalGastos)}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card h-100">
            <div className="kpi-card__label">{t('admin.globalBalance')}</div>
            <div className={`kpi-card__value ${stats.balance >= 0 ? 'kpi-card__value--accent' : 'kpi-card__value--danger'}`}>
              $ {formatNumber(stats.balance)}
            </div>
            <div className={`kpi-card__delta ${stats.balance >= 0 ? 'kpi-card__delta--up' : 'kpi-card__delta--down'}`}>
              {stats.balance >= 0 ? t('dashboard.positive') : t('dashboard.negative')}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== GRÁFICO DE FLUJO (comparativa) ==================== */}
      <div className="card mb-4">
        <p className="eyebrow mb-1">{t('admin.cashFlow')}</p>
        <h5 className="text-white mb-3">{t('admin.globalComparison')}</h5>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparativa}>
            <XAxis dataKey="name" stroke="#565F6E" />
            <YAxis stroke="#565F6E" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={formatoMonto} contentStyle={estiloTooltip} />
            <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
              {comparativa.map((entry) => (
                <Cell key={entry.key} fill={COLOR_BARRA[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ==================== COMPOSICIÓN (tortas) ==================== */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <p className="eyebrow mb-1">{t('admin.breakdown')}</p>
            <h5 className="text-white mb-3">{t('admin.expensesByCategory')}</h5>
            {gastosData.length === 0 ? (
              <p className="text-secondary text-center">{t('common.noData')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={gastosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {gastosData.map((_, i) => (<Cell key={i} fill={COLORES[i % COLORES.length]} />))}
                  </Pie>
                  <Tooltip formatter={formatoMonto} contentStyle={estiloTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <p className="eyebrow mb-1">{t('admin.breakdown')}</p>
            <h5 className="text-white mb-3">{t('admin.incomeByCategory')}</h5>
            {ingresosData.length === 0 ? (
              <p className="text-secondary text-center">{t('common.noData')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={ingresosData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {ingresosData.map((_, i) => (<Cell key={i} fill={COLORES[i % COLORES.length]} />))}
                  </Pie>
                  <Tooltip formatter={formatoMonto} contentStyle={estiloTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ==================== TABLA DE USUARIOS ==================== */}
      <div className="card">
        <p className="eyebrow mb-1">{t('admin.records')}</p>
        <h5 className="text-white mb-3">{t('admin.registeredUsers')}</h5>
        <table>
          <thead>
            <tr>
              <th>{t('admin.colId')}</th>
              <th>{t('admin.colRole')}</th>
              <th>{t('admin.colRegistered')}</th>
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
                    {t(`role.${u.rol}`)}
                  </span>
                </td>
                <td className="text-secondary small">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}