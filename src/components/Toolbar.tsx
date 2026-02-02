import { useRef, useEffect, memo, useState } from 'react'
import { FileText, Moon, Sun, Settings as SettingsIcon } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { THEMES } from '../config/constants'
import ExportMenu from './ExportMenu'

interface ToolbarProps {
  currentFile: string | null
  isModified: boolean
  onNewFile: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onExportPDF: () => void
  onExportHTML: () => void
  onExportWord: () => (setShowSettings: (show: boolean) => void) => void
  onToggleTheme: () => void
  onOpenSettings: () => void
}

/**
 * 顶部工具栏组件
 * 包含文件操作、导出、主题切换和设置按钮
 */
function Toolbar({
  currentFile,
  isModified,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onExportPDF,
  onExportHTML,
  onExportWord,
  onToggleTheme,
  onOpenSettings
}: ToolbarProps) {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭导出菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 select-none">
      {/* 左侧：文件名和状态 */}
      <div className="flex items-center gap-3">
        <FileText className="text-blue-600" size={18} />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {currentFile ? currentFile.split(/[/\\]/).pop() : '未命名'}
        </span>
        {isModified && <span className="text-sm text-blue-600 font-medium">●</span>}
      </div>

      {/* 中间：菜单 */}
      <div className="flex items-center gap-1">
        <button
          onClick={onNewFile}
          className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={t.toolbar.new}
        >
          {t.toolbar.new}
        </button>
        <button
          onClick={onOpenFile}
          className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={t.toolbar.open}
        >
          {t.toolbar.open}
        </button>
        <button
          onClick={onSaveFile}
          className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={t.toolbar.save}
        >
          {t.toolbar.save}
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* 导出菜单 */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-1"
            aria-expanded={showExportMenu}
          >
            {t.toolbar.export}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <ExportMenu
            isOpen={showExportMenu}
            onClose={() => setShowExportMenu(false)}
            onExportPDF={onExportPDF}
            onExportHTML={onExportHTML}
            onExportWord={onExportWord}
            onOpenSettings={() => setShowSettings(true)}
          />
        </div>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* 主题切换 */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={theme === THEMES.DARK ? t.settings.themeLight : t.settings.themeDark}
        >
          {theme === THEMES.DARK ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title={t.toolbar.settings}
        >
          <SettingsIcon size={16} />
        </button>
      </div>
    </div>
  )
}

export default memo(Toolbar)
