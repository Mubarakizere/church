#!/bin/bash
# Manual Symlink Creation Script
# Use this when php artisan storage:link fails due to disabled exec() function

echo "🔧 Manual Storage Symlink Creation"
echo "==================================="
echo ""

# Check current directory
echo "📁 Current directory: $(pwd)"
echo ""

# Check if we're in the Laravel directory
if [ ! -f "artisan" ]; then
    echo "❌ Not in Laravel root directory. Please cd to your Laravel backend directory first."
    exit 1
fi

echo "✅ Laravel directory detected"
echo ""

# Check current state
echo "🔍 Current state:"
if [ -d "public/storage" ]; then
    echo "❌ public/storage is a directory"
    echo "📁 Removing directory..."
    rm -rf public/storage
    echo "✅ Directory removed"
elif [ -L "public/storage" ]; then
    echo "✅ public/storage is already a symlink"
    echo "📁 Current target: $(readlink public/storage)"
    read -p "Do you want to recreate it? (y/n): " recreate
    if [ "$recreate" = "y" ]; then
        rm public/storage
        echo "✅ Old symlink removed"
    else
        echo "✅ Keeping existing symlink"
        exit 0
    fi
else
    echo "✅ public/storage doesn't exist - ready to create"
fi

echo ""

# Create the symlink manually
echo "🔗 Creating symlink manually..."

# Check if target directory exists
if [ ! -d "storage/app/public" ]; then
    echo "❌ Target directory storage/app/public doesn't exist!"
    echo "   Creating it..."
    mkdir -p storage/app/public
fi

# Create the symlink
echo "📁 Creating symlink: public/storage -> storage/app/public"
ln -sf ../storage/app/public public/storage

# Verify the symlink
if [ -L "public/storage" ]; then
    echo "✅ Symlink created successfully!"
    echo "📁 Symlink target: $(readlink public/storage)"
    
    # Test file access
    if [ -d "storage/app/public/team-images" ]; then
        echo "✅ Team images directory accessible through symlink"
        echo "📊 Team images count: $(ls -1 public/storage/team-images/ 2>/dev/null | wc -l)"
    else
        echo "⚠️  Team images directory not found in storage/app/public/"
    fi
else
    echo "❌ Failed to create symlink!"
    echo "   Please check permissions and try manually:"
    echo "   ln -sf ../storage/app/public public/storage"
fi

echo ""

# Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 storage/app/public/
echo "✅ Permissions set"

# Clear Laravel caches
echo "🧹 Clearing Laravel caches..."
php artisan config:clear 2>/dev/null && echo "✅ Config cache cleared" || echo "⚠️  Could not clear config cache"
php artisan cache:clear 2>/dev/null && echo "✅ Application cache cleared" || echo "⚠️  Could not clear application cache"

echo ""

# Final verification
echo "🧪 Final verification:"
echo "   Symlink exists: $([ -L "public/storage" ] && echo "✅ Yes" || echo "❌ No")"
echo "   Target exists: $([ -e "public/storage" ] && echo "✅ Yes" || echo "❌ No")"
echo "   Team images accessible: $([ -d "public/storage/team-images" ] && echo "✅ Yes" || echo "❌ No")"

echo ""
echo "🚀 TEST COMMANDS:"
echo "=================="
echo "1. Test symlink: ls -la public/storage"
echo "2. Test team images: ls public/storage/team-images/ | head -5"
echo "3. Test specific image: curl -I https://earshyogwe.com/storage/team-images/[filename].jpg"

echo ""
echo "✅ Manual symlink creation completed!"
echo "   Your team images should now be accessible via the web!"
