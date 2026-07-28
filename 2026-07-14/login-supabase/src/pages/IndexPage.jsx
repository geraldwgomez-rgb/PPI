function IndexPage({ onEntrar }) {
  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-info border-opacity-25 px-4">
        <div className="container-fluid">
          <h1 className="navbar-brand fw-bold text-info fs-4 m-0">💰 Sistema SMC</h1>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
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

        {/* INTRODUCCIÓN */}
        <section className="custom-card shadow-lg mb-5 p-4 rounded-4"
          style={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
          <h2 className="display-5 fw-bold text-info mb-4">INTRODUCCIÓN</h2>
          <p className="lead fw-normal text-justify">
            La aplicación busca resolver problemas en cuanto a la <strong>administración contable</strong> de las empresas,
            mediante un sistema el cual realizará el seguimiento a los ingresos y gastos teniendo en cuenta los gastos
            fijos, variables, impuestos e inversiones.
          </p>
          <p className="text-secondary">
            Nuestro objetivo es brindar una oportunidad para que los comercios en Colombia tengan un mejor futuro,
            logrando expandirse y crecer monetariamente a través de operaciones estadísticas precisas.
          </p>
        </section>

        <hr className="my-5 border-secondary opacity-25" />

        {/* EL PROBLEMA */}
        <section className="row justify-content-center mb-5">
          <div className="col-md-10 text-center">
            <h2 className="display-6 fw-bold text-danger mb-4">EL PROBLEMA</h2>
            <div className="p-4 bg-dark rounded-3 border border-danger border-opacity-25">
              <p className="fs-5 fw-light fst-italic">
                "Muchos microempresarios en Colombia no conocen la importancia de un orden financiero,
                lo que provoca pérdidas de dinero y cierres prematuros."
              </p>
              <p className="mt-3">
                Nuestra aplicación soluciona esta brecha informativa, proporcionando un sistema de seguimiento
                robusto que informa y previene la insolvencia.
              </p>
            </div>
          </div>
        </section>

        {/* OBJETIVOS */}
        <div className="mt-5 p-4 bg-dark text-primary rounded-pill text-center mb-3">
          <h2 className="fw-bolder m-0">OBJETIVOS</h2>
        </div>
        <hr className="border border-danger border-2 opacity-50 mb-4" />

        <section className="p-4 rounded-4 mb-5"
          style={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}>
          <h3 className="fw-bold text-info mb-3">Objetivo General</h3>
          <p>Diseñar y crear una aplicación web que permita registrar, controlar y analizar los ingresos y gastos de los usuarios.</p>

          <h3 className="fw-bold text-info mt-4 mb-3">Objetivos Específicos</h3>
          <ul className="text-secondary">
            <li>Identificar los diferentes tipos de aplicaciones contables e identificar el funcionamiento y las variables</li>
            <li>Crear y diseñar el modelo de datos para la aplicación contable</li>
            <li>Diseñar y crear el sistema contable</li>
            <li>Realizar pruebas al sistema contable</li>
            <li>Documentar el desarrollo del sistema y elaborar manuales de usuario</li>
          </ul>
        </section>

        {/* FUNDADORES */}
        <div className="mt-5 p-3 rounded-pill text-center mb-4"
          style={{ backgroundColor: '#0dcaf0' }}>
          <h2 className="fw-bolder m-0 text-dark">FUNDADORES</h2>
        </div>

        <section className="row g-4 mb-5">

          {/* Yulian */}
          <div className="col-md-3">
            <div className="h-100 p-3 shadow-lg text-center rounded-4"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #0dcaf0' }}>
              <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 150, height: 150, background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)', border: '3px solid #0dcaf0' }}>
                <span className="text-white small">Foto Yulian</span>
              </div>
              <h5 className="text-info fw-bold mb-1">Yulian Monsalve</h5>
              <span className="badge bg-primary mb-3">Frontend & Backend</span>
              <p className="text-white fs-6 text-start lh-sm">
                Residente en Carpinelo, Medellín. Especialista en HTML y CSS con visión en lógica de Backend.
                Su enfoque es la funcionalidad robusta y la profesionalización tecnológica.
              </p>
            </div>
          </div>

          {/* Sarai */}
          <div className="col-md-3">
            <div className="h-100 p-3 shadow-lg text-center rounded-4"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #0dcaf0' }}>
              <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 150, height: 150, background: 'linear-gradient(45deg, #6610f2, #d63384)', border: '3px solid #d63384' }}>
                <span className="text-white small">Foto Sarai</span>
              </div>
              <h5 className="text-info fw-bold mb-1">Sarai Cardona</h5>
              <span className="badge mb-3" style={{ backgroundColor: '#d63384' }}>Frontend</span>
              <p className="text-white fs-6 text-start lh-sm">
                Residente de Santo Domingo, Medellín. Especialista en diseño visual. Se enfoca en crear
                experiencias impactantes, creativas y fáciles de usar para el usuario final.
              </p>
            </div>
          </div>

          {/* Daniel */}
          <div className="col-md-3">
            <div className="h-100 p-3 shadow-lg text-center rounded-4"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #0dcaf0' }}>
              <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 150, height: 150, backgroundColor: '#ff2626', border: '2px dashed #181616' }}>
                <span className="text-white small">Foto Daniel</span>
              </div>
              <h5 className="text-info fw-bold mb-1">Daniel Gomez</h5>
              <span className="badge mb-3" style={{ backgroundColor: '#137a41' }}>Frontend</span>
              <p className="text-white fs-6 text-start lh-sm">
                Daniel Gómez Ortiz, residente en Santo Domingo, Medellín. Se especializa en diseño visual
                y calidad. Busca que su trabajo sea detallado y del agrado de los clientes.
              </p>
            </div>
          </div>

          {/* Gerald */}
          <div className="col-md-3">
            <div className="h-100 p-3 shadow-lg text-center rounded-4"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #0dcaf0' }}>
              <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 150, height: 150, backgroundColor: '#4d9fdd', border: '2px dashed #444' }}>
                <span className="text-white small">Foto Gerald</span>
              </div>
              <h5 className="text-info fw-bold mb-1">Gerald Williams</h5>
              <span className="badge mb-3" style={{ backgroundColor: '#680ecf' }}>Frontend & Backend</span>
              <p className="text-white fs-6 text-start lh-sm">
                Desarrollador Backend Jr. en Medellín. Especialista en administración de bases de datos y Node.js.
                Enfocado en crear sistemas escalables y eficientes.
              </p>
            </div>
          </div>

        </section>

          {/* Juan Jose */}
          <div className="col-md-3">
            <div className="h-100 p-3 shadow-lg text-center rounded-4"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #0dcaf0' }}>
              <div className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 150, height: 150, backgroundColor: '#0d6efd', border: '2px dashed #0dcaf0' }}>
                <span className="text-white small">Foto Juan Jose</span>
              </div>
              <h5 className="text-info fw-bold mb-1">Juan Jose Gaviria</h5>
              <span className="badge mb-3" style={{ backgroundColor: '#680ecf' }}>Frontend & Backend</span>
              <p className="text-white fs-6 text-start lh-sm">
                Residente del Carpinelo, Medellín, Colombia. Desarrollador Backend Jr. especialista en
                Node.js y bases de datos. Enfocado en construir sistemas robustos y eficientes.
              </p>
            </div>
          </div>

        {/* BOTÓN ENTRAR */}
        <div className="text-center mt-4 mb-5">
          <button
            className="btn btn-info btn-lg fw-bold px-5 py-3"
            style={{ letterSpacing: '1px', borderRadius: '50px' }}
            onClick={onEntrar}
          >
            Entrar al Sistema →
          </button>
        </div>

      </div>
    </div>
  )
}

export default IndexPage
