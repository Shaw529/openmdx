import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DOMParser } from '@tiptap/pm/model'
import { marked } from 'marked'

/**
 * 检测文本是否包含Markdown语法
 */
function hasMarkdownSyntax(text: string): boolean {
  const patterns = [
    /^#{1,6}\s/m,           // 标题 # ## ### etc.
    /\*\*[^*]+\*\*/m,       // 粗体 **text**
    /\*[^*]+\*/m,           // 斜体 *text*
    /^[-*+]\s/m,            // 无序列表 - or *
    /^\d+\.\s/m,            // 有序列表 1.
    /^>\s/m,                // 引用 >
    /`[^`]+`/m,             // 行内代码 `code`
    /^```/m,                // 代码块 ```
    /\[.*\]\(.*\)/m,       // 链接 [text](url)
    /^\|.*\|/m,             // 表格
  ]

  return patterns.some(pattern => pattern.test(text))
}

/**
 * Markdown粘贴解析扩展
 * 自动检测粘贴的Markdown文本并转换为富文本格式
 */
export const ClipboardTextParser = Extension.create({
  name: 'clipboardTextParser',

  addProseMirrorPlugins() {
    const plugin = new Plugin({
      key: new PluginKey('clipboardTextParser'),
      props: {
        handlePaste: (view, event) => {
          const text = event.clipboardData?.getData('text/plain')
          if (!text) {
            return false
          }

          // 检测是否包含Markdown语法
          if (!hasMarkdownSyntax(text)) {
            return false
          }

          event.preventDefault()

          try {
            // 先用 marked 转换
            let html = marked(text)
            const { schema } = view.state

            // 检测是否为多行纯内联内容（需要手动换行）
            const lines = text.split('\n').filter(line => line.trim())
            const hasMultipleLines = lines.length > 1

            // 检查原始文本是否有块级 Markdown 语法
            const hasBlockSyntax = lines.some(line => {
              return /^#{1,6}\s/.test(line) ||              // 标题
                     /^\s*[-*+]\s/.test(line) ||           // 无序列表
                     /^\s*\d+\.\s/.test(line) ||             // 有序列表
                     /^\s*>\s/.test(line) ||                // 引用
                     /^\s*```/.test(line) ||                // 代码块
                     /^\s*\|.*\|/.test(line)               // 表格
            })

            // 如果是多行且没有块级语法，才需要手动换行
            if (hasMultipleLines && !hasBlockSyntax) {
              // 纯内联多行内容：逐行转换，每行独立成段
              html = lines.map(line => marked(line)).join('')
            }

            // 创建临时DOM元素解析HTML
            const div = document.createElement('div')
            div.innerHTML = html

            // 使用ProseMirror的DOMParser解析HTML
            const domParser = schema.domParser || DOMParser.fromSchema(schema)
            const slice = domParser.parseSlice(div)

            // 使用 replaceSelectionWith 插入内容
            const tr = view.state.tr.replaceSelection(slice)
            view.dispatch(tr)

            return true
          } catch (error) {
            console.error('[ClipboardTextParser] Paste error:', error)
            return false
          }
        }
      }
    })

    return [plugin]
  },
})
