@echo off
chcp 65001 >nul   :: 可选：解决中文乱码（如果控制台支持）
echo.
echo [信息] 打包Web工程，生成dist文件。
echo.

%~d0
cd %~dp0

cd ..
call yarn build:prod

pause