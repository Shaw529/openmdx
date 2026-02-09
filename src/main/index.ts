import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { execFile } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execFileAsync = promisify(execFile)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#ffffff',
    show: false,
    autoHideMenuBar: true, // 隐藏Electron默认的菜单栏（避免与React MenuBar重复）
    webPreferences: {
      // 开发环境和生产环境的 preload 路径不同
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  // 开发环境加载Vite开发服务器，生产环境加载打包后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境：从应用根目录的 dist 目录加载
    // __dirname 在打包后是 dist-electron/main，需要向上两级到 app 根目录，再进入 dist
    const htmlPath = path.join(__dirname, '..', '..', 'dist', 'index.html')
    mainWindow.loadFile(htmlPath)
    // 打开开发者工具查看错误（调试用）
    // mainWindow.webContents.openDevTools()
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })
}

// IPC 通信处理
ipcMain.handle('save-file', async (_event, filePath: string, content: string, isHTML: boolean = false) => {
  try {
    let finalContent = content

    // 如果是 HTML 格式，需要转换为 Markdown
    if (isHTML && typeof document === 'undefined') {
      // 在主进程中，使用简单的 HTML 转 Markdown
      // 注意：这里只是简单处理，完整的转换应该在渲染进程中完成
      finalContent = content
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
        .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
        .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
        .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<br[^>]*>/gi, '\n')
        .replace(/<\/?[^>]+>/g, '') // 移除所有其他标签
    }

    await fs.writeFile(filePath, finalContent, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('show-save-dialog', async () => {
  if (!mainWindow) return { canceled: true }
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] }
  ],
    properties: ['createDirectory']
  })
  return result
})

ipcMain.handle('show-word-save-dialog', async (_event, defaultName: string) => {
  if (!mainWindow) return { canceled: true }
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: 'Word Documents', extensions: ['docx'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['createDirectory']
  })
  return result
})

ipcMain.handle('show-open-dialog', async () => {
  if (!mainWindow) return { canceled: true }
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  return result
})

ipcMain.handle('export-pdf', async (event) => {
  if (!mainWindow) return { success: false, error: 'No window' }

  console.log('[PDF Export] Starting export process...')

  const saveResult = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  })

  if (saveResult.canceled || !saveResult.filePath) {
    console.log('[PDF Export] Export canceled by user')
    return { canceled: true }
  }

  console.log('[PDF Export] Save path:', saveResult.filePath)

  let printWindow: BrowserWindow | null = null
  let tempHtmlPath: string | null = null

  try {
    // 从渲染进程获取格式化的 HTML 内容（与编辑器样式一致）
    console.log('[PDF Export] Getting content from renderer process...')
    const htmlContent = await mainWindow.webContents.executeJavaScript(`
      (() => {
        const editor = document.querySelector('.ProseMirror');
        if (!editor) {
          console.error('[PDF Export] Editor not found');
          return '';
        }

        console.log('[PDF Export] Editor found, getting content...');
        // 获取编辑器内容
        const content = editor.innerHTML;

        console.log('[PDF Export] Content length:', content.length);

        // 返回格式化的 HTML（与编辑器 index.css 完全一致）
        return \`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      padding: 2rem;
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
    }
    h1 {
      font-size: 2em;
      font-weight: 700;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      page-break-after: avoid;
    }
    h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      page-break-after: avoid;
    }
    h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      line-height: 1.3;
      page-break-after: avoid;
    }
    h4, h5, h6 {
      font-size: 1em;
      font-weight: 600;
      margin: 1em 0 0.5em;
      page-break-after: avoid;
    }
    p { margin: 0.5em 0; orphans: 3; widows: 3; }
    ul, ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }
    blockquote {
      border-left: 4px solid #4880bd;
      padding-left: 1em;
      margin: 1em 0;
      color: #666;
      font-style: italic;
      page-break-inside: avoid;
    }
    code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    pre code {
      background: none;
      padding: 0;
    }
    a {
      color: #4880bd;
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    hr {
      border: none;
      border-top: 2px solid #e0e0e0;
      margin: 2em 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      page-break-inside: avoid;
    }
    td, th {
      border: 1px solid #ddd;
      padding: 0.5em;
      min-width: 1em;
    }
    th {
      background: #f7f7f7;
      font-weight: 600;
      text-align: left;
    }
    @media print {
      body { padding: 0; }
      h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
      img, table, pre, blockquote { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
\${content}
</body>
</html>
        \`;
      })()
    `)

    if (!htmlContent || htmlContent.length === 0) {
      console.error('[PDF Export] Failed to get content from editor')
      return { success: false, error: 'Failed to get content from editor. Is the editor empty?' }
    }

    console.log('[PDF Export] Got HTML content, length:', htmlContent.length)

    // 创建临时 HTML 文件
    const tempDir = path.dirname(saveResult.filePath)
    tempHtmlPath = path.join(tempDir, 'temp_print.html')
    console.log('[PDF Export] Creating temp file:', tempHtmlPath)
    await fs.writeFile(tempHtmlPath, htmlContent, 'utf-8')
    console.log('[PDF Export] Temp file created successfully')

    // 创建打印窗口
    console.log('[PDF Export] Creating print window...')
    printWindow = new BrowserWindow({
      width: 800,
      height: 1200,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    })

    // 加载临时 HTML 文件
    console.log('[PDF Export] Loading temp file into print window...')
    await printWindow.loadFile(tempHtmlPath)
    console.log('[PDF Export] File loaded')

    // 等待页面完全加载
    await new Promise<void>((resolve) => {
      printWindow!.webContents.on('did-finish-load', () => {
        console.log('[PDF Export] Page finished loading')
        resolve()
      })
    })

    // 额外等待确保样式应用
    console.log('[PDF Export] Waiting for styles to apply...')
    await new Promise(resolve => setTimeout(resolve, 500))

    // 生成 PDF
    console.log('[PDF Export] Generating PDF...')
    const pdf = await printWindow.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      marginsType: 0,
      marginTop: 20,
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
      landscape: false,
    })
    console.log('[PDF Export] PDF generated, size:', pdf.length, 'bytes')

    // 保存 PDF
    console.log('[PDF Export] Saving PDF to:', saveResult.filePath)
    await fs.writeFile(saveResult.filePath, pdf)
    console.log('[PDF Export] PDF saved successfully')

    // 关闭打印窗口
    if (printWindow && !printWindow.isDestroyed()) {
      printWindow.close()
      console.log('[PDF Export] Print window closed')
    }

    // 删除临时文件
    if (tempHtmlPath) {
      try {
        await fs.unlink(tempHtmlPath)
        console.log('[PDF Export] Temp file deleted:', tempHtmlPath)
        tempHtmlPath = null
      } catch (err) {
        console.error('[PDF Export] Failed to delete temp file:', err)
      }
    }

    console.log('[PDF Export] Export completed successfully')
    return { success: true, filePath: saveResult.filePath }
  } catch (error) {
    const errorMessage = (error as Error).message
    console.error('[PDF Export] Error during export:', errorMessage)
    console.error('[PDF Export] Error stack:', (error as Error).stack)

    // 清理资源
    if (printWindow && !printWindow.isDestroyed()) {
      printWindow.close()
      console.log('[PDF Export] Print window closed (cleanup)')
    }

    if (tempHtmlPath) {
      try {
        await fs.unlink(tempHtmlPath)
        console.log('[PDF Export] Temp file deleted (cleanup):', tempHtmlPath)
      } catch (err) {
        console.error('[PDF Export] Failed to delete temp file (cleanup):', err)
      }
    }

    return { success: false, error: errorMessage }
  }
})

ipcMain.handle('export-word', async (_event, filePath: string, content: string, pandocPath: string) => {
  try {
    // 创建临时HTML文件（TipTap编辑器输出的是HTML格式）
    const tempDir = path.dirname(filePath)
    const tempHtmlPath = path.join(tempDir, 'temp_export.html')

    // 构建完整的HTML文档
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'SimSun', '宋体', serif; line-height: 1.8; color: #000000; }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; color: #000000; }
    p { margin: 0.5em 0; color: #000000; }
    ul, ol { margin: 0.5em 0; padding-left: 2em; }
    li { margin: 0.25em 0; color: #000000; }
    blockquote { border-left: 4px solid #4880bd; padding-left: 1em; margin: 1em 0; color: #000000; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Consolas', 'Monaco', monospace; }
    pre code { background: none; padding: 0; }
    a { color: #4880bd; text-decoration: underline; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 0.5em; }
    th { background: #f4f4f4; font-weight: 600; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
  </style>
</head>
<body>
${content}
</body>
</html>`

    await fs.writeFile(tempHtmlPath, fullHtml, 'utf-8')

    // 使用pandoc从HTML转换为Word
    await execFileAsync(pandocPath, [
      tempHtmlPath,
      '-o', filePath,
      '--from', 'html',
      '--to', 'docx',
      '--standalone',  // 包含完整的文档结构
      '--highlight-style', 'pygments'  // 代码高亮样式
    ])

    // 删除临时文件
    await fs.unlink(tempHtmlPath)

    return { success: true, filePath }
  } catch (error) {
    // 清理临时文件（如果存在）
    try {
      const tempDir = path.dirname(filePath)
      const tempHtmlPath = path.join(tempDir, 'temp_export.html')
      await fs.unlink(tempHtmlPath)
    } catch {}
    return { success: false, error: (error as Error).message }
  }
})

/**
 * 自动搜索 Pandoc 可执行文件
 */
async function findPandoc(): Promise<string | null> {
  const platform = process.platform
  const possiblePaths: string[] = []

  // Windows 常见安装路径
  if (platform === 'win32') {
    const programFiles = process.env['PROGRAMFILES'] || 'C:\\Program Files'
    const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'
    const localAppData = process.env['LOCALAPPDATA'] || path.join(os.homedir(), 'AppData', 'Local')
    const appData = process.env['APPDATA'] || path.join(os.homedir(), 'AppData', 'Roaming')
    const userPath = os.homedir()

    possiblePaths.push(
      path.join(programFiles, 'Pandoc', 'pandoc.exe'),
      path.join(programFilesX86, 'Pandoc', 'pandoc.exe'),
      path.join(localAppData, 'Pandoc', 'pandoc.exe'),
      path.join(appData, 'Pandoc', 'pandoc.exe'),
      path.join(userPath, 'AppData', 'Local', 'Pandoc', 'pandoc.exe'),
      path.join(userPath, 'scoop', 'shims', 'pandoc.exe'),
      path.join(userPath, '.cargo', 'bin', 'pandoc.exe')
    )
  }
  // macOS 常见安装路径
  else if (platform === 'darwin') {
    const userPath = os.homedir()
    possiblePaths.push(
      '/usr/local/bin/pandoc',
      '/opt/homebrew/bin/pandoc',
      path.join(userPath, '.local', 'bin', 'pandoc')
    )
  }
  // Linux 常见安装路径
  else {
    const userPath = os.homedir()
    possiblePaths.push(
      '/usr/bin/pandoc',
      '/usr/local/bin/pandoc',
      path.join(userPath, '.local', 'bin', 'pandoc'),
      path.join(userPath, 'bin', 'pandoc')
    )
  }

  // 检查 PATH 环境变量
  const pathEnv = process.env.PATH || ''
  const pathDirs = pathEnv.split(path.delimiter)

  // 逐个检查可能的路径
  for (const pandocPath of [...possiblePaths, ...pathDirs.map(dir => path.join(dir, 'pandoc' + (platform === 'win32' ? '.exe' : '')))]) {
    try {
      await fs.access(pandocPath)
      // 验证是否可执行
      await execFileAsync(pandocPath, ['--version'])
      return pandocPath
    } catch {
      // 继续检查下一个路径
      continue
    }
  }

  return null
}

// IPC 处理：自动搜索 Pandoc
ipcMain.handle('find-pandoc', async () => {
  try {
    const pandocPath = await findPandoc()
    return { success: true, path: pandocPath }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
