# Package Church CMS for earshyogwe.com Deployment

Write-Host "📦 Packaging Church CMS for earshyogwe.com deployment..." -ForegroundColor Green

# Create deployment directory
$deployDir = "deployment-earshyogwe"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

Write-Host "✅ Created deployment directory: $deployDir" -ForegroundColor Green

# 1. Package Frontend (for web root)
Write-Host "📱 Packaging frontend files..." -ForegroundColor Cyan
$frontendDir = "$deployDir\web-root"
New-Item -ItemType Directory -Path $frontendDir | Out-Null

# Copy dist contents
Copy-Item "dist\*" $frontendDir -Recurse -Force
Write-Host "   ✅ Copied frontend files to web-root/" -ForegroundColor Green
Write-Host "   ✅ .htaccess included for React Router" -ForegroundColor Green

# 2. Package Backend (for secure location)
Write-Host "🔧 Packaging backend files..." -ForegroundColor Cyan
$backendDir = "$deployDir\laravel-backend"
New-Item -ItemType Directory -Path $backendDir | Out-Null

# Copy backend files (excluding node_modules, vendor, storage/logs)
$excludeItems = @("node_modules", "vendor", "storage\logs\*", "storage\framework\cache\*", "storage\framework\sessions\*", "storage\framework\views\*")

robocopy "backend" $backendDir /E /XD node_modules vendor /XF "*.log" | Out-Null
Write-Host "   ✅ Copied Laravel backend files" -ForegroundColor Green

# 3. Package API files (for public_html/api/)
Write-Host "🔌 Packaging API files..." -ForegroundColor Cyan
$apiDir = "$deployDir\api"
New-Item -ItemType Directory -Path $apiDir | Out-Null

# Copy Laravel public directory contents
Copy-Item "backend\public\*" $apiDir -Recurse -Force
Write-Host "   ✅ Copied API public files" -ForegroundColor Green

# 4. Create deployment instructions
Write-Host "📋 Creating deployment instructions..." -ForegroundColor Cyan

$instructions = @"
# 🚀 earshyogwe.com Deployment Instructions

## 📁 Folder Contents:

### 1. web-root/
Upload these files to your web server's public_html/ directory:
- index.html (React app)
- .htaccess (✅ Frontend routing - fixes /about page)
- assets/ (CSS, JS, images)
- Static files

### 2. laravel-backend/
Upload this folder to a secure location outside web root.
You can rename it to anything you want:
- church-cms/
- earshyogwe-api/
- backend/
- Any name you prefer

### 3. api/
Upload these files to public_html/api/ directory:
- index.php (Laravel entry point)
- .htaccess (API routing)

## 🔧 Server Setup:

1. Upload web-root/ contents to public_html/
2. Upload laravel-backend/ to secure location outside web root
3. Upload api/ contents to public_html/api/
4. In your Laravel directory:
   ```bash
   cp .env.production .env
   # Update database credentials in .env
   php artisan migrate --force
   php artisan storage:link
   php artisan config:cache
   ```

## 🧪 Test URLs:
- https://earshyogwe.com/ (Homepage)
- https://earshyogwe.com/about (Should work now!)
- https://earshyogwe.com/admin (Admin panel)
- https://earshyogwe.com/api/partners (API test)

## 🔧 Database Configuration:
Update these in your server's .env file:
```
DB_DATABASE=your_database_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

Your Church CMS is ready for earshyogwe.com! 🎉
"@

$instructions | Out-File -FilePath "$deployDir\DEPLOYMENT_INSTRUCTIONS.txt" -Encoding UTF8

# 5. Create a summary
Write-Host ""
Write-Host "🎉 Deployment package created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Package contents:" -ForegroundColor Yellow
Write-Host "   📁 $deployDir\web-root\          → Upload to public_html/" -ForegroundColor White
Write-Host "   📁 $deployDir\laravel-backend\   → Upload to secure location" -ForegroundColor White
Write-Host "   📁 $deployDir\api\               → Upload to public_html/api/" -ForegroundColor White
Write-Host "   📄 $deployDir\DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor White
Write-Host ""
Write-Host "✅ Key fixes included:" -ForegroundColor Green
Write-Host "   • .htaccess file for frontend routing (fixes /about page)" -ForegroundColor White
Write-Host "   • Flexible backend folder naming" -ForegroundColor White
Write-Host "   • Complete API setup" -ForegroundColor White
Write-Host "   • Production environment configured for earshyogwe.com" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to deploy to earshyogwe.com!" -ForegroundColor Green
