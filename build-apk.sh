#!/bin/bash

# Build APK Script for BhaktiVani App
# This script builds the Android APK locally

set -e  # Exit on error

echo "🚀 Building BhaktiVani APK..."
echo ""

# Set up JAVA_HOME if not set
if [ -z "$JAVA_HOME" ]; then
    # Try to find Java using Homebrew
    if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
        export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    elif [ -d "/usr/local/opt/openjdk@17" ]; then
        export JAVA_HOME="/usr/local/opt/openjdk@17"
    else
        # Try system Java
        JAVA_HOME_CMD=$(/usr/libexec/java_home -v 17 2>/dev/null || /usr/libexec/java_home 2>/dev/null || echo "")
        if [ -n "$JAVA_HOME_CMD" ]; then
            export JAVA_HOME="$JAVA_HOME_CMD"
        fi
    fi
fi

# Add Java to PATH if JAVA_HOME is set
if [ -n "$JAVA_HOME" ]; then
    export PATH="$JAVA_HOME/bin:$PATH"
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed or not in PATH"
    echo "Please install Java JDK 17 or later"
    echo "Visit: https://adoptium.net/"
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo "✅ Java found: $JAVA_VERSION"
echo "✅ JAVA_HOME: $JAVA_HOME"

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME is not set"
    echo "Trying default location: ~/Library/Android/sdk"
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo "✅ Using default Android SDK location"
    else
        echo "❌ Android SDK not found"
        echo "Please install Android Studio and set ANDROID_HOME"
        echo "See BUILD_APK.md for instructions"
        exit 1
    fi
else
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
fi

# Navigate to project root
cd "$(dirname "$0")"

# Navigate to android directory
cd android

# Make gradlew executable
chmod +x gradlew

echo ""
echo "📦 Building release APK..."
echo ""

# Build the APK
./gradlew assembleRelease

# Check if APK was created
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo ""
    echo "✅ APK built successfully!"
    echo "📍 Location: $(pwd)/$APK_PATH"
    echo "📦 Size: $APK_SIZE"
    echo ""
    echo "You can now install this APK on your Android device."
else
    echo "❌ APK not found at expected location: $APK_PATH"
    exit 1
fi

