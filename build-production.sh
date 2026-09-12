#!/bin/bash

# Church CMS Production Build Script
# This script builds the frontend for production deployment

echo "🏗️  Building Church CMS for Production..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "❌ package.json not found. Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build for production
print_status "Building for production..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    print_status "✨ Production build completed successfully!"
    echo ""
    print_warning "Next steps:"
    echo "1. Upload the contents of the 'dist/' folder to your web server"
    echo "2. Make sure your web server is configured to serve the index.html file"
    echo "3. Ensure your backend API is accessible at the configured URL"
    echo ""
    print_status "Build output location: ./dist/"
    echo "📁 Contents ready for deployment:"
    ls -la dist/
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
