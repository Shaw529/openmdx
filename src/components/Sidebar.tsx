import { useState, useEffect, useCallback, memo, useMemo } from 'react'
import { X, FileText } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { debounce } from '../utils/debounce'

interface Heading {
  id: string
  level: number
  text: string
}

interface SidebarProps {
  content: string
  onHeadingClick: (id: string) => void
  isOpen: boolean
  onToggle: () => void
}

/**
 * 解析HTML内容提取标题
 * 从 TipTap 编辑器生成的 HTML 中提取带有 ID 属性的标题
 */
function parseHeadings(content: string): Heading[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  // 同时选择带有 data-id 或 id 属性的标题
  const headingElements = doc.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id], h1[data-id], h2[data-id], h3[data-id], h4[data-id], h5[data-id], h6[data-id]')

  return Array.from(headingElements).map((heading) => {
    const element = heading as HTMLElement
    // 优先使用 data-id，其次使用 id
    const id = element.getAttribute('data-id') || element.getAttribute('id') || `heading-${Math.random().toString(36).substr(2, 9)}`
    return {
      id,
      level: parseInt(element.tagName[1]),
      text: element.textContent || '',
    }
  })
}

/**
 * 侧边栏组件
 * 显示文档大纲
 * 支持边缘悬停触发和外部状态控制
 */
function Sidebar({ content, onHeadingClick, isOpen, onToggle }: SidebarProps) {
  const { t } = useLanguage()
  const [headings, setHeadings] = useState<Heading[]>([])

  // 使用防抖的函数来更新标题
  const updateHeadings = useMemo(
    () =>
      debounce((newContent: string) => {
        const extractedHeadings = parseHeadings(newContent)
        setHeadings(extractedHeadings)
      }, 300),
    []
  )

  useEffect(() => {
    updateHeadings(content)
  }, [content, updateHeadings])

  const handleHeadingClick = useCallback(
    (id: string) => {
      onHeadingClick(id)
    },
    [onHeadingClick]
  )

  // 缓存空状态UI
  const emptyState = useMemo(
    () => (
      <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
        <FileText className="mx-auto mb-2" size={24} />
        <p>{t.sidebar.noOutline}</p>
        <p className="text-xs mt-1">{t.sidebar.addHeadings}</p>
      </div>
    ),
    [t.sidebar.noOutline, t.sidebar.addHeadings]
  )

  // 收起状态：显示边缘悬停触发按钮
  if (!isOpen) {
    return (
      <div
        className="fixed left-0 top-0 bottom-0 w-1 hover:w-2 bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 cursor-col-resize z-40"
        onMouseEnter={onToggle}
        title={t.sidebar.show}
      />
    )
  }

  return (
    <div className="w-64 bg-[#f7f7f7] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">{t.sidebar.outline}</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title={t.sidebar.hide}
        >
          <X size={16} className="dark:text-gray-100" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {headings.length === 0 ? (
          emptyState
        ) : (
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => handleHeadingClick(heading.id)}
                  className="w-full text-left px-2 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm truncate transition-colors dark:text-gray-100"
                  style={{
                    paddingLeft: `${heading.level * 0.75 + 0.5}rem`,
                    fontSize: `${1 - (heading.level - 1) * 0.1}rem`,
                    fontWeight: heading.level === 1 ? '600' : '400',
                  }}
                  title={heading.text}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default memo(Sidebar)
