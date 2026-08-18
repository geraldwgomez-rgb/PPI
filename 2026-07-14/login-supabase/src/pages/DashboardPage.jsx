import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORES = ['#0dcaf0', '#20c997', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#0d6efd', '#d63384']

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
      <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-2">
        <h2 className="text-info fw-bold m-0">📊 Dashboard</h2>

        {/* Selector de mes */}
        <select
          className="form-select bg-black border-secondary text-white"
          style={{ width: 'auto', minWidth: '200px' }}
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
        >
          {meses.map((m) => (
            <option key={m.valor} value={m.valor}>{m.label}</option>
          ))}
        </select>
      </div>

      <p className="text-secondary mb-4">Resumen de <strong className="text-white">{labelMes}</strong></p>

      {cargando ? (
        <p className="text-secondary text-center mt-5">Cargando datos...</p>
      ) : (
        <>
          {/* TARJETAS */}
          <div className="row g-4 mb-5">
            <div className="col-12 col-md-4">
              <div className="card bg-dark border-success border-opacity-50 p-4 text-center" style={{ borderRadius: '16px' }}>
                <p className="text-secondary small mb-1">💰 Total Ingresos</p>
                <h3 className="text-success fw-bold">$ {totalIngresos.toLocaleString('es-CO')}</h3>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card bg-dark border-danger border-opacity-50 p-4 text-center" style={{ borderRadius: '16px' }}>
                <p className="text-secondary small mb-1">💸 Total Gastos</p>
                <h3 className="text-danger fw-bold">$ {totalGastos.toLocaleString('es-CO')}</h3>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className={`card bg-dark p-4 text-center border-opacity-50 ${balance >= 0 ? 'border-info' : 'border-warning'}`} style={{ borderRadius: '16px' }}>
                <p className="text-secondary small mb-1">⚖️ Balance</p>
                <h3 className={`fw-bold ${balance >= 0 ? 'text-info' : 'text-warning'}`}>
                  $ {balance.toLocaleString('es-CO')}
                </h3>
              </div>
            </div>
          </div>

          {/* GRÁFICO BARRAS */}
          <div className="card bg-dark border-secondary p-4 mb-4" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">📊 Comparativa del mes</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparativa}>
                <XAxis dataKey="name" stroke="#8b92a0" />
                <YAxis stroke="#8b92a0" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => `$ ${Number(v).toLocaleString('es-CO')}`} contentStyle={{ backgroundColor: '#1F232C', border: '1px solid #2A2F3A' }} />
                <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
                  {comparativa.map((entry, index) => (
                    <Cell key={index} fill={entry.name === 'Ingresos' ? '#20c997' : entry.name === 'Gastos' ? '#dc3545' : '#0dcaf0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* GRÁFICOS TORTA */}
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="card bg-dark border-secondary p-4" style={{ borderRadius: '16px' }}>
                <h5 className="text-white mb-3">💸 Gastos por categoría</h5>
                {gastosPorCategoria.length === 0 ? (
                  <p className="text-secondary text-center">Sin gastos este mes</p>
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
                  <p className="text-secondary text-center">Sin ingresos este mes</p>
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
        </>
      )}
    </div>
  )
}
