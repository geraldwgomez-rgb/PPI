import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function CuentasPage() {
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [gastos, setGastos] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [pestana, setPestana] = useState('gastos')
  const [cargando, setCargando] = useState(true)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    setCargando(true)
    const { data, error } = await supabase
      .rpc('obtener_usuarios')
    if (error) console.error(error)
    else setUsuarios(data)
    setCargando(false)
  }

  async function verDetalle(usuario) {
    setUsuarioSeleccionado(usuario)
    setCargandoDetalle(true)
    setPestana('gastos')

    const { data: g } = await supabase
      .from('gastos')
      .select('id_gasto, descripcion, categoria_nombre, tipo, monto, fecha')
      .eq('user_id', usuario.id)
      .order('fecha', { ascending: false })

    const { data: i } = await supabase
      .from('ingresos')
      .select('id_ingreso, descripcion, categoria_nombre, tipo, monto, fecha')
      .eq('user_id', usuario.id)
      .order('fecha', { ascending: false })

    setGastos(g || [])
    setIngresos(i || [])
    setCargandoDetalle(false)
  }

  const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto), 0)
  const totalIngresos = ingresos.reduce((acc, i) => acc + Number(i.monto), 0)
  const balance = totalIngresos - totalGastos

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-4">🏦 Control de Cuentas</h2>

      <div className="row g-4">

        {/* LISTA DE USUARIOS */}
        <div className="col-12 col-md-4">
          <div className="card bg-dark border-secondary p-3" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">👥 Usuarios ({usuarios.length})</h5>
            {cargando ? (
              <p className="text-secondary">Cargando...</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {usuarios.map((u) => (
                  <button
                    key={u.id}
                    className={`btn text-start p-3 ${usuarioSeleccionado?.id === u.id ? 'btn-info text-dark' : 'btn-outline-secondary text-white'}`}
                    style={{ borderRadius: '10px' }}
                    onClick={() => verDetalle(u)}
                  >
                    <div className="fw-bold small">{u.email}</div>
                    <div className="d-flex gap-2 mt-1">
                      <span className={`badge ${u.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                        {u.rol}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>
                        {new Date(u.created_at).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DETALLE DEL USUARIO */}
        <div className="col-12 col-md-8">
          {!usuarioSeleccionado ? (
            <div className="card bg-dark border-secondary p-4 text-center" style={{ borderRadius: '16px', minHeight: '200px' }}>
              <p className="text-secondary mt-4">👈 Selecciona un usuario para ver su detalle</p>
            </div>
          ) : (
            <div className="card bg-dark border-danger border-opacity-25 p-4" style={{ borderRadius: '16px' }}>

              {/* Header usuario */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="text-white fw-bold m-0">{usuarioSeleccionado.email}</h5>
                  <span className={`badge ${usuarioSeleccionado.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                    {usuarioSeleccionado.rol}
                  </span>
                </div>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setUsuarioSeleccionado(null)}>
                  ✕ Cerrar
                </button>
              </div>

              {/* Tarjetas resumen */}
              {!cargandoDetalle && (
                <div className="row g-3 mb-3">
                  <div className="col-4">
                    <div className="card bg-dark border-success border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">Ingresos</small>
                      <div className="text-success fw-bold">$ {totalIngresos.toLocaleString('es-CO')}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card bg-dark border-danger border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">Gastos</small>
                      <div className="text-danger fw-bold">$ {totalGastos.toLocaleString('es-CO')}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className={`card bg-dark p-3 text-center border-opacity-50 ${balance >= 0 ? 'border-info' : 'border-warning'}`} style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">Balance</small>
                      <div className={`fw-bold ${balance >= 0 ? 'text-info' : 'text-warning'}`}>
                        $ {balance.toLocaleString('es-CO')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestañas */}
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button className={`nav-link ${pestana === 'gastos' ? 'active text-danger' : 'text-secondary'}`} onClick={() => setPestana('gastos')}>
                    💸 Gastos ({gastos.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${pestana === 'ingresos' ? 'active text-success' : 'text-secondary'}`} onClick={() => setPestana('ingresos')}>
                    💰 Ingresos ({ingresos.length})
                  </button>
                </li>
              </ul>

              {cargandoDetalle ? (
                <p className="text-secondary">Cargando datos...</p>
              ) : (
                <>
                  {pestana === 'gastos' && (
                    gastos.length === 0 ? (
                      <p className="text-secondary">Sin gastos registrados.</p>
                    ) : (
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table table-dark table-bordered table-hover table-sm align-middle">
                          <thead>
                            <tr>
                              <th className="text-danger">Descripción</th>
                              <th className="text-danger">Categoría</th>
                              <th className="text-danger">Monto</th>
                              <th className="text-danger">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gastos.map((g) => (
                              <tr key={g.id_gasto}>
                                <td>{g.descripcion}</td>
                                <td><span className="badge bg-secondary">{g.categoria_nombre || '—'}</span></td>
                                <td className="text-danger fw-bold">$ {Number(g.monto).toLocaleString('es-CO')}</td>
                                <td>{new Date(g.fecha).toLocaleDateString('es-CO')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {pestana === 'ingresos' && (
                    ingresos.length === 0 ? (
                      <p className="text-secondary">Sin ingresos registrados.</p>
                    ) : (
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table table-dark table-bordered table-hover table-sm align-middle">
                          <thead>
                            <tr>
                              <th className="text-success">Descripción</th>
                              <th className="text-success">Categoría</th>
                              <th className="text-success">Monto</th>
                              <th className="text-success">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingresos.map((i) => (
                              <tr key={i.id_ingreso}>
                                <td>{i.descripcion}</td>
                                <td><span className="badge bg-secondary">{i.categoria_nombre || '—'}</span></td>
                                <td className="text-success fw-bold">$ {Number(i.monto).toLocaleString('es-CO')}</td>
                                <td>{new Date(i.fecha).toLocaleDateString('es-CO')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
