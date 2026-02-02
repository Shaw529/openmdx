import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useEffect, memo, useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { ClipboardTextParser } from '../extensions/ClipboardTextParser'
import { MarkdownCopy } from '../extensions/MarkdownCopy'
import HeadingWithId from '../extensions/HeadingWithId'
import HeadingIdPlugin from '../extensions/HeadingIdPlugin'

const lowlight = createLowlight(common)

interface EditorProps {
  content: string
  onChange?: (content: string) => void
  onReady?: () => void
}

export interface EditorRef {
  getCharCount: () => number
  getLineCount: () => number
  getEditor: () => unknown
  scrollToHeading: (headingId: string) => void
}

/**
 * TipTap 编辑器组件
 * 提供 Markdown 编辑功能
 * 优化：使用ref跟踪上一次内容，避免不必要的更新
 * 新增：暴露字符数、行数统计和editor实例
 */
const Editor = forwardRef<EditorRef, EditorProps>(({ content, onChange, onReady }, ref) => {
  const { t } = useLanguage()
  const prevContentRef = useRef<string>()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        // 排除会被重复配置的扩展
        link: false,
        image: false,
        heading: false, // 禁用默认的 Heading，使用自定义的 HeadingWithId
      }),
      HeadingWithId.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Placeholder.configure({
        placeholder: t.editor.placeholder,
      }),
      ClipboardTextParser, // Markdown粘贴解析
      MarkdownCopy, // Markdown复制
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4',
        },
      }),
      HeadingIdPlugin, // 自动为标题分配 ID 的插件
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
        spellcheck: 'false',
      },
    },
  })

  useEffect(() => {
    if (!editor) return

    // 只在内容真正变化时更新编辑器
    if (content !== prevContentRef.current && content !== editor.getHTML()) {
      editor.commands.setContent(content)
      prevContentRef.current = content
    }
  }, [content, editor])

  useEffect(() => {
    if (editor && onReady) {
      onReady()
    }
  }, [editor, onReady])

  // 监听打印模式切换
  useEffect(() => {
    const handleEnterPrintMode = () => {
      document.body.classList.add('print-mode')
    }

    const handleExitPrintMode = () => {
      document.body.classList.remove('print-mode')
    }

    // 监听来自主进程的打印模式消息
    const wrappedEnterPrintMode = () => handleEnterPrintMode()
    const wrappedExitPrintMode = () => handleExitPrintMode()

    if (window.electronAPI?.on) {
      window.electronAPI.on('enter-print-mode', wrappedEnterPrintMode)
      window.electronAPI.on('exit-print-mode', wrappedExitPrintMode)
    }

    // 兼容非 Electron 环境（浏览器开发时）
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'enter-print-mode') {
        handleEnterPrintMode()
      } else if (event.data.type === 'exit-print-mode') {
        handleExitPrintMode()
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      if (window.electronAPI?.removeListener) {
        window.electronAPI.removeListener('enter-print-mode', wrappedEnterPrintMode as (...args: unknown[]) => void)
        window.electronAPI.removeListener('exit-print-mode', wrappedExitPrintMode as (...args: unknown[]) => void)
      }
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // 计算字符数（使用useMemo优化性能）
  const charCount = useMemo(() => {
    if (!editor) return 0
    return editor.getText().length
  }, [editor])

  // 计算行数
  const lineCount = useMemo(() => {
    if (!editor) return 0
    return editor.state.doc.childCount
  }, [editor])

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getCharCount: () => charCount,
    getLineCount: () => lineCount,
    getEditor: () => editor,
    scrollToHeading: (headingId: string) => {
      // 同时查找 id 和 data-id 属性
      const element = document.querySelector(`[id="${headingId}"], [data-id="${headingId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }))

  if (!editor) {
    return null
  }

  return (
    <div className="flex-1 overflow-auto">
      <EditorContent editor={editor} />
    </div>
  )
})

Editor.displayName = 'Editor'

const EditorWithMemo = memo(Editor)
export default EditorWithMemo
export { EditorRef }
