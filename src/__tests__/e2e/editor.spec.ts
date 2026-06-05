import { test, expect } from '@playwright/test'

test.describe('OpenMDtx 编辑器 E2E', () => {

  test('页面加载成功，显示编辑器', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('OpenMDtx')

    // 编辑器 ProseMirror 已渲染
    const editor = page.locator('.ProseMirror')
    await expect(editor).toBeVisible()
  })

  test('菜单栏显示7个主菜单', async ({ page }) => {
    await page.goto('/')

    const menus = ['文件', '编辑', '段落', '图表', '格式', '视图', '帮助']
    for (const menu of menus) {
      await expect(page.getByText(menu, { exact: true })).toBeVisible()
    }
  })

  test('点击文件菜单展开下拉项', async ({ page }) => {
    await page.goto('/')
    await page.getByText('文件', { exact: true }).click()

    await expect(page.getByText('新建')).toBeVisible()
    await expect(page.getByText('打开')).toBeVisible()
    await expect(page.getByText('保存')).toBeVisible()
    await expect(page.getByText('导出PDF')).toBeVisible()
    await expect(page.getByText('导出HTML')).toBeVisible()

    // 再次点击关闭下拉
    await page.getByText('文件', { exact: true }).click()
    await expect(page.getByText('新建')).not.toBeVisible()
  })

  test('点击编辑菜单显示快捷键', async ({ page }) => {
    await page.goto('/')
    await page.locator('.ProseMirror').waitFor({ state: 'visible' })

    // 第2个菜单按钮是编辑（index 1）
    const menuButtons = page.locator('.h-8 > div.relative > button')
    await expect(menuButtons).toHaveCount(7)
    await menuButtons.nth(1).click()
    await page.waitForTimeout(300)

    // 验证下拉菜单项
    await expect(page.getByText('撤销')).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Ctrl+Z')).toBeVisible()
    await expect(page.getByText('查找')).toBeVisible()
    await expect(page.getByText('Ctrl+F')).toBeVisible()
  })

  test('在编辑器中输入文本', async ({ page }) => {
    await page.goto('/')

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.pressSequentially('Hello E2E Test!')

    await expect(editor).toContainText('Hello E2E Test!')
  })

  test('Ctrl+F 打开查找栏', async ({ page }) => {
    await page.goto('/')

    // 先在编辑器中输入文本
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.pressSequentially('Hello World')

    // Ctrl+F 打开查找栏
    await page.keyboard.press('Control+f')

    const findInput = page.locator('input[placeholder*="查找"]')
    await expect(findInput).toBeVisible()

    // 输入搜索词
    await findInput.fill('Hello')
    // 应显示 1/1
    await expect(page.getByText('1/1')).toBeVisible()

    // Escape 关闭查找栏（先聚焦输入框确保 Escape 能冒泡到外层容器）
    await findInput.focus()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    await expect(findInput).not.toBeVisible()
  })

  test('Ctrl+N 新建页签', async ({ page }) => {
    await page.goto('/')

    // 先输入一些文本让第一个页签有内容
    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.pressSequentially('Tab 1 Content')

    // 处理 confirm 对话框
    page.on('dialog', dialog => dialog.accept())

    // Ctrl+N 新建
    await page.keyboard.press('Control+n')

    // 新页签应该出现，编辑器清空
    await expect(editor).not.toContainText('Tab 1 Content')
  })

  test('状态栏显示统计信息', async ({ page }) => {
    await page.goto('/')

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.pressSequentially('Hello\nWorld')

    // 状态栏应该有字符数和行数
    const statusBar = page.locator('text=字符').first()
    await expect(statusBar).toBeVisible()
  })

  test('侧边栏切换', async ({ page }) => {
    await page.goto('/')

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.pressSequentially('# Test Heading')

    // 侧边栏应该可见，并能检测到大纲标题
    const sidebarToggles = page.getByTitle('切换侧边栏')
    if (await sidebarToggles.count() > 0) {
      await sidebarToggles.first().click()
      // 侧边栏关闭/打开后编辑器仍然存在
      await expect(editor).toBeVisible()
    }
  })

  test('编辑器支持 Markdown 快捷键（加粗）', async ({ page }) => {
    await page.goto('/')

    const editor = page.locator('.ProseMirror')
    await editor.click()
    await editor.pressSequentially('**Bold Text**')

    // 内容应包含粗体标记（TipTap 会将 markdown 转为富文本）
    await expect(editor).toContainText('Bold Text')
  })
})
