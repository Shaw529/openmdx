import React, { useState } from 'react'
import type { CustomMermaidTheme } from '../constants/mermaidThemes'
import { CUSTOM_MERMAID_THEMES, getLightThemes, getDarkThemes } from '../constants/mermaidThemes'

interface MermaidThemeSelectorProps {
  currentThemeId: string
  onThemeChange: (themeId: string) => void
  isDark?: boolean
}

/**
 * Mermaid 主题选择器组件
 *
 * 设计理念：
 * - 使用色块预览展示主题风格
 * - 分类展示浅色和深色主题
 * - 流畅的悬停动画效果
 * - 现代化的视觉设计
 */
export const MermaidThemeSelector: React.FC<MermaidThemeSelectorProps> = ({
  currentThemeId,
  onThemeChange,
  isDark = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>(
    CUSTOM_MERMAID_THEMES.find(t => t.id === currentThemeId)?.colors?.bgMain === '#0f172a' ||
    CUSTOM_MERMAID_THEMES.find(t => t.id === currentThemeId)?.colors?.bgMain === '#0a0a0a' ||
    CUSTOM_MERMAID_THEMES.find(t => t.id === currentThemeId)?.colors?.bgMain === '#0c0f1a' ||
    CUSTOM_MERMAID_THEMES.find(t => t.id === currentThemeId)?.colors?.bgMain === '#171717'
      ? 'dark'
      : 'light'
  )

  const currentTheme = CUSTOM_MERMAID_THEMES.find(t => t.id === currentThemeId)
  const lightThemes = getLightThemes()
  const darkThemes = getDarkThemes()

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          transition-all duration-200
          border shadow-sm
          ${isDark
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }
        `}
        title="选择主题"
      >
        {/* 主题预览色块 */}
        <div className="flex gap-0.5">
          {currentTheme?.preview?.slice(0, 4).map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* 主题名称 */}
        <span className={`text-sm font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {currentTheme?.name?.zh || '主题'}
        </span>

        {/* 下拉箭头 */}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 主题选择面板 */}
          <div
            className={`
              absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl border z-20
              transition-all duration-200
              ${isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 选项卡切换 */}
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setActiveTab('light')}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors rounded-tl-xl
                  ${activeTab === 'light'
                    ? isDark
                      ? 'bg-gray-700 text-white border-b-2 border-indigo-500'
                      : 'bg-gray-50 text-gray-900 border-b-2 border-indigo-500'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                浅色主题
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dark')}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors rounded-tr-xl
                  ${activeTab === 'dark'
                    ? isDark
                      ? 'bg-gray-700 text-white border-b-2 border-indigo-500'
                      : 'bg-gray-50 text-gray-900 border-b-2 border-indigo-500'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                深色主题
              </button>
            </div>

            {/* 主题列表 */}
            <div className="p-3 max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {(activeTab === 'light' ? lightThemes : darkThemes).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      onThemeChange(theme.id)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full p-3 rounded-lg transition-all duration-200
                      ${currentThemeId === theme.id
                        ? isDark
                          ? 'bg-indigo-500/20 border-2 border-indigo-500'
                          : 'bg-indigo-50 border-2 border-indigo-500'
                        : isDark
                          ? 'bg-gray-750 border-2 border-transparent hover:border-gray-600 hover:bg-gray-700'
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-300 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* 主题预览色块 */}
                      <div className="flex gap-1">
                        {theme.preview?.slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-md shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {/* 主题信息 */}
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-semibold ${
                          currentThemeId === theme.id
                            ? isDark
                              ? 'text-indigo-300'
                              : 'text-indigo-700'
                            : isDark
                              ? 'text-gray-200'
                              : 'text-gray-900'
                        }`}>
                          {theme.name.zh}
                        </div>
                        <div className={`text-xs mt-0.5 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {theme.description.zh}
                        </div>
                      </div>

                      {/* 选中标记 */}
                      {currentThemeId === theme.id && (
                        <svg
                          className={`w-5 h-5 ${
                            isDark ? 'text-indigo-400' : 'text-indigo-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 底部提示 */}
            <div className={`px-4 py-2 border-t text-xs ${
              isDark
                ? 'bg-gray-750 border-gray-700 text-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}>
              选择主题即可实时预览效果
            </div>
          </div>
        </>
      )}
    </div>
  )
}
