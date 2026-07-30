import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ListaGastos({ session }) {
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerGastos()
  }, [])

  async function obtenerGastos() {
    setCargando(true)
    const { data, error } = await supabase
      .from('gastos')
      .select(`
        id_gasto,
        descripcion,
        tipo,
        monto,
        fecha,
        categoria ( nombre )
      `)
      .eq('cedula_usuario', session.user.email)
      .order('fecha', { ascending: false })

    if (error) console.error(error)
    else setGastos(data)
    setCargando(false)
  }

  if (cargando) return <p className="text-secondary">Cargando gastos...</p>

  return (
    <div>
      <h4 className="text-info mb-3">Lista de Gastos</h4>
      {gastos.length === 0 ? (
        <p className="text-secondary">No tienes gastos registrados aún.</p>
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
