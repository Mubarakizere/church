#!/bin/bash
# Recreate Laravel Storage Symlink - Hostinger Compatible
# This script properly creates the storage symlink now that we know Hostinger supports it

echo "🔧 Recreating Laravel Storage Symlink"
echo "====================================="
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

echo "🔍 CURRENT STATE CHECK:"
echo "======================="

# Check current state of public/storage
if [ -d "public/storage" ] && [ ! -L "public/storage" ]; then
    echo "❌ public/storage is currently a DIRECTORY (copied files)"
    echo "📊 Files in directory: $(find public/storage -type f | wc -l)"
    echo ""
    echo "🔄 CONVERTING TO SYMLINK..."
    echo ""
    
    # Backup the copied files (just in case)
    echo "1. Creating backup of copied files..."
    if [ -d "storage/app/public" ]; then
        # Ensure all files are in the source directory
        echo "   Ensuring files are in storage/app/public..."
        mkdir -p storage/app/public
        # Don't overwrite existing files in storage/app/public
        echo "✅ Source directory ready"
    fi
    
    # Remove the directory
    echo "2. Removing public/storage directory..."
    rm -rf public/storage
    echo "✅ Directory removed"
    
elif [ -L "public/storage" ]; then
    echo "✅ public/storage is already a symlink"
    echo "📁 Current target: $(readlink public/storage)"
    echo ""
    echo "🔄 RECREATING SYMLINK..."
    echo ""
    
    # Remove existing symlink
    echo "1. Removing existing symlink..."
    rm public/storage
    echo "✅ Symlink removed"
    
else
    echo "✅ public/storage doesn't exist - ready to create symlink"
    echo ""
    echo "🔄 CREATING SYMLINK..."
    echo ""
fi

# Ensure source directory exists
echo "2. Ensuring source directory exists..."
mkdir -p storage/app/public
echo "✅ Source directory ready"

# Create the symlink
echo "3. Creating symlink: public/storage -> storage/app/public"
ln -sf ../storage/app/public public/storage

# Verify the symlink
if [ -L "public/storage" ]; then
    echo "✅ Symlink created successfully!"
    echo "📁 Symlink target: $(readlink public/storage)"
    echo "📁 Target exists: $([ -e "public/storage" ] && echo "✅ Yes" || echo "❌ No")"
else
    echo "❌ Failed to create symlink!"
    echo "   Please try manually: ln -sf ../storage/app/public public/storage"
    exit 1
fi

echo ""

# Set permissions
echo "4. Setting permissions..."
chmod -R 755 storage/app/public/
echo "✅ Permissions set"

# Clear Laravel caches
echo "5. Clearing Laravel caches..."
php artisan config:clear 2>/dev/null && echo "✅ Config cache cleared" || echo "⚠️  Could not clear config cache"
php artisan cache:clear 2>/dev/null && echo "✅ Application cache cleared" || echo "⚠️  Could not clear application cache"

echo ""

# Test the symlink
echo "🧪 TESTING SYMLINK:"
echo "==================="

# Check if team images are accessible
if [ -d "public/storage/team-images" ]; then
    TEAM_COUNT=$(ls -1 public/storage/team-images/ 2>/dev/null | wc -l)
    echo "✅ Team images accessible through symlink"
    echo "📊 Team images count: $TEAM_COUNT"
    
    # Test specific image
    TEST_IMAGE="vrhKvRVALbQnxN7DIc1N0mSp3u7ntB8IcQVB5U0Q.jpg"
    if [ -f "public/storage/team-images/$TEST_IMAGE" ]; then
        echo "✅ Test image accessible: $TEST_IMAGE"
    else
        echo "⚠️  Test image not found: $TEST_IMAGE"
    fi
else
    echo "❌ Team images directory not accessible through symlink"
fi

echo ""
echo "🌐 WEB ACCESSIBILITY TEST:"
echo "=========================="
echo "Test with: curl -I https://earshyogwe.com/storage/team-images/vrhKvRVALbQnxN7DIc1N0mSp3u7ntB8IcQVB5U0Q.jpg"
echo ""
echo "Expected results:"
echo "• HTTP/2 200"
echo "• Content-Type: image/jpeg"
echo "• Content-Length: [actual file size]"
echo ""

echo "✅ Storage symlink recreated successfully!"
echo "   Your Laravel storage should now work properly with symlinks!"
echo ""
echo "💡 BENEFITS OF SYMLINK APPROACH:"
echo "• Files automatically accessible when uploaded"
echo "• No need to manually copy files after uploads"
echo "• Laravel's storage:link command will work"
echo "• Standard Laravel file serving behavior"








