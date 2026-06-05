/**
 * 编辑器导出样式 - 统一模块
 * 供 useExport.ts (HTML/PDF导出) 和 main/index.ts (PDF导出) 共享
 * 修改样式时只需改此处，导出一致生效
 */

export interface ExportStyleOptions {
  isDark?: boolean
  isPrint?: boolean
  lang?: string
  fontFamily?: string
  fontSize?: string
}

/** 生成基础导出样式（非 scoped，直接应用于 h1/h2/p 等元素） */
export function generateBaseStyles(options: ExportStyleOptions = {}): string {
  const {
    isDark = false,
    isPrint = false,
    fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    fontSize = '16px',
  } = options

  const color = isDark ? '#e0e0e0' : '#333'
  const bg = isDark ? '#1f2937' : '#ffffff'
  const codeBg = isDark ? '#3a3a3a' : '#f4f4f4'
  const preBg = isDark ? '#2a2a2a' : '#f4f4f4'
  const blockquoteColor = isDark ? '#aaa' : '#666'
  const hrColor = isDark ? '#444' : '#e0e0e0'
  const thBg = isDark ? '#3a3a3a' : '#f7f7f7'
  const tdBorder = isDark ? '#555' : '#ddd'
  const trHover = isDark ? '#374151' : '#f9fafb'

  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${fontFamily};
      font-size: ${fontSize};
      line-height: 1.8;
      color: ${color};
      background: ${bg};
      padding: 2rem;
      max-width: ${isPrint ? '210mm' : '100%'};
      margin: 0 auto;
      min-height: ${isPrint ? 'auto' : '100vh'};
    }
    h1 { font-size: 2em; font-weight: 700; margin: 1em 0 0.5em; line-height: 1.3; color: ${color}; ${isPrint ? 'page-break-after: avoid;' : ''} }
    h2 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em; line-height: 1.3; color: ${color}; ${isPrint ? 'page-break-after: avoid;' : ''} }
    h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.5em; line-height: 1.3; color: ${color}; ${isPrint ? 'page-break-after: avoid;' : ''} }
    h4, h5, h6 { font-size: 1em; font-weight: 600; margin: 1em 0 0.5em; color: ${color}; ${isPrint ? 'page-break-after: avoid;' : ''} }
    p { margin: 0.5em 0; ${isPrint ? 'orphans: 3; widows: 3;' : ''} }
    ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }
    li { margin: 0.25em 0; }
    blockquote { border-left: 4px solid #4880bd; padding-left: 1em; margin: 1em 0; color: ${blockquoteColor}; font-style: italic; ${isPrint ? 'page-break-inside: avoid;' : ''} }
    code { background: ${codeBg}; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.9em; }
    pre { background: ${preBg}; padding: 1em; border-radius: 4px; overflow-x: auto; margin: 1em 0; ${isPrint ? 'page-break-inside: avoid;' : ''} }
    pre code { background: none; padding: 0; }
    a { color: #4880bd; text-decoration: underline; }
    a:hover { color: #336699; }
    img { max-width: 100%; height: auto; border-radius: 4px; margin: 1em 0; ${isPrint ? 'page-break-inside: avoid;' : ''} }
    hr { border: none; border-top: 2px solid ${hrColor}; margin: 2em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; ${isPrint ? 'page-break-inside: avoid;' : ''} overflow: hidden; border-radius: 4px; }
    td, th { border: 1px solid ${tdBorder}; padding: 0.5em; min-width: 1em; }
    th { background: ${thBg}; font-weight: 600; text-align: left; }
    tr:hover { background: ${trHover}; }
    ${isPrint ? '@media print { body { padding: 0; } h1, h2, h3, h4, h5, h6 { page-break-after: avoid; } img, table, pre, blockquote { page-break-inside: avoid; } }' : ''}
  `
}

/** 生成完整 HTML 文档 */
export function generateHTMLDocument(
  content: string,
  title: string,
  options: ExportStyleOptions = {}
): string {
  const styles = generateBaseStyles(options)
  const lang = options.lang || 'zh-CN'

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${styles}</style>
</head>
<body>
${content}
</body>
</html>`
}
