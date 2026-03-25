import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { MermaidBlockNodeView } from './MermaidBlockNodeView'
import type { MermaidDiagramType, ExtendedMermaidTheme } from '../utils/mermaidRenderer'

/**
 * MermaidBlock 节点属性
 */
export interface MermaidBlockAttributes {
  diagramType: MermaidDiagramType
  viewMode: 'source' | 'preview' | 'split'
  theme: ExtendedMermaidTheme
  customThemeId?: string // 自定义主题 ID（当 theme 为 'custom' 时使用）
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
        default: 'custom', // 默认使用自定义主题
        parseHTML: element => {
          const theme = element.getAttribute('data-theme')
          return (theme as ExtendedMermaidTheme) || 'custom'
        },
        renderHTML: attributes => ({
          'data-theme': attributes.theme,
        }),
      },
      customThemeId: {
        default: 'modern-light', // 默认使用现代浅色主题
        parseHTML: element => {
          const themeId = element.getAttribute('data-custom-theme-id')
          return themeId || 'modern-light'
        },
        renderHTML: attributes => ({
          'data-custom-theme-id': attributes.customThemeId,
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
          theme: ((element as HTMLElement).getAttribute('data-theme') as ExtendedMermaidTheme) || 'custom',
          customThemeId: (element as HTMLElement).getAttribute('data-custom-theme-id') || 'modern-light',
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
          'data-custom-theme-id': node.attrs.customThemeId || 'modern-light',
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
        theme?: ExtendedMermaidTheme
        customThemeId?: string
      } = {}) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            diagramType: options.diagramType || 'flowchart',
            viewMode: 'source',
            theme: options.theme || 'custom',
            customThemeId: options.customThemeId || 'modern-light',
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
      updateMermaidTheme: (theme: ExtendedMermaidTheme, customThemeId?: string) => ({ commands }) => {
        return commands.updateAttributes(this.name, {
          theme,
          ...(customThemeId ? { customThemeId } : {})
        })
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

