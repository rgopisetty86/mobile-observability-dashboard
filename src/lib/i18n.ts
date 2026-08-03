import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en'
import fr from '../locales/fr'
import de from '../locales/de'
import it from '../locales/it'
import es from '../locales/es'

export type LangCode = 'en' | 'fr' | 'de' | 'it' | 'es'

export const LANGUAGES: { code: LangCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

const STORAGE_KEY = 'obs-lang'

function savedLang(): LangCode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && LANGUAGES.some(l => l.code === v)) return v as LangCode
  } catch {}
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      es: { translation: es },
    },
    lng: savedLang(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export function setLanguage(code: LangCode) {
  i18n.changeLanguage(code)
  try { localStorage.setItem(STORAGE_KEY, code) } catch {}
}

export default i18n
