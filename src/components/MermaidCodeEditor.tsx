import React, { useCallback, useRef } from 'react'

interface MermaidCodeEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  height?: string
  isDark?: boolean
}

/**
 * ⚠️ 重要说明：内容处理原则
 *
 * 本组件使用原生 textarea 编辑器，不会对用户输入进行任何自动处理：
 *
 * 1. **保留所有空行**：空行对代码分隔和可读性很重要
 * 2. **保留首尾空格**：可能用于格式化或对齐
 * 3. **保留原始缩进**：不自动调整缩进层级
 * 4. **保留特殊字符**：包括但不限于制表符、特殊空格等
 *
 * 禁止添加以下功能：
 * - ❌ 自动 trim() 首尾空白
 * - ❌ 自动清理多余空行
 * - ❌ 自动格式化代码
 * - ❌ 自动修正缩进
 *
** 原因：这些"清理"操作会破坏 Mermaid 语法或影响代码显示效果
 */

/**
 * Mermaid 代码编辑器组件
 *
 * 使用原生 textarea 以确保在 NodeView 中正常工作
 * 功能：
 * - 简单可靠的原生编辑
 * - 等宽字体显示
 * - 支持暗色主题
 * - Tab 键支持
 */
export const MermaidCodeEditor: React.FC<MermaidCodeEditorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = '输入 Mermaid 代码...',
  className = '',
  height = '16rem',
  isDark = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const handleBlur = useCallback(() => {
    onBlur?.()
  }, [onBlur])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 支持 Tab 键输入（而不是切换焦点）
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      // 插入两个空格
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)

      // 恢复光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }, [value, onChange])

  // 阻止事件冒泡到 NodeView
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    // 确保文本框获得焦点
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  return (
    <div
      className={`mermaid-code-editor ${className}`}
      style={{ height }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          w-full h-full p-3 resize-none
          font-mono text-sm leading-relaxed
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-gray-100
          border border-gray-300 dark:border-gray-700
          rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          focus:border-transparent
          transition-colors
          ${isDark ? 'caret-blue-400' : 'caret-blue-600'}
        `}
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          minHeight: height
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  )
}
