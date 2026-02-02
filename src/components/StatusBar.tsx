import { memo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface StatusBarProps {
  charCount: number
  lineCount: number
  language: string
  encoding: string
  theme: string
}

/**
 * 底部状态栏组件
 * 显示字符数、行数、语言、编码、主题等信息
 */
function StatusBar({
  charCount,
  lineCount,
  language,
  encoding,
  theme
}: StatusBarProps) {
  const { t } = useLanguage()

  return (
    <div className="h-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 text-xs text-gray-600 dark:text-gray-400 select-none">
      {/* 左侧统计区域 */}
      <div className="flex items-center gap-4">
        <span>{charCount} {t.statusbar.characters}</span>
        <span>{lineCount} {t.statusbar.lines}</span>
      </div>

      {/* 右侧信息区域 */}
      <div className="flex items-center gap-4">
        <span>{language}</span>
        <span>{encoding}</span>
        <span>{theme === 'dark' ? t.settings.themeDark : t.settings.themeLight}</span>
      </div>
    </div>
  )
}

export default memo(StatusBar)
