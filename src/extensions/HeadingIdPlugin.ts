import { Plugin } from '@tiptap/pm/state'
import { Extension } from '@tiptap/core'

/**
 * 标题 ID 插件
 * 在编辑时自动为标题分配唯一 ID
 */
export const HeadingIdPlugin = Extension.create({
  name: 'headingIdPlugin',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          // 只在文档内容发生变化时处理
          const docChanged = transactions.some(tr => tr.docChanged)
          if (!docChanged) {
            return
          }

          const tr = newState.tr
          let modified = false
          const headingIds = new Set<string>()

          // 遍历文档中的所有标题节点
          newState.doc.descendants((node, pos) => {
            if (node.type.name !== 'heading') {
              return
            }

            const currentId = node.attrs.id as string | undefined

            // 如果已经有 ID，确保其唯一性
            if (currentId) {
              if (headingIds.has(currentId)) {
                // ID 重复，生成新 ID
                const newId = generateHeadingId()
                tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  id: newId,
                })
                modified = true
                headingIds.add(newId)
              } else {
                headingIds.add(currentId)
              }
            } else {
              // 没有 ID，生成新 ID
              const newId = generateHeadingId()
              tr.setNodeMarkup(pos, null, {
                ...node.attrs,
                id: newId,
              })
              modified = true
              headingIds.add(newId)
            }
          })

          return modified ? tr : undefined
        },
      }),
    ]
  },
})

/**
 * 生成唯一的标题 ID
 */
function generateHeadingId(): string {
  return `heading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default HeadingIdPlugin
