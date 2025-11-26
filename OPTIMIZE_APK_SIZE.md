# Optimizing APK Size

## Current Size: 83 MB

The APK is large because it's a **universal APK** containing native libraries for all 4 CPU architectures:
- arm64-v8a (64-bit ARM - modern phones) ✅ Most common
- armeabi-v7a (32-bit ARM - older phones)
- x86 (32-bit Intel - emulators)
- x86_64 (64-bit Intel - emulators)

## Solutions to Reduce Size

### Option 1: Build Only for arm64-v8a (Recommended for Most Users)
**Reduces size to ~25-30 MB**

Most modern Android phones use arm64-v8a. This removes ~60% of the size.

**How to build:**
```bash
cd android
./gradlew assembleRelease -PABI_FILTERS=arm64-v8a
```

Or add to `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        ndk {
            abiFilters "arm64-v8a"
        }
    }
}
```

### Option 2: Build Split APKs (Recommended for Play Store)
**Each APK: ~20-25 MB**

Google Play Store automatically serves the correct APK to each device.

**How to build:**
```bash
cd android
./gradlew bundleRelease
```

This creates an AAB (Android App Bundle) file that Google Play uses to generate optimized APKs.

### Option 3: Enable Code Shrinking & Resource Shrinking
**Can reduce by additional 10-20%**

Already partially enabled, but can be optimized further.

### Option 4: Optimize Images
**Can reduce assets by 30-50%**

Compress images, use WebP format, remove unused assets.

## Quick Fix: Build arm64-v8a Only

Add this to `android/app/build.gradle` in the `defaultConfig` block:

```gradle
ndk {
    abiFilters "arm64-v8a"
}
```

Then rebuild:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

Expected size: **~25-30 MB** (reduction of ~65%)

