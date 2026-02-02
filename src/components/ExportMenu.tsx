import { useLanguage } from '../contexts/LanguageContext'
import { memo } from 'react'

interface ExportMenuProps {
  isOpen: boolean
  onClose: () => void
  onExportPDF: () => void
  onExportHTML: () => void
  onExportWord: () => (setShowSettings: (show: boolean) => void) => void
  onOpenSettings: () => void
}

/**
 * 导出菜单组件
 * 提供PDF、HTML、Word导出选项
 */
function ExportMenu({
  isOpen,
  onClose,
  onExportPDF,
  onExportHTML,
  onExportWord,
  onOpenSettings
}: ExportMenuProps) {
  const { t } = useLanguage()

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px] z-50">
      <button
        onClick={() => {
          onExportPDF()
          onClose()
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {t.toolbar.pdf}
      </button>
      <button
        onClick={() => {
          onExportHTML()
          onClose()
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {t.toolbar.html}
      </button>
      <button
        onClick={() => {
          onExportWord()(onOpenSettings)
          onClose()
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {t.toolbar.word}
      </button>
    </div>
  )
}

export default memo(ExportMenu)
