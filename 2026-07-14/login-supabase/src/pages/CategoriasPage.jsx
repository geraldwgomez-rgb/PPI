import { useState } from 'react'
import FormularioCategoria from '../components/categorias/FormularioCategoria'
import ListaCategorias from '../components/categorias/ListaCategorias'

export default function CategoriasPage() {
  const [recargar, setRecargar] = useState(0)
  const [categoriaEditar, setCategoriaEditar] = useState(null)

  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">Categorías</h2>
      <FormularioCategoria
        categoriaEditar={categoriaEditar}
        onCategoriaGuardada={() => { setRecargar(r => r + 1); setCategoriaEditar(null) }}
        onCancelar={() => setCategoriaEditar(null)}
      />
      <ListaCategorias
        recargar={recargar}
        onEditar={(c) => setCategoriaEditar(c)}
      />
    </div>
  )
}
