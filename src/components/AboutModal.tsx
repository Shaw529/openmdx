import { useLanguage } from '../contexts/LanguageContext'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * 关于 OpenMDtx 对话框
 */
export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useLanguage()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white text-center">
          <h1 className="text-4xl font-bold mb-2">OpenMDtx</h1>
          <p className="text-xl opacity-90">{t.app.version}</p>
          <p className="text-sm mt-2 opacity-75">强大的 Markdown 编辑器</p>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 项目描述 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">✨ 项目简介</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              OpenMDtx 是一个基于 Electron + React + TipTap 构建的现代化 Markdown 编辑器。
              它提供了所见即所得的编辑体验，支持多文件管理、实时大纲、语法高亮等功能，
              让 Markdown 编辑变得更加高效和愉悦。
            </p>
          </section>

          {/* 核心特性 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">📝 核心特性</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700 dark:text-gray-300">所见即所得编辑</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700 dark:text-gray-300">多文件页签管理</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700 dark:text-gray-300">实时大纲预览</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700 dark:text-gray-300">语法高亮（100+ 语言）</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700 dark:text-gray-300">PDF/HTML/Word 导出</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700 dark:text-gray-300">多语言界面</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700 dark:text-gray-300">主题切换（浅/深/系统）</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-gray-700 dark:text-gray-300">Pandoc 智能集成</span>
              </div>
            </div>
          </section>

          {/* 技术栈 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">🛠️ 技术栈</h2>
            <div className="flex flex-wrap gap-2">
              <TechBadge name="Electron 40.1.0" color="#999999" />
              <TechBadge name="React 19.2.0" color="#61DAFB" />
              <TechBadge name="TipTap 3.18.0" color="#6B42F4" />
              <TechBadge name="TypeScript 5.9.3" color="#3178C6" />
              <TechBadge name="Tailwind CSS" color="#06B6D4" />
              <TechBadge name="Vite 7.2.4" color="#646CFF" />
            </div>
          </section>

          {/* 系统信息 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">💻 系统信息</h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">版本号：</span>
                <span className="text-gray-900 dark:text-white font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">发布日期：</span>
                <span className="text-gray-900 dark:text-white">2025-02-01</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">开源协议：</span>
                <span className="text-gray-900 dark:text-white">MIT License</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">作者：</span>
                <span className="text-gray-900 dark:text-white">xiaoq16</span>
              </div>
            </div>
          </section>

          {/* 许可证 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">📄 许可证</h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed max-h-32 overflow-y-auto">
              <p className="mb-2">MIT License</p>
              <p className="mb-2">Copyright (c) 2025 xiaoq16</p>
              <p>
                本软件按"原样"提供，不提供任何形式的明示或暗示保证。
                您可以自由使用、修改、分发本软件。
              </p>
            </div>
          </section>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 技术标签组件
 */
function TechBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  )
}
