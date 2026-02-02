export interface ElectronAPI {
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
  showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>
  showWordSaveDialog: (defaultName: string) => Promise<{ canceled: boolean; filePath?: string }>
  showOpenDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>
  exportPDF: () => Promise<{ success: boolean; canceled?: boolean; filePath?: string; error?: string }>
  exportWord: (filePath: string, content: string, pandocPath: string) => Promise<{ success: boolean; filePath?: string; error?: string }>
  onMenuAction: (callback: (action: string) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
