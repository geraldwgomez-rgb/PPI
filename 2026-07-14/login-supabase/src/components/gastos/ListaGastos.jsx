import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const CATEGORIAS = [
  'Alimentación',
  'Arriendo / Vivienda',
  'Servicios públicos',
  'Transporte',
  'Salud',
  'Educación',
  'Ropa y calzado',
  'Entretenimiento / Ocio',
  'Tecnología',
  'Deudas / Créditos',
  'Ahorro',
  'Inversiones',
  'Mascotas',
  'Belleza / Cuidado personal',
  'Otros',
]

export default function ListaGastos({ session, recargar, filtros = {} }) {
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editandoId, setEditandoId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    obtenerGastos()
  }, [recargar, filtros])

  async function obtenerGastos() {
    setCargando(true)
    let query = supabase
      .from('gastos')
      .select('id_gasto, descripcion, tipo, monto, fecha, categoria_nombre')
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
        resultado = resultado.filter(g =>
          g.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())
        )
      }
      setGastos(resultado)
    }
    setCargando(false)
  }

  function iniciarEdicion(g) {
    setEditandoId(g.id_gasto)
    setEditForm({
      descripcion: g.descripcion,
      monto: g.monto,
      tipo: g.tipo,
      fecha: g.fecha,
      categoria_nombre: g.categoria_nombre || '',
    })
  }

  function cancelarEdicion() {
    setEditandoId(null)
    setEditForm({})
  }

  async function guardarEdicion(id) {
    const { error } = await supabase
      .from('gastos')
      .update({
        descripcion: editForm.descripcion,
        monto: Number(editForm.monto),
        tipo: editForm.tipo,
        fecha: editForm.fecha,
        categoria_nombre: editForm.categoria_nombre,
      })
      .eq('id_gasto', id)

    if (error) console.error(error)
    else {
      setEditandoId(null)
      setEditForm({})
      obtenerGastos()
    }
  }

  async function eliminarGasto(id) {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este gasto?')
    if (!confirmar) return
    const { error } = await supabase.from('gastos').delete().eq('id_gasto', id)
    if (error) console.error(error)
    else obtenerGastos()
  }

  if (cargando) return <p className="text-secondary">Cargando gastos...</p>

  return (
    <div>
      <h4 className="text-info mb-3">Lista de Gastos ({gastos.length})</h4>
      {gastos.length === 0 ? (
        <p className="text-secondary">No se encontraron gastos.</p>
      ) : (
        <table className="table table-dark table-bordered table-hover align-middle">
          <thead>
            <tr>
              <th className="text-info">Descripción</th>
              <th className="text-info">Categoría</th>
              <th className="text-info">Tipo</th>
              <th className="text-info">Monto</th>
              <th className="text-info">Fecha</th>
              <th className="text-info text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g) => (
              editandoId === g.id_gasto ? (
                // FILA EN MODO EDICIÓN
                <tr key={g.id_gasto} className="table-active">
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={editForm.descripcion}
                      onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm bg-black border-secondary text-white"
                      value={editForm.categoria_nombre}
                      onChange={(e) => setEditForm({ ...editForm, categoria_nombre: e.target.value })}
                    >
                      <option value="">-- Categoría --</option>
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm bg-black border-secondary text-white"
                      value={editForm.tipo}
                      onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                    >
                      <option value="FIJO">Fijo</option>
                      <option value="EXTRAORDINARIO">Extraordinario</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={editForm.monto}
                      onChange={(e) => setEditForm({ ...editForm, monto: e.target.value })}
                      min="1"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      className="form-control form-control-sm bg-black border-secondary text-white"
                      value={editForm.fecha}
                      onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
                    />
                  </td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-success btn-sm" onClick={() => guardarEdicion(g.id_gasto)}>
                        Guardar
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelarEdicion}>
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // FILA NORMAL
                <tr key={g.id_gasto}>
                  <td>{g.descripcion}</td>
                  <td><span className="badge bg-secondary">{g.categoria_nombre || '—'}</span></td>
                  <td>
                    <span className={`badge ${g.tipo === 'FIJO' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                      {g.tipo}
                    </span>
                  </td>
                  <td className="text-danger fw-bold">$ {Number(g.monto).toLocaleString('es-CO')}</td>
                  <td>{new Date(g.fecha).toLocaleDateString('es-CO')}</td>
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <button className="btn btn-outline-info btn-sm" onClick={() => iniciarEdicion(g)}>
                        Editar
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarGasto(g.id_gasto)}>
                        Eliminar
                      </button>
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
