import { useTranslation } from 'react-i18next'

// Formato de números y fechas según el idioma activo (es-CO / en-US).
export function useFormato() {
  const { i18n } = useTranslation()
  const lang = (i18n.resolvedLanguage || i18n.language || 'es').toLowerCase()
  const locale = lang.startsWith('en') ? 'en-US' : 'es-CO'
  return {
    locale,
    formatNumber: (n) => Number(n).toLocaleString(locale),
    formatDate: (d) => new Date(d).toLocaleDateString(locale),
  }
}