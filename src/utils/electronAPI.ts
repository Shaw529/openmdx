/**
 * electronAPI 工具函数
 * 统一处理 Electron API 可用性检查和提示
 */

/**
 * 检查 electronAPI 是否可用
 * @returns {boolean} electronAPI 是否可用
 */
export function checkElectronAPI(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

/**
 * 显示 Electron 环境不可用提示
 * @param {string} message - 提示消息（可选）
 */
export function showElectronAlert(message: string = '此功能需要在Electron环境中运行'): void {
  console.warn('electronAPI not available - running in web mode')
  alert(message)
}
