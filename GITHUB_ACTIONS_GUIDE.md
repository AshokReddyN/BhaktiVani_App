# GitHub Actions - Android Debug APK Build

## Quick Start

### 1. Save the Workflow File

The workflow file is already saved at:
```
.github/workflows/android-debug-artifact.yml
```

### 2. Commit and Push

```bash
git add .github/workflows/android-debug-artifact.yml
git commit -m "Add GitHub Actions workflow for Android debug builds"
git push origin main
```

### 3. Trigger a Build

**Automatic:** Push to `main` branch or create a pull request

**Manual:** Go to GitHub → Actions → "Build Android Debug APK" → Run workflow

## Download the APK

### Option 1: GitHub UI

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click on the latest workflow run
4. Scroll to "Artifacts" section
5. Download `app-debug-apk`

### Option 2: GitHub CLI (`gh`)

**List recent workflow runs:**
```bash
gh run list --workflow=android-debug-artifact.yml --limit 5
```

**Download the latest artifact:**
```bash
# Get the latest run ID
gh run list --workflow=android-debug-artifact.yml --limit 1 --json databaseId --jq '.[0].databaseId'

# Download artifact from specific run
gh run download <RUN_ID> --name app-debug-apk

# Or download from latest run automatically
gh run download $(gh run list --workflow=android-debug-artifact.yml --limit 1 --json databaseId --jq '.[0].databaseId') --name app-debug-apk
```

**One-liner to download latest APK:**
```bash
gh run download $(gh run list --workflow=android-debug-artifact.yml --limit 1 --json databaseId --jq '.[0].databaseId') --name app-debug-apk && echo "✅ APK downloaded to ./app-debug.apk"
```

### Option 3: Install Directly on Device

After downloading:
```bash
adb install app-debug.apk
```

Or if you have multiple devices:
```bash
adb -s ZD222GCZDB install app-debug.apk
```

## Workflow Features

✅ **Triggers:**
- Push to `main` branch
- Pull requests to `main`
- Manual trigger from Actions UI

✅ **Caching:**
- Gradle dependencies
- Gradle wrapper
- npm packages

✅ **Build Time:**
- First build: ~5-10 minutes
- Cached builds: ~2-3 minutes

✅ **Artifact:**
- Name: `app-debug-apk`
- Retention: 30 days
- Size: ~70-80 MB (reduced after removing voice module)


## Troubleshooting

### APK Path Differs

If the APK is not at `android/app/build/outputs/apk/debug/app-debug.apk`:

1. Check the "Verify APK exists" step in the workflow logs
2. Update the path in the workflow file:
   ```yaml
   path: android/app/build/outputs/apk/debug/YOUR-APK-NAME.apk
   ```

### Build Fails

**Check these common issues:**

1. **Gradle version mismatch:**
   - Ensure `android/gradle/wrapper/gradle-wrapper.properties` specifies a compatible version

2. **Missing dependencies:**
   - Check if `package.json` has all required packages
   - Verify `android/build.gradle` dependencies

3. **JDK version:**
   - Workflow uses JDK 17 (Temurin)
   - Update if your project needs a different version:
     ```yaml
     java-version: '11'  # or '17', '21'
     ```

4. **Node version:**
   - Workflow uses Node 20
   - Update if needed:
     ```yaml
     node-version: '18'  # or '20', '22'
     ```

5. **Expo/React Native specific:**
   - Ensure `npx expo prebuild` is run if needed
   - Add before the build step:
     ```yaml
     - name: Prebuild
       run: npx expo prebuild --platform android
     ```

### Artifact Not Found

If `gh run download` fails:

```bash
# List all artifacts for a run
gh run view <RUN_ID>

# Check artifact name
gh api repos/:owner/:repo/actions/runs/<RUN_ID>/artifacts
```

### Permission Issues

If you get permission errors with `gh` CLI:

```bash
# Login to GitHub
gh auth login

# Check authentication
gh auth status
```

## Advanced Usage

### Download Multiple Runs

```bash
# Download last 3 builds
for run_id in $(gh run list --workflow=android-debug-artifact.yml --limit 3 --json databaseId --jq '.[].databaseId'); do
  gh run download $run_id --name app-debug-apk --dir "build-$run_id"
done
```

### Build Release APK

To build a release APK instead, modify the workflow:

```yaml
- name: Build release APK
  working-directory: ./android
  run: ./gradlew assembleRelease --no-daemon --stacktrace

- name: Upload release APK
  uses: actions/upload-artifact@v4
  with:
    name: app-release-apk
    path: android/app/build/outputs/apk/release/app-release.apk
```

### Build on Schedule

Add to `on:` section to build daily:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
```

## Comparison: GitHub Actions vs EAS Build

| Feature | GitHub Actions | EAS Build |
|---------|---------------|-----------|
| **Cost** | Free (2000 min/month) | Free tier: 30 builds/month |
| **Build Time** | 5-10 minutes | 10-15 minutes |
| **Setup** | Commit workflow file | Install CLI, login |
| **Native Modules** | ✅ Full support | ✅ Full support |
| **Customization** | ✅ Full control | Limited |
| **Caching** | ✅ Manual setup | ✅ Automatic |
| **Download** | GitHub UI or `gh` CLI | EAS dashboard or CLI |

## Next Steps

1. ✅ Commit the workflow file
2. ✅ Push to GitHub
3. ✅ Wait for build to complete
4. ✅ Download APK
5. ✅ Install and test the app!

**The APK built by GitHub Actions will include all native modules properly linked!** 📱

