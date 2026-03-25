import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface FindBarProps {
  editor: any
  onClose: () => void
}

interface Match {
  from: number
  to: number
  text: string
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

  const getMatchesInDocument = useCallback((): Match[] => {
    if (!editor || !searchTerm) return []
    
    const allMatches: Match[] = []
    const { doc } = editor.state
    const textContent = editor.getText()
    
    if (!textContent) return []

    let flags = caseSensitive ? 'g' : 'gi'
    let pattern = searchTerm
    if (!regex) {
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      pattern = escaped
    }
    if (wholeWord) {
      pattern = '\\b' + pattern + '\\b'
    }

    let searchRegex: RegExp
    try {
      searchRegex = new RegExp(pattern, flags)
    } catch {
      return []
    }

    let textPos = 0
    let match
    while ((match = searchRegex.exec(textContent)) !== null) {
      const matchStart = match.index
      const matchEnd = matchStart + match[0].length
      
      const docPos = getDocPositionFromTextOffset(doc, matchStart, matchEnd)
      if (docPos) {
        allMatches.push({
          from: docPos.from,
          to: docPos.to,
          text: match[0]
        })
      }
      
      if (match[0].length === 0) {
        searchRegex.lastIndex++
      }
    }

    return allMatches
  }, [editor, searchTerm, caseSensitive, wholeWord, regex])

  const getDocPositionFromTextOffset = (doc: any, startOffset: number, endOffset: number): { from: number; to: number } | null => {
    let currentOffset = 0
    let fromPos = 0
    let toPos = 0
    let foundStart = false
    let foundEnd = false

    doc.descendants((node: any, pos: number) => {
      if (node.isText && !foundEnd) {
        const nodeStart = currentOffset
        const nodeEnd = currentOffset + node.text.length
        
        if (!foundStart && startOffset >= nodeStart && startOffset <= nodeEnd) {
          fromPos = pos + (startOffset - nodeStart)
          foundStart = true
        }
        
        if (foundStart && !foundEnd && endOffset >= nodeStart && endOffset <= nodeEnd) {
          toPos = pos + (endOffset - nodeStart)
          foundEnd = true
          return false
        }
        
        if (!foundStart && endOffset <= nodeEnd) {
          toPos = pos + (endOffset - nodeStart)
          foundEnd = true
          return false
        }
        
        currentOffset = nodeEnd
      }
    })

    if (foundStart && foundEnd) {
      return { from: fromPos, to: toPos }
    }
    
    if (foundStart && !foundEnd) {
      return { from: fromPos, to: doc.content.size }
    }
    
    return null
  }

  const clearHighlights = useCallback(() => {
    if (!editor) return
    const { state, view } = editor
    if (!state || !view) return
    
    const markType = state.schema.marks['searchHighlight']
    if (!markType) return
    
    const tr = state.tr
    state.doc.descendants((node: any, pos: number) => {
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

  const highlightAllMatches = useCallback((allMatches: Match[]) => {
    if (!editor) return
    const { state, view } = editor
    if (!state || !view) return
    
    const markType = state.schema.marks['searchHighlight']
    if (!markType) return

    const tr = state.tr

    state.doc.descendants((node: any, pos: number) => {
      if (node.isText && node.marks) {
        node.marks.forEach((mark: any) => {
          if (mark.type.name === 'searchHighlight') {
            tr.removeMark(pos, pos + node.nodeSize, markType)
          }
        })
      }
    })
    view.dispatch(tr)

    if (allMatches.length === 0) return

    const tr2 = view.state.tr
    allMatches.forEach(match => {
      tr2.addMark(match.from, match.to, markType.create({ class: 'search-highlight' }))
    })
    view.dispatch(tr2)
  }, [editor])

  const scrollToPosition = useCallback((pos: number) => {
    if (!editor) return
    try {
      const { view } = editor
      const coords = view.coordsAtPos(pos)
      const editorDom = view.dom
      const editorRect = editorDom.getBoundingClientRect()
      
      if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
        const scrollTarget = coords.top - editorRect.top - editorDom.clientHeight / 2
        editorDom.scrollTo({
          top: Math.max(0, scrollTarget),
          behavior: 'smooth'
        })
      }
      
      editor.commands.setTextSelection(pos)
      editor.view.focus()
    } catch (e) {
      console.error('Scroll error:', e)
    }
  }, [editor])

  const goToMatch = useCallback((index: number) => {
    if (matches.length === 0 || !editor) return
    const targetIndex = Math.max(0, Math.min(index, matches.length - 1))
    setCurrentIndex(targetIndex)
    
    const match = matches[targetIndex]
    highlightAllMatches(matches)
    scrollToPosition(match.from)
  }, [matches, editor, highlightAllMatches, scrollToPosition])

  useEffect(() => {
    if (!editor) return
    
    if (!searchTerm) {
      clearHighlights()
      setMatches([])
      setCurrentIndex(0)
      return
    }

    const allMatches = getMatchesInDocument()
    setMatches(allMatches)
    setCurrentIndex(0)

    if (allMatches.length > 0) {
      highlightAllMatches(allMatches)
      scrollToPosition(allMatches[0].from)
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
    const { state, view } = editor

    const tr = state.tr.deleteRange(match.from, match.to)
    const newText = state.schema.text(replaceTerm)
    tr.insert(match.from, newText)
    view.dispatch(tr)

    setTimeout(() => {
      const newMatches = getMatchesInDocument()
      setMatches(newMatches)
      setCurrentIndex(Math.min(currentIndex, Math.max(0, newMatches.length - 1)))
      
      if (newMatches.length > 0) {
        highlightAllMatches(newMatches)
        scrollToPosition(newMatches[Math.min(currentIndex, newMatches.length - 1)].from)
      } else {
        clearHighlights()
      }
    }, 0)
  }, [editor, matches, currentIndex, replaceTerm, getMatchesInDocument, highlightAllMatches, scrollToPosition, clearHighlights])

  const handleReplaceAll = useCallback(() => {
    if (!editor || matches.length === 0) return
    
    const { state, view } = editor
    const sortedMatches = [...matches].sort((a, b) => b.from - a.from)

    sortedMatches.forEach(match => {
      const tr = state.tr.deleteRange(match.from, match.to)
      const newText = state.schema.text(replaceTerm)
      tr.insert(match.from, newText)
      view.dispatch(tr)
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

  const matchCountText = matches.length === 0 && searchTerm 
    ? t.findBar.noResults 
    : matches.length > 0 
      ? `${currentIndex + 1}/${matches.length}` 
      : '0/0'

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
