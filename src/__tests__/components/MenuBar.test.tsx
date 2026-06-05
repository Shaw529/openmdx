import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MenuBar from '../../components/MenuBar'

// Mock contexts
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: {
      menu: {
        file: '文件',
        edit: '编辑',
        paragraph: '段落',
        diagram: '图表',
        format: '格式',
        view: '视图',
        help: '帮助',
        new: '新建',
        open: '打开',
        save: '保存',
        exportPDF: '导出PDF',
        exportHTML: '导出HTML',
        exportWord: '导出Word',
        undo: '撤销',
        redo: '重做',
        cut: '剪切',
        copy: '复制',
        paste: '粘贴',
        selectAll: '全选',
        find: '查找',
        findNext: '查找下一个',
        findPrevious: '查找上一个',
        replace: '替换',
        replaceOne: '替换',
        replaceAll: '替换全部',
        goToLine: '转到行',
        heading1: '一级标题',
        heading2: '二级标题',
        heading3: '三级标题',
        heading4: '四级标题',
        heading5: '五级标题',
        heading6: '六级标题',
        plainText: '正文',
        codeBlock: '代码块',
        quoteBlock: '引用',
        bulletList: '无序列表',
        orderedList: '有序列表',
        taskList: '任务列表',
        bold: '粗体',
        italic: '斜体',
        strike: '删除线',
        code: '行内代码',
        link: '链接',
        image: '图片',
        table: '表格',
        toggleSidebar: '切换侧边栏',
        about: '关于',
      },
      mermaid: {},
      settings: { title: '设置' },
      app: { title: 'OpenMDtx', version: '1.0.0' },
    },
    language: 'zh-CN',
  }),
}))

describe('MenuBar', () => {
  const defaultProps = {
    editor: null,
    onNewFile: vi.fn(),
    onOpenFile: vi.fn(),
    onSaveFile: vi.fn(),
    onExportPDF: vi.fn(),
    onExportHTML: vi.fn(),
    onExportWord: vi.fn(),
    onOpenSettings: vi.fn(),
    onToggleSidebar: vi.fn(),
    onShowAbout: vi.fn(),
    onFind: vi.fn(),
    onReplace: vi.fn(),
    onGoToLine: vi.fn(),
  }

  it('渲染7个主菜单按钮', () => {
    render(<MenuBar {...defaultProps} />)
    expect(screen.getByText('文件')).toBeInTheDocument()
    expect(screen.getByText('编辑')).toBeInTheDocument()
    expect(screen.getByText('段落')).toBeInTheDocument()
    expect(screen.getByText('图表')).toBeInTheDocument()
    expect(screen.getByText('格式')).toBeInTheDocument()
    expect(screen.getByText('视图')).toBeInTheDocument()
    expect(screen.getByText('帮助')).toBeInTheDocument()
  })

  it('点击文件菜单展开下拉', async () => {
    render(<MenuBar {...defaultProps} />)
    await userEvent.click(screen.getByText('文件'))

    expect(screen.getByText('新建')).toBeInTheDocument()
    expect(screen.getByText('打开')).toBeInTheDocument()
    expect(screen.getByText('保存')).toBeInTheDocument()
  })

  it('点击编辑菜单展开下拉', async () => {
    render(<MenuBar {...defaultProps} />)
    await userEvent.click(screen.getByText('编辑'))

    expect(screen.getByText('撤销')).toBeInTheDocument()
    expect(screen.getByText('重做')).toBeInTheDocument()
    expect(screen.getByText('查找')).toBeInTheDocument()
  })

  it('点击格式菜单展开下拉', async () => {
    render(<MenuBar {...defaultProps} />)
    await userEvent.click(screen.getByText('格式'))

    expect(screen.getByText('粗体')).toBeInTheDocument()
    expect(screen.getByText('斜体')).toBeInTheDocument()
  })

  it('点击帮助菜单展开下拉', async () => {
    render(<MenuBar {...defaultProps} />)
    await userEvent.click(screen.getByText('帮助'))

    expect(screen.getByText('设置')).toBeInTheDocument()
  })

  it('再次点击菜单关闭下拉', async () => {
    render(<MenuBar {...defaultProps} />)
    await userEvent.click(screen.getByText('文件'))
    expect(screen.getByText('新建')).toBeInTheDocument()

    await userEvent.click(screen.getByText('文件'))
    expect(screen.queryByText('新建')).not.toBeInTheDocument()
  })

  it('点击菜单项触发回调', async () => {
    render(<MenuBar {...defaultProps} />)
    await userEvent.click(screen.getByText('文件'))
    await userEvent.click(screen.getByText('新建'))

    expect(defaultProps.onNewFile).toHaveBeenCalled()
  })

  it('导出PDF菜单项触发回调', async () => {
    render(<MenuBar {...defaultProps} />)
    await userEvent.click(screen.getByText('文件'))
    await userEvent.click(screen.getByText('导出PDF'))

    expect(defaultProps.onExportPDF).toHaveBeenCalled()
  })

  it('显示键盘快捷键', async () => {
    render(<MenuBar {...defaultProps} />)
    await userEvent.click(screen.getByText('编辑'))

    expect(screen.getByText('Ctrl+Z')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+Y')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+F')).toBeInTheDocument()
  })
})
