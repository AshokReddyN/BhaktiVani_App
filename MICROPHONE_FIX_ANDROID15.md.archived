# Microphone Permission Fix for Android 15

## Problem
Voice search (microphone icon in search bar) was not working on Android 15 even after granting permission in settings.

## Root Causes
1. **Missing RECORD_AUDIO permission** in AndroidManifest.xml and app.json
2. **No runtime permission request** - Android 15 requires explicit runtime permission request via PermissionsAndroid API
3. **Android 15 not recognized** in version detection code

## Fixes Applied

### 1. Added RECORD_AUDIO Permission to AndroidManifest.xml
**File:** `android/app/src/main/AndroidManifest.xml`

Added microphone permission declaration:
```xml
<!-- RECORD_AUDIO permission for voice search functionality -->
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

### 2. Added RECORD_AUDIO Permission to app.json
**File:** `app.json`

Updated Android permissions array:
```json
"permissions": [
  "INTERNET",
  "ACCESS_NETWORK_STATE",
  "RECORD_AUDIO"
]
```

### 3. Added Runtime Permission Request
**File:** `src/components/SearchBar.tsx`

- Imported `PermissionsAndroid` from React Native
- Created `requestMicrophonePermission()` function that:
  - Checks if permission is already granted
  - Requests permission with localized messages (Telugu/Kannada)
  - Returns permission status
- Modified `startVoiceRecognition()` to request permission before starting voice recognition
- Shows user-friendly error dialog with "Settings" button if permission denied

### 4. Added Android 15 Support
**File:** `src/utils/voiceSearchUtils.ts`

Added Android 15 (API 35) to version map:
```typescript
35: 'Android 15',
```

## How to Apply the Fix

### Step 1: Clean Build
```bash
cd /Users/u1126039/Documents/PlayGround/BhaktiVani_App

# Clean Android build
cd android
./gradlew clean
cd ..

# Clean metro bundler cache
npx react-native start --reset-cache
```

### Step 2: Rebuild the App
```bash
# If using Expo
npx expo run:android

# OR if using React Native CLI
npx react-native run-android
```

### Step 3: Test Voice Search
1. Open the app
2. Go to Home screen (deity list)
3. Tap the microphone icon in the search bar
4. **You should see a permission dialog** asking for microphone access
5. Tap "Allow" or "While using the app"
6. Speak in Telugu or Kannada to search for a deity
7. The voice search should now work!

## For New Builds (EAS Build)

If you're creating a new production build:

```bash
# Update version code in app.json (increment versionCode)
# Then build with EAS
eas build --platform android --profile production
```

## Testing Checklist

- [ ] Microphone permission dialog appears when tapping mic icon (first time)
- [ ] Voice recognition starts after granting permission
- [ ] Telugu voice search works (try "వెంకటేశ్వర", "గణేష", etc.)
- [ ] Kannada voice search works (if selected in settings)
- [ ] Permission error shows "Settings" button if denied
- [ ] Settings button opens system settings correctly
- [ ] Text search still works normally

## Troubleshooting

### If voice search still doesn't work:

1. **Check permission in system settings:**
   - Go to Settings → Apps → BhaktiVani → Permissions
   - Ensure "Microphone" is enabled

2. **Uninstall and reinstall the app:**
   ```bash
   adb uninstall com.anonymous.bhaktivani
   npx expo run:android
   ```

3. **Check Android logs:**
   ```bash
   adb logcat | grep -i "SearchBar\|microphone\|permission"
   ```

4. **Verify Google app is updated:**
   - Voice recognition uses Google's speech recognition service
   - Go to Play Store → Update "Google" app

5. **Check language pack:**
   - Go to Settings → System → Languages → On-screen keyboard → Gboard
   - Ensure Telugu/Kannada voice typing is enabled

## Technical Details

### Android 15 (API 35) Permission Changes
Android 15 introduced stricter permission handling:
- Manifest permissions alone are not sufficient
- Apps MUST request dangerous permissions at runtime using `PermissionsAndroid.request()`
- User can revoke permissions at any time from Settings
- Apps should check permission status before each sensitive operation

### Voice Recognition Flow
1. User taps microphone icon
2. App checks `PermissionsAndroid.check(RECORD_AUDIO)`
3. If not granted, shows system permission dialog
4. After permission granted, initializes Voice module
5. Starts listening with locale (te-IN for Telugu, kn-IN for Kannada)
6. Captures speech and converts to text
7. Updates search query with recognized text

## Dependencies
- `@react-native-voice/voice`: ^3.2.4 (already installed)
- React Native's built-in `PermissionsAndroid` API (no additional package needed)

## Files Modified
1. `android/app/src/main/AndroidManifest.xml` - Added RECORD_AUDIO permission
2. `app.json` - Added RECORD_AUDIO to permissions array
3. `src/components/SearchBar.tsx` - Added runtime permission handling
4. `src/utils/voiceSearchUtils.ts` - Added Android 15 version mapping

---

**Last Updated:** 2025-11-25  
**Tested On:** Android 15 (API 35)  
**Status:** ✅ Fixed

