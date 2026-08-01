import { useState } from 'react'
import FormularioGasto from '../components/gastos/FormularioGasto'
import FiltroGastos from '../components/gastos/FiltroGastos'
import ListaGastos from '../components/gastos/ListaGastos'

export default function GastosPage({ session }) {
  const [recargarGastos, setRecargarGastos] = useState(0)
  const [filtros, setFiltros] = useState({})

  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">Gastos</h2>
      <FormularioGasto
        session={session}
        onGastoAgregado={() => setRecargarGastos(r => r + 1)}
      />
      <FiltroGastos onFiltrar={setFiltros} />
      <ListaGastos
        session={session}
        recargar={recargarGastos}
        filtros={filtros}
      />
    </div>
  )
}
