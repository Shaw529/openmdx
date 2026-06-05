import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom 未实现 scrollIntoView，mock 避免 setTimeout 回调抛未捕获异常
Element.prototype.scrollIntoView = vi.fn()
