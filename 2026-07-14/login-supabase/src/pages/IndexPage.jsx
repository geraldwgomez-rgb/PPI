function IndexPage({ onEntrar }) {
  return (
    <>
      {/* FONDO ANIMADO (crossfade + Ken Burns) */}
      <div className="bg-slideshow bg-slideshow--principal">
        <div className="bg-slideshow__layer"></div>
        <div className="bg-slideshow__layer"></div>
      </div>
      <div className="bg-slideshow__overlay"></div>

      <div style={{ minHeight: '100vh' }}>

        {/* ==================== NAVBAR ==================== */}
        <nav
          className="navbar navbar-expand-lg navbar-dark px-4"
          style={{ backgroundColor: 'rgba(16, 20, 28, 0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="container-fluid">
            <h1 className="navbar-brand fw-bold text-info fs-4 m-0 d-flex align-items-center gap-2">
              💰 Sistema SMC
            </h1>

            {/* Pills de estado, estilo "LIVE ONLINE / SYS V4.2" */}
            <div className="d-none d-lg-flex align-items-center gap-2 ms-3">
              <span className="badge" style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>
                ● SISTEMA ACTIVO
              </span>
              <span className="badge font-mono" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                V1.0
              </span>
            </div>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              {/* Tabs de navegación a cada sección */}
              <div className="navbar-nav mx-auto d-flex flex-row gap-4">
                <a href="#introduccion" className="nav-link text-secondary small text-uppercase" style={{ letterSpacing: '0.06em' }}>Introducción</a>
                <a href="#problema" className="nav-link text-secondary small text-uppercase" style={{ letterSpacing: '0.06em' }}>El Problema</a>
                <a href="#objetivos" className="nav-link text-secondary small text-uppercase" style={{ letterSpacing: '0.06em' }}>Objetivos</a>
                <a href="#fundadores" className="nav-link text-secondary small text-uppercase" style={{ letterSpacing: '0.06em' }}>Fundadores</a>
              </div>

              <div className="navbar-nav ms-auto">
                <button
                  className="btn btn-outline-info me-2"
                  onClick={onEntrar}
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container py-5">

          {/* ==================== HERO / INTRODUCCIÓN ==================== */}
          <section id="introduccion" className="hero-header">
            <p className="eyebrow mb-2">SISTEMA SMC // GESTIÓN CONTABLE INTELIGENTE</p>
            <h1>INTRODUCCIÓN</h1>
            <p className="lead fw-normal mb-3" style={{ maxWidth: '760px', color: 'rgba(232,237,242,0.85)' }}>
              La aplicación busca resolver problemas en cuanto a la <strong style={{ color: 'var(--text-primary)' }}>administración contable</strong> de las empresas,
              mediante un sistema el cual realizará el seguimiento a los ingresos y gastos teniendo en cuenta los gastos
              fijos, variables, impuestos e inversiones.
            </p>
            <p style={{ maxWidth: '760px' }}>
              Nuestro objetivo es brindar una oportunidad para que los comercios en Colombia tengan un mejor futuro,
              logrando expandirse y crecer monetariamente a través de operaciones estadísticas precisas.
            </p>
          </section>

          {/* ==================== TARJETAS DE MÉTRICAS (decorativas) ==================== */}
          <div className="row g-3 mb-5">
            <div className="col-6 col-md-3">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Módulos activos</div>
                <div className="kpi-card__value kpi-card__value--accent">12+</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Stack tecnológico</div>
                <div className="kpi-card__value" style={{ fontSize: '18px' }}>React + Supabase</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Equipo</div>
                <div className="kpi-card__value kpi-card__value--success">6 devs</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="kpi-card h-100">
                <div className="kpi-card__label">Base</div>
                <div className="kpi-card__value" style={{ fontSize: '18px' }}>Medellín, CO</div>
              </div>
            </div>
          </div>

          <hr className="my-5" style={{ borderColor: 'var(--border)', opacity: 0.5 }} />

          {/* ==================== EL PROBLEMA ==================== */}
          <section id="problema" className="row justify-content-center mb-5">
            <div className="col-md-10 text-center">
              <p className="eyebrow mb-2">DIAGNÓSTICO</p>
              <h2 className="section-title mb-4" style={{ color: 'var(--danger)' }}>EL PROBLEMA</h2>
              <div className="glow-card text-start" style={{ borderColor: 'rgba(255, 92, 122, 0.3)', boxShadow: '0 0 16px rgba(255, 92, 122, 0.15), var(--shadow-card)' }}>
                <p className="fs-5 fw-light fst-italic mb-3">
                  "Muchos microempresarios en Colombia no conocen la importancia de un orden financiero,
                  lo que provoca pérdidas de dinero y cierres prematuros."
                </p>
                <p className="m-0">
                  Nuestra aplicación soluciona esta brecha informativa, proporcionando un sistema de seguimiento
                  robusto que informa y previene la insolvencia.
                </p>
              </div>
            </div>
          </section>

          {/* ==================== OBJETIVOS ==================== */}
          <section id="objetivos">
            <div className="mt-5 p-3 rounded-pill text-center mb-3" style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--border-glow)' }}>
              <h2 className="section-title m-0">OBJETIVOS</h2>
            </div>

            <div className="card mb-5">
              <h3 className="text-info mb-3">Objetivo General</h3>
              <p className="mb-4">Diseñar y crear una aplicación web que permita registrar, controlar y analizar los ingresos y gastos de los usuarios.</p>

              <h3 className="text-info mb-3">Objetivos Específicos</h3>
              <ul className="text-secondary m-0">
                <li>Identificar los diferentes tipos de aplicaciones contables e identificar el funcionamiento y las variables</li>
                <li>Crear y diseñar el modelo de datos para la aplicación contable</li>
                <li>Diseñar y crear el sistema contable</li>
                <li>Realizar pruebas al sistema contable</li>
                <li>Documentar el desarrollo del sistema y elaborar manuales de usuario</li>
              </ul>
            </div>
          </section>

          {/* ==================== FUNDADORES ==================== */}
          <section id="fundadores">
            <div className="mt-5 p-3 rounded-pill text-center mb-4" style={{ backgroundColor: 'var(--accent)' }}>
              <h2 className="fw-bolder m-0" style={{ color: '#06131A' }}>FUNDADORES</h2>
            </div>

            <div className="row g-4 mb-4">

              {/* Yulian */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, background: 'linear-gradient(45deg, #0d6efd, var(--accent))', border: '2px solid var(--accent)' }}>
                    <span className="text-white small">Foto Yulian</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Yulian Monsalve</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>Frontend & Backend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Residente en Carpinelo, Medellín. Especialista en HTML y CSS con visión en lógica de Backend.
                    Su enfoque es la funcionalidad robusta y la profesionalización tecnológica.
                  </p>
                </div>
              </div>

              {/* Sarai */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, background: 'linear-gradient(45deg, #6610f2, #d63384)', border: '2px solid #d63384' }}>
                    <span className="text-white small">Foto Sarai</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Sarai Cardona</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'rgba(214, 51, 132, 0.15)', color: '#d63384' }}>Frontend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Residente de Santo Domingo, Medellín. Especialista en diseño visual. Se enfoca en crear
                    experiencias impactantes, creativas y fáciles de usar para el usuario final.
                  </p>
                </div>
              </div>

              {/* Daniel */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, backgroundColor: '#ff2626', border: '2px dashed var(--border-light)' }}>
                    <span className="text-white small">Foto Daniel</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Daniel Gomez</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}>Frontend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Daniel Gómez Ortiz, residente en Santo Domingo, Medellín. Se especializa en diseño visual
                    y calidad. Busca que su trabajo sea detallado y del agrado de los clientes.
                  </p>
                </div>
              </div>

              {/* Gerald */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, backgroundColor: '#4d9fdd', border: '2px dashed var(--border-light)' }}>
                    <span className="text-white small">Foto Gerald</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Gerald Williams</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'rgba(104, 14, 207, 0.15)', color: '#a25bf0' }}>Frontend & Backend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Desarrollador Backend Jr. en Medellín. Especialista en administración de bases de datos y Node.js.
                    Enfocado en crear sistemas escalables y eficientes.
                  </p>
                </div>
              </div>

            </div>

            <div className="row g-4 mb-5 justify-content-center">
              {/* Juan Jose */}
              <div className="col-6 col-md-3">
                <div className="glow-card h-100 text-center">
                  <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 120, height: 120, backgroundColor: '#0d6efd', border: '2px dashed var(--border-light)' }}>
                    <span className="text-white small">Foto Juan Jose</span>
                  </div>
                  <h5 className="text-info fw-bold mb-1">Juan Jose Gaviria</h5>
                  <span className="badge mb-3" style={{ backgroundColor: 'rgba(104, 14, 207, 0.15)', color: '#a25bf0' }}>Frontend & Backend</span>
                  <p className="fs-6 text-start lh-sm" style={{ color: 'var(--text-secondary)' }}>
                    Residente del Carpinelo, Medellín, Colombia. Desarrollador Backend Jr. especialista en
                    Node.js y bases de datos. Enfocado en construir sistemas robustos y eficientes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== BOTÓN ENTRAR ==================== */}
          <div className="text-center mt-4 mb-5">
            <button
              className="btn fw-bold px-5 py-3"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#06131A',
                letterSpacing: '1px',
                borderRadius: '50px',
                fontSize: '18px',
                boxShadow: 'var(--accent-glow)'
              }}
              onClick={onEntrar}
            >
              Entrar al Sistema →
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

export default IndexPage