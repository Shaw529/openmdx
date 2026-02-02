import { useState, useCallback, useRef, memo, useEffect } from 'react'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'

// Editor引用类型（与Editor.tsx中的EditorRef保持一致）
interface EditorRef {
  getCharCount: () => number
  getLineCount: () => number
  getEditor: () => unknown
}
import SettingsModal from './components/SettingsModal'
import AboutModal from './components/AboutModal'
import MenuBar from './components/MenuBar'
import StatusBar from './components/StatusBar'
import { useLanguage } from './contexts/LanguageContext'
import { useTheme } from './contexts/ThemeContext'
import { useSettings } from './contexts/SettingsContext'
import { useTabs } from './hooks/useTabs'
import { useExport } from './hooks/useExport'

/**
 * 主应用组件
 * 使用 TipTap 编辑器的 Markdown 编辑器
 * Typora风格：经典菜单栏 + 多文件页签 + 沉浸式编辑器 + 状态栏
 */
function App() {
  const { language } = useLanguage()
  const { resolvedTheme } = useTheme()
  const { settings } = useSettings()

  // 状态管理
  const [showSettings, setShowSettings] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [charCount, setCharCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)

  // Editor引用（用于访问editor实例和统计信息）
  const editorRef = useRef<EditorRef>(null)

  // 多文件页签管理
  const {
    tabs,
    activeTab,
    activeTabId,
    handleNewFile,
    handleOpenFile,
    handleSaveFile,
    handleCloseTab,
    handleTabClick,
    updateTabContent
  } = useTabs({
    onTabChange: () => {
      // 更新统计信息
      setTimeout(() => {
        setCharCount(editorRef.current?.getCharCount() || 0)
        setLineCount(editorRef.current?.getLineCount() || 0)
      }, 100)
    }
  })

  // 初始化：如果没有任何页签，创建一个
  useEffect(() => {
    if (tabs.length === 0) {
      handleNewFile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 内容变更处理
  const handleContentChange = useCallback((newContent: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, newContent)
    }
    // 更新统计信息
    setCharCount(editorRef.current?.getCharCount() || 0)
    setLineCount(editorRef.current?.getLineCount() || 0)
  }, [activeTab, updateTabContent])

  // 导出功能hooks
  const { handleExportPDF, handleExportHTML, handleExportWord } = useExport({
    content: activeTab?.content || '',
    currentFile: activeTab?.path || null,
    language,
    resolvedTheme,
    settings
  })

  // 侧边栏切换
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  // 标题点击处理
  const handleHeadingClick = useCallback((headingId: string) => {
    editorRef.current?.scrollToHeading(headingId)
  }, [])

  // 全局快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S 或 Cmd+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (handleSaveFile) {
          handleSaveFile()
        }
      }
      // Ctrl+N 或 Cmd+N 新建
      else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewFile()
      }
      // Ctrl+O 或 Cmd+O 打开
      else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        handleOpenFile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSaveFile, handleNewFile, handleOpenFile])

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* 1. 经典菜单栏 - 32px高 */}
      <MenuBar
        editor={editorRef.current?.getEditor()}
        currentFile={activeTab?.path || null}
        isModified={activeTab?.isModified || false}
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onExportPDF={handleExportPDF}
        onExportHTML={handleExportHTML}
        onExportWord={handleExportWord}
        onOpenSettings={() => setShowSettings(true)}
        onToggleSidebar={handleToggleSidebar}
        onShowAbout={() => setShowAbout(true)}
      />

      {/* 2. 多文件页签 */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
      />

      {/* 3. 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 - 0或16rem宽 */}
        <Sidebar
          content={activeTab?.content || ''}
          onHeadingClick={handleHeadingClick}
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
        />

        {/* 编辑器 - flex-1 */}
        <Editor
          ref={editorRef}
          content={activeTab?.content || ''}
          onChange={handleContentChange}
          key={activeTabId} // 关键：切换页签时重新挂载编辑器
        />
      </div>

      {/* 4. 底部状态栏 - 24px高 */}
      <StatusBar
        charCount={charCount}
        lineCount={lineCount}
        language={language === 'zh-CN' ? '简体中文' : 'English'}
        encoding="UTF-8"
        theme={resolvedTheme}
      />

      {/* 5. 设置对话框 */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* 6. 关于对话框 */}
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />
    </div>
  )
}

export default memo(App)
