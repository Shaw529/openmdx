import { useState, memo } from 'react'
import { X, Monitor, Sun, Moon, Settings as SettingsIcon, FolderOpen, Search, Loader2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { useSettings } from '../contexts/SettingsContext'
import { THEMES, FILE_EXTENSIONS } from '../config/constants'
import { checkElectronAPI } from '../utils/electronAPI'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * 设置对话框组件
 * 提供主题、语言、导出设置
 * 优化：移除过度使用的useCallback
 */
function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings } = useSettings()
  const [pandocPath, setPandocPath] = useState(settings.pandocPath)
  const [isSearching, setIsSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')

  const handleSave = () => {
    updateSettings({ pandocPath })
    onClose()
  }

  const handleBrowsePandoc = async () => {
    // 让用户选择pandoc可执行文件
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = FILE_EXTENSIONS.EXE // Windows
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // 在Electron中获取完整路径
        const filePath =
          (file as File & { path?: string; webkitRelativePath?: string }).path ||
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
          file.name
        setPandocPath(filePath)
      }
    }
    input.click()
  }

  const handleAutoSearchPandoc = async () => {
    if (!checkElectronAPI()) {
      setSearchMessage(t.settings.pandocSearchError || '此功能需要在Electron环境中运行')
      return
    }

    setIsSearching(true)
    setSearchMessage('')

    try {
      const result = await window.electronAPI!.findPandoc()
      if (result.success && result.path) {
        setPandocPath(result.path)
        setSearchMessage(t.settings.pandocFound || `已找到 Pandoc: ${result.path}`)
      } else {
        setSearchMessage(t.settings.pandocNotFound || '未找到 Pandoc，请手动安装')
      }
    } catch (error) {
      setSearchMessage(t.settings.pandocSearchError || '搜索失败')
      console.error('搜索 Pandoc 失败:', error)
    } finally {
      setIsSearching(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} />
            <h2 className="text-lg font-semibold">{t.settings.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title={t.settings.cancel}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Appearance */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Monitor size={16} />
              {t.settings.appearance}
            </h3>

            {/* Theme */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t.settings.theme}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme(THEMES.LIGHT)}
                  className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors ${
                    theme === THEMES.LIGHT
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400'
                      : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Sun size={16} />
                  {t.settings.themeLight}
                </button>
                <button
                  onClick={() => setTheme(THEMES.DARK)}
                  className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors ${
                    theme === THEMES.DARK
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400'
                      : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Moon size={16} />
                  {t.settings.themeDark}
                </button>
                <button
                  onClick={() => setTheme(THEMES.SYSTEM)}
                  className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors ${
                    theme === THEMES.SYSTEM
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400'
                      : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Monitor size={16} />
                  {t.settings.themeSystem}
                </button>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t.settings.language}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'zh-CN' | 'en-US')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>

          {/* Export Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t.settings.export}
            </h3>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t.settings.pandocPath}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pandocPath}
                  onChange={(e) => setPandocPath(e.target.value)}
                  placeholder={t.settings.pandocPathHint}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBrowsePandoc}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 dark:text-gray-100"
                  title={t.settings.browse}
                >
                  <FolderOpen size={16} />
                  {t.settings.browse}
                </button>
                <button
                  onClick={handleAutoSearchPandoc}
                  disabled={isSearching}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600 rounded hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center gap-2 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t.settings.autoSearch || "自动搜索"}
                >
                  {isSearching ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  {isSearching ? (t.settings.searching || '搜索中...') : (t.settings.autoSearch || '自动搜索')}
                </button>
              </div>
              {searchMessage && (
                <p className={`text-xs mt-2 ${searchMessage.includes('未找到') || searchMessage.includes('失败') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {searchMessage}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t.settings.pandocDownload}{' '}
                <a
                  href="https://pandoc.org/installing.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t.settings.pandocDownloadLink}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            {t.settings.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {t.settings.save}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(SettingsModal)
