import { useState, useEffect, useCallback, memo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { MERMAID_TEMPLATES } from '../constants/mermaidTemplates'
import type { MermaidDiagramType } from '../utils/mermaidRenderer'

interface MenuBarProps {
  editor: any
  currentFile: string | null
  isModified: boolean
  onNewFile: () => void
  onOpenFile: () => void
  onSaveFile: () => void
  onExportPDF: () => void
  onExportHTML: () => void
  onExportWord: () => (setShowSettings: (show: boolean) => void) => void
  onOpenSettings: () => void
  onToggleSidebar: () => void
  onShowAbout: () => void
}

type MenuType = 'file' | 'edit' | 'paragraph' | 'diagram' | 'format' | 'view' | 'help' | null

/**
 * 经典下拉菜单栏组件
 * 提供7个主菜单：文件、编辑、段落、图表、格式、视图、帮助
 */
function MenuBar({
  editor,
  currentFile,
  isModified,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onExportPDF,
  onExportHTML,
  onExportWord,
  onOpenSettings,
  onToggleSidebar,
  onShowAbout
}: MenuBarProps) {
  const { t } = useLanguage()
  const [activeMenu, setActiveMenu] = useState<MenuType>(null)

  // 关闭菜单（点击外部时）
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null)
    if (activeMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [activeMenu])

  // 切换菜单显示/隐藏
  const toggleMenu = useCallback((menu: MenuType, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveMenu(activeMenu === menu ? null : menu)
  }, [activeMenu])

  // 检查是否可以执行编辑命令
  const canEdit = editor?.isEditable ?? false

  // 文件菜单
  const FileMenu = activeMenu === 'file' && (
    <div className="absolute top-full left-0 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
      <MenuItem onClick={onNewFile} shortcut="Ctrl+N" label={t.menu.new} />
      <MenuItem onClick={onOpenFile} shortcut="Ctrl+O" label={t.menu.open} />
      <MenuItem onClick={onSaveFile} shortcut="Ctrl+S" label={t.menu.save} />
      <Divider />
      <MenuItem onClick={onExportPDF} label={t.menu.exportPDF} />
      <MenuItem onClick={onExportHTML} label={t.menu.exportHTML} />
      <MenuItem onClick={() => onExportWord()(onOpenSettings)} label={t.menu.exportWord} />
    </div>
  )

  // 编辑菜单
  const EditMenu = activeMenu === 'edit' && (
    <div className="absolute top-full left-0 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
      <MenuItem
        onClick={() => editor?.chain().focus().undo().run()}
        shortcut="Ctrl+Z"
        label={t.menu.undo}
        disabled={!canEdit || !editor?.can().undo()}
      />
      <MenuItem
        onClick={() => editor?.chain().focus().redo().run()}
        shortcut="Ctrl+Y"
        label={t.menu.redo}
        disabled={!canEdit || !editor?.can().redo()}
      />
      <Divider />
      <MenuItem onClick={() => editor?.chain().focus().cut().run()} shortcut="Ctrl+X" label={t.menu.cut} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().copy().run()} shortcut="Ctrl+C" label={t.menu.copy} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().paste().run()} shortcut="Ctrl+V" label={t.menu.paste} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().selectAll().run()} shortcut="Ctrl+A" label={t.menu.selectAll} disabled={!canEdit} />
    </div>
  )

  // 段落菜单
  const ParagraphMenu = activeMenu === 'paragraph' && (
    <div className="absolute top-full left-0 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
      <MenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} shortcut="Ctrl+Alt+1" label={t.menu.heading1} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} shortcut="Ctrl+Alt+2" label={t.menu.heading2} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} shortcut="Ctrl+Alt+3" label={t.menu.heading3} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} shortcut="Ctrl+Alt+4" label={t.menu.heading4} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()} shortcut="Ctrl+Alt+5" label={t.menu.heading5} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleHeading({ level: 6 }).run()} shortcut="Ctrl+Alt+6" label={t.menu.heading6} disabled={!canEdit} />
      <Divider />
      <MenuItem onClick={() => editor?.chain().focus().setParagraph().run()} label={t.menu.plainText} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleCodeBlock().run()} label={t.menu.codeBlock} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleBlockquote().run()} label={t.menu.quoteBlock} disabled={!canEdit} />
      <Divider />
      <MenuItem onClick={() => editor?.chain().focus().toggleBulletList().run()} label={t.menu.bulletList} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleOrderedList().run()} label={t.menu.orderedList} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleTaskList().run()} label={t.menu.taskList} disabled={!canEdit} />
    </div>
  )

  // 图表菜单
  const DiagramMenu = activeMenu === 'diagram' && (
    <div className="absolute top-full left-0 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
      {MERMAID_TEMPLATES.map((template) => {
        const typeNameKey = template.type as keyof typeof t.mermaid
        return (
          <MenuItem
            key={template.type}
            onClick={() => {
              const type = template.type as MermaidDiagramType
              editor?.chain().focus().insertMermaidBlock({
                diagramType: type,
                content: template.template,
              }).run()
              setActiveMenu(null)
            }}
            label={t.mermaid[typeNameKey]}
            disabled={!canEdit}
          />
        )
      })}
    </div>
  )

  // 格式菜单
  const FormatMenu = activeMenu === 'format' && (
    <div className="absolute top-full left-0 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
      <MenuItem onClick={() => editor?.chain().focus().toggleBold().run()} shortcut="Ctrl+B" label={t.menu.bold} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleItalic().run()} shortcut="Ctrl+I" label={t.menu.italic} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleStrike().run()} shortcut="Ctrl+D" label={t.menu.strike} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().toggleCode().run()} shortcut="Ctrl+`" label={t.menu.code} disabled={!canEdit} />
      <Divider />
      <MenuItem onClick={() => editor?.chain().focus().setLink({ href: '' }).run()} label={t.menu.link} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().setImage({ src: '' }).run()} label={t.menu.image} disabled={!canEdit} />
      <MenuItem onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} label={t.menu.table} disabled={!canEdit} />
    </div>
  )

  // 视图菜单
  const ViewMenu = activeMenu === 'view' && (
    <div className="absolute top-full left-0 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
      <MenuItem onClick={onToggleSidebar} shortcut="Ctrl+Shift+S" label={t.menu.toggleSidebar} />
    </div>
  )

  // 帮助菜单
  const HelpMenu = activeMenu === 'help' && (
    <div className="absolute top-full left-0 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
      <MenuItem onClick={onOpenSettings} label={t.settings.title} />
      <Divider />
      <MenuItem
        onClick={onShowAbout}
        label={`${t.menu.about} ${t.app.title} ${t.app.version}`}
      />
    </div>
  )

  return (
    <div className="h-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-2 select-none">
      {/* 文件菜单 */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => toggleMenu('file', e)}
          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {t.menu.file}
        </button>
        {FileMenu}
      </div>

      {/* 编辑菜单 */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => toggleMenu('edit', e)}
          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {t.menu.edit}
        </button>
        {EditMenu}
      </div>

      {/* 段落菜单 */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => toggleMenu('paragraph', e)}
          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {t.menu.paragraph}
        </button>
        {ParagraphMenu}
      </div>

      {/* 图表菜单 */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => toggleMenu('diagram', e)}
          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {t.menu.diagram}
        </button>
        {DiagramMenu}
      </div>

      {/* 格式菜单 */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => toggleMenu('format', e)}
          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {t.menu.format}
        </button>
        {FormatMenu}
      </div>

      {/* 视图菜单 */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => toggleMenu('view', e)}
          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {t.menu.view}
        </button>
        {ViewMenu}
      </div>

      {/* 帮助菜单 */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => toggleMenu('help', e)}
          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {t.menu.help}
        </button>
        {HelpMenu}
      </div>
    </div>
  )
}

/**
 * 菜单项组件
 */
function MenuItem({
  label,
  onClick,
  shortcut,
  disabled = false
}: {
  label: string
  onClick: () => void
  shortcut?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full px-4 py-2 text-sm text-left flex items-center justify-between ${
        disabled
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
      }`}
    >
      <span>{label}</span>
      {shortcut && <span className="text-xs text-gray-400 dark:text-gray-500">{shortcut}</span>}
    </button>
  )
}

/**
 * 分隔线组件
 */
function Divider() {
  return <hr className="my-1 border-gray-200 dark:border-gray-700" />
}

export default memo(MenuBar)
