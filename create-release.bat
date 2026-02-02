@echo off
echo ========================================
echo   OpenMDtx v1.1.0 Release Creator
echo ========================================
echo.

REM 检查是否安装了 GitHub CLI
where gh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未安装 GitHub CLI (gh)
    echo.
    echo 请选择以下方式之一创建 Release：
    echo.
    echo 方式一：安装 GitHub CLI（推荐）
    echo   1. 访问 https://cli.github.com/
    echo   2. 下载并安装 GitHub CLI
    echo   3. 运行: gh auth login
    echo   4. 重新运行此脚本
    echo.
    echo 方式二：手动创建 Release
    echo   1. 访问: https://github.com/Shaw529/openmdx/releases/new
    echo   2. 标签填写: v1.1.0
    echo   3. 上传以下文件:
    echo      - release/OpenMDtx Setup 1.1.0.exe
    echo      - release/OpenMDtx-Portable-1.1.0.zip
    echo   4. 复制 RELEASE_NOTES.md 的内容到描述框
    echo.
    pause
    exit /b 1
)

REM 创建 Release
echo [1/3] 正在创建 GitHub Release...
gh release create v1.1.0 ^
    "release/OpenMDtx Setup 1.1.0.exe" ^
    "release/OpenMDtx-Portable-1.1.0.zip" ^
    --title "OpenMDtx v1.1.0 - 首次正式发布" ^
    --notes-file "RELEASE_NOTES.md"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [成功] Release 创建成功！
    echo.
    echo 访问地址: https://github.com/Shaw529/openmdx/releases/tag/v1.1.0
) else (
    echo.
    echo [错误] Release 创建失败
    echo 请检查:
    echo 1. 是否已登录 (gh auth login)
    echo 2. 是否有仓库权限
    echo 3. 标签 v1.1.0 是否已存在
)

echo.
pause
