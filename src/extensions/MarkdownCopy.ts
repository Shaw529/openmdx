import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DOMSerializer } from '@tiptap/pm/model'

/**
 * 将DOM元素转换为Markdown
 */
function domToMarkdown(element: HTMLElement, depth: number = 0): string {
  let markdown = ''

  element.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      markdown += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      switch (tag) {
        case 'h1':
          markdown += `# ${el.textContent}\n\n`
          break
        case 'h2':
          markdown += `## ${el.textContent}\n\n`
          break
        case 'h3':
          markdown += `### ${el.textContent}\n\n`
          break
        case 'h4':
          markdown += `#### ${el.textContent}\n\n`
          break
        case 'h5':
          markdown += `##### ${el.textContent}\n\n`
          break
        case 'h6':
          markdown += `###### ${el.textContent}\n\n`
          break
        case 'strong':
        case 'b':
          markdown += `**${el.textContent}**`
          break
        case 'em':
        case 'i':
          markdown += `*${el.textContent}*`
          break
        case 'code':
          const codeText = el.textContent || ''
          // 检查是否在pre标签内（代码块）
          if (el.parentElement?.tagName === 'PRE') {
            markdown += '```\n' + codeText + '\n```\n\n'
          } else {
            markdown += '`' + codeText + '`'
          }
          break
        case 'pre':
          // pre 标签通常包含 code 标签
          const codeEl = el.querySelector('code')
          if (codeEl) {
            const lang = codeEl.className.match(/language-(\w+)/)?.[1] || ''
            markdown += '```' + lang + '\n' + (codeEl.textContent || '') + '\n```\n\n'
          } else {
            markdown += '```\n' + (el.textContent || '') + '\n```\n\n'
          }
          break
        case 'blockquote':
          const quoteContent = domToMarkdown(el, depth + 1).trim()
          quoteContent.split('\n').forEach(line => {
            markdown += `> ${line}\n`
          })
          markdown += '\n'
          break
        case 'ul':
          const ulItems = el.querySelectorAll(':scope > li')
          ulItems.forEach(li => {
            const liContent = domToMarkdown(li, depth + 1).trim()
            markdown += `- ${liContent}\n`
          })
          markdown += '\n'
          break
        case 'ol':
          const olItems = el.querySelectorAll(':scope > li')
          olItems.forEach((li, idx) => {
            const liContent = domToMarkdown(li, depth + 1).trim()
            markdown += `${idx + 1}. ${liContent}\n`
          })
          markdown += '\n'
          break
        case 'li':
          // 列表项内容（已在 ul/ol 处理）
          markdown += domToMarkdown(el, depth + 1).trim()
          break
        case 'a':
          const href = el.getAttribute('href') || ''
          markdown += `[${el.textContent}](${href})`
          break
        case 'p':
          const pContent = domToMarkdown(el, depth + 1).trim()
          if (pContent) {
            markdown += pContent + '\n\n'
          }
          break
        case 'hr':
          markdown += '---\n\n'
          break
        case 'br':
          markdown += '\n'
          break
        case 'table':
          // 简单的表格转换
          const rows = el.querySelectorAll('tr')
          rows.forEach((row, idx) => {
            const cells = row.querySelectorAll('td, th')
            const rowText = Array.from(cells).map(cell => cell.textContent?.trim() || '').join(' | ')
            markdown += `| ${rowText} |\n`
            if (idx === 0) {
              const separator = Array.from(cells).map(() => '---').join(' | ')
              markdown += `| ${separator} |\n`
            }
          })
          markdown += '\n'
          break
        default:
          // 递归处理其他标签
          markdown += domToMarkdown(el, depth + 1)
      }
    }
  })

  return markdown
}

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
