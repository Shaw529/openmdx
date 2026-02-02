import zhCN from './zh-CN'
import enUS from './en-US'

export type { Language, Translation } from './types'
import type { Translation } from './types'

const locales: Record<string, Translation> = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export default locales
