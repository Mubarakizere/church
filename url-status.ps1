Write-Host "Church CMS URL Configuration Status" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Gray

Write-Host ""
Write-Host "Frontend API Config:" -ForegroundColor Cyan
if (Test-Path "src\config\api.ts") {
    $content = Get-Content "src\config\api.ts" -Raw
    if ($content -match "your-domain") {
        Write-Host "  Status: Needs configuration (placeholder domain found)" -ForegroundColor Yellow
    } else {
        Write-Host "  Status: Configured" -ForegroundColor Green
    }
} else {
    Write-Host "  Status: File not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Backend Production Config:" -ForegroundColor Cyan
if (Test-Path "backend\.env.production") {
    $content = Get-Content "backend\.env.production" -Raw
    if ($content -match "your-domain") {
        Write-Host "  Status: Needs configuration (placeholder domain found)" -ForegroundColor Yellow
    } else {
        Write-Host "  Status: Configured" -ForegroundColor Green
    }
} else {
    Write-Host "  Status: File not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Build Status:" -ForegroundColor Cyan
if (Test-Path "dist") {
    Write-Host "  Status: Built and ready" -ForegroundColor Green
} else {
    Write-Host "  Status: Not built (run npm run build)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure URLs: .\configure-production.ps1 -Domain yourdomain.com" -ForegroundColor White
Write-Host "2. Build frontend: npm run build" -ForegroundColor White
Write-Host "3. Deploy to server" -ForegroundColor White
