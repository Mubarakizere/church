# Church CMS Production URL Validation Script
# This script validates and shows all URL configurations for production

Write-Host "🔍 Church CMS Production URL Configuration Validation" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Check if we're in the right directory
if (-not (Test-Path "backend\artisan")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Current Configuration Status:" -ForegroundColor Yellow

# 1. Check Frontend API Configuration
Write-Host ""
Write-Host "1. Frontend API Configuration (src/config/api.ts):" -ForegroundColor Cyan
if (Test-Path "src\config\api.ts") {
    $apiConfig = Get-Content "src\config\api.ts" -Raw
    if ($apiConfig -match "your-domain\.com") {
        Write-Host "   ⚠️  Still using placeholder domain 'your-domain.com'" -ForegroundColor Yellow
        Write-Host "   📝 Action needed: Update with your actual domain" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Frontend API configuration looks good" -ForegroundColor Green
    }
    
    # Show current API URL logic
    $apiUrlLine = ($apiConfig -split "`n" | Where-Object { $_ -match "API_BASE_URL.*=" })[0]
    if ($apiUrlLine) {
        Write-Host "   📍 Current logic: $($apiUrlLine.Trim())" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Frontend API config file not found" -ForegroundColor Red
}

# 2. Check Backend Environment Configuration
Write-Host ""
Write-Host "2. Backend Environment Configuration:" -ForegroundColor Cyan

# Check production environment file
if (Test-Path "backend\.env.production") {
    Write-Host "   ✅ Production environment file exists" -ForegroundColor Green
    
    $envContent = Get-Content "backend\.env.production"
    $appUrl = ($envContent | Where-Object { $_ -match "^APP_URL=" })[0]
    $frontendUrl = ($envContent | Where-Object { $_ -match "^FRONTEND_URL=" })[0]
    $viteApiUrl = ($envContent | Where-Object { $_ -match "^VITE_API_URL=" })[0]
    $sanctumDomains = ($envContent | Where-Object { $_ -match "^SANCTUM_STATEFUL_DOMAINS=" })[0]
    $sessionDomain = ($envContent | Where-Object { $_ -match "^SESSION_DOMAIN=" })[0]
    
    Write-Host "   📍 $appUrl" -ForegroundColor Gray
    if ($frontendUrl) { Write-Host "   📍 $frontendUrl" -ForegroundColor Gray }
    if ($viteApiUrl) { Write-Host "   📍 $viteApiUrl" -ForegroundColor Gray }
    if ($sanctumDomains) { Write-Host "   📍 $sanctumDomains" -ForegroundColor Gray }
    if ($sessionDomain) { Write-Host "   📍 $sessionDomain" -ForegroundColor Gray }
    
    if ($appUrl -match "your-domain\.com") {
        Write-Host "   ⚠️  Still using placeholder domain" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Production environment file not found" -ForegroundColor Red
}

# Check current environment file
if (Test-Path "backend\.env") {
    Write-Host ""
    Write-Host "   Current .env file:" -ForegroundColor Cyan
    $currentEnv = Get-Content "backend\.env"
    $currentAppUrl = ($currentEnv | Where-Object { $_ -match "^APP_URL=" })[0]
    if ($currentAppUrl) {
        Write-Host "   📍 $currentAppUrl" -ForegroundColor Gray
    }
}

# 3. Check CORS Configuration
Write-Host ""
Write-Host "3. CORS Configuration (backend/config/cors.php):" -ForegroundColor Cyan
if (Test-Path "backend\config\cors.php") {
    $corsConfig = Get-Content "backend\config\cors.php" -Raw
    if ($corsConfig -match "allowed_origins.*\[\'\*\'\]") {
        Write-Host "   ⚠️  CORS allows all origins (*) - Security risk in production" -ForegroundColor Yellow
    } elseif ($corsConfig -match "env\('APP_ENV'\).*===.*'production'") {
        Write-Host "   ✅ CORS has environment-specific configuration" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CORS configuration may need review" -ForegroundColor Yellow
    }
    
    if ($corsConfig -match "supports_credentials.*true") {
        Write-Host "   ✅ CORS supports credentials (required for authentication)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CORS credentials support may be disabled" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ CORS config file not found" -ForegroundColor Red
}

# 4. Check Sanctum Configuration
Write-Host ""
Write-Host "4. Sanctum Configuration (backend/config/sanctum.php):" -ForegroundColor Cyan
if (Test-Path "backend\config\sanctum.php") {
    $sanctumConfig = Get-Content "backend\config\sanctum.php" -Raw
    if ($sanctumConfig -match "SANCTUM_STATEFUL_DOMAINS") {
        Write-Host "   ✅ Sanctum uses environment-based domain configuration" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Sanctum may not be properly configured for production domains" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Sanctum config file not found" -ForegroundColor Red
}

# 5. Check Frontend Environment Files
Write-Host ""
Write-Host "5. Frontend Environment Files:" -ForegroundColor Cyan

$frontendEnvFiles = @(".env.local", ".env.production", ".env")
foreach ($envFile in $frontendEnvFiles) {
    if (Test-Path $envFile) {
        Write-Host "   ✅ $envFile exists" -ForegroundColor Green
        $content = Get-Content $envFile
        $viteUrl = ($content | Where-Object { $_ -match "^VITE_API_URL=" })[0]
        if ($viteUrl) {
            Write-Host "      📍 $viteUrl" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  $envFile not found" -ForegroundColor Yellow
    }
}

# 6. Summary and Recommendations
Write-Host ""
Write-Host "📊 Summary and Recommendations:" -ForegroundColor Yellow
Write-Host ""

$issues = @()
$recommendations = @()

# Check for placeholder domains
$hasPlaceholders = $false
if (Test-Path "src\config\api.ts") {
    $apiConfig = Get-Content "src\config\api.ts" -Raw
    if ($apiConfig -match "your-domain\.com") {
        $hasPlaceholders = $true
        $issues += "Frontend still uses placeholder domain"
        $recommendations += "Run configure-production.ps1 with your actual domain"
    }
}

if (Test-Path "backend\.env.production") {
    $envContent = Get-Content "backend\.env.production" -Raw
    if ($envContent -match "your-domain\.com") {
        $hasPlaceholders = $true
        $issues += "Backend environment still uses placeholder domain"
        $recommendations += "Update backend/.env.production with your actual domain"
    }
}

# Display issues and recommendations
if ($issues.Count -gt 0) {
    Write-Host "⚠️  Issues Found:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "   • $issue" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "💡 Recommendations:" -ForegroundColor Green
    foreach ($rec in $recommendations) {
        Write-Host "   • $rec" -ForegroundColor White
    }
} else {
    Write-Host "✅ All URL configurations look good!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Next Steps for Production:" -ForegroundColor Yellow
Write-Host "1. Run: .\configure-production.ps1 -Domain 'yourdomain.com'" -ForegroundColor White
Write-Host "2. Update database credentials in backend\.env.production" -ForegroundColor White
Write-Host "3. Run: npm run build" -ForegroundColor White
Write-Host "4. Upload files to your server" -ForegroundColor White
Write-Host "5. Copy backend\.env.production to backend\.env on server" -ForegroundColor White
Write-Host "6. Run: php artisan config:cache" -ForegroundColor White
Write-Host "7. Run: php artisan partners:update-urls" -ForegroundColor White

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
