import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DOMSerializer } from '@tiptap/pm/model'
import { domToMarkdown } from '../utils/htmlToMarkdown'

/**
 * Markdown复制扩展
 * 复制时同时提供Markdown格式和富文本格式
 */
export const MarkdownCopy = Extension.create({
  name: 'markdownCopy',

  addProseMirrorPlugins() {
    const plugin = new Plugin({
      key: new PluginKey('markdownCopy'),
      props: {
        handleDOMEvents: {
          copy: (view, event) => {
            const { state } = view
            const { selection } = state

            // 安全检查：selection 可能不存在
            if (!selection) {
              return false
            }

            const { from, to, empty } = selection

            if (empty) {
              return false
            }

            event.preventDefault()

            try {
              // 使用 DOMSerializer 将选中的内容序列化为 DOM
              const slice = state.doc.slice(from, to)
              const serializer = DOMSerializer.fromSchema(view.state.schema)
              const domFragment = serializer.serializeFragment(slice.content)

              // 创建临时 div 容器
              const div = document.createElement('div')
              div.appendChild(domFragment)

              // 转换为 Markdown
              const markdown = domToMarkdown(div).trim()

              // 获取 HTML
              const html = div.innerHTML

              // 设置到剪贴板
              event.clipboardData?.setData('text/plain', markdown)
              event.clipboardData?.setData('text/html', html)

              return true
            } catch (error) {
              console.error('[MarkdownCopy] Copy error:', error)
              return false
            }
          }
        }
      }
    })

    return [plugin]
  },
})
