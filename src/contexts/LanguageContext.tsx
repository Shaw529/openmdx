import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import locales from '../locales'
import type { Language, Translation } from '../locales/types'
import { STORAGE_KEYS, DEFAULTS } from '../config/constants'

interface LanguageContextType {
  language: Language
  t: Translation
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE)
    // 如果没有保存过，默认使用中文
    if (!saved) return DEFAULTS.LANGUAGE
    return (saved as Language)
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang)
  }

  const t = locales[language]

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
