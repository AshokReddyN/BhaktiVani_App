# Building Android APK Locally

This guide will help you build the APK file for BhaktiVani app on your local machine.

## Prerequisites

### 1. Install Java Development Kit (JDK)

**For macOS:**
```bash
# Install using Homebrew (recommended)
brew install openjdk@17

# Or download from Oracle/Adoptium
# Visit: https://adoptium.net/
```

**Set JAVA_HOME:**
```bash
# Add to your ~/.zshrc or ~/.bash_profile
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH
```

**Verify installation:**
```bash
java -version
# Should show: openjdk version "17.x.x"
```

### 2. Install Android Studio & Android SDK

1. Download Android Studio from: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → SDK Manager
4. Install:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android SDK (API 34 or latest)
   - Android SDK Command-line Tools

**Set ANDROID_HOME:**
```bash
# Add to your ~/.zshrc or ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

**Reload shell:**
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### 3. Verify Setup

```bash
java -version
echo $JAVA_HOME
echo $ANDROID_HOME
```

## Building the APK

### Method 1: Using Gradle (Recommended)

```bash
cd /Applications/Personal/BhaktiVani_App/android
chmod +x gradlew
./gradlew assembleRelease
```

The APK will be generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Method 2: Using Expo CLI

```bash
cd /Applications/Personal/BhaktiVani_App
npx expo run:android --variant release --no-install
```

### Method 3: Using EAS Build (Local)

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Build locally
eas build --platform android --local --profile preview
```

## Signing the APK (For Production)

Currently, the app uses a debug keystore. For production, you should:

1. **Generate a production keystore:**
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Create `android/keystore.properties`:**
```properties
storePassword=your-store-password
keyPassword=your-key-password
keyAlias=my-key-alias
storeFile=my-release-key.keystore
```

3. **Update `android/app/build.gradle`:**
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... rest of config
        }
    }
}
```

## Troubleshooting

### Error: "Unable to locate a Java Runtime"
- Install JDK 17 or later
- Set JAVA_HOME environment variable
- Restart terminal

### Error: "ANDROID_HOME is not set"
- Install Android Studio
- Set ANDROID_HOME to your Android SDK path
- Usually: `~/Library/Android/sdk` on macOS

### Error: "SDK location not found"
- Open Android Studio
- Go to Preferences → Appearance & Behavior → System Settings → Android SDK
- Note the "Android SDK Location"
- Set ANDROID_HOME to that path

### Build fails with dependency errors
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

## APK Location

After successful build, find your APK at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installing the APK

1. Transfer the APK to your Android device
2. Enable "Install from Unknown Sources" in device settings
3. Open the APK file and install

