# Safe Production Build Script
# This script helps avoid common build and deployment errors

Write-Host "Starting safe production build..." -ForegroundColor Green

# Step 1: Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✓ Removed dist directory" -ForegroundColor Green
}

# Step 2: Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 3: Check for TypeScript errors
Write-Host "Checking TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript errors found. Please fix them before building." -ForegroundColor Red
    exit 1
}
Write-Host "✓ No TypeScript errors" -ForegroundColor Green

# Step 4: Check for linting errors
Write-Host "Checking linting..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting errors found. Please fix them before building." -ForegroundColor Red
    exit 1
}
Write-Host "✓ No linting errors" -ForegroundColor Green

# Step 5: Build for production
Write-Host "Building for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

# Step 6: Check build output
Write-Host "Checking build output..." -ForegroundColor Yellow
if (-not (Test-Path "dist/index.html")) {
    Write-Host "❌ index.html not found in dist" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "dist/assets")) {
    Write-Host "❌ assets directory not found in dist" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build output verified" -ForegroundColor Green

Write-Host "🎉 Safe build completed successfully!" -ForegroundColor Green
Write-Host "You can now safely upload the contents of the 'dist' folder to production." -ForegroundColor Cyan
