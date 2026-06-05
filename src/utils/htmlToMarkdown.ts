/**
 * HTML 转 Markdown 工具 - 统一模块
 * 消除 MarkdownCopy.ts (domToMarkdown) 和 useTabs.ts (htmlToMarkdown) 中的重复代码
 */

const MAX_DEPTH = 50

/** 将 DOM 元素递归转换为 Markdown */
export function domToMarkdown(element: HTMLElement, _depth: number = 0): string {
  if (_depth > MAX_DEPTH) return ''

  let markdown = ''

  element.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      markdown += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      switch (tag) {
        case 'h1': markdown += `# ${el.textContent}\n\n`; break
        case 'h2': markdown += `## ${el.textContent}\n\n`; break
        case 'h3': markdown += `### ${el.textContent}\n\n`; break
        case 'h4': markdown += `#### ${el.textContent}\n\n`; break
        case 'h5': markdown += `##### ${el.textContent}\n\n`; break
        case 'h6': markdown += `###### ${el.textContent}\n\n`; break
        case 'strong':
        case 'b':
          markdown += `**${el.textContent}**`
          break
        case 'em':
        case 'i':
          markdown += `*${el.textContent}*`
          break
        case 'code': {
          const codeText = el.textContent || ''
          if (el.parentElement?.tagName === 'PRE') {
            markdown += `\`\`\`${codeText}\`\`\`\n\n`
          } else {
            markdown += `\`${codeText}\``
          }
          break
        }
        case 'pre': {
          const codeEl = el.querySelector('code')
          if (codeEl) {
            const lang = codeEl.className.match(/language-(\w+)/)?.[1] || ''
            markdown += `\`\`\`${lang}\n${codeEl.textContent || ''}\`\`\`\n\n`
          } else {
            markdown += `\`\`\`\n${el.textContent || ''}\`\`\`\n\n`
          }
          break
        }
        case 'blockquote': {
          const quoteContent = domToMarkdown(el, _depth + 1).trim()
          quoteContent.split('\n').forEach(line => {
            markdown += `> ${line}\n`
          })
          markdown += '\n'
          break
        }
        case 'ul':
          el.querySelectorAll(':scope > li').forEach(li => {
            markdown += `- ${domToMarkdown(li as HTMLElement, _depth + 1).trim()}\n`
          })
          markdown += '\n'
          break
        case 'ol':
          el.querySelectorAll(':scope > li').forEach((li, idx) => {
            markdown += `${idx + 1}. ${domToMarkdown(li as HTMLElement, _depth + 1).trim()}\n`
          })
          markdown += '\n'
          break
        case 'li':
          markdown += domToMarkdown(el, _depth + 1).trim()
          break
        case 'a':
          markdown += `[${el.textContent}](${el.getAttribute('href') || ''})`
          break
        case 'p': {
          const pContent = domToMarkdown(el, _depth + 1).trim()
          if (pContent) markdown += pContent + '\n\n'
          break
        }
        case 'hr':
          markdown += '---\n\n'
          break
        case 'br':
          markdown += '\n'
          break
        case 'table': {
          const rows = el.querySelectorAll('tr')
          rows.forEach((row, idx) => {
            const cells = row.querySelectorAll('td, th')
            const rowText = Array.from(cells).map(c => c.textContent?.trim() || '').join(' | ')
            markdown += `| ${rowText} |\n`
            if (idx === 0) {
              markdown += `| ${Array.from(cells).map(() => '---').join(' | ')} |\n`
            }
          })
          markdown += '\n'
          break
        }
        default:
          markdown += domToMarkdown(el, _depth + 1)
      }
    }
  })

  return markdown
}

/** 将 HTML 字符串转换为 Markdown */
export function htmlToMarkdown(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return domToMarkdown(div).trim()
}
