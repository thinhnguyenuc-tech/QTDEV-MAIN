@echo off
chcp 65001 >nul
echo [AUTO PUSH] 🚀 Đang đẩy thay đổi mới lên GitHub...

git add .
git commit -m "update appstate.json"
git push -u origin main

echo.
echo [AUTO PUSH] ✅ Hoàn tất! Đã đẩy lên GitHub thành công.
echo.
timeout /t 30 /nobreak >nul
