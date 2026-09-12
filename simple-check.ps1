# Simple URL Configuration Checker

Write-Host "🔍 Church CMS URL Configuration Check" -ForegroundColor Green

# Check frontend API config
Write-Host ""
Write-Host "Frontend API Configuration:" -ForegroundColor Cyan
if (Test-Path "src\config\api.ts") {
    $content = Get-Content "src\config\api.ts" -Raw
    if ($content -match "your-domain\.com") {
        Write-Host "⚠️  Still using placeholder domain" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Frontend API config looks good" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Frontend API config not found" -ForegroundColor Red
}

# Check backend production config
Write-Host ""
Write-Host "Backend Production Configuration:" -ForegroundColor Cyan
if (Test-Path "backend\.env.production") {
    $content = Get-Content "backend\.env.production" -Raw
    if ($content -match "your-domain\.com") {
        Write-Host "⚠️  Still using placeholder domain" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Backend production config looks good" -ForegroundColor Green
    }
    
    # Show key URLs
    $lines = Get-Content "backend\.env.production"
    foreach ($line in $lines) {
        if ($line.StartsWith("APP_URL=")) {
            Write-Host "📍 $line" -ForegroundColor Gray
        }
        if ($line.StartsWith("VITE_API_URL=")) {
            Write-Host "📍 $line" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Backend production config not found" -ForegroundColor Red
}

# Check build status
Write-Host ""
Write-Host "Build Status:" -ForegroundColor Cyan
if (Test-Path "dist") {
    Write-Host "✅ Frontend build exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  No frontend build - run 'npm run build'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 To configure for your domain:" -ForegroundColor Yellow
Write-Host ".\configure-production.ps1 -Domain 'yourdomain.com'" -ForegroundColor White
