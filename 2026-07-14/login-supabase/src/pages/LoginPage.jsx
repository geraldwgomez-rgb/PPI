import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ParticlesBackground from '../components/ParticlesBackground'

export default function LoginPage({ onLogin, onVolver }) {
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
    <>
      {/* FONDO: partículas animadas (puntos + líneas en movimiento) */}
      <ParticlesBackground particleCount={80} />
      <div className="bg-slideshow__overlay"></div>

      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-glow)',
                borderRadius: '20px',
                boxShadow: 'var(--accent-glow), var(--shadow-elevated)',
              }}
            >
              <div className="card-body">

                {/* Botón volver */}
                <button
                  type="button"
                  className="btn btn-link text-secondary p-0 mb-3 d-flex align-items-center gap-1"
                  onClick={onVolver}
                >
                  ← Volver al inicio
                </button>

                <p className="eyebrow text-center mb-1">AUTENTICACIÓN SMC</p>
                <h2 className="text-info fw-bold text-center mb-1">
                  {isSignUp ? 'Crear cuenta' : 'Iniciar Sesión'}
                </h2>
                <p className="text-secondary text-center small mb-4">
                  Accede a tu panel financiero
                </p>

                {errorMsg && (
                  <div className="alert alert-danger py-2 text-center small">{errorMsg}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-white fw-light">Correo</label>
                    <input
                      type="email"
                      className="form-control py-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-white fw-light">Contraseña</label>
                    <input
                      type="password"
                      className="form-control py-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="fw-bold py-2 text-uppercase"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#06131A',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--accent-glow)',
                      }}
                      disabled={loading}
                    >
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
    </>
  )
}