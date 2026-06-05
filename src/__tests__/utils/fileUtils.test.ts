import { describe, it, expect } from 'vitest'
import { extractFileName, parseFileExtension, removeFileExtension } from '../../utils/fileUtils'

describe('extractFileName', () => {
  it('从 Windows 路径提取文件名', () => {
    expect(extractFileName('C:\\Users\\test\\document.md')).toBe('document.md')
  })

  it('从 Unix 路径提取文件名', () => {
    expect(extractFileName('/home/user/document.md')).toBe('document.md')
  })

  it('仅文件名时返回自身', () => {
    expect(extractFileName('document.md')).toBe('document.md')
  })

  it('null 返回默认值', () => {
    expect(extractFileName(null)).toBe('未命名')
  })

  it('空字符串返回默认值', () => {
    expect(extractFileName('')).toBe('未命名')
  })
})

describe('parseFileExtension', () => {
  it('解析 .md 扩展名', () => {
    expect(parseFileExtension('document.md')).toBe('.md')
  })

  it('解析 .txt 扩展名', () => {
    expect(parseFileExtension('notes.txt')).toBe('.txt')
  })

  it('无扩展名返回空字符串', () => {
    expect(parseFileExtension('README')).toBe('')
  })

  it('多个点号取最后一个', () => {
    expect(parseFileExtension('file.backup.md')).toBe('.md')
  })
})

describe('removeFileExtension', () => {
  it('移除默认 .md 扩展名', () => {
    expect(removeFileExtension('document.md')).toBe('document')
  })

  it('移除指定扩展名', () => {
    expect(removeFileExtension('notes.txt', '.txt')).toBe('notes')
  })

  it('大小写不敏感', () => {
    expect(removeFileExtension('document.MD')).toBe('document')
  })

  it('无匹配扩展名时不变', () => {
    expect(removeFileExtension('README')).toBe('README')
  })

  it('仅移除结尾的扩展名', () => {
    expect(removeFileExtension('file.md.backup', '.backup')).toBe('file.md')
  })
})
