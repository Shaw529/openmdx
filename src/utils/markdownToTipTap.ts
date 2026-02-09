import { marked } from 'marked'
import { DOMParser, Fragment, Slice } from '@tiptap/pm/model'

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
 * 同时记录每个代码块在原文中的位置，以保持内容顺序
 */
function extractMermaidBlocks(text: string): MermaidBlock[] {
  const blocks: MermaidBlock[] = []
  // 按 "```" 分割文本
  const parts = text.split('```')

  // 计算每个 "```" 在原文中的位置
  const positions: number[] = []
  let searchPos = 0
  for (let i = 0; i < parts.length - 1; i++) {
    const pos = text.indexOf('```', searchPos)
    if (pos !== -1) {
      positions.push(pos)
      searchPos = pos + 3
    }
  }

  // 遍历每个代码块，使用 mermaidIndex 来跟踪 mermaid 代码块
  let mermaidIndex = 0
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

      // 计算位置：
      // startIndex 指向当前 "```" 的位置（用于分割文本）
      // endIndex 应该指向下一个 "```" 之后的位置（包含结束标记）
      const startIndex = positions[i] // 当前 "```" 的位置
      // 下一个 "```" 的位置 + 3（包含 ``` 本身），这样下一个分割才会从结束标记之后开始
      const endIndex = (positions[i + 1] !== undefined)
        ? positions[i + 1] + 3 // 包含结束的 ``` 标记
        : text.length

      blocks.push({
        content: mermaidContent,
        startIndex,
        endIndex,
        diagramType,
      })

      mermaidIndex++
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

  return 'flowchart'
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
 * 将包含 mermaid 代码块的 Markdown 转换为 TipTap 节点数组
 * 用于文件打开时正确渲染 mermaid 图表
 *
 * 修复：使用 Schema API 直接创建节点，避免 HTML 解析问题
 */
export function convertMarkdownToTipTapNodes(
  markdownText: string,
  schema: any
): any[] {
  // 检测是否包含 mermaid 代码块
  const mermaidBlocks = extractMermaidBlocks(markdownText)

  // 如果没有 mermaid 代码块，转换整个文本为节点
  if (mermaidBlocks.length === 0) {
    const html = convertMarkdownToHTML(markdownText)
    const div = document.createElement('div')
    div.innerHTML = html
    const domParser = schema.domParser || DOMParser.fromSchema(schema)
    const slice = domParser.parseSlice(div)

    // 将 slice 转换为节点数组
    const nodes: any[] = []
    slice.content.forEach((node: any) => nodes.push(node))
    return nodes
  }

  // 有 mermaid 代码块，需要分别处理
  const contentNodes: any[] = []
  let lastIndex = 0

  // 按顺序处理每个 mermaid 代码块和它们之间的内容
  for (let i = 0; i < mermaidBlocks.length; i++) {
    const block = mermaidBlocks[i]

    // 处理 mermaid 代码块之前的普通内容
    if (block.startIndex > lastIndex) {
      const beforeText = markdownText.substring(lastIndex, block.startIndex)
      if (beforeText.trim()) {
        const html = convertMarkdownToHTML(beforeText)
        const div = document.createElement('div')
        div.innerHTML = html
        const domParser = schema.domParser || DOMParser.fromSchema(schema)
        const slice = domParser.parseSlice(div)

        slice.content.forEach((node: any) => {
          contentNodes.push(node)
        })
      }
    }

    // 直接创建 mermaidBlock 节点（与复制粘贴逻辑一致）
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
    if (i < mermaidBlocks.length - 1 || block.endIndex < markdownText.length) {
      const paraNode = schema.nodes.paragraph.create()
      contentNodes.push(paraNode)
    }

    lastIndex = block.endIndex
  }

  // 处理最后一个 mermaid 代码块之后的普通内容
  if (lastIndex < markdownText.length) {
    const afterText = markdownText.substring(lastIndex)
    if (afterText.trim()) {
      const html = convertMarkdownToHTML(afterText)
      const div = document.createElement('div')
      div.innerHTML = html
      const domParser = schema.domParser || DOMParser.fromSchema(schema)
      const slice = domParser.parseSlice(div)

      slice.content.forEach((node: any) => {
        contentNodes.push(node)
      })
    }
  }

  return contentNodes
}

/**
 * 将包含 mermaid 代码块的 Markdown 转换为 TipTap HTML 格式
 * 用于文件打开时正确渲染 mermaid 图表
 * @deprecated 请使用 convertMarkdownToTipTapNodes 代替
 */
export function convertMarkdownToTipTapHTML(
  markdownText: string,
  schema: any
): string {
  // 检测是否包含 mermaid 代码块
  const mermaidBlocks = extractMermaidBlocks(markdownText)

  // 如果没有 mermaid 代码块，直接转换整个文本
  if (mermaidBlocks.length === 0) {
    return convertMarkdownToHTML(markdownText)
  }

  // 有 mermaid 代码块，需要特殊处理
  let lastIndex = 0
  let htmlContent = ''

  // 按顺序处理每个 mermaid 代码块和它们之间的内容
  for (let i = 0; i < mermaidBlocks.length; i++) {
    const block = mermaidBlocks[i]

    // 处理 mermaid 代码块之前的普通内容
    if (block.startIndex > lastIndex) {
      const beforeText = markdownText.substring(lastIndex, block.startIndex)
      htmlContent += convertMarkdownToHTML(beforeText)
    }

    // 创建 mermaid 代码块的 HTML（使用正确的结构）
    htmlContent += `<div data-type="mermaid-block" data-diagram-type="${block.diagramType}" data-view-mode="preview" data-theme="default" class="mermaid-block"><pre class="mermaid-source"><code class="language-mermaid">${escapeHtml(block.content)}</code></pre></div>`

    // 如果不是最后一个 mermaid 块，或者后面还有内容，添加一个空段落
    if (i < mermaidBlocks.length - 1 || block.endIndex < markdownText.length) {
      htmlContent += '<p></p>'
    }

    lastIndex = block.endIndex
  }

  // 处理最后一个 mermaid 代码块之后的普通内容
  if (lastIndex < markdownText.length) {
    const afterText = markdownText.substring(lastIndex)
    htmlContent += convertMarkdownToHTML(afterText)
  }

  return htmlContent
}

/**
 * 将 Markdown 转换为 HTML（不包含 mermaid 处理）
 */
function convertMarkdownToHTML(markdownText: string): string {
  const lines = markdownText.split('\n').filter(line => line.trim())
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

  // 如果是多行且没有块级语法，逐行转换
  if (hasMultipleLines && !hasBlockSyntax) {
    return lines.map(line => marked(line)).join('')
  }

  return marked(markdownText)
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 检查 Markdown 文本是否包含 mermaid 代码块
 */
export function hasMermaidBlocks(text: string): boolean {
  // 与 extractMermaidBlocks 使用一致的正则表达式
  const mermaidRegex = /```mermaid\r?\n(.*?)\r?\n```(?:\r?\n|$)/gs
  return mermaidRegex.test(text)
}
