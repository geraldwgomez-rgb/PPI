import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function getMesesDesde(fechaRegistro) {
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

export default function AdminReportesPage() {
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('')
  const [meses, setMeses] = useState([])
  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual)
  const [generando, setGenerando] = useState(false)
  const [preview, setPreview] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarUsuarios() {
      const { data } = await supabase
        .from('usuarios_info')
        .select('id, email, rol, created_at')
      if (data) setUsuarios(data)
      setCargando(false)
    }
    cargarUsuarios()
  }, [])

  function handleUsuarioChange(e) {
    const id = e.target.value
    setUsuarioSeleccionado(id)
    setPreview(null)

    if (id) {
      const usuario = usuarios.find(u => u.id === id)
      if (usuario) {
        const mesesDisponibles = getMesesDesde(usuario.created_at)
        setMeses(mesesDisponibles)
        setMesSeleccionado(mesesDisponibles[0]?.valor || mesActual)
      }
    } else {
      setMeses([])
    }
  }

  async function generarReporte() {
    if (!usuarioSeleccionado) { alert('Selecciona un usuario primero.'); return }

    setGenerando(true)

    const [anio, mesNum] = mesSeleccionado.split('-').map(Number)
    const primerDia = new Date(anio, mesNum - 1, 1).toISOString().split('T')[0]
    const ultimoDia = new Date(anio, mesNum, 0).toISOString().split('T')[0]
    const labelMes = meses.find(m => m.valor === mesSeleccionado)?.label || mesSeleccionado
    const emailUsuario = usuarios.find(u => u.id === usuarioSeleccionado)?.email || ''

    const { data: gastos } = await supabase
      .from('gastos')
      .select('descripcion, categoria_nombre, tipo, monto, fecha')
      .eq('user_id', usuarioSeleccionado)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)
      .order('fecha', { ascending: true })

    const { data: ingresos } = await supabase
      .from('ingresos')
      .select('descripcion, categoria_nombre, tipo, monto, fecha')
      .eq('user_id', usuarioSeleccionado)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)
      .order('fecha', { ascending: true })

    const { data: presupuestos } = await supabase
      .from('presupuesto')
      .select('periodo, monto_limite, gasto_acumulado')
      .eq('user_id', usuarioSeleccionado)

    const totalGastos = gastos?.reduce((acc, g) => acc + Number(g.monto), 0) || 0
    const totalIngresos = ingresos?.reduce((acc, i) => acc + Number(i.monto), 0) || 0
    const balance = totalIngresos - totalGastos

    setPreview({ gastos, ingresos, presupuestos, totalGastos, totalIngresos, balance, labelMes, emailUsuario })

    // Generar PDF
    const doc = new jsPDF()
    const azul = [13, 202, 240]
    const rojo = [220, 53, 69]
    const verde = [32, 201, 151]
    const gris = [100, 100, 100]

    doc.setFillColor(15, 17, 21)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(...azul)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Sistema SMC', 14, 18)
    doc.setFontSize(11)
    doc.setTextColor(200, 200, 200)
    doc.text(`Reporte financiero — ${labelMes}`, 14, 26)
    doc.text(`Usuario: ${emailUsuario}`, 14, 33)
    doc.setTextColor(...gris)
    doc.setFontSize(9)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 150, 33)

    doc.setFillColor(30, 35, 44)
    doc.rect(14, 45, 55, 22, 'F')
    doc.rect(77, 45, 55, 22, 'F')
    doc.rect(140, 45, 55, 22, 'F')

    doc.setFontSize(9)
    doc.setTextColor(...gris)
    doc.text('INGRESOS', 20, 52)
    doc.text('GASTOS', 83, 52)
    doc.text('BALANCE', 146, 52)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...verde)
    doc.text(`$ ${totalIngresos.toLocaleString('es-CO')}`, 20, 62)
    doc.setTextColor(...rojo)
    doc.text(`$ ${totalGastos.toLocaleString('es-CO')}`, 83, 62)
    doc.setTextColor(balance >= 0 ? azul[0] : 255, balance >= 0 ? azul[1] : 193, balance >= 0 ? azul[2] : 7)
    doc.text(`$ ${balance.toLocaleString('es-CO')}`, 146, 62)

    let y = 75

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...verde)
    doc.text('Ingresos', 14, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Descripción', 'Categoría', 'Tipo', 'Monto', 'Fecha']],
      body: ingresos?.length > 0
        ? ingresos.map(i => [i.descripcion, i.categoria_nombre || '—', i.tipo, `$ ${Number(i.monto).toLocaleString('es-CO')}`, new Date(i.fecha).toLocaleDateString('es-CO')])
        : [['Sin ingresos este mes', '', '', '', '']],
      styles: { fontSize: 9, cellPadding: 3, textColor: [220, 220, 220], fillColor: [25, 30, 40] },
      headStyles: { fillColor: [32, 201, 151], textColor: [0, 0, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [30, 36, 48] },
      margin: { left: 14, right: 14 },
    })

    y = doc.lastAutoTable.finalY + 10

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...rojo)
    doc.text('Gastos', 14, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Descripción', 'Categoría', 'Tipo', 'Monto', 'Fecha']],
      body: gastos?.length > 0
        ? gastos.map(g => [g.descripcion, g.categoria_nombre || '—', g.tipo, `$ ${Number(g.monto).toLocaleString('es-CO')}`, new Date(g.fecha).toLocaleDateString('es-CO')])
        : [['Sin gastos este mes', '', '', '', '']],
      styles: { fontSize: 9, cellPadding: 3, textColor: [220, 220, 220], fillColor: [25, 30, 40] },
      headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [30, 36, 48] },
      margin: { left: 14, right: 14 },
    })

    y = doc.lastAutoTable.finalY + 10
    if (y > 240) { doc.addPage(); y = 20 }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...azul)
    doc.text('Presupuestos', 14, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Periodo', 'Límite', 'Gastado', 'Disponible']],
      body: presupuestos?.length > 0
        ? presupuestos.map(p => {
            const disponible = Number(p.monto_limite) - Number(p.gasto_acumulado)
            return [p.periodo, `$ ${Number(p.monto_limite).toLocaleString('es-CO')}`, `$ ${Number(p.gasto_acumulado).toLocaleString('es-CO')}`, `$ ${disponible.toLocaleString('es-CO')}`]
          })
        : [['Sin presupuestos registrados', '', '', '']],
      styles: { fontSize: 9, cellPadding: 3, textColor: [220, 220, 220], fillColor: [25, 30, 40] },
      headStyles: { fillColor: [13, 110, 253], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [30, 36, 48] },
      margin: { left: 14, right: 14 },
    })

    doc.setFontSize(8)
    doc.setTextColor(...gris)
    doc.text('Sistema SMC — Reporte generado automáticamente', 14, 290)
    doc.save(`reporte_${emailUsuario}_${mesSeleccionado}.pdf`)
    setGenerando(false)
  }

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-4">📈 Reportes</h2>

      <div className="card bg-dark border-secondary p-4 mb-4" style={{ borderRadius: '16px' }}>
        <h5 className="text-white mb-3">⚙️ Configurar reporte</h5>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label text-white fw-light">Usuario</label>
            <select className="form-select bg-black border-secondary text-white" value={usuarioSeleccionado} onChange={handleUsuarioChange}>
              <option value="">-- Selecciona un usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.email} ({u.rol})</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label text-white fw-light">Mes</label>
            <select
              className="form-select bg-black border-secondary text-white"
              value={mesSeleccionado}
              onChange={(e) => { setMesSeleccionado(e.target.value); setPreview(null) }}
              disabled={!usuarioSeleccionado}
            >
              {meses.length === 0
                ? <option value="">-- Selecciona un usuario primero --</option>
                : meses.map((m) => (<option key={m.valor} value={m.valor}>{m.label}</option>))
              }
            </select>
          </div>
        </div>

        <button className="btn btn-danger fw-bold w-100 mt-4" onClick={generarReporte} disabled={generando || !usuarioSeleccionado}>
          {generando ? 'Generando PDF...' : '📄 Generar y descargar PDF'}
        </button>
      </div>

      {preview && (
        <div className="card bg-dark border-info border-opacity-25 p-4" style={{ borderRadius: '16px' }}>
          <h5 className="text-white mb-3">👁️ Vista previa — {preview.labelMes}</h5>
          <p className="text-secondary small mb-3">Usuario: <strong className="text-white">{preview.emailUsuario}</strong></p>
          <div className="row g-3 mb-3">
            <div className="col-4">
              <div className="card bg-dark border-success border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                <small className="text-secondary">Ingresos</small>
                <div className="text-success fw-bold">$ {preview.totalIngresos.toLocaleString('es-CO')}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="card bg-dark border-danger border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                <small className="text-secondary">Gastos</small>
                <div className="text-danger fw-bold">$ {preview.totalGastos.toLocaleString('es-CO')}</div>
              </div>
            </div>
            <div className="col-4">
              <div className={`card bg-dark p-3 text-center border-opacity-50 ${preview.balance >= 0 ? 'border-info' : 'border-warning'}`} style={{ borderRadius: '12px' }}>
                <small className="text-secondary">Balance</small>
                <div className={`fw-bold ${preview.balance >= 0 ? 'text-info' : 'text-warning'}`}>$ {preview.balance.toLocaleString('es-CO')}</div>
              </div>
            </div>
          </div>
          <p className="text-secondary small">
            📊 {preview.ingresos?.length || 0} ingresos · {preview.gastos?.length || 0} gastos · {preview.presupuestos?.length || 0} presupuestos
          </p>
        </div>
      )}
    </div>
  )
}
