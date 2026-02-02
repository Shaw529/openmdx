import { useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { checkElectronAPI } from '../utils/electronAPI'
import { extractFileName, removeFileExtension } from '../utils/fileUtils'

interface UseExportParams {
  content: string
  currentFile: string | null
  language: string
  resolvedTheme: string
  settings: { pandocPath: string }
}

/**
 * 将 TipTap HTML 转换为标准 HTML
 * 移除 TipTap 特定的类名和属性，保留核心内容
 */
function normalizeTipTapHTML(html: string): string {
  // 创建临时 DOM 元素解析 HTML
  const temp = document.createElement('div')
  temp.innerHTML = html

  // 移除所有 data-* 属性和 TipTap 特定的类
  const allElements = temp.querySelectorAll('*')
  allElements.forEach(el => {
    // 移除所有 data-* 属性
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        el.removeAttribute(attr.name)
      }
    })

    // 移除 TipTap 特定的类
    el.classList.remove('ProseMirror', 'ProseMirror-focused')
  })

  return temp.innerHTML
}

/**
 * 生成与编辑器样式完全一致的 HTML 文档（所见即所得）
 */
function generateHTMLDocument(content: string, title: string, isPrint: boolean = false, theme: string = 'light', lang: string = 'en'): string {
  const normalizedContent = normalizeTipTapHTML(content)
  const isDark = theme === 'dark'

  // 使用与编辑器 index.css 完全相同的样式
  const styles = isPrint ? `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      padding: 2rem;
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
    }
    h1 {
      font-size: 2em;
      font-weight: 700;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      page-break-after: avoid;
    }
    h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      page-break-after: avoid;
    }
    h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      page-break-after: avoid;
    }
    h4, h5, h6 {
      font-size: 1em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      page-break-after: avoid;
    }
    p { margin: 0.5em 0; orphans: 3; widows: 3; }
    ul, ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }
    blockquote {
      border-left: 4px solid #4880bd;
      padding-left: 1em;
      margin: 1em 0;
      color: #666;
      font-style: italic;
      page-break-inside: avoid;
    }
    code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    pre code {
      background: none;
      padding: 0;
    }
    a {
      color: #4880bd;
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    hr {
      border: none;
      border-top: 2px solid #e0e0e0;
      margin: 2em 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    td, th {
      border: 1px solid #ddd;
      padding: 0.5em;
      min-width: 1em;
    }
    th {
      background: #f7f7f7;
      font-weight: 600;
      text-align: left;
    }
    @media print {
      body { padding: 0; }
      h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
      img, table, pre, blockquote { page-break-inside: avoid; }
    }
  ` : `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.8;
      color: ${isDark ? '#e0e0e0' : '#333'};
      background: ${isDark ? '#1f2937' : '#ffffff'};
      padding: 2rem;
      max-width: 100%;
      min-height: 100vh;
    }
    h1 {
      font-size: 2em;
      font-weight: 700;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      color: ${isDark ? '#e0e0e0' : '#333'};
    }
    h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      color: ${isDark ? '#e0e0e0' : '#333'};
    }
    h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      color: ${isDark ? '#e0e0e0' : '#333'};
    }
    h4, h5, h6 {
      font-size: 1em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      color: ${isDark ? '#e0e0e0' : '#333'};
    }
    p { margin: 0.5em 0; }
    ul, ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }
    blockquote {
      border-left: 4px solid #4880bd;
      padding-left: 1em;
      margin: 1em 0;
      color: ${isDark ? '#aaa' : '#666'};
      font-style: italic;
    }
    code {
      background: ${isDark ? '#3a3a3a' : '#f4f4f4'};
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
    }
    pre {
      background: ${isDark ? '#2a2a2a' : '#f4f4f4'};
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
      margin: 1em 0;
    }
    pre code {
      background: none;
      padding: 0;
    }
    a {
      color: #4880bd;
      text-decoration: underline;
    }
    a:hover {
      color: #336699;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 1em 0;
    }
    hr {
      border: none;
      border-top: 2px solid ${isDark ? '#444' : '#e0e0e0'};
      margin: 2em 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      overflow: hidden;
      border-radius: 4px;
    }
    td, th {
      border: 1px solid ${isDark ? '#555' : '#ddd'};
      padding: 0.5em;
      min-width: 1em;
    }
    th {
      background: ${isDark ? '#3a3a3a' : '#f7f7f7'};
      font-weight: 600;
      text-align: left;
    }
    tr:hover {
      background: ${isDark ? '#374151' : '#f9fafb'};
    }
  `

  return `<!DOCTYPE html>
<html lang="${lang === 'zh-CN' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${styles}</style>
</head>
<body>
${normalizedContent}
</body>
</html>`
}

/**
 * 导出功能自定义Hook
 * 封装PDF、HTML、Word导出功能
 */
export function useExport({
  content,
  currentFile,
  language,
  resolvedTheme,
  settings
}: UseExportParams) {
  const { t } = useLanguage()

  /**
   * 导出为PDF
   * 在Electron环境中使用原生PDF导出
   */
  const handleExportPDF = useCallback(async () => {
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

      const htmlDocument = generateHTMLDocument(content, baseName, true, resolvedTheme, language)

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
  }, [content, currentFile, resolvedTheme, language, t.dialog.exportSuccess, t.dialog.exportFailed])

  /**
   * 导出为HTML
   */
  const handleExportHTML = useCallback(() => {
    const fileName = extractFileName(currentFile)
    const baseName = removeFileExtension(fileName, '.md')

    const htmlDocument = generateHTMLDocument(content, baseName, false, resolvedTheme, language)

    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseName || 'untitled'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, currentFile, resolvedTheme, language])

  /**
   * 导出为Word
   * 浏览器环境：提示使用Electron版本
   */
  const handleExportWord = useCallback(
    () => {
      return async (setShowSettings: (show: boolean) => void) => {
        if (!checkElectronAPI()) {
          // 浏览器环境：给出友好提示
          alert('Word导出功能需要在Electron桌面应用中使用。\n\n请在开发环境中使用HTML导出，或打包为Electron应用后使用Word导出功能。')
          return
        }

        if (!settings.pandocPath) {
          alert(t.dialog.pandocRequired)
          setShowSettings(true)
          return
        }

        // 生成标准 HTML 文档（使用打印样式，浅色主题）
        const fileName = extractFileName(currentFile)
        const baseName = currentFile ? removeFileExtension(fileName, '.md') : '未命名'
        const htmlDocument = generateHTMLDocument(content, baseName, true, 'light', language)

        const defaultFileName = `${baseName}.docx`

        // 使用专门的Word保存对话框，包含默认文件名
        const result = await window.electronAPI!.showWordSaveDialog(defaultFileName)
        if (result.canceled || !result.filePath) {
          return
        }

        const exportResult = await window.electronAPI!.exportWord(
          result.filePath,
          htmlDocument,
          settings.pandocPath
        )
        if (exportResult.success) {
          alert(t.dialog.exportSuccess + ': ' + exportResult.filePath)
        } else {
          alert(t.dialog.exportFailed + ': ' + exportResult.error)
        }
      }
    },
    [content, currentFile, settings.pandocPath, language, t.dialog.pandocRequired, t.dialog.exportSuccess, t.dialog.exportFailed]
  )

  return {
    handleExportPDF,
    handleExportHTML,
    handleExportWord
  }
}
