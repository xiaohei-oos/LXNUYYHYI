@echo off
chcp 65001 >nul
title LXNUYYHYI 图片上传工具

:menu
cls
echo.
echo   ╔══════════════════════════════════════╗
echo   ║   LXNUYYHYI 图片上传工具             ║
echo   ╚══════════════════════════════════════╝
echo.
echo   请选择操作:
echo.
echo   [1] 查看所有分类
echo   [2] 上传 财富与财务 (Wealth Finance)
echo   [3] 上传 旅行与探索 (Travel Adventure)
echo   [4] 上传 健康与健身 (Health Fitness)
echo   [5] 上传 职业与事业 (Career Business)
echo   [6] 上传 自爱与成长 (Self-Love Growth)
echo   [7] 上传 家庭与关系 (Family Relationship)
echo   [8] 上传 居家生活 (Home Living)
echo   [9] 上传 灵性与显化 (Spiritual Manifestation)
echo   [A] 上传所有分类
echo   [Z] 生成ZIP包(所有分类)
echo   [0] 退出
echo.
set /p choice=   请输入选项:

if "%choice%"=="1" goto list
if "%choice%"=="2" goto wealth
if "%choice%"=="3" goto travel
if "%choice%"=="4" goto health
if "%choice%"=="5" goto career
if "%choice%"=="6" goto selflove
if "%choice%"=="7" goto family
if "%choice%"=="8" goto home
if "%choice%"=="9" goto spiritual
if /i "%choice%"=="A" goto all
if /i "%choice%"=="Z" goto zipall
if "%choice%"=="0" goto end

echo   无效选项，请重新选择
timeout /t 2 >nul
goto menu

:list
cls
echo.
node upload.js --list
echo.
pause
goto menu

:wealth
cls
echo.
echo   正在上传 Wealth Finance ...
echo.
node upload.js --category wealth-finance
echo.
pause
goto menu

:travel
cls
echo.
echo   正在上传 Travel Adventure ...
echo.
node upload.js --category travel-adventure
echo.
pause
goto menu

:health
cls
echo.
echo   正在上传 Health Fitness ...
echo.
node upload.js --category health-fitness
echo.
pause
goto menu

:career
cls
echo.
echo   正在上传 Career Business ...
echo.
node upload.js --category career-business
echo.
pause
goto menu

:selflove
cls
echo.
echo   正在上传 Self-Love Growth ...
echo.
node upload.js --category self-love-growth
echo.
pause
goto menu

:family
cls
echo.
echo   正在上传 Family Relationship ...
echo.
node upload.js --category family-relationship
echo.
pause
goto menu

:home
cls
echo.
echo   正在上传 Home Living ...
echo.
node upload.js --category home-living
echo.
pause
goto menu

:spiritual
cls
echo.
echo   正在上传 Spiritual Manifestation ...
echo.
node upload.js --category spiritual-manifestation
echo.
pause
goto menu

:all
cls
echo.
echo   正在上传所有分类...
echo.
node upload.js --all
echo.
pause
goto menu

:zipall
cls
echo.
echo   正在生成所有分类的ZIP包...
echo.
node upload.js --zip-all
echo.
pause
goto menu

:end
echo.
echo   再见！
timeout /t 1 >nul
exit
