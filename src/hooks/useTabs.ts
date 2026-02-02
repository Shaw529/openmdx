import { useState, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { checkElectronAPI } from '../utils/electronAPI'
import { confirmUnsavedChanges } from '../utils/dialog'
import { marked } from 'marked'

/**
 * 将 HTML 转换为 Markdown
 */
function htmlToMarkdown(html: string): string {
  // 创建临时 DOM 元素
  const div = document.createElement('div')
  div.innerHTML = html

  // 递归转换 DOM 为 Markdown
  let markdown = ''

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      switch (tag) {
        case 'h1':
          return `# ${el.textContent}\n\n`
        case 'h2':
          return `## ${el.textContent}\n\n`
        case 'h3':
          return `### ${el.textContent}\n\n`
        case 'h4':
          return `#### ${el.textContent}\n\n`
        case 'h5':
          return `##### ${el.textContent}\n\n`
        case 'h6':
          return `###### ${el.textContent}\n\n`
        case 'strong':
        case 'b':
          return `**${el.textContent}**`
        case 'em':
        case 'i':
          return `*${el.textContent}*`
        case 'code':
          const text = el.textContent || ''
          if (el.parentElement?.tagName === 'PRE') {
            return `\`\`\`${text}\`\`\`\n\n`
          } else {
            return `\`${text}\``
          }
        case 'pre':
          const codeEl = el.querySelector('code')
          if (codeEl) {
            const lang = codeEl.className.match(/language-(\w+)/)?.[1] || ''
            return `\`\`\`${lang}\n${codeEl.textContent || ''}\`\`\`\n\n`
          }
          return `\`\`\`\n${el.textContent || ''}\`\`\`\n\n`
        case 'blockquote':
          const quoteContent = Array.from(el.childNodes).map(processNode).join('').trim()
          return quoteContent.split('\n').map(line => `> ${line}`).join('\n') + '\n\n'
        case 'ul':
          return Array.from(el.querySelectorAll(':scope > li')).map(li => {
            return `- ${Array.from(li.childNodes).map(processNode).join('').trim()}`
          }).join('\n') + '\n\n'
        case 'ol':
          return Array.from(el.querySelectorAll(':scope > li')).map((li, idx) => {
            return `${idx + 1}. ${Array.from(li.childNodes).map(processNode).join('').trim()}`
          }).join('\n') + '\n\n'
        case 'li':
          return Array.from(el.childNodes).map(processNode).join('').trim()
        case 'a':
          return `[${el.textContent}](${el.getAttribute('href') || ''})`
        case 'p':
          const pContent = Array.from(el.childNodes).map(processNode).join('').trim()
          return pContent + '\n\n'
        case 'hr':
          return '---\n\n'
        case 'br':
          return '\n'
        case 'table':
          // 简单的表格转换
          const rows = Array.from(el.querySelectorAll('tr'))
          return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'))
            return `| ${cells.map(c => c.textContent?.trim() || '').join(' | ')} |`
          }).join('\n') + '\n\n'
        default:
          return Array.from(el.childNodes).map(processNode).join('')
      }
    }
    return ''
  }

  Array.from(div.childNodes).forEach(node => {
    markdown += processNode(node)
  })

  return markdown.trim()
}

export interface Tab {
  id: string
  title: string
  path: string | null
  content: string
  isModified: boolean
}

interface UseTabsParams {
  onTabChange?: (tab: Tab) => void
}

/**
 * 多文件页签管理Hook
 * 管理多个打开的文件，支持新建、打开、切换、关闭
 */
export function useTabs({ onTabChange }: UseTabsParams = {}) {
  const { t } = useLanguage()
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')

  /**
   * 获取当前活动页签
   */
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  /**
   * 创建新页签
   */
  const createNewTab = useCallback((
    title: string,
    content: string = '',
    path: string | null = null
  ) => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title,
      content,
      path,
      isModified: false
    }

    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    onTabChange?.(newTab)

    return newTab
  }, [onTabChange])

  /**
   * 更新页签内容
   */
  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId) {
        const updated = { ...tab, content, isModified: true }
        if (tabId === activeTabId) {
          onTabChange?.(updated)
        }
        return updated
      }
      return tab
    }))
  }, [activeTabId, onTabChange])

  /**
   * 标记页签为已保存
   */
  const markTabSaved = useCallback((tabId: string, path?: string) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId) {
        const updated = { ...tab, isModified: false, ...(path && { path }) }
        if (tabId === activeTabId) {
          onTabChange?.(updated)
        }
        return updated
      }
      return tab
    }))
  }, [activeTabId, onTabChange])

  /**
   * 新建文件
   */
  const handleNewFile = useCallback(async () => {
    // 检查当前页签是否有未保存的更改
    if (activeTab && activeTab.isModified) {
      if (!confirmUnsavedChanges(t.dialog.unsavedChanges)) {
        return
      }
    }

    // 创建新页签
    const newTab = createNewTab(t.app.untitled || '未命名')
    return newTab
  }, [activeTab, createNewTab, t.dialog.unsavedChanges, t.app.untitled])

  /**
   * 打开文件
   */
  const handleOpenFile = useCallback(async () => {
    if (!checkElectronAPI()) {
      alert('此功能需要在Electron环境中运行')
      return
    }

    // 检查当前页签是否有未保存的更改
    if (activeTab && activeTab.isModified) {
      if (!confirmUnsavedChanges(t.dialog.unsavedChanges)) {
        return
      }
    }

    try {
      const result = await window.electronAPI!.showOpenDialog()
      if (result.canceled || !result.filePaths || !result.filePaths[0]) {
        return
      }

      const filePath = result.filePaths[0]

      // 检查文件是否已经打开
      const existingTab = tabs.find(tab => tab.path === filePath)
      if (existingTab) {
        setActiveTabId(existingTab.id)
        onTabChange?.(existingTab)
        return
      }

      // 读取文件内容
      const fileResult = await window.electronAPI!.readFile(filePath)
      if (!fileResult.success || !fileResult.content) {
        alert(t.dialog.openFailed + ': ' + (fileResult.error || '未知错误'))
        return
      }

      // 提取文件名和扩展名
      const fileName = filePath.split(/[/\\]/).pop() || '未命名'
      const fileExtension = filePath.split('.').pop()?.toLowerCase()

      // 处理 Markdown 文件：转换为 HTML 富文本格式
      let content = fileResult.content
      if (fileExtension === 'md' || fileExtension === 'markdown') {
        try {
          // 使用 marked 将 Markdown 转换为 HTML
          content = marked(content) as string
        } catch (error) {
          console.warn('Markdown 解析失败，使用原始内容:', error)
          // 解析失败时使用原始内容
          content = fileResult.content
        }
      }

      // 创建新页签
      createNewTab(fileName, content, filePath)
    } catch (error) {
      console.error('打开文件失败:', error)
      alert('打开文件失败: ' + (error as Error).message)
    }
  }, [activeTab, tabs, createNewTab, t.dialog.unsavedChanges, t.dialog.openFailed, onTabChange])

  /**
   * 保存文件
   */
  const handleSaveFile = useCallback(async () => {
    if (!activeTab) {
      return null
    }

    if (!checkElectronAPI()) {
      alert('此功能需要在Electron环境中运行')
      return null
    }

    try {
      let filePath = activeTab.path

      // 如果没有路径，显示保存对话框
      if (!filePath) {
        const result = await window.electronAPI!.showSaveDialog()
        if (result.canceled || !result.filePath) {
          return null
        }
        filePath = result.filePath
      }

      // 将 HTML 转换为 Markdown 格式再保存
      const markdown = htmlToMarkdown(activeTab.content)

      // 保存文件（已转换为 Markdown 格式）
      const saveResult = await window.electronAPI!.saveFile(filePath, markdown, false)
      if (!saveResult.success) {
        alert(t.dialog.saveFailed + ': ' + (saveResult.error || '未知错误'))
        return null
      }

      // 更新页签状态
      markTabSaved(activeTab.id, filePath)

      // 如果是新保存的文件，更新标题
      if (!activeTab.path) {
        const fileName = filePath.split(/[/\\]/).pop() || '未命名'
        setTabs(prev => prev.map(tab => {
          if (tab.id === activeTab.id) {
            return { ...tab, title: fileName, path: filePath, isModified: false }
          }
          return tab
        }))
      }

      return filePath
    } catch (error) {
      console.error('保存文件失败:', error)
      alert('保存文件失败: ' + (error as Error).message)
      return null
    }
  }, [activeTab, markTabSaved, t.dialog.saveFailed])

  /**
   * 关闭页签
   */
  const handleCloseTab = useCallback(async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) {
      return
    }

    // 检查是否有未保存的更改
    if (tab.isModified) {
      if (!confirmUnsavedChanges(t.dialog.unsavedChanges)) {
        return
      }
    }

    // 移除页签
    const newTabs = tabs.filter(t => t.id !== tabId)

    // 如果关闭的是当前活动页签，切换到其他页签
    if (tabId === activeTabId) {
      if (newTabs.length > 0) {
        // 尝试切换到右边的页签，如果没有则切换到左边的
        const currentIndex = tabs.findIndex(t => t.id === tabId)
        const nextTab = newTabs[currentIndex] || newTabs[newTabs.length - 1]
        setActiveTabId(nextTab.id)
        onTabChange?.(nextTab)
      } else {
        // 没有页签了，创建一个新的
        const newTab = createNewTab(t.app.untitled || '未命名')
        setActiveTabId(newTab.id)
        onTabChange?.(newTab)
        return
      }
    }

    setTabs(newTabs)
  }, [tabs, activeTabId, createNewTab, t.dialog.unsavedChanges, onTabChange])

  /**
   * 切换页签
   */
  const handleTabClick = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      setActiveTabId(tabId)
      onTabChange?.(tab)
    }
  }, [tabs, onTabChange])

  return {
    tabs,
    activeTab,
    activeTabId,
    handleNewFile,
    handleOpenFile,
    handleSaveFile,
    handleCloseTab,
    handleTabClick,
    updateTabContent
  }
}
