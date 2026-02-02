/**
 * 文件操作工具函数
 */

/**
 * 从文件路径中提取文件名
 * @param {string | null} filePath - 文件路径
 * @returns {string} 文件名，如果路径为空则返回"未命名"
 */
export function extractFileName(filePath: string | null): string {
  if (!filePath) return '未命名'
  return filePath.split(/[/\\]/).pop() || '未命名'
}

/**
 * 解析文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string} 文件扩展名（包含点号）
 */
export function parseFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : ''
}

/**
 * 移除文件扩展名
 * @param {string} fileName - 文件名
 * @param {string} extension - 要移除的扩展名（如 '.md'）
 * @returns {string} 移除扩展名后的文件名
 */
export function removeFileExtension(fileName: string, extension: string = '.md'): string {
  const regex = new RegExp(`${extension.replace('.', '\\.')}$`, 'i')
  return fileName.replace(regex, '')
}
