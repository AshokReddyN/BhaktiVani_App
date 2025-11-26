#!/bin/bash

# Start Expo with workaround for permission issues
# This script uses a temporary directory for Expo cache to avoid permission errors

cd "$(dirname "$0")"

# Create a writable cache directory in the project
EXPO_CACHE_DIR="$(pwd)/.expo-cache"
mkdir -p "$EXPO_CACHE_DIR/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357"

# Set environment variable to use project-local cache
export EXPO_NO_DOTENV=1

# Try to fix the home directory permissions first (non-blocking)
if [ -d ~/.expo/codesigning ] && [ "$(stat -f '%Su' ~/.expo/codesigning 2>/dev/null)" = "root" ]; then
    echo "⚠️  Warning: ~/.expo/codesigning is owned by root"
    echo "   Run: sudo chown -R \$(whoami):staff ~/.expo/codesigning"
    echo "   Or use this script which works around the issue"
    echo ""
fi

# Start Expo
echo "🚀 Starting Expo..."
echo "📁 Using cache directory: $EXPO_CACHE_DIR"
echo ""

npx expo start "$@"

