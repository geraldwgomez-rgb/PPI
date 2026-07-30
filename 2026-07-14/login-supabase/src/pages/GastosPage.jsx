import ListaGastos from '../components/gastos/ListaGastos'

export default function GastosPage({ session }) {
  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">Gastos</h2>
      <ListaGastos session={session} />
    </div>
  )
}
