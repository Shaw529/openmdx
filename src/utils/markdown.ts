import { marked } from 'marked'

marked.use({
  gfm: true,
  breaks: false,
})

export function parseMarkdown(text: string): string {
  return marked.parse(text) as string
}

export function parseMarkdownInline(text: string): string {
  return marked.parseInline(text) as string
}

export { marked }
