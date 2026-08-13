import { useState } from 'react'
import FormularioIngreso from '../components/ingresos/FormularioIngreso'
import FiltroIngresos from '../components/ingresos/FiltroIngresos'
import ListaIngresos from '../components/ingresos/ListaIngresos'

export default function IngresosPage({ session }) {
  const [recargar, setRecargar] = useState(0)
  const [filtros, setFiltros] = useState({})

  return (
    <div className="container py-4">
      <h2 className="text-success fw-bold mb-4">💰 Ingresos</h2>
      <FormularioIngreso session={session} onIngresoAgregado={() => setRecargar(r => r + 1)} />
      <FiltroIngresos onFiltrar={setFiltros} />
      <ListaIngresos session={session} recargar={recargar} filtros={filtros} />
    </div>
  )
}
