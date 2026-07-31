import { useState } from 'react'
import FormularioGasto from '../components/gastos/FormularioGasto'
import FiltroGastos from '../components/gastos/FiltroGastos'
import ListaGastos from '../components/gastos/ListaGastos'
import FormularioCategoria from '../components/categorias/FormularioCategoria'
import ListaCategorias from '../components/categorias/ListaCategorias'

export default function GastosPage({ session }) {
  const [pestana, setPestana] = useState('gastos')
  const [recargarGastos, setRecargarGastos] = useState(0)
  const [recargarCategorias, setRecargarCategorias] = useState(0)
  const [filtros, setFiltros] = useState({})
  const [categoriaEditar, setCategoriaEditar] = useState(null)

  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">Gastos</h2>

      {/* Pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${pestana === 'gastos' ? 'active text-info' : 'text-secondary'}`}
            onClick={() => setPestana('gastos')}
          >
            💸 Mis Gastos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${pestana === 'categorias' ? 'active text-info' : 'text-secondary'}`}
            onClick={() => setPestana('categorias')}
          >
            🏷️ Categorías
          </button>
        </li>
      </ul>

      {/* Pestaña Gastos */}
      {pestana === 'gastos' && (
        <>
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
        </>
      )}

      {/* Pestaña Categorías */}
      {pestana === 'categorias' && (
        <>
          <FormularioCategoria
            categoriaEditar={categoriaEditar}
            onCategoriaGuardada={() => { setRecargarCategorias(r => r + 1); setCategoriaEditar(null) }}
            onCancelar={() => setCategoriaEditar(null)}
          />
          <ListaCategorias
            recargar={recargarCategorias}
            onEditar={(c) => setCategoriaEditar(c)}
          />
        </>
      )}
    </div>
  )
}
