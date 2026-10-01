import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'

// Los archivos viven en public/manuales/ (así Vite y Vercel los sirven tal cual)
const manuales = [
  { archivo: 'manualA.md', titulo: 'MANUAL DE INSTALACION' },
  { archivo: 'manualb.md', titulo: 'MANUAL DE USUARIOS Y ADMINISTRACION' },
]

function Manuales() {
  const { t } = useTranslation()
  const [abierto, setAbierto] = useState(null)
  const [texto, setTexto] = useState('')

  async function ver(archivo) {
    // Si ya está abierto, lo cierra
    if (abierto === archivo) {
      setAbierto(null)
      return
    }
    try {
      const res = await fetch(`/manuales/${archivo}`)
      if (!res.ok) throw new Error('No encontrado')
      setTexto(await res.text())
    } catch {
      setTexto(t('manuales.error'))
    }
    setAbierto(archivo)
  }

  return (
    <section id="manuales" className="mb-5">
      <div className="mt-5 p-3 rounded-pill text-center mb-4" style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--border-glow)' }}>
        <h2 className="section-title m-0">{t('manuales.titulo')}</h2>
      </div>

      <div className="row g-4 justify-content-center">
        {manuales.map(({ archivo, titulo }) => (
          <div className="col-12 col-md-5" key={archivo}>
            <div className="glow-card h-100 text-center">
              <h5 className="text-info fw-bold mb-3">{t(titulo)}</h5>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button className="btn btn-outline-info" onClick={() => ver(archivo)}>
                  {abierto === archivo ? t('manuales.cerrar') : t('manuales.ver')}
                </button>
                <a className="btn btn-info" href={`/manuales/${archivo}`} download>
                  {t('manuales.descargar')}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {abierto && (
        <div className="card mt-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <ReactMarkdown>{texto}</ReactMarkdown>
        </div>
      )}
    </section>
  )
}

export default Manuales