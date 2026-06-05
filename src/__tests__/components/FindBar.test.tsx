import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Editor } from '@tiptap/core'
import { SearchHighlight } from '../../extensions/SearchHighlight'
import FindBar from '../../components/FindBar'

// Mock LanguageContext
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      menu: {
        replace: '替换',
        find: '查找',
      },
      findBar: {
        placeholder: '查找...',
        replacePlaceholder: '替换为...',
        replaceBtn: '替换',
        replaceAllBtn: '全部替换',
        previous: '上一个',
        next: '下一个',
        close: '关闭',
        caseSensitive: '区分大小写',
        regex: '正则表达式',
        wholeWord: '全词匹配',
        noResults: '无结果',
      },
    },
    language: 'zh-CN',
  }),
}))

// Helper: 创建一个测试用的 TipTap editor
function TestEditor({ editorRef }: { editorRef: { current: Editor | null } }) {
  const editor = useEditor({
    extensions: [StarterKit, SearchHighlight],
    content: '<p>Hello World</p><p>Hello Test</p>',
    immediatelyRender: false,
  })

  editorRef.current = editor as Editor | null
  return null
}

function renderFindBar(editor: Editor | null, onClose = vi.fn()) {
  return render(<FindBar editor={editor} onClose={onClose} />)
}

describe('FindBar', () => {
  let editorRef: { current: Editor | null }

  beforeEach(() => {
    editorRef = { current: null }
    render(<TestEditor editorRef={editorRef} />)
  })

  it('渲染搜索输入框', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    renderFindBar(editorRef.current)
    expect(screen.getByPlaceholderText('查找...')).toBeInTheDocument()
  })

  it('搜索输入框自动聚焦', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    renderFindBar(editorRef.current)
    const input = screen.getByPlaceholderText('查找...')
    expect(input).toHaveFocus()
  })

  it('显示 0/0 当搜索词为空', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    renderFindBar(editorRef.current)
    expect(screen.getByText('0/0')).toBeInTheDocument()
  })

  it('搜索到匹配项并高亮', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    renderFindBar(editorRef.current)

    const input = screen.getByPlaceholderText('查找...')
    await userEvent.type(input, 'Hello')

    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })
  })

  it('无匹配时显示"无结果"', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    renderFindBar(editorRef.current)

    const input = screen.getByPlaceholderText('查找...')
    await userEvent.type(input, 'NotExist')

    await waitFor(() => {
      expect(screen.getByText('无结果')).toBeInTheDocument()
    })
  })

  it('大小写敏感开关', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    renderFindBar(editorRef.current)

    const input = screen.getByPlaceholderText('查找...')
    await userEvent.type(input, 'hello')

    // 默认不区分大小写，应该找到
    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    // 开启大小写敏感
    const caseBtn = screen.getByTitle('区分大小写')
    await userEvent.click(caseBtn)

    await waitFor(() => {
      expect(screen.getByText('无结果')).toBeInTheDocument()
    })
  })

  it('全词匹配开关', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    renderFindBar(editorRef.current)

    const input = screen.getByPlaceholderText('查找...')
    await userEvent.type(input, 'Hell')

    // 默认部分匹配
    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    // 开启全词匹配
    const wholeWordBtn = screen.getByTitle('全词匹配')
    await userEvent.click(wholeWordBtn)

    await waitFor(() => {
      expect(screen.getByText('无结果')).toBeInTheDocument()
    })
  })

  it('展开替换面板', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    const onClose = vi.fn()
    renderFindBar(editorRef.current, onClose)

    // 点击替换展开按钮
    const toggleBtn = screen.getByTitle('替换')
    await userEvent.click(toggleBtn)

    expect(screen.getByPlaceholderText('替换为...')).toBeInTheDocument()
    expect(screen.getByText('替换')).toBeInTheDocument()
    expect(screen.getByText('全部替换')).toBeInTheDocument()
  })

  it('Escape 关闭查找栏', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    const onClose = vi.fn()
    const { container } = renderFindBar(editorRef.current, onClose)

    // 输入框的 onKeyDown 会 stopPropagation，Escape 需在外层容器触发
    const outerDiv = container.firstChild as HTMLElement
    fireEvent.keyDown(outerDiv, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })

  it('点击关闭按钮关闭查找栏', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    const onClose = vi.fn()
    renderFindBar(editorRef.current, onClose)

    const closeBtn = screen.getByTitle('关闭')
    await userEvent.click(closeBtn)

    expect(onClose).toHaveBeenCalled()
  })

  it('Enter 查找下一个', async () => {
    await waitFor(() => {
      expect(editorRef.current).not.toBeNull()
    })
    renderFindBar(editorRef.current)

    const input = screen.getByPlaceholderText('查找...')
    await userEvent.type(input, 'Hello')

    await waitFor(() => {
      expect(screen.getByText('1/2')).toBeInTheDocument()
    })

    // 按 Enter 跳转到下一个匹配项
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => {
      expect(screen.getByText('2/2')).toBeInTheDocument()
    })
  })
})
