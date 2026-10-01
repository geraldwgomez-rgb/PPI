import { useTranslation } from 'react-i18next'

export default function SelectorIdioma() {
  const { i18n } = useTranslation()
  const cambiar = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('lang', lng)
  }
  return (
    <div style={{ display: 'flex', gap: 8, marginLeft: 16, marginRight: 32 }}>
      {['es', 'en'].map((lng) => (
        <button
          key={lng}
          onClick={() => cambiar(lng)}
          style={{ opacity: i18n.language === lng ? 1 : 0.5 }}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  )
}