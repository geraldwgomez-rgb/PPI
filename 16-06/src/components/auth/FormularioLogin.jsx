import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: '80vh' }}
    >
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">

          <div
            className="card bg-dark border-info border-opacity-50 shadow-lg p-4"
            style={{ borderRadius: '20px' }}
          >
            <div className="card-body">
              <h2 className="text-info fw-bold text-center mb-4">Iniciar Sesión</h2>

              <form>
                <div className="mb-3">
                  <label className="form-label text-white fw-light">Correo o Usuario</label>
                  <input
                    type="text"
                    className="form-control bg-black border-secondary text-white py-2"
                    placeholder="Ej: yulian@smc.com"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-white fw-light">Contraseña</label>
                  <input
                    type="password"
                    className="form-control bg-black border-secondary text-white py-2"
                    placeholder="••••••••"
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-info fw-bold py-2 shadow-sm text-uppercase"
                    style={{ letterSpacing: '1px' }}
                  >
                    Ingresar
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="small text-secondary mb-1">¿No tienes una cuenta?</p>
                  <Link to="/registro" className="text-info text-decoration-none small fw-bold">
                    Regístrate gratis aquí
                  </Link>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default LoginPage