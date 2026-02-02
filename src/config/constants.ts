/**
 * 应用常量配置
 */

// 文件扩展名
export const FILE_EXTENSIONS = {
  MARKDOWN: '.md',
  HTML: '.html',
  WORD: '.docx',
  PDF: '.pdf',
  EXE: '.exe' as const
} as const

// 本地存储key前缀
export const STORAGE_KEYS = {
  SETTINGS: 'openmdtx-settings',
  LANGUAGE: 'openmdtx-language',
  THEME: 'openmdtx-theme'
} as const

// 默认值
export const DEFAULTS = {
  LANGUAGE: 'zh-CN' as const,
  THEME: 'system' as const,
  FILE_NAME: '未命名',
  ENCODING: 'utf-8'
} as const

// 支持的语言
export const LANGUAGES = {
  'zh-CN': '简体中文',
  'en-US': 'English'
} as const

// 支持的主题
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

// 类型定义
export type Language = keyof typeof LANGUAGES
export type Theme = typeof THEMES[keyof typeof THEMES]
