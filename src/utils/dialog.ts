/**
 * 对话框工具函数
 */

/**
 * 确认未保存修改
 * @param {string} message - 确认消息
 * @returns {boolean} 用户是否确认
 */
export function confirmUnsavedChanges(message: string): boolean {
  return confirm(message)
}
