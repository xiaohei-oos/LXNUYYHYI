@echo off
chcp 65001 >nul
title LXNUYYHYI - 上传压缩包到OSS

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║         LXNUYYHYI 压缩包上传工具                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 请选择分类（输入数字）：
echo.
echo   1. Wealth Finance        财富与财务
echo   2. Travel Adventure      旅行与探索
echo   3. Health Fitness        健康与健身
echo   4. Career Business       职业与事业
echo   5. Self Love Growth      自爱与成长
echo   6. Family Relationship   家庭与关系
echo   7. Home Living           居家生活
echo   8. Spiritual Manifestation 灵性与显化
echo.

set /p choice="请输入选项数字（1-8）："

if "%choice%"=="1" set slug=wealth-finance
if "%choice%"=="2" set slug=travel-adventure
if "%choice%"=="3" set slug=health-fitness
if "%choice%"=="4" set slug=career-business
if "%choice%"=="5" set slug=self-love-growth
if "%choice%"=="6" set slug=family-relationship
if "%choice%"=="7" set slug=home-living
if "%choice%"=="8" set slug=spiritual-manifestation

if "%slug%"=="" (
    echo.
    echo ❌ 无效选择，请重新运行并输入1-8的数字
    pause
    exit /b 1
)

echo.
echo 你选择的分类：%slug%
echo.
echo 请输入ZIP压缩包的完整路径：
echo （可以直接把文件拖拽到此窗口，会自动填入路径）
echo.

set /p zipfile="ZIP文件路径："

if "%zipfile%"=="" (
    echo.
    echo ❌ 未输入文件路径
    pause
    exit /b 1
)

echo.
echo ──────────────────────────────────────────────────────────────
echo 分类：%slug%
echo 文件：%zipfile%
echo ──────────────────────────────────────────────────────────────
echo.
echo 开始上传...
echo.

node upload.js --upload-zip %slug% --file "%zipfile%"

echo.
echo ──────────────────────────────────────────────────────────────
echo 上传完成！
echo ──────────────────────────────────────────────────────────────
echo.
pause
