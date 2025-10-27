@echo off
:: === Auto push appstate lên GitHub và Render ===
cd /d "C:\Users\Admin\Documents\qtdev-main"
echo.
echo [AUTO PUSH] Đang cập nhật thay đổi...
git add .
git commit -m "Auto update appstate"
git push origin main
echo.
echo [AUTO PUSH] ✅ Hoàn tất đẩy lên GitHub!
echo Đang đợi 30 giây trước khi thoát...
timeout /t 30 >nul
exit
