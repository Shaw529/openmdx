import { Heading } from '@tiptap/extension-heading'
import { mergeAttributes } from '@tiptap/core'

/**
 * 自定义标题扩展
 * 为每个标题添加唯一的 ID 属性，支持锚点跳转
 */
export const HeadingWithId = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: element => (element as HTMLElement).getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return {
            'data-id': attributes.id,
            id: attributes.id, // 同时设置 id 和 data-id
          }
        },
      },
    }
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs.level)
      ? node.attrs.level
      : this.options.levels[0]

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'scroll-mt-4 cursor-pointer',
      }),
      0,
    ]
  },
})

export default HeadingWithId
