# Church CMS Production Deployment Script (PowerShell)
# This script sets up the production environment and creates necessary directories

Write-Host "🚀 Starting Church CMS Production Deployment..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "backend\artisan")) {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

Write-Status "Setting up backend..."

# Navigate to backend directory
Set-Location backend

# Create storage directories if they don't exist
Write-Status "Creating storage directories..."
$directories = @(
    "storage\app\public\partner-logos",
    "storage\app\public\team-images", 
    "storage\app\public\hero-images",
    "storage\app\public\uploads",
    "storage\logs",
    "storage\framework\cache",
    "storage\framework\sessions",
    "storage\framework\views"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Cyan
    } else {
        Write-Host "Exists: $dir" -ForegroundColor Gray
    }
}

# Create symbolic link for storage (if not exists)
if (-not (Test-Path "public\storage")) {
    Write-Status "Creating storage symbolic link..."
    try {
        php artisan storage:link
    } catch {
        Write-Warning "Could not create storage link. You may need to run this manually on the server."
    }
} else {
    Write-Status "Storage link already exists"
}

# Copy production environment file
if (Test-Path ".env.production") {
    Write-Warning "Production environment configuration found..."
    Write-Host "Please update .env.production with your actual production values:" -ForegroundColor Yellow
    Write-Host "- Database credentials" -ForegroundColor Yellow
    Write-Host "- Domain name" -ForegroundColor Yellow
    Write-Host "- Mail configuration" -ForegroundColor Yellow
    Write-Host "- Any other production-specific settings" -ForegroundColor Yellow
}

# Install/update composer dependencies for production
Write-Status "Installing Composer dependencies..."
try {
    composer install --optimize-autoloader --no-dev
} catch {
    Write-Warning "Composer install failed. Please ensure Composer is installed and try again."
}

# Generate application key if not set
Write-Status "Generating application key..."
try {
    php artisan key:generate
} catch {
    Write-Warning "Could not generate application key. Please run 'php artisan key:generate' manually."
}

# Clear and cache configuration
Write-Status "Optimizing Laravel for production..."
try {
    php artisan config:clear
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
} catch {
    Write-Warning "Some optimization commands failed. Please run them manually on the server."
}

# Navigate back to project root
Set-Location ..

Write-Status "Setting up frontend..."

# Install npm dependencies
Write-Status "Installing NPM dependencies..."
try {
    npm install
} catch {
    Write-Warning "NPM install failed. Please ensure Node.js is installed and try again."
}

# Build for production
Write-Status "Building frontend for production..."
try {
    npm run build
} catch {
    Write-Warning "Frontend build failed. Please check for errors and try again."
}

Write-Status "🎉 Deployment setup complete!"
Write-Host ""
Write-Warning "Next steps for production deployment:"
Write-Host "1. Update backend\.env.production with your actual production values" -ForegroundColor Yellow
Write-Host "2. Upload files to your production server" -ForegroundColor Yellow
Write-Host "3. Point your domain to the 'dist' folder for frontend" -ForegroundColor Yellow
Write-Host "4. Point your API subdomain/path to the 'backend\public' folder" -ForegroundColor Yellow
Write-Host "5. Run database migrations: php artisan migrate --force" -ForegroundColor Yellow
Write-Host "6. Set up SSL certificates for HTTPS" -ForegroundColor Yellow
Write-Host ""
Write-Status "Production URLs structure:"
Write-Host "Frontend: https://your-domain.com (points to dist/)" -ForegroundColor Cyan
Write-Host "Backend API: https://your-domain.com/api (points to backend/public/)" -ForegroundColor Cyan
Write-Host "Storage: https://your-domain.com/storage/ (via Laravel storage link)" -ForegroundColor Cyan

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
