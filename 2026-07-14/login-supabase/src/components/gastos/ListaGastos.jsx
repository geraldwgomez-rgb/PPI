import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ListaGastos({ session, recargar, filtros = {} }) {
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerGastos()
  }, [recargar, filtros])

  async function obtenerGastos() {
    setCargando(true)
    let query = supabase
      .from('gastos')
      .select('id_gasto, descripcion, tipo, monto, fecha, categoria ( nombre )')
      .eq('user_id', session.user.id)
      .order('fecha', { ascending: false })

    if (filtros.categoria) query = query.eq('id_categoria', filtros.categoria)
    if (filtros.fechaInicio) query = query.gte('fecha', filtros.fechaInicio)
    if (filtros.fechaFin) query = query.lte('fecha', filtros.fechaFin)
    if (filtros.montoMax) query = query.lte('monto', filtros.montoMax)

    const { data, error } = await query
    if (error) console.error(error)
    else {
      let resultado = data
      if (filtros.busqueda) {
        resultado = data.filter(g =>
          g.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())
        )
      }
      setGastos(resultado)
    }
    setCargando(false)
  }

  if (cargando) return <p className="text-secondary">Cargando gastos...</p>

  return (
    <div>
      <h4 className="text-info mb-3">Lista de Gastos ({gastos.length})</h4>
      {gastos.length === 0 ? (
        <p className="text-secondary">No se encontraron gastos.</p>
      ) : (
        <table className="table table-dark table-bordered table-hover">
          <thead>
            <tr>
              <th className="text-info">Descripción</th>
              <th className="text-info">Categoría</th>
              <th className="text-info">Tipo</th>
              <th className="text-info">Monto</th>
              <th className="text-info">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g) => (
              <tr key={g.id_gasto}>
                <td>{g.descripcion}</td>
                <td>{g.categoria ? g.categoria.nombre : '—'}</td>
                <td>
                  <span className={`badge ${g.tipo === 'FIJO' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                    {g.tipo}
                  </span>
                </td>
                <td className="text-danger fw-bold">
                  $ {Number(g.monto).toLocaleString('es-CO')}
                </td>
                <td>{new Date(g.fecha).toLocaleDateString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
