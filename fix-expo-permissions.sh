#!/bin/bash

# Fix Expo codesigning directory permissions
# This script fixes the permission denied error for Expo codesigning

echo "🔧 Fixing Expo codesigning directory permissions..."

# Check if directory exists and is owned by root
if [ -d ~/.expo/codesigning ] && [ "$(stat -f '%Su' ~/.expo/codesigning)" = "root" ]; then
    echo "⚠️  Directory is owned by root. Fixing ownership..."
    sudo chown -R $(whoami):staff ~/.expo/codesigning
    echo "✅ Ownership fixed"
else
    echo "✅ Directory permissions are correct"
fi

# Create the project-specific directory
mkdir -p ~/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357
chmod 755 ~/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357

# Verify
if [ -d ~/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357 ]; then
    echo "✅ Directory created successfully"
    echo "📍 Location: ~/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357"
else
    echo "❌ Failed to create directory"
    exit 1
fi

echo ""
echo "✨ Permission fix complete! You can now run Expo commands."

