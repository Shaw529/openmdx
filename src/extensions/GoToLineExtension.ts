import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

export const GoToLineExtension = Extension.create({
  name: 'goToLine',

  addCommands() {
    return {
      goToLine: (lineNumber: number) => ({ editor }) => {
        const doc = editor.state.doc
        const totalBlocks = doc.childCount
        const targetBlock = Math.max(1, Math.min(lineNumber, totalBlocks))

        const block = doc.child(targetBlock - 1)
        if (!block) return false

        let blockPos = 0
        for (let i = 0; i < targetBlock - 1; i++) {
          blockPos += doc.child(i).nodeSize
        }

        const tr = editor.state.tr
        const resolved = editor.state.doc.resolve(blockPos)
        tr.setSelection(TextSelection.near(resolved))
        editor.view.dispatch(tr)
        editor.view.focus()

        setTimeout(() => {
          const domNode = editor.view.nodeDOM(blockPos)
          if (domNode) {
            domNode.scrollIntoView({ block: 'center', behavior: 'smooth' })
          }
        }, 10)

        return true
      },

      getTotalLines: () => ({ editor }) => {
        return editor.state.doc.childCount
      },
    }
  },
})
