// Agrega al diccionario de react-i18next las traducciones del login, el menú
// lateral y las pantallas internas, SIN modificar src/i18n.js.
// - Se importa una sola vez, arriba de App.jsx:  import './i18nApp'
// - No pisa claves que ya existan en tu i18n.js (overwrite = false).
import './i18n'
import i18n from 'i18next'
import { appEs } from './locales/appEs'
import { appEn } from './locales/appEn'

const ns = (Array.isArray(i18n.options?.defaultNS) ? i18n.options.defaultNS[0] : i18n.options?.defaultNS) || 'translation'

i18n.addResourceBundle('es', ns, appEs, true, false)
i18n.addResourceBundle('en', ns, appEn, true, false)