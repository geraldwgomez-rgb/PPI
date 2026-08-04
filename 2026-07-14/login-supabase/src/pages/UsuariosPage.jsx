function UsuariosPage({ session }) {
  return (
    <div className="container py-4">
      <h2 className="text-info fw-bold mb-4">👤 Mi Perfil</h2>
      <div className="card bg-dark border-info border-opacity-50 p-4" style={{ borderRadius: '16px' }}>
        <p className="text-white mb-1"><strong>Correo:</strong> {session?.user?.email}</p>
        <p className="text-secondary small">ID: {session?.user?.id}</p>
      </div>
    </div>
  )
}
export default UsuariosPage
