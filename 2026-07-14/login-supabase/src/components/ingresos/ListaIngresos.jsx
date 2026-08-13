import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const CATEGORIAS = [
  'Salario', 'Ventas', 'Freelance', 'Inversiones',
  'Arriendo', 'Préstamo recibido', 'Bonificación',
  'Herencia / Regalo', 'Dividendos', 'Otros',
]

const TIPOS = ['ORDINARIO', 'EXTRAORDINARIO', 'DIFERIDO', 'NO_OPERACIONAL']

export default function ListaIngresos({ session, recargar, filtros = {} }) {
  const [ingresos, setIngresos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editandoId, setEditandoId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { obtenerIngresos() }, [recargar, filtros])

  async function obtenerIngresos() {
    setCargando(true)
    let query = supabase
      .from('ingresos')
      .select('id_ingreso, descripcion, tipo, monto, fecha, categoria_nombre')
      .eq('user_id', session.user.id)
      .order('fecha', { ascending: false })

    if (filtros.categoria) query = query.eq('categoria_nombre', filtros.categoria)
    if (filtros.fechaInicio) query = query.gte('fecha', filtros.fechaInicio)
    if (filtros.fechaFin) query = query.lte('fecha', filtros.fechaFin)
    if (filtros.montoMax) query = query.lte('monto', filtros.montoMax)

    const { data, error } = await query
    if (error) console.error(error)
    else {
      let resultado = data
      if (filtros.busqueda) {
        resultado = resultado.filter(i =>
          i.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())
        )
      }
      setIngresos(resultado)
    }
    setCargando(false)
  }

  function iniciarEdicion(i) {
    setEditandoId(i.id_ingreso)
    setEditForm({ descripcion: i.descripcion, monto: i.monto, tipo: i.tipo, fecha: i.fecha, categoria_nombre: i.categoria_nombre || '' })
  }

  function cancelarEdicion() { setEditandoId(null); setEditForm({}) }

  async function guardarEdicion(id) {
    const { error } = await supabase
      .from('ingresos')
      .update({ descripcion: editForm.descripcion, monto: Number(editForm.monto), tipo: editForm.tipo, fecha: editForm.fecha, categoria_nombre: editForm.categoria_nombre })
      .eq('id_ingreso', id)
    if (error) console.error(error)
    else { setEditandoId(null); setEditForm({}); obtenerIngresos() }
  }

  async function eliminarIngreso(id) {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este ingreso?')
    if (!confirmar) return
    const { error } = await supabase.from('ingresos').delete().eq('id_ingreso', id)
    if (error) console.error(error)
    else obtenerIngresos()
  }

  if (cargando) return <p className="text-secondary">Cargando ingresos...</p>

  return (
    <div>
      <h4 className="text-success mb-3">Lista de Ingresos ({ingresos.length})</h4>
      {ingresos.length === 0 ? (
        <p className="text-secondary">No se encontraron ingresos.</p>
      ) : (
        <table className="table table-dark table-bordered table-hover align-middle">
          <thead>
            <tr>
              <th className="text-success">Descripción</th>
              <th className="text-success">Categoría</th>
              <th className="text-success">Tipo</th>
              <th className="text-success">Monto</th>
              <th className="text-success">Fecha</th>
              <th className="text-success text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((i) => (
              editandoId === i.id_ingreso ? (
                <tr key={i.id_ingreso} className="table-active">
                  <td><input type="text" className="form-control form-control-sm bg-black border-secondary text-white" value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} /></td>
                  <td>
                    <select className="form-select form-select-sm bg-black border-secondary text-white" value={editForm.categoria_nombre} onChange={(e) => setEditForm({ ...editForm, categoria_nombre: e.target.value })}>
                      <option value="">-- Categoría --</option>
                      {CATEGORIAS.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </td>
                  <td>
                    <select className="form-select form-select-sm bg-black border-secondary text-white" value={editForm.tipo} onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}>
                      {TIPOS.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </td>
                  <td><input type="number" className="form-control form-control-sm bg-black border-secondary text-white" value={editForm.monto} onChange={(e) => setEditForm({ ...editForm, monto: e.target.value })} min="1" /></td>
                  <td><input type="date" className="form-control form-control-sm bg-black border-secondary text-white" value={editForm.fecha} onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })} /></td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-success btn-sm" onClick={() => guardarEdicion(i.id_ingreso)}>Guardar</button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelarEdicion}>Cancelar</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={i.id_ingreso}>
                  <td>{i.descripcion}</td>
                  <td><span className="badge bg-secondary">{i.categoria_nombre || '—'}</span></td>
                  <td><span className="badge bg-success">{i.tipo}</span></td>
                  <td className="text-success fw-bold">$ {Number(i.monto).toLocaleString('es-CO')}</td>
                  <td>{new Date(i.fecha).toLocaleDateString('es-CO')}</td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-outline-info btn-sm" onClick={() => iniciarEdicion(i)}>Editar</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarIngreso(i.id_ingreso)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
