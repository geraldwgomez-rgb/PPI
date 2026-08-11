import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import FormularioPresupuesto from '../components/presupuestos/FormularioPresupuesto'
import ListaPresupuestos from '../components/presupuestos/ListaPresupuestos'

export default function PresupuestosPage({ session }) {
  const [presupuestos, setPresupuestos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerPresupuestos()
  }, [])

  async function obtenerPresupuestos() {
    setCargando(true)
    const { data, error } = await supabase
      .from('presupuesto')
      .select('*')
      .eq('user_id', session.user.id)
      .order('id_presupuesto', { ascending: false })
    if (error) console.error(error)
    else setPresupuestos(data)
    setCargando(false)
  }

  async function agregarPresupuesto(nuevo) {
    const { error } = await supabase
      .from('presupuesto')
      .insert({
        periodo: nuevo.periodo,
        monto_limite: nuevo.monto_limite,
        gasto_acumulado: 0,
        user_id: session.user.id,
      })
    if (error) console.error(error)
    else obtenerPresupuestos()
  }

  async function eliminarPresupuesto(id) {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este presupuesto?')
    if (!confirmar) return
    const { error } = await supabase
      .from('presupuesto')
      .delete()
      .eq('id_presupuesto', id)
    if (error) console.error(error)
    else obtenerPresupuestos()
  }

  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">📋 Presupuestos</h2>
      <FormularioPresupuesto onAgregarPresupuesto={agregarPresupuesto} />
      {cargando ? (
        <p className="text-secondary">Cargando presupuestos...</p>
      ) : (
        <ListaPresupuestos
          presupuestos={presupuestos}
          onEliminar={eliminarPresupuesto}
        />
      )}
    </div>
  )
}
