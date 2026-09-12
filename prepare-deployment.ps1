# Deployment Package Preparation Script
# Date: October 23, 2025

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   Shyogwe Diocese CMS - Deployment Package   " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Create deployment directory
$deploymentDir = "deployment-$(Get-Date -Format 'yyyy-MM-dd-HH-mm')"
Write-Host "Creating deployment package: $deploymentDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $deploymentDir -Force | Out-Null
New-Item -ItemType Directory -Path "$deploymentDir/backend" -Force | Out-Null
New-Item -ItemType Directory -Path "$deploymentDir/frontend" -Force | Out-Null

Write-Host ""
Write-Host "=== BACKEND FILES ===" -ForegroundColor Green

# Controllers
Write-Host "Copying Controllers..." -ForegroundColor Cyan
$controllerDest = "$deploymentDir/backend/app/Http/Controllers/Api"
New-Item -ItemType Directory -Path $controllerDest -Force | Out-Null

Copy-Item "backend/app/Http/Controllers/Api/SchoolController.php" $controllerDest -Force
Copy-Item "backend/app/Http/Controllers/Api/HealthCenterController.php" $controllerDest -Force
Copy-Item "backend/app/Http/Controllers/Api/HealthPostController.php" $controllerDest -Force
Copy-Item "backend/app/Http/Controllers/Api/GalleryController.php" $controllerDest -Force
Copy-Item "backend/app/Http/Controllers/Api/ImageUploadController.php" $controllerDest -Force
Write-Host "  ✓ 5 Controllers copied" -ForegroundColor White

# Models
Write-Host "Copying Models..." -ForegroundColor Cyan
$modelDest = "$deploymentDir/backend/app/Models"
New-Item -ItemType Directory -Path $modelDest -Force | Out-Null
Copy-Item "backend/app/Models/Gallery.php" $modelDest -Force
Write-Host "  ✓ 1 Model copied" -ForegroundColor White

# Migrations
Write-Host "Copying Migrations..." -ForegroundColor Cyan
$migrationDest = "$deploymentDir/backend/database/migrations"
New-Item -ItemType Directory -Path $migrationDest -Force | Out-Null
Copy-Item "backend/database/migrations/2025_10_23_120000_create_gallery_table.php" $migrationDest -Force
Write-Host "  ✓ 1 Migration copied" -ForegroundColor White

# Seeders
Write-Host "Copying Seeders..." -ForegroundColor Cyan
$seederDest = "$deploymentDir/backend/database/seeders"
New-Item -ItemType Directory -Path $seederDest -Force | Out-Null
Copy-Item "backend/database/seeders/GallerySeeder.php" $seederDest -Force
Write-Host "  ✓ 1 Seeder copied" -ForegroundColor White

# Routes
Write-Host "Copying Routes..." -ForegroundColor Cyan
$routeDest = "$deploymentDir/backend/routes"
New-Item -ItemType Directory -Path $routeDest -Force | Out-Null
Copy-Item "backend/routes/api.php" $routeDest -Force
Write-Host "  ✓ 1 Route file copied" -ForegroundColor White

Write-Host ""
Write-Host "=== FRONTEND BUILD ===" -ForegroundColor Green
Write-Host "Building frontend..." -ForegroundColor Cyan

# Build frontend
npm run build

if (Test-Path "dist") {
    Write-Host "  ✓ Frontend built successfully" -ForegroundColor White
    Write-Host "Copying frontend build files..." -ForegroundColor Cyan
    Copy-Item -Path "dist/*" -Destination "$deploymentDir/frontend" -Recurse -Force
    Write-Host "  ✓ Frontend files copied to deployment package" -ForegroundColor White
} else {
    Write-Host "  ✗ Build failed or dist folder not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== DOCUMENTATION ===" -ForegroundColor Green
Write-Host "Copying documentation files..." -ForegroundColor Cyan
Copy-Item "FILES_TO_UPLOAD.md" "$deploymentDir/" -Force
Copy-Item "GALLERY_AND_NEWS_FIXES.md" "$deploymentDir/" -Force
Write-Host "  ✓ Documentation copied" -ForegroundColor White

# Create deployment instructions
$instructions = @"
# DEPLOYMENT INSTRUCTIONS
# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## BACKEND DEPLOYMENT

### Upload these files to: /home/u493455048/domains/earshyogwe.com/public_html/api/

1. app/Http/Controllers/Api/SchoolController.php
2. app/Http/Controllers/Api/HealthCenterController.php
3. app/Http/Controllers/Api/HealthPostController.php
4. app/Http/Controllers/Api/GalleryController.php (NEW)
5. app/Http/Controllers/Api/ImageUploadController.php (NEW)
6. app/Models/Gallery.php (NEW)
7. database/migrations/2025_10_23_120000_create_gallery_table.php (NEW)
8. database/seeders/GallerySeeder.php (NEW)
9. routes/api.php

### Run these commands via SSH:

``````bash
cd /home/u493455048/domains/earshyogwe.com/public_html/api

# Create storage link
php artisan storage:link

# Create image directories
mkdir -p storage/app/public/images/news
mkdir -p storage/app/public/images/gallery
mkdir -p storage/app/public/images/events
mkdir -p storage/app/public/images/team
mkdir -p storage/app/public/images/general

# Set permissions
chmod -R 775 storage/app/public/images

# Run migration
php artisan migrate

# Seed gallery (optional)
php artisan db:seed --class=GallerySeeder

# Clear caches
php artisan optimize:clear
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Cache for performance
php artisan route:cache
php artisan config:cache
``````

## FRONTEND DEPLOYMENT

### Upload entire contents of frontend/ folder to:
/home/u493455048/domains/earshyogwe.com/public_html/

Replace ALL existing files.

## TESTING

1. Gallery: https://earshyogwe.com/gallery
2. Admin Gallery: https://earshyogwe.com/admin/gallery
3. News: https://earshyogwe.com/news
4. Admin News: https://earshyogwe.com/admin/news
5. Test school update (no 500 error!)
6. Test health facility update (no 500 error!)

## IMPORTANT NOTES

- Image uploads now support up to 60MB
- Make sure PHP settings allow 60MB uploads:
  - upload_max_filesize = 60M
  - post_max_size = 60M
  - memory_limit = 256M

Done! 🎉
"@

Set-Content -Path "$deploymentDir/DEPLOY_NOW.txt" -Value $instructions

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT PACKAGE READY!                  " -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package Location: $deploymentDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Contents:" -ForegroundColor Cyan
Write-Host "  - backend/ (9 files)" -ForegroundColor White
Write-Host "  - frontend/ (built files)" -ForegroundColor White
Write-Host "  - DEPLOY_NOW.txt (instructions)" -ForegroundColor White
Write-Host "  - FILES_TO_UPLOAD.md (detailed list)" -ForegroundColor White
Write-Host "  - GALLERY_AND_NEWS_FIXES.md (documentation)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open $deploymentDir folder" -ForegroundColor White
Write-Host "2. Read DEPLOY_NOW.txt for instructions" -ForegroundColor White
Write-Host "3. Upload backend files via FTP" -ForegroundColor White
Write-Host "4. Upload frontend files via FTP" -ForegroundColor White
Write-Host "5. Run commands via SSH" -ForegroundColor White
Write-Host ""
Write-Host "Ready to deploy! 🚀" -ForegroundColor Green

