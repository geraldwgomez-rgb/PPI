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

// Devuelve los meses ('YYYY-MM') desde el registro hasta hoy, del más nuevo al más viejo.
// La etiqueta se arma al dibujar, para que cambie junto con el idioma.
function getMesesDisponibles(fechaRegistro) {
  const meses = []
  const inicio = new Date(fechaRegistro)
  const hoy = new Date()
  let actual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  while (actual <= hoy) {
    meses.push(`${actual.getFullYear()}-${String(actual.getMonth() + 1).padStart(2, '0')}`)
    actual.setMonth(actual.getMonth() + 1)
  }
  return meses.reverse()
}

export default function DashboardPage({ session }) {
  const { t } = useTranslation()
  const { locale, formatNumber } = useFormato()
  const [totalIngresos, setTotalIngresos] = useState(0)
  const [totalGastos, setTotalGastos] = useState(0)
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [ingresosPorCategoria, setIngresosPorCategoria] = useState([])
  const [cargando, setCargando] = useState(true)
  const [meses, setMeses] = useState([])

  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual)

  useEffect(() => {
    if (!session) return
    const fechaRegistro = session.user.created_at || new Date().toISOString()
    setMeses(getMesesDisponibles(fechaRegistro))
    cargarDatos(mesSeleccionado)
  }, [session])

  useEffect(() => {
    if (!session) return
    cargarDatos(mesSeleccionado)
  }, [mesSeleccionado])

  async function cargarDatos(mes) {
    setCargando(true)
    const [anio, mesNum] = mes.split('-').map(Number)
    const primerDia = new Date(anio, mesNum - 1, 1).toISOString().split('T')[0]
    const ultimoDia = new Date(anio, mesNum, 0).toISOString().split('T')[0]

    const { data: ingresos } = await supabase
      .from('ingresos')
      .select('monto, categoria_nombre')
      .eq('user_id', session.user.id)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)

    const { data: gastos } = await supabase
      .from('gastos')
      .select('monto, categoria_nombre')
      .eq('user_id', session.user.id)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)

    setTotalIngresos(ingresos?.reduce((acc, i) => acc + Number(i.monto), 0) || 0)
    setTotalGastos(gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0)

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

  const balance = totalIngresos - totalGastos

  const etiquetaMes = (valor) => {
    const [anio, mesNum] = valor.split('-').map(Number)
    return new Date(anio, mesNum - 1, 1).toLocaleString(locale, { month: 'long', year: 'numeric' })
  }
  const labelMes = etiquetaMes(mesSeleccionado)

  const nombrar = (lista) =>
    lista.map((d) => ({ ...d, name: d.name || t('common.uncategorized') }))
  const gastosData = nombrar(gastosPorCategoria)
  const ingresosData = nombrar(ingresosPorCategoria)

  const comparativa = [
    { key: 'income', name: t('dashboard.income'), monto: totalIngresos },
    { key: 'expenses', name: t('dashboard.expenses'), monto: totalGastos },
    { key: 'balance', name: t('dashboard.balance'), monto: balance },
  ]

  const estiloTooltip = { backgroundColor: '#10141C', border: '1px solid #1E2530', borderRadius: '8px' }
  const formatoMonto = (v) => `$ ${formatNumber(v)}`

  return (
    <div className="container py-4">

      {/* ==================== HERO / ENCABEZADO DEL PORTAL ==================== */}
      <section className="hero-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <p className="hero-header__eyebrow">{t('dashboard.eyebrow')}</p>
            <h1 className="mb-1">{t('dashboard.title')}</h1>
            <p className="m-0">
              {t('dashboard.summaryOf')} <strong style={{ color: '#fff' }}>{labelMes}</strong>
            </p>
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '200px' }}
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            {meses.map((valor) => (
              <option key={valor} value={valor}>{etiquetaMes(valor)}</option>
            ))}
          </select>
        </div>
      </section>

      {cargando ? (
        <p className="text-secondary text-center mt-5">{t('common.loadingData')}</p>
      ) : (
        <>
          {/* ==================== KPI CARDS ==================== */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">{t('dashboard.totalIncome')}</div>
                <div className="kpi-card__value kpi-card__value--success">$ {formatNumber(totalIngresos)}</div>
                <div className="kpi-card__delta">{t(ingresosPorCategoria.length === 1 ? 'dashboard.categories_one' : 'dashboard.categories', { n: ingresosPorCategoria.length })}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">{t('dashboard.totalExpenses')}</div>
                <div className="kpi-card__value kpi-card__value--danger">$ {formatNumber(totalGastos)}</div>
                <div className="kpi-card__delta">{t(gastosPorCategoria.length === 1 ? 'dashboard.categories_one' : 'dashboard.categories', { n: gastosPorCategoria.length })}</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">{t('dashboard.balance')}</div>
                <div className={`kpi-card__value ${balance >= 0 ? 'kpi-card__value--accent' : 'kpi-card__value--danger'}`}>
                  $ {formatNumber(balance)}
                </div>
                <div className={`kpi-card__delta ${balance >= 0 ? 'kpi-card__delta--up' : 'kpi-card__delta--down'}`}>
                  {balance >= 0 ? t('dashboard.positive') : t('dashboard.negative')}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== GRÁFICO DE FLUJO ==================== */}
          <div className="card mb-4">
            <p className="eyebrow mb-1">{t('dashboard.cashFlow')}</p>
            <h5 className="text-white mb-3">{t('dashboard.monthlyComparison')}</h5>
            <ResponsiveContainer width="100%" height={250}>
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
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="card h-100">
                <p className="eyebrow mb-1">{t('dashboard.breakdown')}</p>
                <h5 className="text-white mb-3">{t('dashboard.expensesByCategory')}</h5>
                {gastosData.length === 0 ? (
                  <p className="text-secondary text-center">{t('dashboard.noExpenses')}</p>
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
                <p className="eyebrow mb-1">{t('dashboard.breakdown')}</p>
                <h5 className="text-white mb-3">{t('dashboard.incomeByCategory')}</h5>
                {ingresosData.length === 0 ? (
                  <p className="text-secondary text-center">{t('dashboard.noIncome')}</p>
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
        </>
      )}
    </div>
  )
}