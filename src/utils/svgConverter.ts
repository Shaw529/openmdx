/**
 * SVG 转换工具
 *
 * 用于将 Mermaid 渲染的 SVG 转换为 PNG/JPEG 图片
 * 主要用于 Word 导出功能
 */

/**
 * SVG 转换选项
 */
export interface SvgToImageOptions {
  /** 宽度（像素） */
  width?: number
  /** 高度（像素） */
  height?: number
  /** 缩放比例（用于提高清晰度） */
  scale?: number
  /** 背景颜色（PNG 透明，JPEG 白色） */
  backgroundColor?: string
}

/**
 * 将 SVG 字符串转换为 PNG Blob
 *
 * @param svgString - SVG 字符串
 * @param options - 转换选项
 * @returns PNG Blob
 * @throws {Error} 转换失败时抛出
 */
export async function svgToPng(
  svgString: string,
  options: SvgToImageOptions = {}
): Promise<Blob> {
  const {
    width,
    height,
    scale = 2, // 默认 2x 缩放以提高清晰度
    backgroundColor = 'transparent',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svg)

    img.onload = () => {
      try {
        // 创建 Canvas
        const canvas = document.createElement('canvas')
        const imgWidth = width || img.width || 800
        const imgHeight = height || img.height || 600

        canvas.width = imgWidth * scale
        canvas.height = imgHeight * scale

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Failed to get canvas context')
        }

        // 缩放上下文
        ctx.scale(scale, scale)

        // 绘制背景
        if (backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor
          ctx.fillRect(0, 0, imgWidth, imgHeight)
        }

        // 绘制图片
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight)

        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert canvas to blob'))
            }
          },
          'image/png',
          1.0 // 质量
        )
      } catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }

    img.src = url
  })
}

/**
 * 将 SVG 字符串转换为 JPEG Blob
 *
 * @param svgString - SVG 字符串
 * @param options - 转换选项
 * @returns JPEG Blob
 * @throws {Error} 转换失败时抛出
 */
export async function svgToJpg(
  svgString: string,
  options: Omit<SvgToImageOptions, 'backgroundColor'> = {}
): Promise<Blob> {
  // JPEG 需要白色背景（不支持透明）
  return svgToPng(svgString, {
    ...options,
    backgroundColor: '#ffffff',
  }).then(async (pngBlob) => {
    // 将 PNG 转换为 JPEG
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(pngBlob)

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            throw new Error('Failed to get canvas context')
          }

          // 绘制白色背景
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // 绘制 PNG 图片
          ctx.drawImage(img, 0, 0)

          // 转换为 JPEG
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url)
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to convert canvas to JPEG blob'))
              }
            },
            'image/jpeg',
            0.95 // JPEG 质量
          )
        } catch (error) {
          URL.revokeObjectURL(url)
          reject(error)
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load PNG image'))
      }

      img.src = url
    })
  })
}

/**
 * 将 SVG 字符串转换为 Data URL（可直接用于 img 标签）
 *
 * @param svgString - SVG 字符串
 * @param format - 格式（png 或 jpeg）
 * @param options - 转换选项
 * @returns Data URL 字符串
 */
export async function svgToDataUrl(
  svgString: string,
  format: 'png' | 'jpeg' = 'png',
  options: SvgToImageOptions = {}
): Promise<string> {
  const blob = format === 'png'
    ? await svgToPng(svgString, options)
    : await svgToJpg(svgString, options)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read blob as data URL'))
      }
    }
    reader.onerror = () => {
      reject(new Error('FileReader error'))
    }
    reader.readAsDataURL(blob)
  })
}

/**
 * 从 DOM 元素获取 SVG 字符串
 *
 * @param element - 包含 SVG 的 DOM 元素
 * @returns SVG 字符串
 */
export function extractSvgFromElement(element: HTMLElement): string | null {
  const svg = element.querySelector('svg')
  if (!svg) {
    return null
  }

  // 克隆 SVG 以避免修改原始 DOM
  const clone = svg.cloneNode(true) as SVGElement

  // 确保有 xmlns 属性
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }

  return clone.outerHTML
}

/**
 * 下载图片
 *
 * @param blob - 图片 Blob
 * @param filename - 文件名
 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
