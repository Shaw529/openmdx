import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DOMParser, Fragment, Slice } from '@tiptap/pm/model'
import { marked } from 'marked'

/**
 * Mermaid 代码块信息
 */
interface MermaidBlock {
  content: string
  startIndex: number
  endIndex: number
  diagramType: string
}

/**
 * 从文本中提取所有 mermaid 代码块
 * 按 "```" 分割，检查每个代码块的第一行是否为 "mermaid"
 */
function extractMermaidBlocks(text: string): MermaidBlock[] {
  const blocks: MermaidBlock[] = []
  // 按 "```" 分割文本
  const parts = text.split('```')

  // 遍历每个代码块（跳过最后一个，因为 ``` 后面没有内容）
  for (let i = 0; i < parts.length - 1; i++) {
    const content = parts[i + 1] // ``` 之后的内容（代码块内容）

    // 检查 content 的第一行是否是 "mermaid"
    const firstLine = content.trim().split('\n')[0].trim()

    // 如果第一行是 "mermaid"，则这是一个 mermaid 代码块
    if (firstLine === 'mermaid') {
      // 去掉第一行的 "mermaid"，获取实际内容
      const lines = content.split('\n')
      const mermaidContent = lines.slice(1).join('\n').trim()
      const diagramType = detectDiagramType(mermaidContent)

      blocks.push({
        content: mermaidContent,
        startIndex: 0,
        endIndex: mermaidContent.length,
        diagramType,
      })
    }
  }

  return blocks
}

/**
 * 检测 Mermaid 图表类型
 */
function detectDiagramType(content: string): string {
  const typePatterns = [
    { regex: /^graph\s+(?:TD|LR|RL|BT)/im, type: 'flowchart' },
    { regex: /^graph\s+/im, type: 'flowchart' },
    { regex: /^flowchart/im, type: 'flowchart' },
    { regex: /^sequenceDiagram/im, type: 'sequence' },
    { regex: /^classDiagram/im, type: 'class' },
    { regex: /^stateDiagram/im, type: 'state' },
    { regex: /^gantt/im, type: 'gantt' },
    { regex: /^pie/im, type: 'pie' },
    { regex: /^mindmap/im, type: 'mindmap' },
    { regex: /^erDiagram/im, type: 'er' },
    { regex: /^gitGraph/im, type: 'git' },
    { regex: /^timeline/im, type: 'timeline' },
    { regex: /^journey/im, type: 'journey' },
    { regex: /^quadrantChart/im, type: 'quadrant' },
    { regex: /^C4Context/im, type: 'c4' },
    { regex: /^requirementDiagram/im, type: 'requirement' },
  ]

  for (const { regex, type } of typePatterns) {
    if (regex.test(content)) {
      return type
    }
  }

  return 'flowchart' // 默认类型
}

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
            const { schema } = view.state

            // 检测是否包含 mermaid 代码块
            const mermaidBlocks = extractMermaidBlocks(text)

            if (mermaidBlocks.length === 0) {
              // 没有 mermaid 代码块，使用原有逻辑
              return pasteMarkdown(view, text, schema)
            }

            // 有 mermaid 代码块，分割文本并分别处理
            pasteMarkdownWithMermaid(view, text, mermaidBlocks, schema)

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

/**
 * 粘贴普通 Markdown（不包含 mermaid）
 */
function pasteMarkdown(view: any, text: string, schema: any): boolean {
  try {
    // 先用 marked 转换
    let html = marked(text)

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
    console.error('[ClipboardTextParser] Paste markdown error:', error)
    return false
  }
}

/**
 * 粘贴包含 mermaid 代码块的 Markdown
 * 自动识别 ```mermaid 代码块并转换为 MermaidBlock 节点
 */
function pasteMarkdownWithMermaid(
  view: any,
  text: string,
  mermaidBlocks: MermaidBlock[],
  schema: any
): boolean {
  try {
    let lastIndex = 0
    const contentNodes: any[] = []

    // 按顺序处理每个 mermaid 代码块和它们之间的内容
    for (let i = 0; i < mermaidBlocks.length; i++) {
      const block = mermaidBlocks[i]

      // 处理 mermaid 代码块之前的普通内容
      if (block.startIndex > lastIndex) {
        const beforeText = text.substring(lastIndex, block.startIndex)
        if (beforeText.trim()) {
          const html = marked(beforeText)
          const div = document.createElement('div')
          div.innerHTML = html
          const domParser = schema.domParser || DOMParser.fromSchema(schema)
          const slice = domParser.parseSlice(div)

          // 将 slice 的内容转换为节点数组
          slice.content.forEach((node: any) => {
            contentNodes.push(node)
          })
        }
      }

      // 创建 mermaid 代码块节点
      const mermaidNode = schema.nodes.mermaidBlock.create(
        {
          diagramType: block.diagramType,
          viewMode: 'preview',
          theme: 'default',
        },
        [schema.text(block.content)]
      )
      contentNodes.push(mermaidNode)

      // 如果不是最后一个 mermaid 块，或者后面还有内容，添加一个空段落
      if (i < mermaidBlocks.length - 1 || block.endIndex < text.length) {
        const paraNode = schema.nodes.paragraph.create()
        contentNodes.push(paraNode)
      }

      lastIndex = block.endIndex
    }

    // 处理最后一个 mermaid 代码块之后的普通内容
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex)
      if (afterText.trim()) {
        const html = marked(afterText)
        const div = document.createElement('div')
        div.innerHTML = html
        const domParser = schema.domParser || DOMParser.fromSchema(schema)
        const slice = domParser.parseSlice(div)

        // 将 slice 的内容转换为节点数组
        slice.content.forEach((node: any) => {
          contentNodes.push(node)
        })
      }
    }

    // 一次性插入所有内容
    if (contentNodes.length > 0) {
      let tr = view.state.tr

      // 为每个节点创建独立的插入操作
      contentNodes.forEach((node) => {
        const slice = new Slice(Fragment.from(node), 0, 0)
        tr = tr.replaceSelection(slice)
      })

      view.dispatch(tr)
    }

    return true
  } catch (error) {
    console.error('[ClipboardTextParser] Paste with mermaid error:', error)
    return false
  }
}
