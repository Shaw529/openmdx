import { useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { checkElectronAPI, showElectronAlert } from '../utils/electronAPI'
import { confirmUnsavedChanges } from '../utils/dialog'

interface UseFileOperationsParams {
  content: string
  isModified: boolean
  onContentChange: (content: string) => void
  onFileStateChange: (file: string | null, modified: boolean) => void
}

/**
 * 文件操作自定义Hook
 * 封装文件新建、打开、保存功能
 */
export function useFileOperations({
  content,
  isModified,
  onContentChange,
  onFileStateChange
}: UseFileOperationsParams) {
  const { t } = useLanguage()

  /**
   * 新建文件
   */
  const handleNewFile = useCallback(() => {
    if (isModified) {
      if (!confirmUnsavedChanges(t.dialog.unsavedChanges)) {
        return
      }
    }
    onContentChange('')
    onFileStateChange(null, false)
  }, [isModified, onContentChange, onFileStateChange, t.dialog.unsavedChanges])

  /**
   * 打开文件
   */
  const handleOpenFile = useCallback(async () => {
    if (!checkElectronAPI()) {
      showElectronAlert()
      return
    }

    if (isModified) {
      if (!confirmUnsavedChanges(t.dialog.unsavedChanges)) {
        return
      }
    }

    const result = await window.electronAPI!.showOpenDialog()
    if (!result.canceled && result.filePaths && result.filePaths[0]) {
      const fileResult = await window.electronAPI!.readFile(result.filePaths[0])
      if (fileResult.success && fileResult.content) {
        onContentChange(fileResult.content)
        onFileStateChange(result.filePaths[0], false)
      }
    }
  }, [isModified, onContentChange, onFileStateChange, t.dialog.unsavedChanges])

  /**
   * 保存文件
   */
  const handleSaveFile = useCallback(
    async (currentFile: string | null) => {
      if (!checkElectronAPI()) {
        showElectronAlert()
        return null
      }

      let filePath = currentFile

      if (!filePath) {
        const result = await window.electronAPI!.showSaveDialog()
        if (result.canceled || !result.filePath) {
          return null
        }
        filePath = result.filePath
      }

      const result = await window.electronAPI!.saveFile(filePath, content)
      if (result.success) {
        onFileStateChange(filePath, false)
        return filePath
      } else {
        alert(t.dialog.saveFailed + ': ' + result.error)
        return null
      }
    },
    [content, onFileStateChange, t.dialog.saveFailed]
  )

  return {
    handleNewFile,
    handleOpenFile,
    handleSaveFile
  }
}
