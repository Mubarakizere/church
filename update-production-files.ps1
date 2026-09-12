# Script to update production files with corrected content

Write-Host "Updating production files with corrected content..." -ForegroundColor Green

# Step 1: Build the project with corrected content
Write-Host "Building project with corrected Bishop and About Us content..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green

# Step 2: Create backup of current production files
$backupDir = "production-backup-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')"
if (Test-Path "production-hostinger") {
    Copy-Item -Recurse "production-hostinger" $backupDir
    Write-Host "✓ Backup created: $backupDir" -ForegroundColor Green
}

# Step 3: Copy new built files to production
Write-Host "Copying updated files to production..." -ForegroundColor Yellow

# Copy main index.html
if (Test-Path "dist/index.html") {
    Copy-Item "dist/index.html" "production-hostinger/index.html" -Force
    Write-Host "✓ Updated index.html" -ForegroundColor Green
}

# Copy assets directory
if (Test-Path "dist/assets") {
    if (Test-Path "production-hostinger/assets") {
        Remove-Item -Recurse -Force "production-hostinger/assets"
    }
    Copy-Item -Recurse "dist/assets" "production-hostinger/assets"
    Write-Host "✓ Updated assets directory" -ForegroundColor Green
}

# Copy images
if (Test-Path "dist/*.jpg") {
    Copy-Item "dist/*.jpg" "production-hostinger/" -Force
    Write-Host "✓ Updated images" -ForegroundColor Green
}

Write-Host "🎉 Production files updated successfully!" -ForegroundColor Green
Write-Host "Changes made:" -ForegroundColor Cyan
Write-Host "- Bishop page now fetches data from API instead of hardcoded text" -ForegroundColor White
Write-Host "- About Us page corrected from 'St. Matthew's' to 'Shyogwe Diocese'" -ForegroundColor White
Write-Host "- All text now reflects correct church information" -ForegroundColor White
Write-Host "Backup available in: $backupDir" -ForegroundColor Yellow
