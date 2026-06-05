import { describe, it, expect } from 'vitest'
import { domToMarkdown, htmlToMarkdown } from '../../utils/htmlToMarkdown'

describe('domToMarkdown', () => {
  it('将 h1 转换为 Markdown 标题', () => {
    const div = document.createElement('div')
    div.innerHTML = '<h1>标题</h1>'
    expect(domToMarkdown(div).trim()).toBe('# 标题')
  })

  it('将 h2 转换为 Markdown 标题', () => {
    const div = document.createElement('div')
    div.innerHTML = '<h2>二级标题</h2>'
    expect(domToMarkdown(div).trim()).toBe('## 二级标题')
  })

  it('将 h1-h6 转换为对应级别标题', () => {
    for (let i = 1; i <= 6; i++) {
      const div = document.createElement('div')
      div.innerHTML = `<h${i}>标题${i}</h${i}>`
      const prefix = '#'.repeat(i)
      expect(domToMarkdown(div).trim()).toBe(`${prefix} 标题${i}`)
    }
  })

  it('将 strong 转换为粗体', () => {
    const div = document.createElement('div')
    div.innerHTML = '<strong>粗体文本</strong>'
    expect(domToMarkdown(div)).toBe('**粗体文本**')
  })

  it('将 em 转换为斜体', () => {
    const div = document.createElement('div')
    div.innerHTML = '<em>斜体文本</em>'
    expect(domToMarkdown(div)).toBe('*斜体文本*')
  })

  it('将行内 code 转换为反引号', () => {
    const div = document.createElement('div')
    div.innerHTML = '<code>var x = 1;</code>'
    expect(domToMarkdown(div)).toBe('`var x = 1;`')
  })

  it('将 pre > code 转换为围栏代码块', () => {
    const div = document.createElement('div')
    div.innerHTML = '<pre><code class="language-javascript">console.log("hello")</code></pre>'
    expect(domToMarkdown(div).trim()).toBe('```javascript\nconsole.log("hello")```')
  })

  it('将 pre 无 code 子元素转换为无语言代码块', () => {
    const div = document.createElement('div')
    div.innerHTML = '<pre>plain text</pre>'
    expect(domToMarkdown(div).trim()).toBe('```\nplain text```')
  })

  it('将 blockquote 转换为引用', () => {
    const div = document.createElement('div')
    div.innerHTML = '<blockquote><p>引用文本</p></blockquote>'
    const result = domToMarkdown(div).trim()
    expect(result).toContain('> 引用文本')
  })

  it('将 ul 转换为无序列表', () => {
    const div = document.createElement('div')
    div.innerHTML = '<ul><li>项目1</li><li>项目2</li></ul>'
    const result = domToMarkdown(div).trim()
    expect(result).toBe('- 项目1\n- 项目2')
  })

  it('将 ol 转换为有序列表', () => {
    const div = document.createElement('div')
    div.innerHTML = '<ol><li>第一</li><li>第二</li></ol>'
    const result = domToMarkdown(div).trim()
    expect(result).toBe('1. 第一\n2. 第二')
  })

  it('将 a 标签转换为链接', () => {
    const div = document.createElement('div')
    div.innerHTML = '<a href="https://example.com">示例链接</a>'
    expect(domToMarkdown(div)).toBe('[示例链接](https://example.com)')
  })

  it('将 hr 转换为分隔线', () => {
    const div = document.createElement('div')
    div.innerHTML = '<hr>'
    expect(domToMarkdown(div).trim()).toBe('---')
  })

  it('将 table 转换为 Markdown 表格', () => {
    const div = document.createElement('div')
    div.innerHTML = '<table><tr><th>列A</th><th>列B</th></tr><tr><td>1</td><td>2</td></tr></table>'
    const result = domToMarkdown(div).trim()
    expect(result).toContain('| 列A | 列B |')
    expect(result).toContain('| --- | --- |')
    expect(result).toContain('| 1 | 2 |')
  })

  it('将 p 转换为段落', () => {
    const div = document.createElement('div')
    div.innerHTML = '<p>一段文本</p>'
    expect(domToMarkdown(div).trim()).toBe('一段文本')
  })

  it('处理嵌套结构', () => {
    const div = document.createElement('div')
    div.innerHTML = '<p>这是 <strong>粗体</strong> 和 <em>斜体</em></p>'
    expect(domToMarkdown(div).trim()).toBe('这是 **粗体** 和 *斜体*')
  })

  it('拒绝过深嵌套（>50 层）', () => {
    let inner = document.createElement('span')
    inner.textContent = 'deep text'
    for (let i = 0; i < 51; i++) {
      const wrapper = document.createElement('div')
      wrapper.appendChild(inner)
      inner = wrapper as unknown as HTMLElement
    }
    const result = domToMarkdown(inner)
    expect(result).toBe('')
  })
})

describe('htmlToMarkdown', () => {
  it('将 HTML 字符串转换为 Markdown', () => {
    const html = '<h1>标题</h1><p>段落</p>'
    expect(htmlToMarkdown(html)).toBe('# 标题\n\n段落')
  })

  it('空 HTML 返回空字符串', () => {
    expect(htmlToMarkdown('')).toBe('')
  })
})
