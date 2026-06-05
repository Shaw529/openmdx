import { describe, it, expect } from 'vitest'
import { generateBaseStyles, generateHTMLDocument } from '../../styles/exportStyles'

describe('generateBaseStyles', () => {
  it('生成浅色主题样式', () => {
    const styles = generateBaseStyles({ isDark: false })
    expect(styles).toContain('color: #333')
    expect(styles).toContain('background: #ffffff')
  })

  it('生成暗色主题样式', () => {
    const styles = generateBaseStyles({ isDark: true })
    expect(styles).toContain('color: #e0e0e0')
    expect(styles).toContain('background: #1f2937')
  })

  it('打印模式下包含 print 媒体查询', () => {
    const styles = generateBaseStyles({ isPrint: true })
    expect(styles).toContain('@media print')
  })

  it('非打印模式下不包含 print 媒体查询', () => {
    const styles = generateBaseStyles({ isPrint: false })
    expect(styles).not.toContain('@media print')
  })

  it('打印模式下使用 A4 宽度', () => {
    const styles = generateBaseStyles({ isPrint: true })
    expect(styles).toContain('max-width: 210mm')
  })

  it('支持自定义字体', () => {
    const styles = generateBaseStyles({ fontFamily: 'SimSun' })
    expect(styles).toContain('font-family: SimSun')
  })

  it('默认字体存在', () => {
    const styles = generateBaseStyles()
    expect(styles).toContain('font-family')
  })
})

describe('generateHTMLDocument', () => {
  it('生成完整 HTML 文档', () => {
    const doc = generateHTMLDocument('<p>内容</p>', '测试')
    expect(doc).toContain('<!DOCTYPE html>')
    expect(doc).toContain('<title>测试</title>')
    expect(doc).toContain('<p>内容</p>')
  })

  it('默认 lang 为 zh-CN', () => {
    const doc = generateHTMLDocument('<p>test</p>', 'Title')
    expect(doc).toContain('lang="zh-CN"')
  })

  it('支持自定义 lang', () => {
    const doc = generateHTMLDocument('<p>test</p>', 'Title', { lang: 'en' })
    expect(doc).toContain('lang="en"')
  })

  it('支持暗色主题', () => {
    const doc = generateHTMLDocument('<p>test</p>', 'Title', { isDark: true, lang: 'en' })
    expect(doc).toContain('lang="en"')
    expect(doc).toContain('color: #e0e0e0')
  })

  it('包含样式标签', () => {
    const doc = generateHTMLDocument('<p>test</p>', 'Title')
    expect(doc).toContain('<style>')
    expect(doc).toContain('</style>')
  })

  it('内容被正确嵌入', () => {
    const doc = generateHTMLDocument('<h1>Hello</h1>', 'Test')
    expect(doc).toContain('<h1>Hello</h1>')
  })
})
