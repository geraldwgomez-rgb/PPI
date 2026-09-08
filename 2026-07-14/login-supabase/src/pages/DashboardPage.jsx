import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORES = ['#22D3EE', '#2DD4A8', '#FBBF24', '#FF5C7A', '#A78BFA', '#FD7E14', '#60A5FA', '#F472B6']

function getMesesDisponibles(fechaRegistro) {
  const meses = []
  const inicio = new Date(fechaRegistro)
  const hoy = new Date()
  let actual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
  while (actual <= hoy) {
    meses.push({
      valor: `${actual.getFullYear()}-${String(actual.getMonth() + 1).padStart(2, '0')}`,
      label: actual.toLocaleString('es-CO', { month: 'long', year: 'numeric' })
    })
    actual.setMonth(actual.getMonth() + 1)
  }
  return meses.reverse()
}

export default function DashboardPage({ session }) {
  const [totalIngresos, setTotalIngresos] = useState(0)
  const [totalGastos, setTotalGastos] = useState(0)
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [ingresosPorCategoria, setIngresosPorCategoria] = useState([])
  const [comparativa, setComparativa] = useState([])
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

    const sumIngresos = ingresos?.reduce((acc, i) => acc + Number(i.monto), 0) || 0
    const sumGastos = gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0

    setTotalIngresos(sumIngresos)
    setTotalGastos(sumGastos)

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

  const balance = totalIngresos - totalGastos
  const labelMes = meses.find(m => m.valor === mesSeleccionado)?.label || mesSeleccionado

  return (
    <div className="container py-4">

      {/* ==================== HERO / ENCABEZADO DEL PORTAL ==================== */}
      <section className="hero-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <p className="hero-header__eyebrow">MI PORTAL // SISTEMA SMC</p>
            <h1 className="mb-1">Mi Resumen Financiero</h1>
            <p className="m-0">
              Resumen de <strong style={{ color: '#fff' }}>{labelMes}</strong>
            </p>
          </div>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '200px' }}
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            {meses.map((m) => (
              <option key={m.valor} value={m.valor}>{m.label}</option>
            ))}
          </select>
        </div>
      </section>

      {cargando ? (
        <p className="text-secondary text-center mt-5">Cargando datos...</p>
      ) : (
        <>
          {/* ==================== KPI CARDS ==================== */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Total Ingresos</div>
                <div className="kpi-card__value kpi-card__value--success">$ {totalIngresos.toLocaleString('es-CO')}</div>
                <div className="kpi-card__delta">{ingresosPorCategoria.length} categorías</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Total Gastos</div>
                <div className="kpi-card__value kpi-card__value--danger">$ {totalGastos.toLocaleString('es-CO')}</div>
                <div className="kpi-card__delta">{gastosPorCategoria.length} categorías</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Balance</div>
                <div className={`kpi-card__value ${balance >= 0 ? 'kpi-card__value--accent' : 'kpi-card__value--danger'}`}>
                  $ {balance.toLocaleString('es-CO')}
                </div>
                <div className={`kpi-card__delta ${balance >= 0 ? 'kpi-card__delta--up' : 'kpi-card__delta--down'}`}>
                  {balance >= 0 ? '▲ Positivo' : '▼ Negativo'}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== GRÁFICO DE FLUJO ==================== */}
          <div className="card mb-4">
            <p className="eyebrow mb-1">FLUJO DE EFECTIVO</p>
            <h5 className="text-white mb-3">Comparativa del mes</h5>
            <ResponsiveContainer width="100%" height={250}>
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
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="card h-100">
                <p className="eyebrow mb-1">COMPOSICIÓN</p>
                <h5 className="text-white mb-3">Gastos por categoría</h5>
                {gastosPorCategoria.length === 0 ? (
                  <p className="text-secondary text-center">Sin gastos este mes</p>
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
                  <p className="text-secondary text-center">Sin ingresos este mes</p>
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
        </>
      )}
    </div>
  )
}
