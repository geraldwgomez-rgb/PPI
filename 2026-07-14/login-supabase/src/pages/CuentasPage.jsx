import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTranslation } from 'react-i18next'
import { useFormato } from '../lib/useFormato'

export default function CuentasPage() {
  const { t } = useTranslation()
  const { formatNumber, formatDate } = useFormato()
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
    const { data, error } = await supabase.rpc('obtener_usuarios')
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

  const rolBadge = (rol) => (rol === 'administrador' ? 'bg-danger' : 'bg-primary')

  return (
    <div className="container py-4">
      <h2 className="text-danger fw-bold mb-4">{t('accounts.title')}</h2>

      <div className="row g-4">

        {/* LISTA DE USUARIOS */}
        <div className="col-12 col-md-4">
          <div className="card bg-dark border-secondary p-3" style={{ borderRadius: '16px' }}>
            <h5 className="text-white mb-3">{t('accounts.users', { n: usuarios.length })}</h5>
            {cargando ? (
              <p className="text-secondary">{t('common.loading')}</p>
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
                      <span className={`badge ${rolBadge(u.rol)}`}>{t(`role.${u.rol}`)}</span>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>
                        {formatDate(u.created_at)}
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
              <p className="text-secondary mt-4">{t('accounts.selectUser')}</p>
            </div>
          ) : (
            <div className="card bg-dark border-danger border-opacity-25 p-4" style={{ borderRadius: '16px' }}>

              {/* Header usuario */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="text-white fw-bold m-0">{usuarioSeleccionado.email}</h5>
                  <span className={`badge ${rolBadge(usuarioSeleccionado.rol)}`}>
                    {t(`role.${usuarioSeleccionado.rol}`)}
                  </span>
                </div>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setUsuarioSeleccionado(null)}>
                  {t('common.close')}
                </button>
              </div>

              {/* Tarjetas resumen */}
              {!cargandoDetalle && (
                <div className="row g-3 mb-3">
                  <div className="col-4">
                    <div className="card bg-dark border-success border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">{t('accounts.income')}</small>
                      <div className="text-success fw-bold">$ {formatNumber(totalIngresos)}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card bg-dark border-danger border-opacity-50 p-3 text-center" style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">{t('accounts.expenses')}</small>
                      <div className="text-danger fw-bold">$ {formatNumber(totalGastos)}</div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className={`card bg-dark p-3 text-center border-opacity-50 ${balance >= 0 ? 'border-info' : 'border-warning'}`} style={{ borderRadius: '12px' }}>
                      <small className="text-secondary">{t('accounts.balance')}</small>
                      <div className={`fw-bold ${balance >= 0 ? 'text-info' : 'text-warning'}`}>
                        $ {formatNumber(balance)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestañas */}
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button className={`nav-link ${pestana === 'gastos' ? 'active text-danger' : 'text-secondary'}`} onClick={() => setPestana('gastos')}>
                    {t('accounts.tabExpenses', { n: gastos.length })}
                  </button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${pestana === 'ingresos' ? 'active text-success' : 'text-secondary'}`} onClick={() => setPestana('ingresos')}>
                    {t('accounts.tabIncome', { n: ingresos.length })}
                  </button>
                </li>
              </ul>

              {cargandoDetalle ? (
                <p className="text-secondary">{t('common.loadingData')}</p>
              ) : (
                <>
                  {pestana === 'gastos' && (
                    gastos.length === 0 ? (
                      <p className="text-secondary">{t('accounts.noExpenses')}</p>
                    ) : (
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table table-dark table-bordered table-hover table-sm align-middle">
                          <thead>
                            <tr>
                              <th className="text-danger">{t('accounts.colDescription')}</th>
                              <th className="text-danger">{t('accounts.colCategory')}</th>
                              <th className="text-danger">{t('accounts.colAmount')}</th>
                              <th className="text-danger">{t('accounts.colDate')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gastos.map((g) => (
                              <tr key={g.id_gasto}>
                                <td>{g.descripcion}</td>
                                <td><span className="badge bg-secondary">{g.categoria_nombre || '—'}</span></td>
                                <td className="text-danger fw-bold">$ {formatNumber(g.monto)}</td>
                                <td>{formatDate(g.fecha)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {pestana === 'ingresos' && (
                    ingresos.length === 0 ? (
                      <p className="text-secondary">{t('accounts.noIncome')}</p>
                    ) : (
                      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table table-dark table-bordered table-hover table-sm align-middle">
                          <thead>
                            <tr>
                              <th className="text-success">{t('accounts.colDescription')}</th>
                              <th className="text-success">{t('accounts.colCategory')}</th>
                              <th className="text-success">{t('accounts.colAmount')}</th>
                              <th className="text-success">{t('accounts.colDate')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingresos.map((i) => (
                              <tr key={i.id_ingreso}>
                                <td>{i.descripcion}</td>
                                <td><span className="badge bg-secondary">{i.categoria_nombre || '—'}</span></td>
                                <td className="text-success fw-bold">$ {formatNumber(i.monto)}</td>
                                <td>{formatDate(i.fecha)}</td>
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