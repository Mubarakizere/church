Write-Host "Creating deployment package for earshyogwe.com..." -ForegroundColor Green

# Create deployment directory
$deployDir = "deployment-earshyogwe"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir

# 1. Package Frontend
Write-Host "Packaging frontend..." -ForegroundColor Cyan
$frontendDir = "$deployDir\web-root"
New-Item -ItemType Directory -Path $frontendDir
Copy-Item "dist\*" $frontendDir -Recurse -Force

# 2. Package Backend
Write-Host "Packaging backend..." -ForegroundColor Cyan
$backendDir = "$deployDir\laravel-backend"
New-Item -ItemType Directory -Path $backendDir
robocopy "backend" $backendDir /E /XD node_modules vendor

# 3. Package API
Write-Host "Packaging API..." -ForegroundColor Cyan
$apiDir = "$deployDir\api"
New-Item -ItemType Directory -Path $apiDir
Copy-Item "backend\public\*" $apiDir -Recurse -Force

Write-Host ""
Write-Host "Deployment package created!" -ForegroundColor Green
Write-Host "Upload web-root/ to public_html/" -ForegroundColor White
Write-Host "Upload laravel-backend/ to secure location" -ForegroundColor White
Write-Host "Upload api/ to public_html/api/" -ForegroundColor White
