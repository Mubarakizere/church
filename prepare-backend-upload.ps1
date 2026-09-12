# PowerShell script to prepare backend files for upload
# This creates a folder with all the files you need to upload

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  Preparing Backend Files for Upload" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Create upload folder
$uploadFolder = "backend-upload-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
Write-Host "Creating upload folder: $uploadFolder" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $uploadFolder -Force | Out-Null

# Copy files maintaining directory structure
Write-Host ""
Write-Host "Copying files..." -ForegroundColor Yellow
Write-Host ""

# 1. Routes
Write-Host "[1/6] Copying routes/api.php..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$uploadFolder\routes" -Force | Out-Null
Copy-Item "backend\routes\api.php" "$uploadFolder\routes\api.php"

# 2. ImageUploadController
Write-Host "[2/6] Copying ImageUploadController.php..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$uploadFolder\app\Http\Controllers\Api" -Force | Out-Null
Copy-Item "backend\app\Http\Controllers\Api\ImageUploadController.php" "$uploadFolder\app\Http\Controllers\Api\ImageUploadController.php"

# 3. GalleryController
Write-Host "[3/6] Copying GalleryController.php..." -ForegroundColor Green
Copy-Item "backend\app\Http\Controllers\Api\GalleryController.php" "$uploadFolder\app\Http\Controllers\Api\GalleryController.php"

# 4. Gallery Model
Write-Host "[4/6] Copying Gallery.php model..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$uploadFolder\app\Models" -Force | Out-Null
Copy-Item "backend\app\Models\Gallery.php" "$uploadFolder\app\Models\Gallery.php"

# 5. Gallery Migration
Write-Host "[5/6] Copying gallery migration..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$uploadFolder\database\migrations" -Force | Out-Null
Copy-Item "backend\database\migrations\2025_10_23_120000_create_gallery_table.php" "$uploadFolder\database\migrations\2025_10_23_120000_create_gallery_table.php"

# 6. Gallery Seeder
Write-Host "[6/6] Copying GallerySeeder.php..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$uploadFolder\database\seeders" -Force | Out-Null
Copy-Item "backend\database\seeders\GallerySeeder.php" "$uploadFolder\database\seeders\GallerySeeder.php"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  Files prepared successfully!" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Upload folder created: $uploadFolder" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Upload all files from '$uploadFolder' folder to your server" -ForegroundColor White
Write-Host "     maintaining the same directory structure" -ForegroundColor White
Write-Host ""
Write-Host "  2. Run these commands via SSH:" -ForegroundColor White
Write-Host "     cd /home/u493455048/domains/earshyogwe.com/public_html/api" -ForegroundColor Cyan
Write-Host "     php artisan optimize:clear" -ForegroundColor Cyan
Write-Host "     php artisan route:cache" -ForegroundColor Cyan
Write-Host "     mkdir -p storage/app/public/images/{news,gallery}" -ForegroundColor Cyan
Write-Host "     chmod -R 775 storage/app/public/images" -ForegroundColor Cyan
Write-Host "     php artisan storage:link" -ForegroundColor Cyan
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan

