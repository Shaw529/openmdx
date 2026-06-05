import { marked } from './markdown'
import { DOMParser } from '@tiptap/pm/model'
import type { Node as PMNode, Schema } from '@tiptap/pm/model'
import { extractMermaidBlocks } from './mermaidParser'

/**
 * 将包含 mermaid 代码块的 Markdown 转换为 TipTap 节点数组
 * 用于文件打开时正确渲染 mermaid 图表
 *
 * 修复：使用 Schema API 直接创建节点，避免 HTML 解析问题
 */
export function convertMarkdownToTipTapNodes(
  markdownText: string,
  schema: Schema
): PMNode[] {
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
    const nodes: PMNode[] = []
    slice.content.forEach((node: PMNode) => nodes.push(node))
    return nodes
  }

  // 有 mermaid 代码块，需要分别处理
  const contentNodes: PMNode[] = []
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

        slice.content.forEach((node: PMNode) => {
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

      slice.content.forEach((node: PMNode) => {
        contentNodes.push(node)
      })
    }
  }

  return contentNodes
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

export { hasMermaidBlocks } from './mermaidParser'
