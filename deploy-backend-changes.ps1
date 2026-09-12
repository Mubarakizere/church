# Backend Files Deployment Script
# Deploy changed backend files to production server

Write-Host "🚀 Deploying Backend Changes to Production Server..." -ForegroundColor Green

# Create deployment directory for backend files
$BACKEND_DEPLOY_DIR = "backend-deployment-$(Get-Date -Format 'yyyy-MM-dd-HH-mm')"
if (Test-Path $BACKEND_DEPLOY_DIR) {
    Remove-Item $BACKEND_DEPLOY_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $BACKEND_DEPLOY_DIR | Out-Null

Write-Host "📁 Copying updated backend configuration files..." -ForegroundColor Yellow

# Key configuration files that have been updated for production
$configFiles = @(
    "backend/config/app.php",
    "backend/config/sanctum.php",
    "backend/config/filesystems.php",
    "backend/routes/api.php",
    "backend/bootstrap/app.php"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $relativePath = $file -replace "^backend/", ""
        $targetDir = Split-Path "$BACKEND_DEPLOY_DIR/$relativePath" -Parent
        if (!(Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item $file "$BACKEND_DEPLOY_DIR/$relativePath" -Force
        Write-Host "✓ Copied $relativePath" -ForegroundColor Green
    }
}

# Copy controllers that might have been updated
Write-Host "📁 Copying updated controllers..." -ForegroundColor Yellow
if (Test-Path "backend/app/Http/Controllers") {
    Copy-Item "backend/app/Http/Controllers" "$BACKEND_DEPLOY_DIR/app/Http/Controllers" -Recurse -Force
    Write-Host "✓ Copied Controllers directory" -ForegroundColor Green
}

# Copy models that might have been updated
Write-Host "📁 Copying updated models..." -ForegroundColor Yellow
if (Test-Path "backend/app/Models") {
    Copy-Item "backend/app/Models" "$BACKEND_DEPLOY_DIR/app/Models" -Recurse -Force
    Write-Host "✓ Copied Models directory" -ForegroundColor Green
}

# Copy middleware
Write-Host "📁 Copying middleware..." -ForegroundColor Yellow
if (Test-Path "backend/app/Http/Middleware") {
    Copy-Item "backend/app/Http/Middleware" "$BACKEND_DEPLOY_DIR/app/Http/Middleware" -Recurse -Force
    Write-Host "✓ Copied Middleware directory" -ForegroundColor Green
}

# Copy routes
Write-Host "📁 Copying updated routes..." -ForegroundColor Yellow
Copy-Item "backend/routes" "$BACKEND_DEPLOY_DIR/routes" -Recurse -Force
Write-Host "✓ Copied Routes directory" -ForegroundColor Green

# Copy composer files for dependency management
Write-Host "📁 Copying composer files..." -ForegroundColor Yellow
Copy-Item "backend/composer.json" "$BACKEND_DEPLOY_DIR/" -Force
Copy-Item "backend/composer.lock" "$BACKEND_DEPLOY_DIR/" -Force
Write-Host "✓ Copied composer files" -ForegroundColor Green

# Copy artisan command
Copy-Item "backend/artisan" "$BACKEND_DEPLOY_DIR/" -Force
Write-Host "✓ Copied artisan command" -ForegroundColor Green

# Create production .env template
Write-Host "📝 Creating production .env template..." -ForegroundColor Yellow
$envContent = @"
# Production Environment Configuration for Earshyogwe
APP_NAME="Anglican Church of Rwanda, Shyogwe Diocese"
APP_ENV=production
APP_KEY=base64:your-app-key-here
APP_DEBUG=false
APP_URL=https://earshyogwe.com

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=earshyogw_shyogwe
DB_USERNAME=earshyogw_admin
DB_PASSWORD=your_db_password

# Frontend URL for CORS
FRONTEND_URL=https://earshyogwe.com

# API Configuration  
API_URL=https://earshyogwe.com/api

# File Storage
FILESYSTEM_DISK=public

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@earshyogwe.com
MAIL_FROM_NAME="Shyogwe Diocese"

# Cache Configuration
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Security - Production domains only
SANCTUM_STATEFUL_DOMAINS=earshyogwe.com,www.earshyogwe.com
SESSION_DOMAIN=.earshyogwe.com
"@
Set-Content -Path "$BACKEND_DEPLOY_DIR/.env.production" -Value $envContent

# Create deployment instructions
Write-Host "📝 Creating deployment instructions..." -ForegroundColor Yellow
$instructions = @"
# BACKEND DEPLOYMENT INSTRUCTIONS
# Updated files for earshyogwe.com

## FILES TO UPLOAD TO SERVER:

### 1. Configuration Files:
- config/app.php (updated APP_URL)
- config/sanctum.php (updated stateful domains)
- config/filesystems.php
- routes/api.php (updated API routes)

### 2. Application Files:
- app/Http/Controllers/ (updated controllers)
- app/Models/ (updated models)  
- app/Http/Middleware/ (updated middleware)
- routes/ (updated route definitions)

### 3. Core Files:
- composer.json & composer.lock
- artisan (Laravel command line tool)

## DEPLOYMENT STEPS:

### 1. Upload Files:
Upload all files from this directory to your server, maintaining the directory structure.

### 2. Update Environment:
- Copy .env.production to .env on your server
- Update database credentials in .env
- Update APP_KEY with: php artisan key:generate

### 3. Run Laravel Commands:
```bash
cd /path/to/your/backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate
```

### 4. Set Permissions:
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

## KEY CHANGES DEPLOYED:

✓ APP_URL updated to https://earshyogwe.com
✓ Sanctum stateful domains updated for production
✓ API routes configured for production
✓ All localhost references removed from production configs

Generated: $(Get-Date)
Target: earshyogwe.com
"@
Set-Content -Path "$BACKEND_DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" -Value $instructions

Write-Host ""
Write-Host "✅ Backend deployment package ready!" -ForegroundColor Green
Write-Host "📁 Deployment directory: $BACKEND_DEPLOY_DIR" -ForegroundColor Cyan
Write-Host "📖 Instructions: $BACKEND_DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready to upload backend changes to production server!" -ForegroundColor Green


