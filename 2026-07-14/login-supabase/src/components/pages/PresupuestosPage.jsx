import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import FormularioPresupuesto from '../components/presupuestos/FormularioPresupuesto'
import ListaPresupuestos from '../components/presupuestos/ListaPresupuestos'

export default function PresupuestosPage({ session }) {
  const [presupuestos, setPresupuestos] = useState([])
  const [cargando, setCargando] = useState(true)

  const obtenerPresupuestos = async () => {
    setCargando(true)
    
    // Obtenemos los presupuestos filtrando por la cédula o ID del usuario autenticado
    const { data, error } = await supabase
      .from('presupuesto')
      .select('*')
      .eq('cedula_usuario', session.user.id) // O cámbialo por session.user.user_metadata?.cedula si usas un campo de cédula propio

    if (error) {
      console.error('Error al cargar presupuestos:', error)
    } else {
      setPresupuestos(data || [])
    }
    setCargando(false)
  }

  useEffect(() => {
    if (session?.user?.id) obtenerPresupuestos()
  }, [session])

  const agregarPresupuesto = async (nuevo) => {
    const { error } = await supabase
      .from('presupuesto')
      .insert([{
        periodo: nuevo.periodo,
        monto_limite: nuevo.monto_limite,
        gasto_acumulado: 0,
        cedula_usuario: session.user.id
      }])

    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      obtenerPresupuestos()
    }
  }

  const eliminarPresupuesto = async (id) => {
    const { error } = await supabase
      .from('presupuesto')
      .delete()
      .eq('id_presupuesto', id)

    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      setPresupuestos(presupuestos.filter((p) => p.id_presupuesto !== id))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Presupuestos</h1>
      <FormularioPresupuesto onAgregarPresupuesto={agregarPresupuesto} />
      
      {cargando ? (
        <p className="text-gray-500 text-center py-4">Cargando presupuestos...</p>
      ) : (
        <ListaPresupuestos presupuestos={presupuestos} onEliminar={eliminarPresupuesto} />
      )}
    </div>
  )
}