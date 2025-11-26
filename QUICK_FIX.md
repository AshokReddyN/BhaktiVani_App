# Quick Fix for Permission Error

## The Problem
```
Error: EACCES: permission denied, mkdir '/Users/apple/.expo/codesigning/...'
```

## Solution 1: Use the Wrapper Script (Easiest - No sudo needed)

Just run:
```bash
npm start
```

Or directly:
```bash
./start-expo.sh
```

This script works around the permission issue by using a project-local cache directory.

## Solution 2: Fix Permissions (Permanent Fix)

Run this command in your terminal (will ask for password):
```bash
sudo chown -R $(whoami):staff ~/.expo/codesigning
```

Then create the directory:
```bash
mkdir -p ~/.expo/codesigning/4dd89a5c-82cd-45de-af30-438d3697b357
```

## Solution 3: Use the Fix Script

```bash
./fix-expo-permissions.sh
```

## Why This Happened

The `~/.expo/codesigning` directory was created with `root` ownership, likely from running an Expo command with `sudo` at some point.

## Recommendation

Use **Solution 1** (the wrapper script) - it's the easiest and doesn't require sudo. The script is already configured in `package.json`, so `npm start` will use it automatically.

