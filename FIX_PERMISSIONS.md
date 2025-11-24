# Fix Expo Permission Error

## Problem
```
Error: EACCES: permission denied, mkdir '/Users/apple/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357'
```

This happens because the `.expo/codesigning` directory is owned by `root` instead of your user.

## Solution

### Option 1: Run the Fix Script (Recommended)
```bash
cd /Applications/Personal/BhaktiVani_App
./fix-expo-permissions.sh
```

This will prompt for your password to fix the ownership.

### Option 2: Manual Fix
Run these commands in your terminal:

```bash
# Fix ownership of the codesigning directory
sudo chown -R $(whoami):staff ~/.expo/codesigning

# Create the project directory
mkdir -p ~/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357
chmod 755 ~/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357
```

### Option 3: Remove and Recreate (If above doesn't work)
```bash
# Remove the root-owned directory
sudo rm -rf ~/.expo/codesigning

# Recreate with correct permissions
mkdir -p ~/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357
chmod 755 ~/.expo/codesigning
```

## Verify Fix
After running the fix, verify with:
```bash
ls -la ~/.expo/codesigning
```

The directory should be owned by your user (not `root`).

## Why This Happens
This usually occurs when Expo commands were run with `sudo` at some point, which created directories owned by root.

## Prevention
- Never run Expo commands with `sudo`
- If you need elevated permissions, fix the directory ownership instead

