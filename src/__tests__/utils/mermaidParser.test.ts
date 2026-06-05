import { describe, it, expect } from 'vitest'
import { extractMermaidBlocks, detectDiagramType, hasMarkdownSyntax, hasMermaidBlocks } from '../../utils/mermaidParser'
import type { MermaidBlock } from '../../utils/mermaidParser'

describe('detectDiagramType', () => {
  it('识别 flowchart 类型', () => {
    expect(detectDiagramType('flowchart TD\n  A --> B')).toBe('flowchart')
    expect(detectDiagramType('graph LR\n  A --> B')).toBe('flowchart')
    expect(detectDiagramType('graph TD\n  A --> B')).toBe('flowchart')
  })

  it('识别 sequenceDiagram 类型', () => {
    expect(detectDiagramType('sequenceDiagram\n  A->>B: hello')).toBe('sequence')
  })

  it('识别 classDiagram 类型', () => {
    expect(detectDiagramType('classDiagram\n  class Animal')).toBe('class')
  })

  it('识别 stateDiagram 类型', () => {
    expect(detectDiagramType('stateDiagram\n  [*] --> Idle')).toBe('state')
  })

  it('识别 gantt 类型', () => {
    expect(detectDiagramType('gantt\n  title 计划')).toBe('gantt')
  })

  it('识别 pie 类型', () => {
    expect(detectDiagramType('pie title 分布\n  "A": 30')).toBe('pie')
  })

  it('识别 mindmap 类型', () => {
    expect(detectDiagramType('mindmap\n  root(中心)')).toBe('mindmap')
  })

  it('识别 erDiagram 类型', () => {
    expect(detectDiagramType('erDiagram\n  CUSTOMER ||--o{ ORDER : places')).toBe('er')
  })

  it('识别 gitGraph 类型', () => {
    expect(detectDiagramType('gitGraph\n  commit id: "init"')).toBe('git')
  })

  it('识别 timeline 类型', () => {
    expect(detectDiagramType('timeline\n  title 历史')).toBe('timeline')
  })

  it('识别 journey 类型', () => {
    expect(detectDiagramType('journey\n  title 用户旅程')).toBe('journey')
  })

  it('识别 quadrantChart 类型', () => {
    expect(detectDiagramType('quadrantChart\n  x-axis 复杂度')).toBe('quadrant')
  })

  it('识别 c4 类型', () => {
    expect(detectDiagramType('C4Context\n  Person(user, "用户")')).toBe('c4')
  })

  it('识别 requirementDiagram 类型', () => {
    expect(detectDiagramType('requirementDiagram\n  requirement 需求1')).toBe('requirement')
  })

  it('无法识别时返回 null', () => {
    expect(detectDiagramType('unknown type')).toBeNull()
  })

  it('空内容返回 null', () => {
    expect(detectDiagramType('')).toBeNull()
  })

  it('忽略大小写匹配', () => {
    expect(detectDiagramType('FLOWCHART TD\n  A --> B')).toBe('flowchart')
    expect(detectDiagramType('Sequencediagram\n  A->>B')).toBe('sequence')
  })
})

describe('extractMermaidBlocks', () => {
  it('从文本中提取单个 mermaid 代码块', () => {
    const text = '```mermaid\nflowchart TD\n  A --> B\n```'
    const blocks = extractMermaidBlocks(text)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].diagramType).toBe('flowchart')
    expect(blocks[0].content).toBe('flowchart TD\n  A --> B')
    expect(blocks[0].startIndex).toBe(0)
    expect(blocks[0].endIndex).toBe(text.length)
  })

  it('从文本中提取多个 mermaid 代码块', () => {
    const text = '```mermaid\nflowchart TD\n  A --> B\n```\n\n```mermaid\nsequenceDiagram\n  A->>B\n```'
    const blocks = extractMermaidBlocks(text)

    expect(blocks).toHaveLength(2)
    expect(blocks[0].diagramType).toBe('flowchart')
    expect(blocks[1].diagramType).toBe('sequence')
  })

  it('mermaid 代码块之间的文本保留位置信息', () => {
    const before = '这是一段文本\n'
    const mermaid = '```mermaid\nflowchart TD\n  A --> B\n```'
    const after = '\n更多文本'
    const text = before + mermaid + after
    const blocks = extractMermaidBlocks(text)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].startIndex).toBe(before.length)
    expect(blocks[0].endIndex).toBe(before.length + mermaid.length)
  })

  it('不提取普通代码块', () => {
    const text = '```javascript\nconsole.log("hello")\n```'
    const blocks = extractMermaidBlocks(text)

    expect(blocks).toHaveLength(0)
  })

  it('普通代码块中的反引号不影响 mermaid 解析', () => {
    const text = '```javascript\nconst x = "```"\n```\n\n```mermaid\nflowchart TD\n  A --> B\n```'
    const blocks = extractMermaidBlocks(text)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].diagramType).toBe('flowchart')
  })

  it('不包含 mermaid 代码块时返回空数组', () => {
    expect(extractMermaidBlocks('')).toHaveLength(0)
    expect(extractMermaidBlocks('plain text')).toHaveLength(0)
  })

  it('支持 Windows 换行符 (\\r\\n)', () => {
    const text = '```mermaid\r\nflowchart TD\r\n  A --> B\r\n```'
    const blocks = extractMermaidBlocks(text)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].diagramType).toBe('flowchart')
  })

  it('空 mermaid 代码块', () => {
    const text = '```mermaid\n\n```'
    const blocks = extractMermaidBlocks(text)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].content).toBe('')
  })
})

describe('hasMarkdownSyntax', () => {
  it('检测到标题语法', () => {
    expect(hasMarkdownSyntax('# 标题')).toBe(true)
    expect(hasMarkdownSyntax('## 二级标题')).toBe(true)
  })

  it('检测到粗体语法', () => {
    expect(hasMarkdownSyntax('这是 **粗体** 文本')).toBe(true)
  })

  it('检测到斜体语法', () => {
    expect(hasMarkdownSyntax('这是 *斜体* 文本')).toBe(true)
  })

  it('检测到列表语法', () => {
    expect(hasMarkdownSyntax('- 列表项')).toBe(true)
    expect(hasMarkdownSyntax('1. 有序列表')).toBe(true)
  })

  it('检测到代码块语法', () => {
    expect(hasMarkdownSyntax('```javascript')).toBe(true)
  })

  it('检测到行内代码语法', () => {
    expect(hasMarkdownSyntax('这是 `code` 文本')).toBe(true)
  })

  it('检测到链接语法', () => {
    expect(hasMarkdownSyntax('[链接](url)')).toBe(true)
  })

  it('检测到表格语法', () => {
    expect(hasMarkdownSyntax('| 列1 | 列2 |')).toBe(true)
  })

  it('纯文本不包含 Markdown 语法', () => {
    expect(hasMarkdownSyntax('这是普通文本')).toBe(false)
  })

  it('空文本不包含 Markdown 语法', () => {
    expect(hasMarkdownSyntax('')).toBe(false)
  })
})

describe('hasMermaidBlocks', () => {
  it('检测到 mermaid 代码块', () => {
    expect(hasMermaidBlocks('```mermaid\nflowchart TD\n```')).toBe(true)
  })

  it('未检测到 mermaid 代码块', () => {
    expect(hasMermaidBlocks('```javascript\ncode\n```')).toBe(false)
  })

  it('支持 Windows 换行符', () => {
    expect(hasMermaidBlocks('```mermaid\r\nflowchart TD\r\n```')).toBe(true)
  })
})
