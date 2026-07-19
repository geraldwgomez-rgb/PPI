import { supabase } from '../../lib/supabaseClient'

function Header({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="header d-flex justify-content-between align-items-center px-4 py-3 bg-dark border-bottom border-info border-opacity-25">
      <div className="fw-bold text-info fs-5">💰 Sistema SMC</div>
      <div className="d-flex align-items-center gap-3">
        {session && (
          <>
            <span className="text-secondary small">{session.user.email}</span>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
