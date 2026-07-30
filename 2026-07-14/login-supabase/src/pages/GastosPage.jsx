import { useState } from 'react'
import ListaGastos from '../components/gastos/ListaGastos'
import FormularioGasto from '../components/gastos/FormularioGasto'

export default function GastosPage({ session }) {
  const [recargar, setRecargar] = useState(0)

  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">Gastos</h2>
      <FormularioGasto session={session} onGastoAgregado={() => setRecargar(r => r + 1)} />
      <ListaGastos session={session} recargar={recargar} />
    </div>
  )
}
