import { useState, useCallback, memo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface GoToLineModalProps {
  editor: any
  onClose: () => void
}

function GoToLineModal({ editor, onClose }: GoToLineModalProps) {
  const { t } = useLanguage()
  const [lineNumber, setLineNumber] = useState('')
  const [error, setError] = useState('')

  const totalLines = editor?.state?.doc?.childCount
    ? editor.state.doc.childCount
    : 1

  const handleGo = useCallback(() => {
    const num = parseInt(lineNumber, 10)
    if (isNaN(num) || num < 1) {
      setError(t.findBar.noResults)
      return
    }
    if (num > totalLines) {
      setError(`${t.findBar.noResults} (max: ${totalLines})`)
      return
    }
    if (editor?.commands?.goToLine) {
      editor.commands.goToLine(num)
    }
    onClose()
  }, [editor, lineNumber, totalLines, t, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleGo()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-72 p-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
          {t.findBar.goToLineTitle}
        </h3>

        <input
          type="number"
          value={lineNumber}
          onChange={e => {
            setLineNumber(e.target.value)
            setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder={t.findBar.lineNumber.replace('{total}', String(totalLines))}
          autoFocus
          min={1}
          max={totalLines}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 mb-1"
        />

        {error && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          {t.findBar.lineNumber.replace('{total}', String(totalLines))}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {t.findBar.cancel}
          </button>
          <button
            onClick={handleGo}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded"
          >
            {t.findBar.goTo}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(GoToLineModal)
