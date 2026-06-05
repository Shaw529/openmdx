/**
 * Mermaid 解析工具 - 统一模块
 * 提供 MermaidDiagramType、detectDiagramType、extractMermaidBlocks、hasMarkdownSyntax
 * 消除 mermaidRenderer.ts / markdownToTipTap.ts / ClipboardTextParser.ts 中的重复代码
 */

/**
 * Mermaid 图表类型
 * 定义在此处以避免 mermaidParser ↔ mermaidRenderer 循环依赖
 */
export type MermaidDiagramType =
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'state'
  | 'gantt'
  | 'pie'
  | 'mindmap'
  | 'er'
  | 'git'
  | 'timeline'
  | 'journey'
  | 'quadrant'
  | 'c4'
  | 'requirement'

/** Mermaid 代码块信息 */
export interface MermaidBlock {
  content: string
  startIndex: number
  endIndex: number
  diagramType: string
}

/** 检测 Mermaid 图表类型 */
export function detectDiagramType(content: string): MermaidDiagramType | null {
  const lines = content.trim().split('\n')
  const firstLine = lines[0]?.trim().toLowerCase() || ''

  if (firstLine.startsWith('flowchart') || firstLine.startsWith('graph')) return 'flowchart'
  if (firstLine.startsWith('sequencediagram')) return 'sequence'
  if (firstLine.startsWith('classdiagram')) return 'class'
  if (firstLine.startsWith('statediagram')) return 'state'
  if (firstLine.startsWith('gantt')) return 'gantt'
  if (firstLine.startsWith('pie')) return 'pie'
  if (firstLine.startsWith('mindmap')) return 'mindmap'
  if (firstLine.startsWith('erdiagram')) return 'er'
  if (firstLine.startsWith('gitgraph')) return 'git'
  if (firstLine.startsWith('timeline')) return 'timeline'
  if (firstLine.startsWith('journey')) return 'journey'
  if (firstLine.startsWith('quadrantchart')) return 'quadrant'
  if (firstLine.startsWith('c4context') || firstLine.startsWith('c4')) return 'c4'
  if (firstLine.startsWith('requirementdiagram')) return 'requirement'

  return null
}

/** 检测文本是否包含Markdown语法 */
export function hasMarkdownSyntax(text: string): boolean {
  const patterns = [
    /^#{1,6}\s/m,
    /\*\*[^*]+\*\*/m,
    /\*[^*]+\*/m,
    /^[-*+]\s/m,
    /^\d+\.\s/m,
    /^>\s/m,
    /`[^`]+`/m,
    /^```/m,
    /\[.*\]\(.*\)/m,
    /^\|.*\|/m,
  ]
  return patterns.some(pattern => pattern.test(text))
}

/**
 * 从文本中提取所有 mermaid 代码块及其位置信息
 * 使用正则精确匹配 ```mermaid...``` 代码块，避免非 mermaid 代码块中的 ``` 干扰解析
 */
export function extractMermaidBlocks(text: string): MermaidBlock[] {
  const blocks: MermaidBlock[] = []
  // 精确匹配 ```mermaid\n...\n``` 结构，不受普通代码块影响
  const regex = /```mermaid\r?\n([\s\S]*?)```/g

  let match
  while ((match = regex.exec(text)) !== null) {
    const rawContent = match[1]
    // 去除内容尾部可能存在的换行符
    const mermaidContent = rawContent.replace(/\r?\n$/, '').trim()
    const diagramType = detectDiagramType(mermaidContent) || 'flowchart'

    blocks.push({
      content: mermaidContent,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      diagramType,
    })
  }

  return blocks
}

/**
 * 检查 Markdown 文本是否包含 mermaid 代码块
 */
export function hasMermaidBlocks(text: string): boolean {
  return /```mermaid\r?\n/.test(text)
}
