# Fresh Deployment Creation Script for earshyogwe.com
Write-Host "Creating Fresh Deployment Package for earshyogwe.com..." -ForegroundColor Green

# Clean up any existing deployment folders
if (Test-Path "new-deploy") {
    Remove-Item -Recurse -Force "new-deploy"
    Write-Host "Cleaned up existing new-deploy folder" -ForegroundColor Yellow
}

# Create fresh deployment structure
New-Item -ItemType Directory -Force -Path "new-deploy" | Out-Null
New-Item -ItemType Directory -Force -Path "new-deploy\frontend-production" | Out-Null
New-Item -ItemType Directory -Force -Path "new-deploy\backend-production" | Out-Null
New-Item -ItemType Directory -Force -Path "new-deploy\api-public" | Out-Null

Write-Host "Created deployment directory structure" -ForegroundColor Green

# Copy fresh frontend build
Write-Host "Copying frontend production files..." -ForegroundColor Cyan
Copy-Item -Recurse -Force "dist\*" "new-deploy\frontend-production\"

# Ensure .htaccess is included
if (Test-Path "public\.htaccess") {
    Copy-Item -Force "public\.htaccess" "new-deploy\frontend-production\.htaccess"
    Write-Host "Added .htaccess file for frontend routing" -ForegroundColor Green
} else {
    Write-Host "Warning: .htaccess file not found in public directory" -ForegroundColor Yellow
}

# Copy backend files
Write-Host "Copying backend production files..." -ForegroundColor Cyan
Copy-Item -Recurse -Force "backend\*" "new-deploy\backend-production\"

# Copy API public files
Write-Host "Copying API public files..." -ForegroundColor Cyan
Copy-Item -Recurse -Force "backend\public\*" "new-deploy\api-public\"

# Verify the deployment package
Write-Host "Verifying deployment package..." -ForegroundColor Cyan

$frontendFiles = Get-ChildItem "new-deploy\frontend-production" -Force
$backendFiles = Get-ChildItem "new-deploy\backend-production" -Force
$apiFiles = Get-ChildItem "new-deploy\api-public" -Force

Write-Host "Frontend files: $($frontendFiles.Count) items" -ForegroundColor White
Write-Host "Backend files: $($backendFiles.Count) items" -ForegroundColor White
Write-Host "API files: $($apiFiles.Count) items" -ForegroundColor White

# Check for critical files
$criticalFiles = @(
    "new-deploy\frontend-production\index.html",
    "new-deploy\frontend-production\.htaccess",
    "new-deploy\backend-production\.env.production",
    "new-deploy\api-public\index.php"
)

Write-Host "Checking critical files..." -ForegroundColor Cyan
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "Found: $file" -ForegroundColor Green
    } else {
        Write-Host "Missing: $file" -ForegroundColor Red
    }
}

Write-Host "Fresh deployment package created successfully!" -ForegroundColor Green
Write-Host "Ready for upload to earshyogwe.com" -ForegroundColor Green
