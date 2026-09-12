@echo off
echo Starting Church CMS Local Backend...
cd backend
php artisan serve --port=8000
pause
