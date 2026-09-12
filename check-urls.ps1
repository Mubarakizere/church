# Simple URL Configuration Checker for Church CMS

Write-Host "🔍 Church CMS URL Configuration Check" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray

# Check if we're in the right directory
if (-not (Test-Path "backend\artisan")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Current Configuration:" -ForegroundColor Yellow

# 1. Frontend API Configuration
Write-Host ""
Write-Host "1. Frontend API Config (src/config/api.ts):" -ForegroundColor Cyan
if (Test-Path "src\config\api.ts") {
    $apiContent = Get-Content "src\config\api.ts"
    $placeholderFound = $false
    foreach ($line in $apiContent) {
        if ($line -like "*your-domain.com*") {
            Write-Host "   ⚠️  Found placeholder: $($line.Trim())" -ForegroundColor Yellow
            $placeholderFound = $true
        }
    }
    if (-not $placeholderFound) {
        Write-Host "   ✅ No placeholder domains found" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ File not found" -ForegroundColor Red
}

# 2. Backend Production Environment
Write-Host ""
Write-Host "2. Backend Production Environment (.env.production):" -ForegroundColor Cyan
if (Test-Path "backend\.env.production") {
    $envContent = Get-Content "backend\.env.production"
    Write-Host "   ✅ File exists" -ForegroundColor Green
    
    foreach ($line in $envContent) {
        if ($line -like "APP_URL=*") {
            Write-Host "   📍 $line" -ForegroundColor Gray
            if ($line -like "*your-domain.com*") {
                Write-Host "   ⚠️  Using placeholder domain" -ForegroundColor Yellow
            }
        }
        if ($line -like "VITE_API_URL=*") {
            Write-Host "   📍 $line" -ForegroundColor Gray
        }
        if ($line -like "SANCTUM_STATEFUL_DOMAINS=*") {
            Write-Host "   📍 $line" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ❌ File not found" -ForegroundColor Red
}

# 3. Current Backend Environment
Write-Host ""
Write-Host "3. Current Backend Environment (.env):" -ForegroundColor Cyan
if (Test-Path "backend\.env") {
    $currentEnv = Get-Content "backend\.env"
    foreach ($line in $currentEnv) {
        if ($line -like "APP_URL=*") {
            Write-Host "   📍 $line" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ❌ File not found" -ForegroundColor Red
}

# 4. Frontend Environment Files
Write-Host ""
Write-Host "4. Frontend Environment Files:" -ForegroundColor Cyan
$frontendFiles = @(".env.local", ".env.production", ".env")
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file exists" -ForegroundColor Green
        $content = Get-Content $file
        foreach ($line in $content) {
            if ($line -like "VITE_API_URL=*") {
                Write-Host "      📍 $line" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ⚠️  $file not found" -ForegroundColor Yellow
    }
}

# 5. Check for build output
Write-Host ""
Write-Host "5. Build Status:" -ForegroundColor Cyan
if (Test-Path "dist") {
    Write-Host "   ✅ Frontend build output (dist/) exists" -ForegroundColor Green
    if (Test-Path "dist\index.html") {
        Write-Host "   ✅ index.html found" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  No build output found - run 'npm run build'" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow

$needsConfiguration = $false

# Check for placeholder domains
if (Test-Path "src\config\api.ts") {
    $apiContent = Get-Content "src\config\api.ts" -Raw
    if ($apiContent -like "*your-domain.com*") {
        $needsConfiguration = $true
    }
}

if (Test-Path "backend\.env.production") {
    $envContent = Get-Content "backend\.env.production" -Raw
    if ($envContent -like "*your-domain.com*") {
        $needsConfiguration = $true
    }
}

if ($needsConfiguration) {
    Write-Host ""
    Write-Host "⚠️  Configuration needed:" -ForegroundColor Yellow
    Write-Host "   • Placeholder domains found" -ForegroundColor Red
    Write-Host "   • Run: .\configure-production.ps1 -Domain 'yourdomain.com'" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✅ Configuration looks good!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Production Deployment Steps:" -ForegroundColor Yellow
Write-Host "1. Configure URLs: .\configure-production.ps1 -Domain 'yourdomain.com'" -ForegroundColor White
Write-Host "2. Update database credentials in backend\.env.production" -ForegroundColor White
Write-Host "3. Build frontend: npm run build" -ForegroundColor White
Write-Host "4. Upload dist/ to web root" -ForegroundColor White
Write-Host "5. Upload backend/ to secure location" -ForegroundColor White
Write-Host "6. Copy .env.production to .env on server" -ForegroundColor White
Write-Host "7. Run migrations: php artisan migrate --force" -ForegroundColor White
Write-Host "8. Update URLs: php artisan partners:update-urls" -ForegroundColor White

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Gray
