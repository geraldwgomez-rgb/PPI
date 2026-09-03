
cat > src/pages/LoginPage.jsx << 'EOF'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const { data, error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) { setErrorMsg(error.message); return }
    if (data.session) { onLogin(data.session) }
    else if (isSignUp) { setErrorMsg('Revisa tu correo para confirmar la cuenta.') }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card bg-dark border-info border-opacity-50 shadow-lg p-4" style={{ borderRadius: '20px' }}>
            <div className="card-body">
              <h2 className="text-info fw-bold text-center mb-4">{isSignUp ? 'Crear cuenta' : 'Iniciar Sesión'}</h2>
              {errorMsg && <div className="alert alert-danger py-2 text-center small">{errorMsg}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-white fw-light">Correo</label>
                  <input type="email" className="form-control bg-black border-secondary text-white py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label text-white fw-light">Contraseña</label>
                  <input type="password" className="form-control bg-black border-secondary text-white py-2" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-info fw-bold py-2 text-uppercase" disabled={loading}>
                    {loading ? 'Cargando...' : isSignUp ? 'Registrarme' : 'Ingresar'}
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button type="button" className="btn btn-link text-info small" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
