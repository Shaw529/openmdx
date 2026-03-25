import { Mark } from '@tiptap/core'

/**
 * 搜索高亮标记扩展
 * 用于在查找替换功能中高亮显示匹配文本
 */
export const SearchHighlight = Mark.create({
  name: 'searchHighlight',
  
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'search-highlight',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark.search-highlight',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', { class: `search-highlight ${HTMLAttributes.class || ''}`.trim() }, 0]
  },
})
