import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { textblockTypeInputRule, wrappingInputRule } from '@tiptap/pm/inputrules'

/**
 * Markdown自动格式化扩展
 * 功能：
 * 1. 输入 # + 空格 自动转换为标题
 * 2. 不干扰其他输入（包括回车键）
 */
export const MarkdownAutoFormat = Extension.create({
  name: 'markdownAutoFormat',

  addInputRules() {
    const rules = []

    // 标题输入规则：# ## ### #### ##### ###### + 空格
    for (let i = 1; i <= 6; i++) {
      const hash = '#'.repeat(i)
      rules.push(
        textblockTypeInputRule(
          new RegExp(`^${hash}\\s$`),
          (context) => {
            // 检查schema中是否有heading节点
            if (!context.state.schema.nodes.heading) {
              return null
            }
            return context.state.schema.nodes.heading
          },
          (match) => ({ level: i })
        )
      )
    }

    return rules
  },
})

/**
 * 简化版 - 只保留智能输入转换
 */
export const MarkdownSmartInput = MarkdownAutoFormat
