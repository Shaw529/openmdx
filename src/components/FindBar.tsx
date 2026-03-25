import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface FindBarProps {
  editor: any
  onClose: () => void
}

interface Match {
  from: number
  to: number
}

function FindBar({ editor, onClose }: FindBarProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [regex, setRegex] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const clearHighlights = useCallback(() => {
    if (!editor) return
    const { state, view } = editor
    if (!state || !view) return
    const { doc } = state
    const markType = state.schema.marks['searchHighlight']
    if (!markType) return
    const tr = state.tr
    doc.descendants((node: any, pos: number) => {
      if (node.isText && node.marks) {
        node.marks.forEach((mark: any) => {
          if (mark.type.name === 'searchHighlight') {
            tr.removeMark(pos, pos + node.nodeSize, markType)
          }
        })
      }
    })
    if (tr.steps.size > 0) {
      view.dispatch(tr)
    }
  }, [editor])

  const highlightMatch = useCallback((match: Match) => {
    if (!editor) return
    const { state, view } = editor
    if (!state || !view) return
    const markType = state.schema.marks['searchHighlight']
    if (!markType) return

    const clearTr = state.tr
    const { doc } = state
    doc.descendants((node: any, pos: number) => {
      if (node.isText && node.marks) {
        node.marks.forEach((mark: any) => {
          if (mark.type.name === 'searchHighlight') {
            clearTr.removeMark(pos, pos + node.nodeSize, markType)
          }
        })
      }
    })
    view.dispatch(clearTr)

    const tr = view.state.tr
    tr.addMark(match.from, match.to, markType.create({ class: 'search-highlight' }))
    view.dispatch(tr)
  }, [editor])

  const scrollToMatch = useCallback((match: Match) => {
    if (!editor) return
    try {
      const resolved = editor.state.doc.resolve(match.from)
      const domPos = editor.view.coordsAtPos(resolved.pos)
      const editorRect = editor.view.dom.getBoundingClientRect()
      if (domPos.top < editorRect.top || domPos.bottom > editorRect.bottom) {
        editor.view.dom.scrollTop = domPos.top - editorRect.top - editor.view.dom.clientHeight / 2
      }
    } catch {
      // ignore
    }
  }, [editor])

  const goToMatch = useCallback((index: number) => {
    if (matches.length === 0) return
    const targetIndex = Math.max(0, Math.min(index, matches.length - 1))
    setCurrentIndex(targetIndex)
    highlightMatch(matches[targetIndex])
    scrollToMatch(matches[targetIndex])
  }, [matches, highlightMatch, scrollToMatch])

  useEffect(() => {
    if (!editor || !searchTerm) {
      clearHighlights()
      setMatches([])
      setCurrentIndex(0)
      return
    }

    const text = editor.getText()
    const allMatches: Match[] = []

    try {
      let flags = 'g'
      if (!caseSensitive) flags += 'i'
      let pattern = searchTerm
      if (!regex) {
        const escaped = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
        pattern = escaped
      }
      if (wholeWord) {
        pattern = '\\b' + pattern + '\\b'
      }
      const re = new RegExp(pattern, flags)
      let match
      while ((match = re.exec(text)) !== null) {
        allMatches.push({ from: match.index, to: match.index + match[0].length })
      }
    } catch {
      // invalid regex
    }

    setMatches(allMatches)
    setCurrentIndex(0)

    if (allMatches.length > 0) {
      highlightMatch(allMatches[0])
      scrollToMatch(allMatches[0])
    } else {
      clearHighlights()
    }
  }, [searchTerm, caseSensitive, wholeWord, regex, editor])

  const handleFindNext = useCallback(() => {
    if (matches.length === 0) return
    goToMatch((currentIndex + 1) % matches.length)
  }, [matches.length, currentIndex, goToMatch])

  const handleFindPrevious = useCallback(() => {
    if (matches.length === 0) return
    goToMatch((currentIndex - 1 + matches.length) % matches.length)
  }, [matches.length, currentIndex, goToMatch])

  const handleReplace = useCallback(() => {
    if (!editor || matches.length === 0 || currentIndex >= matches.length) return
    const match = matches[currentIndex]
    editor.chain().focus().deleteRange({ from: match.from, to: match.to }).insertContentAt(match.from, replaceTerm).run()
    const newText = editor.getText()
    const allMatches: Match[] = []
    try {
      let flags = 'g'
      if (!caseSensitive) flags += 'i'
      let pattern = searchTerm
      if (!regex) {
        const escaped = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
        pattern = escaped
      }
      if (wholeWord) {
        pattern = '\\b' + pattern + '\\b'
      }
      const re = new RegExp(pattern, flags)
      let matchResult
      while ((matchResult = re.exec(newText)) !== null) {
        allMatches.push({ from: matchResult.index, to: matchResult.index + matchResult[0].length })
      }
    } catch {
      // ignore
    }
    setMatches(allMatches)
    setCurrentIndex(0)
    if (allMatches.length > 0) {
      highlightMatch(allMatches[0])
    } else {
      clearHighlights()
    }
  }, [editor, matches, currentIndex, replaceTerm, searchTerm, caseSensitive, wholeWord, regex, highlightMatch, clearHighlights])

  const handleReplaceAll = useCallback(() => {
    if (!editor || matches.length === 0) return
    let offset = 0
    const sortedMatches = [...matches].sort((a, b) => a.from - b.from)
    sortedMatches.forEach(match => {
      const from = match.from + offset
      const to = match.to + offset
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, replaceTerm).run()
      offset += replaceTerm.length - (match.to - match.from)
    })
    clearHighlights()
    setMatches([])
    setCurrentIndex(0)
  }, [editor, matches, replaceTerm, clearHighlights])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      clearHighlights()
      onClose()
    }
  }, [clearHighlights, onClose])

  const matchCountText = matches.length === 0 && searchTerm ? t.findBar.noResults : matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm select-none" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-1">
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t.findBar.placeholder}
          className="w-48 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (e.shiftKey) handleFindPrevious()
              else handleFindNext()
            }
            e.stopPropagation()
          }}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[40px] text-center">{matchCountText}</span>
        <button onClick={handleFindPrevious} disabled={matches.length === 0} title={t.findBar.previous}
          className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
        </button>
        <button onClick={handleFindNext} disabled={matches.length === 0} title={t.findBar.next}
          className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <button onClick={() => setShowReplace(!showReplace)} title={t.menu.replace}
          className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h12M3 18h6" /></svg>
        </button>
      </div>

      {showReplace && (
        <div className="flex items-center gap-1">
          <input type="text" value={replaceTerm} onChange={e => setReplaceTerm(e.target.value)}
            placeholder={t.findBar.replacePlaceholder}
            className="w-40 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (e.shiftKey) handleReplaceAll()
                else handleReplace()
              }
              e.stopPropagation()
            }}
          />
          <button onClick={handleReplace} disabled={matches.length === 0}
            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded border border-gray-300 dark:border-gray-600">
            {t.findBar.replaceBtn}
          </button>
          <button onClick={handleReplaceAll} disabled={matches.length === 0}
            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded border border-gray-300 dark:border-gray-600">
            {t.findBar.replaceAllBtn}
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 ml-1 border-l border-gray-300 dark:border-gray-600 pl-2">
        <button onClick={() => setCaseSensitive(!caseSensitive)} title={t.findBar.caseSensitive}
          className={`px-1.5 py-1 text-xs rounded border ${caseSensitive ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 text-blue-700 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
          Aa
        </button>
        <button onClick={() => setRegex(!regex)} title={t.findBar.regex}
          className={`px-1.5 py-1 text-xs rounded border ${regex ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 text-blue-700 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
          .*
        </button>
        <button onClick={() => setWholeWord(!wholeWord)} title={t.findBar.wholeWord}
          className={`px-1.5 py-1 text-xs rounded border ${wholeWord ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 text-blue-700 dark:text-blue-200' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
          &quot;&quot;
        </button>
      </div>

      <button onClick={() => { clearHighlights(); onClose() }} title={t.findBar.close}
        className="ml-auto p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </div>
  )
}

export default memo(FindBar) 
