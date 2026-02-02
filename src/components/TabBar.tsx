import { memo } from 'react'
import { X } from 'lucide-react'

interface Tab {
  id: string
  title: string
  path: string | null
  isModified: boolean
}

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
}

/**
 * 多文件页签组件
 * 显示所有打开的文件，支持切换和关闭
 */
const TabBar = memo(({ tabs, activeTabId, onTabClick, onTabClose }: TabBarProps) => {
  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="flex items-center bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`group flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-gray-200 dark:border-gray-700 min-w-[120px] max-w-[200px] ${
            activeTabId === tab.id
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="flex-1 truncate text-sm">
            {tab.title}
            {tab.isModified && <span className="ml-1 text-orange-500">●</span>}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTabClose(tab.id)
            }}
            className={`opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-opacity ${
              activeTabId === tab.id ? 'opacity-100' : ''
            }`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
})

TabBar.displayName = 'TabBar'

export default TabBar
