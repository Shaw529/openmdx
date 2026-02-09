/**
 * Mermaid 导出辅助工具
 *
 * 用于在导出时处理 Mermaid 图表的渲染
 */

import { renderMermaid } from './mermaidRenderer'

/**
 * 处理 HTML 中的 Mermaid 图表
 * - 将 Mermaid 源码渲染为 SVG
 * - 支持导出为 PDF/HTML/Word
 *
 * @param html - TipTap 生成的 HTML
 * @param format - 导出格式（'pdf' | 'html' | 'word'）
 * @returns 处理后的 HTML
 */
export async function processMermaidInHTML(
  html: string,
  format: 'pdf' | 'html' | 'word' = 'html'
): Promise<string> {
  // 创建临时 DOM 解析 HTML
  const temp = document.createElement('div')
  temp.innerHTML = html

  // 查找所有 Mermaid Block
  const mermaidBlocks = temp.querySelectorAll('[data-type="mermaid-block"]')

  // 处理每个 Mermaid Block
  for (let i = 0; i < mermaidBlocks.length; i++) {
    const block = mermaidBlocks[i] as HTMLElement
    const sourceCodeElement = block.querySelector('.mermaid-source code, textarea')

    if (sourceCodeElement) {
      const sourceCode = sourceCodeElement.textContent || ''
      const diagramType = block.getAttribute('data-diagram-type') || 'flowchart'
      const theme = (block.getAttribute('data-theme') || 'default') as 'default' | 'dark' | 'forest' | 'neutral'

      try {
        // 渲染 Mermaid 为 SVG
        const { svg } = await renderMermaid(
          sourceCode,
          `mermaid-export-${Date.now()}-${i}`,
          theme
        )

        // 创建容器
        const container = document.createElement('div')
        container.className = 'mermaid-diagram-export'
        container.style.cssText = `
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          margin: 1rem 0;
          background: ${format === 'word' ? '#ffffff' : 'transparent'};
        `

        if (format === 'word') {
          // Word 导出：将 SVG 转换为 PNG 图片
          const imageDataUrl = await convertMermaidSvgToImage(svg)
          container.innerHTML = `
            <img src="${imageDataUrl}" alt="Mermaid Diagram" style="max-width: 100%; height: auto;" />
          `
        } else {
          // PDF/HTML 导出：直接嵌入 SVG
          container.innerHTML = svg
        }

        // 替换原始 block
        block.replaceWith(container)
      } catch (error) {
        console.error('Failed to render Mermaid diagram:', error)
        // 渲染失败时显示源码
        const errorContainer = document.createElement('div')
        errorContainer.className = 'mermaid-error'
        errorContainer.style.cssText = `
          padding: 1rem;
          margin: 1rem 0;
          background: #fee;
          border-left: 4px solid #f00;
          color: #c00;
        `
        errorContainer.textContent = `Mermaid 图表渲染失败：${error instanceof Error ? error.message : '未知错误'}`

        // 显示源码
        const pre = document.createElement('pre')
        pre.style.cssText = `
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f5f5f5;
          overflow-x: auto;
        `
        pre.textContent = sourceCode
        errorContainer.appendChild(pre)

        block.replaceWith(errorContainer)
      }
    }
  }

  return temp.innerHTML
}

/**
 * 将 Mermaid SVG 转换为图片数据 URL（用于 Word 导出）
 *
 * @param svgString - SVG 字符串
 * @returns PNG 图片的 Data URL
 */
export async function convertMermaidSvgToImage(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. 从 SVG 中提取准确的尺寸
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgString, 'image/svg+xml')
    const svgElement = doc.querySelector('svg')

    if (!svgElement) {
      reject(new Error('Invalid SVG'))
      return
    }

    // 2. 获取 viewBox 或 width/height
    let width = 800
    let height = 600

    const viewBox = svgElement.getAttribute('viewBox')
    if (viewBox) {
      // viewBox 格式: "min-x min-y width height"
      const parts = viewBox.split(/\s+/).map(Number)
      width = parts[2] || 800
      height = parts[3] || 600
    } else {
      width = parseFloat(svgElement.getAttribute('width') || '800')
      height = parseFloat(svgElement.getAttribute('height') || '600')
    }

    // 3. 使用 Base64 data URL 避免 CORS 问题
    const base64Svg = btoa(unescape(encodeURIComponent(svgString)))
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`

    const img = new Image()

    // 4. 添加 CORS 设置
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const scale = 4 // 4x 缩放大幅提高清晰度

        canvas.width = width * scale
        canvas.height = height * scale

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Failed to get canvas context')
        }

        // 设置缩放并填充白色背景
        ctx.scale(scale, scale)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        // 绘制 SVG
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为高质量 PNG
        const pngDataUrl = canvas.toDataURL('image/png', 1.0)
        resolve(pngDataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = (error) => {
      reject(new Error('Failed to load SVG: ' + error))
    }

    img.src = dataUrl
  })
}
