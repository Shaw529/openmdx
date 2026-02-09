import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { MermaidBlockAttributes } from './MermaidBlock'
import type { MermaidDiagramType } from '../utils/mermaidRenderer'
import { renderMermaid, MERMAID_THEMES } from '../utils/mermaidRenderer'
import { MermaidCodeEditor } from '../components/MermaidCodeEditor'

/**
 * MermaidBlockNodeView 组件
 *
 * 功能：
 * - 显示和编辑 Mermaid 图表
 * - 三种视图模式：源码、预览、拆分
 * - 实时渲染预览
 * - 错误提示
 */
export const MermaidBlockNodeView: React.FC<NodeViewProps> = (props) => {
  const { node, updateAttributes, deleteNode, editor, getPos } = props
  const { resolvedTheme } = useTheme()
  const { t } = useLanguage()

  // 节点属性
  const attrs = node.attrs as MermaidBlockAttributes
  const diagramType = attrs.diagramType
  const viewMode = attrs.viewMode
  const theme = attrs.theme

  // 获取源码内容
  const getSourceCode = useCallback(() => {
    const textNode = node.childCount > 0 ? node.child(0) : null
    return textNode?.textContent || ''
  }, [node])

  // 本地状态
  const [sourceCode, setSourceCode] = useState(getSourceCode())
  const [renderedSvg, setRenderedSvg] = useState<string>('')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const isUpdatingNodeRef = useRef(false) // 跟踪是否正在更新节点

  // 跟踪当前主题状态（确保主题更新时能重新渲染）
  const [currentTheme, setCurrentTheme] = useState<MermaidBlockAttributes['theme']>(theme)

  // 预览图缩放和最大化状态
  const [zoomLevel, setZoomLevel] = useState(100) // 缩放级别，100 表示正常
  const [isMaximized, setIsMaximized] = useState(false) // 是否最大化

  // 同步源码到节点（仅在非手动更新时）
  useEffect(() => {
    // 如果正在手动更新节点，跳过同步避免循环
    if (isUpdatingNodeRef.current) {
      isUpdatingNodeRef.current = false
      return
    }

    const currentSource = getSourceCode()
    if (currentSource !== sourceCode) {
      // 从节点更新到本地状态
      setSourceCode(currentSource)
    }
  }, [node, getSourceCode])

  // 同步主题属性到本地状态
  useEffect(() => {
    if (theme !== currentTheme) {
      setCurrentTheme(theme)
    }
  }, [theme])

  // 渲染图表
  const renderDiagram = useCallback(async (code: string) => {
    if (!code.trim()) {
      setRenderedSvg('')
      setRenderError(null)
      return
    }

    setIsRendering(true)
    setRenderError(null)

    try {
      // 使用本地状态的主题
      const mermaidTheme = currentTheme === 'default' && resolvedTheme === 'dark' ? 'dark' : currentTheme
      const { svg } = await renderMermaid(code, `mermaid-${Date.now()}`, mermaidTheme)
      setRenderedSvg(svg)
    } catch (error) {
      console.error('Mermaid render error:', error)
      setRenderError(error instanceof Error ? error.message : 'Unknown error')
      setRenderedSvg('')
    } finally {
      setIsRendering(false)
    }
  }, [currentTheme, resolvedTheme])

  // 防抖渲染
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (viewMode !== 'source') {
        renderDiagram(sourceCode)
      }
    }, 500) // 500ms 防抖

    return () => clearTimeout(timeoutId)
  }, [sourceCode, viewMode, renderDiagram])

  // 监听主题变化，立即触发重新渲染（不使用防抖）
  useEffect(() => {
    if (viewMode !== 'source' && sourceCode.trim()) {
      renderDiagram(sourceCode)
    }
  }, [currentTheme]) // 仅监听 currentTheme

  // 处理源码变更
  const handleSourceChange = useCallback((newCode: string) => {
    // ⚠️ 重要：不要对用户输入进行任何自动清理或格式化
    // - 不要 trim() - 保留首尾空行（可能用于代码分隔）
    // - 不要清理多余空行 - 保留用户的格式意图
    // - 不要自动格式化 - 保持原始输入
    // 原因：空行和格式对 Mermaid 图表渲染和代码显示很重要

    // 仅更新本地状态，不要在每次输入时更新节点
    // 这样可以保持光标位置和焦点
    setSourceCode(newCode)

    // 设置标志，避免同步 effect 覆盖我们的更改
    isUpdatingNodeRef.current = true

    // 使用防抖延迟更新节点，避免频繁替换导致光标丢失
    // 注意：这里我们只在本地状态中更新，实际节点更新会在失焦或切换模式时进行
  }, [])

  // 同步本地状态到节点的辅助函数
  const syncToNode = useCallback((codeToSync?: string) => {
    const code = codeToSync ?? sourceCode

    // ⚠️ 重要：保持内容原样，不做任何清理或格式化
    // 直接使用原始文本内容，包括所有空行和空格

    try {
      const pos = getPos()
      if (typeof pos !== 'number') return

      const { state } = editor.view
      const node = state.doc.nodeAt(pos)
      if (!node) return

      // 创建新节点（保持原有属性）
      // 使用原始文本，不进行任何 trim 或清理
      const newNode = node.type.create(
        { ...node.attrs },
        state.schema.text(code)  // 原样保存，包括空行
      )

      // 用新节点替换旧节点
      const transaction = state.tr.replaceWith(pos, pos + node.nodeSize, newNode)
      editor.view.dispatch(transaction)
    } catch (error) {
      console.error('Failed to sync Mermaid node content:', error)
    }
  }, [sourceCode, editor, getPos])

  // 处理编辑器失焦 - 同步内容到节点
  const handleEditorBlur = useCallback(() => {
    syncToNode()
  }, [syncToNode])

  // 切换视图模式
  const handleViewModeChange = useCallback((newMode: MermaidBlockAttributes['viewMode']) => {
    // 在切换模式前先同步当前内容
    syncToNode()
    updateAttributes({ viewMode: newMode })
  }, [updateAttributes, syncToNode])

  // 切换图表类型
  const handleDiagramTypeChange = useCallback((newType: MermaidDiagramType) => {
    updateAttributes({ diagramType: newType })
  }, [updateAttributes])

  // 切换主题
  const handleThemeChange = useCallback((newTheme: MermaidBlockAttributes['theme']) => {
    // 同时更新节点属性和本地状态
    updateAttributes({ theme: newTheme })
    setCurrentTheme(newTheme)
  }, [updateAttributes])

  // 删除节点
  const handleDelete = useCallback(() => {
    deleteNode()
  }, [deleteNode])

  // 放大
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 25, 300))
  }, [])

  // 缩小
  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 25, 50))
  }, [])

  // 重置缩放
  const handleResetZoom = useCallback(() => {
    setZoomLevel(100)
  }, [])

  // 切换最大化
  const handleToggleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev)
    // 最大化时重置缩放
    if (!isMaximized) {
      setZoomLevel(100)
    }
  }, [isMaximized])

  // 图表类型选项
  const diagramTypeOptions: { value: MermaidDiagramType; label: string }[] = [
    { value: 'flowchart', label: '流程图' },
    { value: 'sequence', label: '时序图' },
    { value: 'class', label: '类图' },
    { value: 'state', label: '状态图' },
    { value: 'gantt', label: '甘特图' },
    { value: 'pie', label: '饼图' },
    { value: 'mindmap', label: '思维导图' },
    { value: 'er', label: 'ER图' },
    { value: 'git', label: 'Git图' },
    { value: 'timeline', label: '时间线' },
    { value: 'journey', label: '用户旅程' },
    { value: 'quadrant', label: '四象限图' },
    { value: 'c4', label: 'C4架构图' },
    { value: 'requirement', label: '需求图' },
  ]

  return (
    <NodeViewWrapper
      as="div"
      className="mermaid-block-node rounded-lg border bg-white dark:bg-gray-800 my-4"
      // 关键修复：不要让 NodeView 捕获编辑器的事件
      onMouseDown={(e) => {
        // 如果点击的是编辑器区域，阻止事件冒泡
        if ((e.target as HTMLElement).closest('.mermaid-code-editor')) {
          e.stopPropagation()
        }
      }}
    >
      {/* 控制栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 dark:bg-gray-700 rounded-t-lg">
        <div className="flex items-center gap-2">
          {/* 图表信息 */}
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t.mermaid[diagramType as keyof typeof t.mermaid] || '图表'}
          </span>

          {/* 分隔符 */}
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 视图模式切换按钮 */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleViewModeChange('source')
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'source'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
              }`}
              title="源码模式"
            >
              源码
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleViewModeChange('preview')
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
              }`}
              title="预览模式"
            >
              预览
            </button>
          </div>
        </div>

        {/* 删除按钮 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="删除图表"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 内容区域 */}
      <div className={viewMode === 'split' ? 'flex grid grid-cols-2 divide-x' : ''}>
        {/* 源码编辑区 */}
        {(viewMode === 'source' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'p-2' : ''}>
            <MermaidCodeEditor
              value={sourceCode}
              onChange={handleSourceChange}
              onBlur={handleEditorBlur}
              placeholder="输入 Mermaid 代码..."
              height="16rem"
              className="w-full"
              isDark={resolvedTheme === 'dark'}
            />
          </div>
        )}

        {/* 预览区 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="relative">
            {/* 缩放控制工具栏 */}
            {viewMode === 'preview' && (
              <div className="absolute top-2 right-2 z-[60] flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomOut()
                  }}
                  disabled={zoomLevel <= 50}
                  className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="缩小"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-xs text-gray-600 dark:text-gray-300 min-w-[3rem] text-center">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomIn()
                  }}
                  disabled={zoomLevel >= 300}
                  className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="放大"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleResetZoom()
                  }}
                  disabled={zoomLevel === 100}
                  className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="重置"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleMaximize()
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    isMaximized
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={isMaximized ? '还原' : '最大化'}
                >
                  {isMaximized ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* 预览内容容器 */}
            <div
              ref={previewRef}
              className={`p-4 min-h-[256px] flex items-center justify-center bg-white dark:bg-gray-900 overflow-auto ${
                isMaximized ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
              }`}
              style={isMaximized ? {} : {}}
            >
              <div
                className="transition-transform origin-center"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'center center'
                }}
              >
                {isRendering && (
                  <div className="text-gray-400 text-sm">渲染中...</div>
                )}

                {renderError && (
                  <div className="text-red-500 text-sm text-center">
                    <p className="font-semibold mb-2">渲染错误</p>
                    <p className="text-xs">{renderError}</p>
                  </div>
                )}

                {!isRendering && !renderError && renderedSvg && (
                  <div
                    className="mermaid-diagram"
                    dangerouslySetInnerHTML={{ __html: renderedSvg }}
                  />
                )}

                {!isRendering && !renderError && !renderedSvg && (
                  <div className="text-gray-400 text-sm">
                    {viewMode === 'preview' ? '在源码模式下输入代码...' : '输入代码后将在此显示预览...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
