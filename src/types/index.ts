export interface ElectronAPI {
  saveFile: (filePath: string, content: string, isHTML?: boolean) => Promise<{ success: boolean; error?: string }>
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>
  showWordSaveDialog: (defaultName: string) => Promise<{ canceled: boolean; filePath?: string }>
  showOpenDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>
  exportPDF: () => Promise<{ success?: boolean; canceled?: boolean; filePath?: string; error?: string }>
  exportWord: (filePath: string, content: string, pandocPath: string) => Promise<{ success?: boolean; filePath?: string; error?: string }>
  findPandoc: () => Promise<{ success: boolean; path?: string | null; error?: string }>
  onMenuAction: (callback: (action: string) => void) => void
  on: (channel: string, callback: (...args: unknown[]) => void) => void
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
