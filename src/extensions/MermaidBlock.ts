import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { MermaidBlockNodeView } from './MermaidBlockNodeView'
import type { MermaidDiagramType } from '../utils/mermaidRenderer'

/**
 * MermaidBlock 节点属性
 */
export interface MermaidBlockAttributes {
  diagramType: MermaidDiagramType
  viewMode: 'source' | 'preview' | 'split'
  theme: 'default' | 'dark' | 'forest' | 'neutral' | 'base' | 'rainbow'
}

/**
 * MermaidBlock Node 扩展
 *
 * 功能：
 * - 支持插入和编辑 Mermaid 图表
 * - 三种视图模式：源码、预览、拆分
 * - 支持主题切换
 * - 可选图表类型
 */
export const MermaidBlock = Node.create<MermaidBlockAttributes>({
  name: 'mermaidBlock',

  // 配置选项
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  // 内容模型：纯文本（存储 mermaid 源码）
  content: 'text*',

  // 不允许任何 mark
  marks: '',

  // 作为块级元素
  group: 'block',

  // 代码块类型
  code: true,

  // 定义属性
  addAttributes() {
    return {
      diagramType: {
        default: 'flowchart',
        parseHTML: element => {
          const type = element.getAttribute('data-diagram-type')
          return type as MermaidDiagramType || 'flowchart'
        },
        renderHTML: attributes => ({
          'data-diagram-type': attributes.diagramType,
        }),
      },
      viewMode: {
        default: 'source',
        parseHTML: element => {
          const mode = element.getAttribute('data-view-mode')
          return (mode as MermaidBlockAttributes['viewMode']) || 'source'
        },
        renderHTML: attributes => ({
          'data-view-mode': attributes.viewMode,
        }),
      },
      theme: {
        default: 'default',
        parseHTML: element => {
          const theme = element.getAttribute('data-theme')
          return (theme as MermaidBlockAttributes['theme']) || 'default'
        },
        renderHTML: attributes => ({
          'data-theme': attributes.theme,
        }),
      },
    }
  },

  // 解析 HTML
  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid-block"]',
        getAttrs: element => ({
          diagramType: (element as HTMLElement).getAttribute('data-diagram-type') || 'flowchart',
          viewMode: (element as HTMLElement).getAttribute('data-view-mode') || 'source',
          theme: (element as HTMLElement).getAttribute('data-theme') || 'default',
        }),
      },
    ]
  },

  // 渲染 HTML
  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'mermaid-block',
          'data-diagram-type': node.attrs.diagramType,
          'data-view-mode': node.attrs.viewMode,
          'data-theme': node.attrs.theme,
          class: 'mermaid-block',
        },
        HTMLAttributes
      ),
      [
        'pre',
        { class: 'mermaid-source' },
        [
          'code',
          { class: 'language-mermaid' },
          0, // 内容子节点
        ],
      ],
    ]
  },

  // 添加命令
  addCommands() {
    return {
      /**
       * 插入 Mermaid 图表
       */
      insertMermaidBlock: (options: {
        diagramType?: MermaidDiagramType
        content?: string
        theme?: MermaidBlockAttributes['theme']
      } = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            diagramType: options.diagramType || 'flowchart',
            viewMode: 'source',
            theme: options.theme || 'default',
          },
          content: options.content
            ? [{ type: 'text', text: options.content }]
            : undefined,
        })
      },

      /**
       * 更新 Mermaid 图表类型
       */
      updateMermaidDiagramType: (diagramType: MermaidDiagramType) => ({ commands }) => {
        return commands.updateAttributes(this.name, { diagramType })
      },

      /**
       * 切换视图模式
       */
      toggleMermaidViewMode: (viewMode: MermaidBlockAttributes['viewMode']) => ({ commands }) => {
        return commands.updateAttributes(this.name, { viewMode })
      },

      /**
       * 更新主题
       */
      updateMermaidTheme: (theme: MermaidBlockAttributes['theme']) => ({ commands }) => {
        return commands.updateAttributes(this.name, { theme })
      },
    }
  },

  // 使用 React Node View 渲染
  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlockNodeView, {
      // 自定义内容 DOM 选择器
      contentDOMElementTag: 'div',
      // 不使用默认的 contentDOM
      contentDOMElementClass: 'mermaid-content',
    })
  },
})

