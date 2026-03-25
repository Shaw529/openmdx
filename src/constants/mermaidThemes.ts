/**
 * Mermaid 自定义主题配置
 *
 * 设计理念：
 * - 摆脱 Mermaid 默认的"AI化"风格
 * - 使用精心调配的色板，更符合现代设计美学
 * - 注重视觉层次和阅读舒适度
 */

/**
 * 主题颜色配置
 */
export interface ThemeColors {
  // 主色系
  primary: string
  primaryLight: string
  primaryDark: string

  // 辅助色系
  secondary: string
  secondaryLight: string
  secondaryDark: string

  // 中性色系
  bgMain: string
  bgSecondary: string
  text: string
  textSecondary: string
  border: string

  // 功能色
  success: string
  warning: string
  error: string
  info: string
}

/**
 * Mermaid 主题配置接口
 */
export interface CustomMermaidTheme {
  /** 主题唯一标识 */
  id: string
  /** 主题名称（多语言） */
  name: {
    zh: string
    en: string
  }
  /** 主题描述 */
  description: {
    zh: string
    en: string
  }
  /** 主题预览色 */
  preview: string[]
  /** 颜色配置 */
  colors: ThemeColors
  /** Mermaid themeVariables 配置 */
  themeVariables: Record<string, string>
}

/**
 * 现代化 Mermaid 主题集合
 */
export const CUSTOM_MERMAID_THEMES: CustomMermaidTheme[] = [
  // ========== 浅色主题 ==========

  {
    id: 'modern-light',
    name: { zh: '现代浅色', en: 'Modern Light' },
    description: {
      zh: '清新简洁的浅色主题，适合日常文档',
      en: 'Clean and minimalist light theme for daily documents'
    },
    preview: ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'],
    colors: {
      primary: '#6366f1',
      primaryLight: '#818cf8',
      primaryDark: '#4f46e5',
      secondary: '#8b5cf6',
      secondaryLight: '#a78bfa',
      secondaryDark: '#7c3aed',
      bgMain: '#ffffff',
      bgSecondary: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    themeVariables: {
      // 背景色
      background: '#ffffff',
      primaryColor: '#6366f1',
      primaryTextColor: '#1e293b',
      primaryBorderColor: '#6366f1',

      // 次要颜色
      secondaryColor: '#f1f5f9',
      secondaryTextColor: '#1e293b',
      tertiaryColor: '#f8fafc',

      // 线条
      lineColor: '#6366f1',
      secondaryLineColor: '#8b5cf6',
      tertiaryLineColor: '#a78bfa',

      // 文字
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',

      // 状态图特定
      fillType0: '#e0e7ff',
      fillType1: '#fae8ff',
      fillType2: '#dbeafe',
      fillType3: '#d1fae5',
      fillType4: '#fef3c7',
      fillType5: '#fee2e2',
      fillType6: '#f3e8ff',
      fillType7: '#ecfdf5'
    }
  },

  {
    id: 'ocean',
    name: { zh: '海洋蓝调', en: 'Ocean Blue' },
    description: {
      zh: '灵感来自海洋的蓝色系主题',
      en: 'Ocean-inspired blue color theme'
    },
    preview: ['#0ea5e9', '#06b6d4', '#3b82f6', '#6366f1'],
    colors: {
      primary: '#0ea5e9',
      primaryLight: '#38bdf8',
      primaryDark: '#0284c7',
      secondary: '#06b6d4',
      secondaryLight: '#22d3ee',
      secondaryDark: '#0891b2',
      bgMain: '#f0f9ff',
      bgSecondary: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    themeVariables: {
      background: '#f0f9ff',
      primaryColor: '#0ea5e9',
      primaryTextColor: '#0c4a6e',
      primaryBorderColor: '#0ea5e9',
      secondaryColor: '#e0f2fe',
      secondaryTextColor: '#0c4a6e',
      tertiaryColor: '#f0f9ff',
      lineColor: '#0ea5e9',
      secondaryLineColor: '#06b6d4',
      tertiaryLineColor: '#3b82f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fillType0: '#e0f2fe',
      fillType1: '#cffafe',
      fillType2: '#dbeafe',
      fillType3: '#ecfeff',
      fillType4: '#f0f9ff',
      fillType5: '#e0f7fa',
      fillType6: '#e1f5fe',
      fillType7: '#e3f2fd'
    }
  },

  {
    id: 'forest-walk',
    name: { zh: '森林漫步', en: 'Forest Walk' },
    description: {
      zh: '自然的绿色系主题，清新舒适',
      en: 'Natural green theme for a fresh look'
    },
    preview: ['#22c55e', '#10b981', '#14b8a6', '#84cc16'],
    colors: {
      primary: '#22c55e',
      primaryLight: '#4ade80',
      primaryDark: '#16a34a',
      secondary: '#10b981',
      secondaryLight: '#34d399',
      secondaryDark: '#059669',
      bgMain: '#f0fdf4',
      bgSecondary: '#dcfce7',
      text: '#14532d',
      textSecondary: '#166534',
      border: '#bbf7d0',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    themeVariables: {
      background: '#f0fdf4',
      primaryColor: '#22c55e',
      primaryTextColor: '#14532d',
      primaryBorderColor: '#22c55e',
      secondaryColor: '#dcfce7',
      secondaryTextColor: '#14532d',
      tertiaryColor: '#f0fdf4',
      lineColor: '#22c55e',
      secondaryLineColor: '#10b981',
      tertiaryLineColor: '#14b8a6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fillType0: '#dcfce7',
      fillType1: '#d1fae5',
      fillType2: '#ecfdf5',
      fillType3: '#ccfbf1',
      fillType4: '#f0fdf4',
      fillType5: '#d1fae5',
      fillType6: '#e6fffa',
      fillType7: '#f0fdf4'
    }
  },

  {
    id: 'sunset',
    name: { zh: '日落黄昏', en: 'Sunset Glow' },
    description: {
      zh: '温暖的橙紫渐变主题',
      en: 'Warm orange-purple gradient theme'
    },
    preview: ['#f97316', '#ec4899', '#8b5cf6', '#f59e0b'],
    colors: {
      primary: '#f97316',
      primaryLight: '#fb923c',
      primaryDark: '#ea580c',
      secondary: '#ec4899',
      secondaryLight: '#f472b6',
      secondaryDark: '#db2777',
      bgMain: '#fff7ed',
      bgSecondary: '#ffedd5',
      text: '#431407',
      textSecondary: '#7c2d12',
      border: '#fed7aa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    themeVariables: {
      background: '#fff7ed',
      primaryColor: '#f97316',
      primaryTextColor: '#431407',
      primaryBorderColor: '#f97316',
      secondaryColor: '#ffedd5',
      secondaryTextColor: '#431407',
      tertiaryColor: '#fff7ed',
      lineColor: '#f97316',
      secondaryLineColor: '#ec4899',
      tertiaryLineColor: '#8b5cf6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fillType0: '#ffedd5',
      fillType1: '#fce7f3',
      fillType2: '#ede9fe',
      fillType3: '#fff7ed',
      fillType4: '#ffedd5',
      fillType5: '#fdf4ff',
      fillType6: '#faf5ff',
      fillType7: '#fffbeb'
    }
  },

  // ========== 深色主题 ==========

  {
    id: 'midnight',
    name: { zh: '午夜深邃', en: 'Midnight Deep' },
    description: {
      zh: '优雅的深色主题，适合夜间编辑',
      en: 'Elegant dark theme for night editing'
    },
    preview: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
    colors: {
      primary: '#6366f1',
      primaryLight: '#818cf8',
      primaryDark: '#4f46e5',
      secondary: '#8b5cf6',
      secondaryLight: '#a78bfa',
      secondaryDark: '#7c3aed',
      bgMain: '#0f172a',
      bgSecondary: '#1e293b',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    themeVariables: {
      background: '#0f172a',
      primaryColor: '#6366f1',
      primaryTextColor: '#e2e8f0',
      primaryBorderColor: '#6366f1',
      secondaryColor: '#1e293b',
      secondaryTextColor: '#e2e8f0',
      tertiaryColor: '#0f172a',
      lineColor: '#6366f1',
      secondaryLineColor: '#8b5cf6',
      tertiaryLineColor: '#a78bfa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fillType0: '#1e293b',
      fillType1: '#312e81',
      fillType2: '#1e1b4b',
      fillType3: '#172554',
      fillType4: '#27172e',
      fillType5: '#2a1a2e',
      fillType6: '#1a1625',
      fillType7: '#132126'
    }
  },

  {
    id: 'cyberpunk',
    name: { zh: '赛博朋克', en: 'Cyberpunk Neon' },
    description: {
      zh: '霓虹灯风格的未来感主题',
      en: 'Futuristic neon-lit style theme'
    },
    preview: ['#00ff9f', '#ff00ff', '#00ffff', '#ffff00'],
    colors: {
      primary: '#00ff9f',
      primaryLight: '#00ffaa',
      primaryDark: '#00cc7f',
      secondary: '#ff00ff',
      secondaryLight: '#ff33ff',
      secondaryDark: '#cc00cc',
      bgMain: '#0a0a0a',
      bgSecondary: '#1a1a1a',
      text: '#e0e0e0',
      textSecondary: '#a0a0a0',
      border: '#333333',
      success: '#00ff9f',
      warning: '#ffff00',
      error: '#ff0055',
      info: '#00ffff'
    },
    themeVariables: {
      background: '#0a0a0a',
      primaryColor: '#00ff9f',
      primaryTextColor: '#e0e0e0',
      primaryBorderColor: '#00ff9f',
      secondaryColor: '#1a1a1a',
      secondaryTextColor: '#e0e0e0',
      tertiaryColor: '#0a0a0a',
      lineColor: '#00ff9f',
      secondaryLineColor: '#ff00ff',
      tertiaryLineColor: '#00ffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fillType0: '#1a1a1a',
      fillType1: '#0f1f1f',
      fillType2: '#1f0f1f',
      fillType3: '#0f1f1f',
      fillType4: '#1f1f0f',
      fillType5: '#1f0f0f',
      fillType6: '#0f0f1f',
      fillType7: '#0f1f0f'
    }
  },

  {
    id: 'northern-lights',
    name: { zh: '北极光', en: 'Northern Lights' },
    description: {
      zh: '灵感来自北极光的深色主题',
      en: 'Dark theme inspired by aurora borealis'
    },
    preview: ['#06b6d4', '#8b5cf6', '#10b981', '#f472b6'],
    colors: {
      primary: '#06b6d4',
      primaryLight: '#22d3ee',
      primaryDark: '#0891b2',
      secondary: '#8b5cf6',
      secondaryLight: '#a78bfa',
      secondaryDark: '#7c3aed',
      bgMain: '#0c0f1a',
      bgSecondary: '#131829',
      text: '#e2e8f0',
      textSecondary: '#94a3b8',
      border: '#1e293b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    themeVariables: {
      background: '#0c0f1a',
      primaryColor: '#06b6d4',
      primaryTextColor: '#e2e8f0',
      primaryBorderColor: '#06b6d4',
      secondaryColor: '#131829',
      secondaryTextColor: '#e2e8f0',
      tertiaryColor: '#0c0f1a',
      lineColor: '#06b6d4',
      secondaryLineColor: '#8b5cf6',
      tertiaryLineColor: '#10b981',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fillType0: '#131829',
      fillType1: '#0f172a',
      fillType2: '#1e1b4b',
      fillType3: '#134e4a',
      fillType4: '#27172e',
      fillType5: '#292524',
      fillType6: '#1a1625',
      fillType7: '#132126'
    }
  },

  {
    id: 'warm-coal',
    name: { zh: '暖灰炭黑', en: 'Warm Coal' },
    description: {
      zh: '温暖舒适的深灰主题',
      en: 'Warm and cozy dark gray theme'
    },
    preview: ['#fb923c', '#f97316', '#fbbf24', '#f472b6'],
    colors: {
      primary: '#fb923c',
      primaryLight: '#fdba74',
      primaryDark: '#f97316',
      secondary: '#f97316',
      secondaryLight: '#fb923c',
      secondaryDark: '#ea580c',
      bgMain: '#171717',
      bgSecondary: '#262626',
      text: '#e5e5e5',
      textSecondary: '#a3a3a3',
      border: '#404040',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    themeVariables: {
      background: '#171717',
      primaryColor: '#fb923c',
      primaryTextColor: '#e5e5e5',
      primaryBorderColor: '#fb923c',
      secondaryColor: '#262626',
      secondaryTextColor: '#e5e5e5',
      tertiaryColor: '#171717',
      lineColor: '#fb923c',
      secondaryLineColor: '#f97316',
      tertiaryLineColor: '#fbbf24',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      fillType0: '#262626',
      fillType1: '#292524',
      fillType2: '#27172e',
      fillType3: '#132126',
      fillType4: '#292524',
      fillType5: '#27172e',
      fillType6: '#1c1917',
      fillType7: '#14532d'
    }
  }
]

/**
 * 根据主题 ID 获取主题配置
 */
export function getThemeById(id: string): CustomMermaidTheme | undefined {
  return CUSTOM_MERMAID_THEMES.find(theme => theme.id === id)
}

/**
 * 获取所有浅色主题
 */
export function getLightThemes(): CustomMermaidTheme[] {
  return CUSTOM_MERMAID_THEMES.filter(theme =>
    ['modern-light', 'ocean', 'forest-walk', 'sunset'].includes(theme.id)
  )
}

/**
 * 获取所有深色主题
 */
export function getDarkThemes(): CustomMermaidTheme[] {
  return CUSTOM_MERMAID_THEMES.filter(theme =>
    ['midnight', 'cyberpunk', 'northern-lights', 'warm-coal'].includes(theme.id)
  )
}

/**
 * 根据系统主题推荐默认主题
 */
export function getDefaultTheme(isSystemDark: boolean): CustomMermaidTheme {
  return isSystemDark
    ? getThemeById('midnight')!
    : getThemeById('modern-light')!
}
