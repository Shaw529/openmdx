<div align="center">

# OpenMDtx

**🚀 一个强大的 Markdown 编辑器，基于 Electron + React + TipTap 构建**

[![CI](https://github.com/Xiaoqiang-Zhao/Mdtx/actions/workflows/ci.yml/badge.svg)](https://github.com/Xiaoqiang-Zhao/Mdtx/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-40.1.0-999999?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![TipTap](https://img.shields.io/badge/TipTap-3.18.0-6B42F4?logo=tiptap)](https://tiptap.dev/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D7?logo=windows)](https://www.microsoft.com/windows)

[特性](#-特性) • [快速开始](#-快速开始) • [使用指南](#-使用指南) • [快捷键](#-快捷键) • [开发](#-开发) • [许可证](#-许可证)

</div>

---

## ✨ 特性

### 📝 核心编辑功能
- ✅ **所见即所得编辑** - 真正的实时 Markdown 编辑体验
- ✅ **多文件管理** - 支持多个文档同时编辑，页签切换
- ✅ **实时大纲** - 自动从文档标题生成目录树
- ✅ **语法高亮** - 代码块自动语法高亮（支持 100+ 种语言）
- ✅ **富文本格式** - 粗体、斜体、删除线、行内代码
- ✅ **列表支持** - 无序列表、有序列表、任务列表
- ✅ **表格编辑** - 可视化表格编辑
- ✅ **引用块** - 支持多级引用
- ✅ **图片插入** - 支持拖拽和粘贴图片
- ✅ **链接支持** - 快速插入和编辑链接

### 🔍 搜索与替换
- ✅ **快速查找** - Ctrl+F 打开搜索面板
- ✅ **替换功能** - Ctrl+H 打开替换面板
- ✅ **正则表达式** - 支持正则表达式搜索
- ✅ **全词匹配** - 精确匹配整个单词
- ✅ **区分大小写** - 切换大小写敏感
- ✅ **实时高亮** - 所有匹配结果即时高亮显示
- ✅ **批量替换** - 支持替换单个或全部匹配

### ⌨️ 导航功能
- ✅ **跳转行号** - Ctrl+G 快速跳转到指定行
- ✅ **行号显示** - 状态栏显示当前行和总行数

### 🌍 国际化与主题
- ✅ **多语言支持** - 中文（简体）、English
- ✅ **主题切换** - 浅色、深色、跟随系统
- ✅ **自动保存提示** - 防止意外丢失数据

### 📤 导出功能
- ✅ **PDF 导出** - 使用 Electron 原生打印功能
- ✅ **HTML 导出** - 完整格式的 HTML 文档
- ✅ **Word 导出** - 通过 Pandoc 导出为 .docx 格式
  - 🎯 **字体选择** - 支持 7 种中文字体（宋体、微软雅黑、黑体、楷体、华文细黑、仿宋、方正姚体）
  - 🎯 颜色：纯黑色 (#000000)
  - 🎯 符合中文排版规范
  - 🎯 支持自定义 Word 模板

### 📊 图表支持
- ✅ **Mermaid 图表** - 支持流程图、时序图、类图、状态图等 15+ 种图表
- ✅ **多种主题** - 默认、暗色、森林、中性、基础、彩虹等主题风格
- ✅ **实时预览** - 源码、预览、拆分三种视图模式
- ✅ **主题修复** - 修复主题配置不生效的问题

### ⚙️ 高级功能
- ✅ **Pandoc 集成** - 自动搜索或手动配置 Pandoc 路径
- ✅ **智能 Markdown 检测** - 自动识别并转换 Markdown 语法
- ✅ **文件拖放** - 直接拖放 .md 文件到编辑器
- ✅ **状态栏信息** - 实时显示字符数、行数、编码等信息

### 🎨 界面设计
- ✅ **经典菜单栏** - 文件、编辑、段落、格式、视图、帮助
- ✅ **工具栏** - 快速访问常用功能
- ✅ **侧边栏大纲** - 可折叠的文档导航
- ✅ **多文件页签** - 类似浏览器的标签页管理
- ✅ **响应式布局** - 适应不同屏幕尺寸

---

## 🚀 快速开始

### 系统要求

- **Windows**: Windows 10/11 (64-bit)
- **RAM**: 4GB 最低，8GB 推荐
- **磁盘空间**: 500MB 可用空间

### 下载应用

**[📥 下载最新版本 v1.4.0](https://github.com/Xiaoqiang-Zhao/Mdtx/releases/latest)**

#### 方式一：安装程序（推荐）

1. 下载 `OpenMDtx Setup 1.4.0.exe`
2. 双击运行安装程序
3. 选择安装位置
4. 点击"安装"按钮
5. 从桌面或开始菜单启动

#### 方式二：绿色便携版

1. 下载 `OpenMDtx-Portable-1.4.0.zip`
2. 解压到任意目录
3. 双击 `OpenMDtx.exe` 运行
4. 无需安装，可放在 U 盘中使用

详细下载说明请查看 [RELEASE_INSTRUCTIONS.md](https://github.com/Xiaoqiang-Zhao/Mdtx/blob/main/RELEASE_INSTRUCTIONS.md)

### 配置 Pandoc（可选）

如果要使用 Word 导出功能，需要安装 [Pandoc](https://pandoc.org/)：

1. **自动搜索**（推荐）
   - 打开"帮助 → 设置"
   - 点击"自动搜索"按钮
   - 系统会自动查找已安装的 Pandoc

2. **手动配置**
   - 下载并安装 Pandoc：https://pandoc.org/installing.html
   - 打开"帮助 → 设置"
   - 在"Pandoc 路径"中输入 Pandoc 可执行文件的完整路径
   - 点击"保存设置"

---

## 📖 使用指南

### 新建文档

- **菜单栏**：文件 → 新建
- **快捷键**：`Ctrl+N`
- **工具栏**：点击新建按钮

### 打开文件

- **菜单栏**：文件 → 打开
- **快捷键**：`Ctrl+O`
- **拖放**：直接将 .md 文件拖到编辑器窗口

### 保存文件

- **菜单栏**：文件 → 保存
- **快捷键**：`Ctrl+S`
- **工具栏**：点击保存按钮

### 导出文档

#### 导出为 PDF
1. 文件 → 导出PDF
2. 选择保存位置
3. 等待导出完成

#### 导出为 HTML
1. 文件 → 导出HTML
2. 选择保存位置
3. 等待导出完成

#### 导出为 Word
1. 文件 → 导出Word
2. 如果未配置 Pandoc，会自动打开设置对话框
3. 配置或搜索 Pandoc 路径
4. 选择保存位置
5. 等待导出完成

**Word 导出特性**：
- **字体选择** - 支持 7 种中文字体：宋体、微软雅黑、黑体、楷体、华文细黑、仿宋、方正姚体
- 颜色：纯黑色 (#000000)
- 完美保留 Markdown 格式
- 适合正式文档和报告
- 支持自定义 Word 模板

---

## ⌨️ 快捷键

### 文件操作

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+N` | 新建文件 |
| `Ctrl+O` | 打开文件 |
| `Ctrl+S` | 保存文件 |

### 编辑操作

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` 或 `Ctrl+Shift+Z` | 重做 |
| `Ctrl+A` | 全选 |
| `Ctrl+C` | 复制 |
| `Ctrl+V` | 粘贴 |
| `Ctrl+X` | 剪切 |
| `Ctrl+F` | 查找 |
| `Ctrl+H` | 替换 |
| `Ctrl+G` | 转到行 |
| `F3` 或 `Enter` | 查找下一个 |
| `Shift+F3` | 查找上一个 |

### 格式化

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+B` | **粗体** |
| `Ctrl+I` | *斜体* |
| `Ctrl+D` | ~~删除线~~ |
| `Ctrl+/` | 行内代码 |

### Markdown 语法

在编辑器中输入以下语法会自动转换：

| 输入 | 效果 |
|------|------|
| `# ` | 一级标题 |
| `## ` | 二级标题 |
| `### ` | 三级标题 |
| `**文本**` | **粗体** |
| `*文本*` | *斜体* |
| `~~文本~~` | ~~删除线~~ |
| `` `文本` `` | `行内代码` |
| `- ` | 无序列表 |
| `1. ` | 有序列表 |
| `- [ ] ` | 任务列表（未完成） |
| `- [x] ` | 任务列表（已完成） |
| `> ` | 引用块 |
| `---` | 水平分割线 |

---

## 🛠️ 开发

### 技术栈

- **Electron** `^40.1.0` - 桌面应用框架
- **React** `^19.2.0` - UI 框架
- **TipTap** `^3.18.0` - 富文本编辑器核心
- **Tailwind CSS** `^3.4.19` - 样式框架
- **Vite** `^7.2.4` - 构建工具
- **TypeScript** `~5.9.3` - 类型安全
- **marked** `^17.0.1` - Markdown 解析器
- **lowlight** `^3.3.0` - 代码高亮

### 项目结构

```
openmdtx/
├── src/
│   ├── components/          # React 组件
│   │   ├── Editor.tsx       # 主编辑器
│   │   ├── MenuBar.tsx      # 菜单栏
│   │   ├── Toolbar.tsx      # 工具栏
│   │   ├── Sidebar.tsx      # 大纲侧边栏
│   │   ├── TabBar.tsx       # 文件页签
│   │   ├── StatusBar.tsx    # 状态栏
│   │   ├── SettingsModal.tsx # 设置对话框
│   │   ├── ExportMenu.tsx   # 导出菜单
│   │   └── ErrorBoundary.tsx # 错误边界
│   ├── contexts/            # React Context
│   │   ├── SettingsContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useTabs.ts       # 文件页签管理
│   │   ├── useExport.ts     # 导出功能
│   │   └── useFileOperations.ts # 文件操作
│   ├── extensions/          # TipTap 扩展
│   │   ├── MarkdownAutoFormat.ts
│   │   ├── MarkdownCopy.ts
│   │   └── ClipboardTextParser.ts
│   ├── locales/             # 国际化
│   │   ├── zh-CN.ts         # 简体中文
│   │   ├── en-US.ts         # English
│   │   └── index.ts
│   ├── main/                # Electron 主进程
│   │   ├── index.ts         # 主进程入口
│   │   └── preload.ts       # 预加载脚本
│   ├── config/              # 配置文件
│   │   └── constants.ts
│   ├── types/               # TypeScript 类型
│   │   ├── index.ts
│   │   └── electron.d.ts
│   ├── utils/               # 工具函数
│   │   ├── electronAPI.ts
│   │   ├── fileUtils.ts
│   │   ├── dialog.ts
│   │   └── debounce.ts
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 渲染进程入口
├── public/                  # 静态资源
├── index.html               # HTML 入口
├── vite.config.ts           # Vite 配置
├── package.json             # 项目配置
└── LICENSE                  # MIT 许可证
```

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/Xiaoqiang-Zhao/Mdtx.git
cd Mdtx

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint
```

### 构建应用

```bash
# 构建渲染进程和 Electron 主进程
npm run build

# 只构建渲染进程（React 前端）
npm run build:renderer

# 只构建 Electron 主进程
npm run build:electron
```

### 打包分发

```bash
# 生成安装包（.exe）
npm run dist

# 打包但不生成安装包（用于测试）
npm run pack
```

构建产物位于 `release/` 目录：
- `OpenMDtx Setup 1.4.0.exe` - 安装程序
- `win-unpacked/` - 便携版目录

**发布到 GitHub**: 运行 `create-release.bat` 脚本自动创建 Release 并上传文件

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出新功能建议！

### 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循现有代码风格
- 添加必要的注释和文档
- 确保代码通过 ESLint 检查
- 测试新功能是否正常工作

---

## 📝 更新日志

### v1.4.0 (2026-03-25)

#### ✨ 新增功能

- ✅ **搜索与替换**
  - 支持 Ctrl+F 快速查找
  - 支持 Ctrl+H 替换
  - 支持正则表达式、区分大小写、全词匹配
  - 实时高亮显示所有匹配结果
  - 支持替换单个或全部匹配

- ✅ **跳转行号**
  - 支持 Ctrl+G 快速跳转到指定行
  - 状态栏显示当前行号和总行数

- ✅ **Word 导出优化**
  - 新增字体选择器，支持 7 种中文字体
  - 优化导出样式（标题边框、段落缩进、表格斑马纹、引用块）
  - 支持自定义 Word 模板

- ✅ **Mermaid 图表增强**
  - 修复主题配置不生效的问题
  - 支持 6 种主题风格
  - 支持 15+ 种图表类型

#### 🔧 改进

- 优化 Word 导出 CSS 样式
- 改进文档渲染效果

---

### v1.0.0 (2025-02-01)

#### 🎉 首次正式发布

- ✅ 完整的 Markdown 编辑功能
- ✅ 多文件管理和页签切换
- ✅ PDF/HTML/Word 导出
- ✅ 国际化支持（中文、English）
- ✅ 主题切换（浅色、深色、系统）
- ✅ Pandoc 自动搜索和手动配置
- ✅ 实时大纲和状态栏
- ✅ 完整的快捷键支持
- ✅ Word 导出优化（宋体、黑色）
- ✅ MIT 开源协议

#### 🔧 技术特性

- Electron 40.1.0
- React 19.2.0
- TipTap 3.18.0
- TypeScript 5.9.3
- Vite 7.2.4

---

## ❓ 常见问题

### Q: Word 导出失败怎么办？

A: 请确保已安装 Pandoc：
1. 打开"帮助 → 设置"
2. 点击"自动搜索"按钮
3. 如果未找到，请访问 https://pandoc.org/installing.html 下载安装

### Q: 如何切换语言？

A: 打开"帮助 → 设置"，在"语言"下拉菜单中选择所需语言。

### Q: 如何切换主题？

A: 打开"帮助 → 设置"，在"主题"下拉菜单中选择：
- 浅色
- 深色
- 跟随系统

### Q: 支持哪些 Markdown 语法？

A: OpenMDtx 支持 CommonMark 和 GFM (GitHub Flavored Markdown) 规范，包括：
- 标题（H1-H6）
- 粗体、斜体、删除线
- 列表（有序、无序、任务）
- 代码块（带语法高亮）
- 引用块
- 表格
- 链接、图片
- 水平分割线

### Q: 界面显示白屏怎么办？

A: 请确保下载的是最新版本。如果问题仍然存在，请提交 Issue。

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

```
MIT License

Copyright (c) 2026 xiaoq16

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [React](https://react.dev/) - UI 框架
- [TipTap](https://tiptap.dev/) - 无头富文本编辑器
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pandoc](https://pandoc.org/) - 通用文档转换器

---

<div align="center">

**Made with ❤️ by xiaoq16**

[官网](https://github.com/Xiaoqiang-Zhao/Mdtx) • [下载](https://github.com/Xiaoqiang-Zhao/Mdtx/releases/latest) • [文档](https://github.com/Xiaoqiang-Zhao/Mdtx/blob/main/RELEASE_INSTRUCTIONS.md) • [问题反馈](https://github.com/Xiaoqiang-Zhao/Mdtx/issues)

</div>
