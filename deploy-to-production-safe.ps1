# Safe Production Deployment Script
# This script safely copies built files to production-hostinger

Write-Host "Starting safe production deployment..." -ForegroundColor Green

# Step 1: Verify dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ dist folder not found. Please run build first." -ForegroundColor Red
    Write-Host "Run: npm run build" -ForegroundColor Yellow
    exit 1
}

# Step 2: Backup current production files
Write-Host "Creating backup of current production files..." -ForegroundColor Yellow
$backupDir = "production-backup-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')"
if (Test-Path "production-hostinger") {
    Copy-Item -Recurse "production-hostinger" $backupDir
    Write-Host "✓ Backup created: $backupDir" -ForegroundColor Green
}

# Step 3: Copy built files to production
Write-Host "Copying built files to production..." -ForegroundColor Yellow

# Copy main files
if (Test-Path "dist/index.html") {
    Copy-Item "dist/index.html" "production-hostinger/index.html" -Force
    Write-Host "✓ Copied index.html" -ForegroundColor Green
}

# Copy assets directory
if (Test-Path "dist/assets") {
    if (Test-Path "production-hostinger/assets") {
        Remove-Item -Recurse -Force "production-hostinger/assets"
    }
    Copy-Item -Recurse "dist/assets" "production-hostinger/assets"
    Write-Host "✓ Copied assets directory" -ForegroundColor Green
}

# Copy public files (images, etc.)
if (Test-Path "dist/*.jpg") {
    Copy-Item "dist/*.jpg" "production-hostinger/" -Force
    Write-Host "✓ Copied images" -ForegroundColor Green
}

# Step 4: Verify deployment
Write-Host "Verifying deployment..." -ForegroundColor Yellow
if (Test-Path "production-hostinger/index.html") {
    Write-Host "✓ index.html deployed" -ForegroundColor Green
}
if (Test-Path "production-hostinger/assets") {
    Write-Host "✓ assets deployed" -ForegroundColor Green
}

Write-Host "🎉 Safe deployment completed!" -ForegroundColor Green
Write-Host "Production files updated in production-hostinger directory." -ForegroundColor Cyan
Write-Host "Backup available in: $backupDir" -ForegroundColor Yellow
