import type { MermaidDiagramType } from '../utils/mermaidRenderer'

/**
 * Mermaid 图表模板接口
 */
export interface MermaidTemplate {
  /** 图表类型 */
  type: MermaidDiagramType
  /** 名称（多语言） */
  name: {
    zh: string
    en: string
  }
  /** 描述（多语言） */
  description: {
    zh: string
    en: string
  }
  /** 图标名称（lucide-react） */
  icon?: string
  /** 模板代码 */
  template: string
}

/**
 * Mermaid 图表模板集合
 * 支持 14 种图表类型
 */
export const MERMAID_TEMPLATES: MermaidTemplate[] = [
  {
    type: 'flowchart',
    name: { zh: '流程图', en: 'Flowchart' },
    description: {
      zh: '用于表示流程、算法和工作流',
      en: 'Flow diagrams, algorithms and workflows'
    },
    icon: 'Workflow',
    template: `flowchart TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E
    `,
  },
  {
    type: 'sequence',
    name: { zh: '时序图', en: 'Sequence Diagram' },
    description: {
      zh: '展示对象之间的交互顺序',
      en: 'Show interactions between objects'
    },
    icon: 'GitBranch',
    template: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    用户->>系统: 发送请求
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 响应数据
    `,
  },
  {
    type: 'class',
    name: { zh: '类图', en: 'Class Diagram' },
    description: {
      zh: '展示类的结构和关系',
      en: 'Show class structure and relationships'
    },
    icon: 'Package',
    template: `classDiagram
    class Animal {
        +String name
        +int age
        +void eat()
        +void sleep()
    }
    class Dog {
        +String breed
        +void bark()
    }
    class Cat {
        +String color
        +void meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat
    `,
  },
  {
    type: 'state',
    name: { zh: '状态图', en: 'State Diagram' },
    description: {
      zh: '展示对象的状态转换',
      en: 'Show state transitions of an object'
    },
    icon: 'GitCommit',
    template: `stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中 : 开始处理
    处理中 --> 已完成 : 完成
    处理中 --> 已取消 : 取消
    已完成 --> [*]
    已取消 --> [*]
    `,
  },
  {
    type: 'gantt',
    name: { zh: '甘特图', en: 'Gantt Chart' },
    description: {
      zh: '项目进度和时间规划',
      en: 'Project timeline and scheduling'
    },
    icon: 'Calendar',
    template: `gantt
    title 项目进度计划
    dateFormat  YYYY-MM-DD
    section 需求分析
    需求收集       :a1, 2024-01-01, 7d
    需求评审       :a2, after a1, 3d
    section 设计阶段
    架构设计       :2024-01-15, 7d
    详细设计       :2024-01-22, 10d
    section 开发阶段
    前端开发       :2024-02-01, 14d
    后端开发       :2024-02-01, 21d
    `,
  },
  {
    type: 'pie',
    name: { zh: '饼图', en: 'Pie Chart' },
    description: {
      zh: '展示数据占比分布',
      en: 'Show data distribution'
    },
    icon: 'PieChart',
    template: `pie title 数据分布
    "类别A" : 30
    "类别B" : 50
    "类别C" : 20
    `,
  },
  {
    type: 'mindmap',
    name: { zh: '思维导图', en: 'Mind Map' },
    description: {
      zh: '展示层次结构关系',
      en: 'Show hierarchical relationships'
    },
    icon: 'Network',
    template: `mindmap
  root((中心主题))
    分支1
      子分支1
      子分支2
    分支2
      子分支3
      子分支4
    分支3
      子分支5
      子分支6
    `,
  },
  {
    type: 'er',
    name: { zh: 'ER图', en: 'ER Diagram' },
    description: {
      zh: '实体关系图，用于数据库设计',
      en: 'Entity-Relationship diagrams'
    },
    icon: 'Database',
    template: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER }|..|{ DELIVERY_ADDRESS : uses
    `,
  },
  {
    type: 'git',
    name: { zh: 'Git图', en: 'Git Graph' },
    description: {
      zh: '展示 Git 提交历史',
      en: 'Show Git commit history'
    },
    icon: 'GitBranch',
    template: `gitGraph
    commit id: "Initial commit"
    commit id: "Add feature"
    branch develop
    checkout develop
    commit id: "Bug fix"
    checkout main
    merge develop
    commit id: "Hotfix"
    `,
  },
  {
    type: 'timeline',
    name: { zh: '时间线', en: 'Timeline' },
    description: {
      zh: '按时间顺序展示事件',
      en: 'Chronological display of events'
    },
    icon: 'Clock',
    template: `timeline
    title 项目里程碑
    2024-01-01 : 项目启动
    2024-02-01 : 需求分析完成
    2024-03-01 : 设计阶段完成
    2024-04-01 : 开发阶段完成
    2024-05-01 : 测试阶段完成
    2024-06-01 : 项目正式上线
    `,
  },
  {
    type: 'journey',
    name: { zh: '用户旅程', en: 'User Journey' },
    description: {
      zh: '展示用户体验旅程',
      en: 'Show user experience journey'
    },
    icon: 'Footprints',
    template: `journey
    title 用户购物体验
    section 浏览商品
      浏览首页: 5: 用户
      搜索商品: 3: 用户
      查看详情: 4: 用户
    section 下单购买
      加入购物车: 3: 用户
      填写地址: 2: 用户
      选择支付: 4: 用户
      完成支付: 3: 用户
    `,
  },
  {
    type: 'quadrant',
    name: { zh: '四象限图', en: 'Quadrant Chart' },
    description: {
      zh: '技术评估和优先级矩阵',
      en: 'Technology evaluation matrix'
    },
    icon: 'LayoutGrid',
    template: `quadrantChart
    title Tech Evaluation Matrix
    x-axis Technical Complexity --> High
    y-axis Business Value --> High
    quadrant-1 Priority 1
    quadrant-2 Priority 2
    quadrant-3 Priority 3
    quadrant-4 Priority 4
    "React": [0.3, 0.8]
    "Vue": [0.2, 0.6]
    "Angular": [0.8, 0.4]
    `,
  },
  {
    type: 'c4',
    name: { zh: 'C4架构图', en: 'C4 Diagram' },
    description: {
      zh: '系统架构上下文图',
      en: 'System architecture context diagram'
    },
    icon: 'Building',
    template: `C4Context
    title 系统架构图
    Person(user, "用户", "系统用户")
    System(system, "订单系统", "处理订单业务逻辑")
    System_Ext(payment, "支付网关", "第三方支付服务")
    System_Ext(inventory, "库存系统", "管理商品库存")
    Rel(user, system, "使用")
    Rel(system, payment, "调用")
    Rel(system, inventory, "查询")
    `,
  },
  {
    type: 'requirement',
    name: { zh: '需求图', en: 'Requirement Diagram' },
    description: {
      zh: '展示需求关系和层次',
      en: 'Show requirement relationships'
    },
    icon: 'ListTodo',
    template: `requirementDiagram
    {
      id: 1
      text: User login
      risk: high
    }
    {
      id: 2
      text: Password recovery
      risk: medium
    }
    1 -up-> 2 : includes
    `,
  },
]

/**
 * 根据图表类型获取模板
 *
 * @param type - 图表类型
 * @returns 模板对象，如果未找到则返回流程图模板
 */
export function getTemplateByType(type: MermaidDiagramType): MermaidTemplate {
  return MERMAID_TEMPLATES.find((t) => t.type === type) || MERMAID_TEMPLATES[0]
}

/**
 * 获取所有模板
 *
 * @returns 所有模板数组
 */
export function getAllTemplates(): MermaidTemplate[] {
  return MERMAID_TEMPLATES
}
