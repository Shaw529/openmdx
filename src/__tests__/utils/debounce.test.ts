import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, debounceCancellable } from '../../utils/debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('延迟调用函数', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('连续调用只执行最后一次', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('在延迟内再次调用重置计时器', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(50)
    debounced()
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('传递参数给原函数', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('hello', 42)
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('hello', 42)
  })
})

describe('debounceCancellable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('可取消待执行的调用', () => {
    const fn = vi.fn()
    const { debounced, cancel } = debounceCancellable(fn, 100)

    debounced()
    cancel()
    vi.advanceTimersByTime(100)

    expect(fn).not.toHaveBeenCalled()
  })

  it('正常执行未取消的调用', () => {
    const fn = vi.fn()
    const { debounced } = debounceCancellable(fn, 100)

    debounced()
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledOnce()
  })

  it('取消后再次调用可正常执行', () => {
    const fn = vi.fn()
    const { debounced, cancel } = debounceCancellable(fn, 100)

    debounced()
    cancel()
    vi.advanceTimersByTime(100)

    debounced()
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledOnce()
  })
})
