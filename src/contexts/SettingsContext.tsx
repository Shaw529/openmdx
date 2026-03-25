import { createContext, useContext, useState, ReactNode } from 'react'
import { STORAGE_KEYS } from '../config/constants'

export interface WordExportFont {
  name: string
  value: string
}

export const WORD_EXPORT_FONTS: WordExportFont[] = [
  { name: '宋体 (SimSun)', value: "'SimSun', '宋体', serif" },
  { name: '微软雅黑 (Microsoft YaHei)', value: "'Microsoft YaHei', '微软雅黑', 'PingFang SC', sans-serif" },
  { name: '黑体 (SimHei)', value: "'SimHei', '黑体', sans-serif" },
  { name: '楷体 (KaiTi)', value: "'KaiTi', '楷体', 'STKaiti', serif" },
  { name: '思源黑体 (Noto Sans)', value: "'Noto Sans SC', '思源黑体', sans-serif" },
  { name: 'Arial', value: "Arial, sans-serif" },
  { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
]

interface Settings {
  pandocPath: string
  fontSize: number
  autoSave: boolean
  autoSaveInterval: number
  wordExportFont: string
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  pandocPath: '',
  fontSize: 16,
  autoSave: true,
  autoSaveInterval: 30000,
  wordExportFont: "'SimSun', '宋体', serif",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) }
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  const updateSettings = (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
