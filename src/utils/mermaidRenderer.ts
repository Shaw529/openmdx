import mermaid from 'mermaid'

/**
 * Mermaid 图表类型
 * 支持 14 种 Mermaid 图表类型
 */
export type MermaidDiagramType =
  | 'flowchart'     // 流程图
  | 'sequence'      // 时序图
  | 'class'         // 类图
  | 'state'         // 状态图
  | 'gantt'         // 甘特图
  | 'pie'           // 饼图
  | 'mindmap'       // 思维导图
  | 'er'            // ER图
  | 'git'           // Git图
  | 'timeline'      // 时间线
  | 'journey'       // 用户旅程
  | 'quadrant'      // 四象限图
  | 'c4'            // C4架构图
  | 'requirement'   // 需求图

/**
 * Mermaid 渲染错误类
 */
export class MermaidRenderError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message)
    this.name = 'MermaidRenderError'
  }
}

/**
 * Mermaid 主题类型
 */
export type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral' | 'base' | 'rainbow'

/**
 * Mermaid 主题配置
 */
export interface MermaidThemeConfig {
  value: MermaidTheme
  label: string
  description?: string
}

/**
 * 可用的 Mermaid 主题列表
 */
export const MERMAID_THEMES: MermaidThemeConfig[] = [
  { value: 'default', label: '默认', description: '标准主题' },
  { value: 'dark', label: '暗色', description: '深色背景' },
  { value: 'forest', label: '森林', description: '绿色系' },
  { value: 'neutral', label: '中性', description: '灰白色调' },
  { value: 'base', label: '基础', description: '简洁风格' },
  { value: 'rainbow', label: '彩虹', description: '多彩配色' },
]

/**
 * 初始化 Mermaid
 *
 * @param theme - 主题配置
 */
export function initMermaid(theme: MermaidTheme = 'default'): void {
  mermaid.initialize({
    startOnLoad: false,
    theme,
    logLevel: 0, // 关闭 mermaid 的日志输出
    securityLevel: 'loose', // 允许 HTML
    fontFamily: 'arial',
    fontSize: 16,
    // 启用实验性功能（quadrantChart 和 requirementDiagram 需要）
    quadrantChart: {},
    requirementDiagram: {},
  })
}

/**
 * 渲染 Mermaid 图表为 SVG
 *
 * @param code - Mermaid 代码
 * @param id - 唯一标识符
 * @param theme - 主题
 * @returns SVG 字符串和绑定函数
 * @throws {MermaidRenderError} 渲染失败时抛出
 */
export async function renderMermaid(
  code: string,
  id: string,
  theme: MermaidTheme = 'default'
): Promise<{ svg: string; bindFunctions?: Function }> {
  try {
    // Mermaid 11.x: 动态更改主题需要在每次渲染时重新初始化
    // 先重置 mermaid 实例
    delete (mermaid as any).config

    // 重新初始化并设置主题
    initMermaid(theme)

    // 检测图表类型
    const diagramType = detectDiagramType(code)

    // 对于实验性图表类型（quadrant 和 requirement），跳过验证
    // 因为 parse 方法可能不支持它们
    if (diagramType !== 'quadrant' && diagramType !== 'requirement') {
      // 验证语法
      const isValid = await validateMermaid(code)
      if (!isValid) {
        throw new MermaidRenderError('Invalid Mermaid syntax')
      }
    }

    // 渲染图表
    const { svg } = await mermaid.render(id, code)
    return { svg }
  } catch (error) {
    // 输出详细错误信息到控制台
    console.error('Mermaid render error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw new MermaidRenderError(
      `Failed to render Mermaid diagram: ${error instanceof Error ? error.message : String(error)}`,
      error
    )
  }
}

/**
 * 验证 Mermaid 语法
 *
 * @param code - Mermaid 代码
 * @returns 是否有效
 */
export async function validateMermaid(code: string): Promise<boolean> {
  try {
    if (!code.trim()) {
      return false
    }

    // 初始化（如果尚未初始化）
    if (!mermaid.isInitialized) {
      initMermaid()
    }

    // 使用 parse 方法验证语法
    await mermaid.parse(code)
    return true
  } catch {
    return false
  }
}

/**
 * 检测图表类型
 *
 * @param code - Mermaid 代码
 * @returns 图表类型，如果无法检测则返回 null
 */
export function detectDiagramType(code: string): MermaidDiagramType | null {
  const lines = code.trim().split('\n')
  const firstLine = lines[0]?.trim().toLowerCase() || ''

  // 流程图
  if (firstLine.startsWith('flowchart') || firstLine.startsWith('graph')) {
    return 'flowchart'
  }

  // 时序图
  if (firstLine.startsWith('sequencediagram')) {
    return 'sequence'
  }

  // 类图
  if (firstLine.startsWith('classdiagram')) {
    return 'class'
  }

  // 状态图
  if (firstLine.startsWith('statediagram')) {
    return 'state'
  }

  // 甘特图
  if (firstLine.startsWith('gantt')) {
    return 'gantt'
  }

  // 饼图
  if (firstLine.startsWith('pie')) {
    return 'pie'
  }

  // 思维导图
  if (firstLine.startsWith('mindmap')) {
    return 'mindmap'
  }

  // ER 图
  if (firstLine.startsWith('erdiagram')) {
    return 'er'
  }

  // Git 图
  if (firstLine.startsWith('gitgraph')) {
    return 'git'
  }

  // 时间线
  if (firstLine.startsWith('timeline')) {
    return 'timeline'
  }

  // 用户旅程
  if (firstLine.startsWith('journey')) {
    return 'journey'
  }

  // 四象限图
  if (firstLine.startsWith('quadrantchart')) {
    return 'quadrant'
  }

  // C4 架构图
  if (firstLine.startsWith('c4context') || firstLine.startsWith('c4')) {
    return 'c4'
  }

  // 需求图
  if (firstLine.startsWith('requirementdiagram')) {
    return 'requirement'
  }

  return null
}

/**
 * 获取图表类型的默认模板
 *
 * @param type - 图表类型
 * @returns 默认模板代码
 */
export function getDefaultTemplate(type: MermaidDiagramType): string {
  const templates: Record<MermaidDiagramType, string> = {
    flowchart: `flowchart TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E`,

    sequence: `sequenceDiagram
    participant 用户
    participant 系统
    用户->>系统: 发送请求
    系统-->>用户: 返回响应`,

    class: `classDiagram
    class Animal {
        +String name
        +int age
        +void eat()
    }
    class Dog {
        +void bark()
    }
    Animal <|-- Dog`,

    state: `stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中 : 开始处理
    处理中 --> 已完成 : 完成
    已完成 --> [*]`,

    gantt: `gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 开发
    需求分析    :a1, 2024-01-01, 7d
    设计阶段    :a2, after a1, 7d
    开发阶段    :a3, after a2, 14d`,

    pie: `pie title 数据分布
    "类别A" : 30
    "类别B" : 50
    "类别C" : 20`,

    mindmap: `mindmap
  root((中心主题))
    分支1
      子分支1
      子分支2
    分支2
      子分支3
      子分支4`,

    er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,

    git: `gitGraph
    commit id: "Initial"
    commit id: "Feature"
    branch develop
    checkout develop
    commit id: "Bug fix"
    checkout main
    merge develop`,

    timeline: `timeline
    title 项目里程碑
    2024-01-01 : 项目启动
    2024-02-01 : 需求完成
    2024-03-01 : 开发完成
    2024-04-01 : 项目上线`,

    journey: `journey
    title 用户购物体验
    section 浏览
      浏览商品: 5: 用户
      查看详情: 4: 用户
    section 购买
      加入购物车: 3: 用户
      完成支付: 5: 用户`,

    quadrant: `quadrantChart
    title 技术评估
    x-axis 技术复杂度 --> 高
    y-axis 业务价值 --> 高
    quadrant-1 优先实现
    quadrant-2 考虑实现
    quadrant-3 暂不考虑
    quadrant-4 以后研究
    "React": [0.3, 0.8]
    "Vue": [0.2, 0.6]`,

    c4: `C4Context
    title 系统架构
    Person(user, "用户", "系统用户")
    System(system, "系统", "核心系统")
    System_Ext(external, "外部系统", "第三方服务")
    Rel(user, system, "使用")
    Rel(system, external, "调用")`,

    requirement: `requirementDiagram
    requirement 需求1 {
      id: 1
      text: 用户能够登录
      risk: high
    }
    requirement 需求2 {
      id: 2
      text: 支持数据导出
      risk: medium
    }`,
  }

  return templates[type] || templates.flowchart
}

// 不再在模块加载时初始化，而是在每次渲染时初始化
// 这样可以支持主题动态切换
