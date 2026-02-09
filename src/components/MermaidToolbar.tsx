import { useState } from 'react'
import { useEditor } from '@tiptap/react'
import { Workflow } from 'lucide-react'
import { MERMAID_TEMPLATES, getTemplateByType } from '../constants/mermaidTemplates'
import type { MermaidDiagramType } from '../utils/mermaidRenderer'
import { useLanguage } from '../contexts/LanguageContext'

/**
 * Mermaid 工具栏组件
 *
 * 功能：
 * - 提供插入 Mermaid 图表的按钮
 * - 下拉菜单显示所有图表类型
 * - 点击插入对应模板
 */
export const MermaidToolbar = () => {
  const editor = useEditor()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  if (!editor) {
    return null
  }

  /**
   * 插入 Mermaid 图表
   */
  const handleInsertDiagram = (type: MermaidDiagramType) => {
    const template = getTemplateByType(type)
    editor.chain().focus().insertMermaidBlock({
      diagramType: type,
      content: template.template,
    }).run()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* 主按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={t.mermaid.insertDiagram}
      >
        <Workflow className="w-4 h-4" />
        <span>{t.mermaid.insertDiagram}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单内容 */}
          <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">
                {t.mermaid.selectDiagramType}
              </div>
              {MERMAID_TEMPLATES.map((template) => {
                const typeNameKey = template.type as keyof typeof t.mermaid
                const descKey = template.type as keyof typeof t.mermaid.description

                return (
                  <button
                    key={template.type}
                    type="button"
                    onClick={() => handleInsertDiagram(template.type)}
                    className="w-full flex items-start gap-2 px-2 py-2 text-left text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Workflow className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {t.mermaid[typeNameKey]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {t.mermaid.description[descKey]}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
