import { useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { checkElectronAPI } from '../utils/electronAPI'
import { extractFileName, removeFileExtension } from '../utils/fileUtils'
import { processMermaidInHTML } from '../utils/mermaidExportHelper'
import { generateHTMLDocument } from '../styles/exportStyles'

interface UseExportParams {
  content: string
  currentFile: string | null
  resolvedTheme: string
  settings: { pandocPath: string; wordExportFont: string }
}

/** 移除 TipTap 特定的 data-* 属性和类名 */
function normalizeTipTapHTML(html: string): string {
  const temp = document.createElement('div')
  temp.innerHTML = html
  temp.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) el.removeAttribute(attr.name)
    })
    el.classList.remove('ProseMirror', 'ProseMirror-focused')
  })
  return temp.innerHTML
}

/**
 * 导出功能自定义Hook
 * 封装PDF、HTML、Word导出功能
 */
export function useExport({
  content,
  currentFile,
  resolvedTheme,
  settings
}: UseExportParams) {
  const { t, language } = useLanguage()

  /**
   * 导出为PDF
   * 在Electron环境中使用原生PDF导出
   */
  const handleExportPDF = useCallback(async () => {
    // 处理 Mermaid 图表
    const processedContent = await processMermaidInHTML(content, 'pdf')

    if (checkElectronAPI()) {
      // Electron环境：使用原生PDF导出
      const result = await window.electronAPI!.exportPDF()
      if (result.success) {
        alert(t.dialog.exportSuccess + ': ' + result.filePath)
      } else if (!result.canceled && result.error) {
        alert(t.dialog.exportFailed + ': ' + result.error)
      }
    } else {
      // 浏览器环境：使用打印功能
      const fileName = extractFileName(currentFile)
      const baseName = currentFile ? removeFileExtension(fileName, '.md') : 'untitled'

      const normalizedContent = normalizeTipTapHTML(processedContent)
      const htmlDocument = generateHTMLDocument(normalizedContent, baseName, { isDark: resolvedTheme === 'dark', isPrint: true, lang: language })

      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlDocument)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    }
  }, [content, currentFile, resolvedTheme, t.dialog.exportSuccess, t.dialog.exportFailed])

  /**
   * 导出为HTML
   */
  const handleExportHTML = useCallback(async () => {
    // 处理 Mermaid 图表
    const processedContent = await processMermaidInHTML(content, 'html')

    const fileName = extractFileName(currentFile)
    const baseName = removeFileExtension(fileName, '.md')

    const normalizedContent = normalizeTipTapHTML(processedContent)
    const htmlDocument = generateHTMLDocument(normalizedContent, baseName, { isDark: resolvedTheme === 'dark', lang: language })

    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseName || 'untitled'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, currentFile, resolvedTheme])

  /**
   * 导出为Word
   * 浏览器环境：提示使用Electron版本
   */
  const handleExportWord = useCallback(
    async (setShowSettings: (show: boolean) => void) => {
      if (!checkElectronAPI()) {
        alert('Word导出功能需要在Electron桌面应用中使用。\n\n请在开发环境中使用HTML导出，或打包为Electron应用后使用Word导出功能。')
        return
      }

      if (!settings.pandocPath) {
        alert(t.dialog.pandocRequired)
        setShowSettings(true)
        return
      }

      const processedContent = await processMermaidInHTML(content, 'word')
      const fileName = extractFileName(currentFile)
      const baseName = currentFile ? removeFileExtension(fileName, '.md') : '未命名'
      const normalizedContent = normalizeTipTapHTML(processedContent)
      const htmlDocument = generateHTMLDocument(normalizedContent, baseName, { isPrint: true, lang: language })
      const defaultFileName = `${baseName}.docx`

      const result = await window.electronAPI!.showWordSaveDialog(defaultFileName)
      if (result.canceled || !result.filePath) return

      const exportResult = await window.electronAPI!.exportWord(
        result.filePath, htmlDocument, settings.pandocPath, settings.wordExportFont
      )
      if (exportResult.success) {
        alert(t.dialog.exportSuccess + ': ' + exportResult.filePath)
      } else {
        alert(t.dialog.exportFailed + ': ' + exportResult.error)
      }
    },
    [content, currentFile, settings.pandocPath, settings.wordExportFont, t.dialog.pandocRequired, t.dialog.exportSuccess, t.dialog.exportFailed]
  )

  return {
    handleExportPDF,
    handleExportHTML,
    handleExportWord
  }
}
