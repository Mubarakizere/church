# Fresh Deployment Creation Script for earshyogwe.com
# This script creates a completely fresh deployment package with all URLs properly configured

Write-Host "🚀 Creating Fresh Deployment Package for earshyogwe.com..." -ForegroundColor Green

# Clean up any existing deployment folders
if (Test-Path "new-deploy") {
    Remove-Item -Recurse -Force "new-deploy"
    Write-Host "✅ Cleaned up existing new-deploy folder" -ForegroundColor Yellow
}

# Create fresh deployment structure
New-Item -ItemType Directory -Force -Path "new-deploy" | Out-Null
New-Item -ItemType Directory -Force -Path "new-deploy\frontend-production" | Out-Null
New-Item -ItemType Directory -Force -Path "new-deploy\backend-production" | Out-Null
New-Item -ItemType Directory -Force -Path "new-deploy\api-public" | Out-Null

Write-Host "✅ Created deployment directory structure" -ForegroundColor Green

# Copy fresh frontend build
Write-Host "📦 Copying frontend production files..." -ForegroundColor Cyan
Copy-Item -Recurse -Force "dist\*" "new-deploy\frontend-production\"

# Ensure .htaccess is included
if (Test-Path "public\.htaccess") {
    Copy-Item -Force "public\.htaccess" "new-deploy\frontend-production\.htaccess"
    Write-Host "✅ Added .htaccess file for frontend routing" -ForegroundColor Green
} else {
    Write-Host "⚠️ Warning: .htaccess file not found in public directory" -ForegroundColor Yellow
}

# Copy backend files
Write-Host "📦 Copying backend production files..." -ForegroundColor Cyan
Copy-Item -Recurse -Force "backend\*" "new-deploy\backend-production\"

# Copy API public files
Write-Host "📦 Copying API public files..." -ForegroundColor Cyan
Copy-Item -Recurse -Force "backend\public\*" "new-deploy\api-public\"

# Verify the deployment package
Write-Host "`n🔍 Verifying deployment package..." -ForegroundColor Cyan

$frontendFiles = Get-ChildItem "new-deploy\frontend-production" -Force
$backendFiles = Get-ChildItem "new-deploy\backend-production" -Force
$apiFiles = Get-ChildItem "new-deploy\api-public" -Force

Write-Host "📁 Frontend files: $($frontendFiles.Count) items" -ForegroundColor White
Write-Host "📁 Backend files: $($backendFiles.Count) items" -ForegroundColor White
Write-Host "📁 API files: $($apiFiles.Count) items" -ForegroundColor White

# Check for critical files
$criticalFiles = @(
    "new-deploy\frontend-production\index.html",
    "new-deploy\frontend-production\.htaccess",
    "new-deploy\backend-production\.env.production",
    "new-deploy\api-public\index.php"
)

Write-Host "`n🔍 Checking critical files..." -ForegroundColor Cyan
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
    }
}

# Check JavaScript files for correct API URLs
Write-Host "`n🔍 Checking API URLs in JavaScript files..." -ForegroundColor Cyan
$jsFiles = Get-ChildItem "new-deploy\frontend-production\assets\*.js" -Force

foreach ($jsFile in $jsFiles) {
    $content = Get-Content $jsFile.FullName -Raw
    if ($content -match "earshyogwe\.com") {
        Write-Host "✅ Found earshyogwe.com URLs in $($jsFile.Name)" -ForegroundColor Green
    }
    if ($content -match "localhost|127\.0\.0\.1") {
        Write-Host "⚠️ Warning: Found localhost URLs in $($jsFile.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`n📋 Deployment Package Summary:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📁 Package Location: new-deploy\" -ForegroundColor White
Write-Host "🌐 Configured for: earshyogwe.com" -ForegroundColor White
Write-Host "📦 Frontend: new-deploy\frontend-production\" -ForegroundColor White
Write-Host "🔧 Backend: new-deploy\backend-production\" -ForegroundColor White
Write-Host "🔗 API: new-deploy\api-public\" -ForegroundColor White

Write-Host "`n📋 Deployment Instructions:" -ForegroundColor Green
Write-Host "1. Upload 'frontend-production' contents to public_html/" -ForegroundColor White
Write-Host "2. Upload 'backend-production' folder to secure location" -ForegroundColor White
Write-Host "3. Upload 'api-public' contents to public_html/api/" -ForegroundColor White
Write-Host "4. Configure database credentials in backend .env" -ForegroundColor White
Write-Host "5. Run: php artisan migrate --force" -ForegroundColor White
Write-Host "6. Run: php artisan storage:link" -ForegroundColor White

Write-Host "`n🎉 Fresh deployment package created successfully!" -ForegroundColor Green
Write-Host "Ready for upload to earshyogwe.com" -ForegroundColor Green
