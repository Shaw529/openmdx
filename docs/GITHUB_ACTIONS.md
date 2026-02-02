# GitHub Actions 配置说明

本项目使用 GitHub Actions 实现 Windows 平台的持续集成和代码质量检查。

## 📋 工作流列表

### CI (持续集成 - Windows)

**文件**: `.github/workflows/ci.yml`

**触发条件**:
- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request 到 `main` 或 `develop` 分支

**执行任务**:
- ✅ **代码检查**: 运行 ESLint 检查代码规范
- 🏗️ **构建测试**: 在 Windows 平台构建应用
- 🔍 **依赖检查**: 检查依赖包的安全漏洞和更新

**平台支持**: Windows 10/11 (64-bit)

**查看结果**: Actions 标签页 → CI 工作流

---

## 🏷️ 标签系统

**文件**: `.github/labels.yml`

项目预定义的标签分类：

### 🐛 问题类型
- `bug` - Bug 报告
- `enhancement` - 功能增强
- `question` - 问题询问
- `documentation` - 文档相关

### 🎯 优先级
- `critical` - 紧急
- `high priority` - 高优先级
- `low priority` - 低优先级

### 💻 平台
- `windows` - Windows 特定
- `portable` - 绿色便携版

### 🔧 功能模块
- `export` - 导出功能
- `i18n` - 国际化
- `ui` - 用户界面
- `electron` - Electron 相关
- `build` - 构建打包
- `dependencies` - 依赖更新

### 👥 状态标签
- `good first issue` - 适合新手
- `help wanted` - 欢迎贡献
- `duplicate` - 重复问题
- `wontfix` - 不予修复

---

## 🚀 本地构建

### 构建绿色便携版

```bash
# 1. 安装依赖
npm install

# 2. 构建渲染进程
npm run build:renderer

# 3. 构建 Electron 主进程
npm run build:electron

# 4. 打包应用（不生成安装程序）
npm run pack

# 5. 绿色版输出目录
# release/win-unpacked/
```

### 构建安装程序

```bash
# 生成 .exe 安装程序
npm run dist

# 输出目录
# release/OpenMDtx Setup 1.1.0.exe
```

---

## 📊 Badge 徽章

README.md 中的徽章：

```markdown
[![CI](https://github.com/Shaw529/openmdx/actions/workflows/ci.yml/badge.svg)](https://github.com/Shaw529/openmdx/actions/workflows/ci.yml)
```

---

## 🔧 自定义配置

### 修改 Node.js 版本

编辑 `.github/workflows/ci.yml`：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 修改为所需版本
```

### 修改触发条件

编辑 `.github/workflows/ci.yml` 的 `on` 部分：

```yaml
on:
  push:
    branches: [main, develop]  # 添加或删除分支
  pull_request:
    branches: [main]
```

---

## 📚 相关资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Electron Builder 文档](https://www.electron.build/)
- [工作流语法](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

**平台说明**: 本项目仅支持 Windows 平台。
