import { Mark } from '@tiptap/core'

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
      { tag: 'span.search-highlight' },
      { tag: 'mark.search-highlight' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { class: `search-highlight ${HTMLAttributes.class || ''}`.trim() }, 0]
  },
})
