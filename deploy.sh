#!/bin/bash

# Church CMS Production Deployment Script
# This script sets up the production environment and creates necessary directories

echo "🚀 Starting Church CMS Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "backend/artisan" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Setting up backend..."

# Navigate to backend directory
cd backend

# Create storage directories if they don't exist
print_status "Creating storage directories..."
mkdir -p storage/app/public/partner-logos
mkdir -p storage/app/public/team-images
mkdir -p storage/app/public/hero-images
mkdir -p storage/app/public/uploads
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views

# Set proper permissions for storage directories
print_status "Setting storage permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Create symbolic link for storage (if not exists)
if [ ! -L "public/storage" ]; then
    print_status "Creating storage symbolic link..."
    php artisan storage:link
else
    print_status "Storage link already exists"
fi

# Copy production environment file
if [ -f ".env.production" ]; then
    print_warning "Copying production environment configuration..."
    echo "Please update .env.production with your actual production values:"
    echo "- Database credentials"
    echo "- Domain name"
    echo "- Mail configuration"
    echo "- Any other production-specific settings"
fi

# Install/update composer dependencies for production
print_status "Installing Composer dependencies..."
composer install --optimize-autoloader --no-dev

# Generate application key if not set
print_status "Generating application key..."
php artisan key:generate

# Clear and cache configuration
print_status "Optimizing Laravel for production..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
print_warning "Database migrations (run manually in production):"
echo "php artisan migrate --force"

# Navigate back to project root
cd ..

print_status "Setting up frontend..."

# Install npm dependencies
print_status "Installing NPM dependencies..."
npm install

# Build for production
print_status "Building frontend for production..."
npm run build

print_status "🎉 Deployment setup complete!"
echo ""
print_warning "Next steps for production deployment:"
echo "1. Update backend/.env.production with your actual production values"
echo "2. Upload files to your production server"
echo "3. Point your domain to the 'dist' folder for frontend"
echo "4. Point your API subdomain/path to the 'backend/public' folder"
echo "5. Run database migrations: php artisan migrate --force"
echo "6. Set up SSL certificates for HTTPS"
echo ""
print_status "Production URLs structure:"
echo "Frontend: https://your-domain.com (points to dist/)"
echo "Backend API: https://your-domain.com/api (points to backend/public/)"
echo "Storage: https://your-domain.com/storage/ (via Laravel storage link)"
