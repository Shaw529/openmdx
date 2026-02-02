import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (filePath: string, content: string, isHTML?: boolean) =>
    ipcRenderer.invoke('save-file', filePath, content, isHTML),

  readFile: (filePath: string) =>
    ipcRenderer.invoke('read-file', filePath),

  showSaveDialog: () =>
    ipcRenderer.invoke('show-save-dialog'),

  showWordSaveDialog: (defaultName: string) =>
    ipcRenderer.invoke('show-word-save-dialog', defaultName),

  showOpenDialog: () =>
    ipcRenderer.invoke('show-open-dialog'),

  exportPDF: () =>
    ipcRenderer.invoke('export-pdf'),

  exportWord: (filePath: string, content: string, pandocPath: string) =>
    ipcRenderer.invoke('export-word', filePath, content, pandocPath),

  findPandoc: () =>
    ipcRenderer.invoke('find-pandoc'),

  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-action', (_event, action) => callback(action))
  },

  // 监听主进程发送的消息
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    // 允许的频道白名单
    const validChannels = ['enter-print-mode', 'exit-print-mode']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    }
  },

  // 移除消息监听器
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = ['enter-print-mode', 'exit-print-mode']
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback as (...args: unknown[]) => void)
    }
  }
})
