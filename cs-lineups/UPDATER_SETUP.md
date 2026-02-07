# Updater Setup Guide

This guide explains how to set up, test, and maintain the updater system for CS Lineups.

## Prerequisites

- Tauri v2 installed
- GitHub repository configured
- Node.js and npm installed

## Initial Setup

### 1. Generate Updater Keys

The updater requires a cryptographic key pair to sign and verify updates for security.

**On Windows (PowerShell):**

```powershell
.\generate_keys.ps1
```

**Or manually:**

```bash
cd src-tauri
npm run tauri signer generate -- -w updater-keys.key
```

This will:

- Generate a **private key** saved to `src-tauri/updater-keys.key`
- Display the **public key** in the console

> **IMPORTANT**: The private key (`updater-keys.key`) is already added to `.gitignore`. Never commit it to version control!

### 2. Configure Tauri

Copy the public key from the console output and replace `PLACEHOLDER_INSERT_PUBLIC_KEY_HERE` in `src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "pubkey": "YOUR_PUBLIC_KEY_HERE",
      ...
    }
  }
}
```

### 3. Set Environment Variable for Builds

When building a release, you need to provide the private key as an environment variable:

**Windows PowerShell:**

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content src-tauri\updater-keys.key -Raw
npm run tauri build
```

**Linux/macOS:**

```bash
export TAURI_SIGNING_PRIVATE_KEY=$(cat src-tauri/updater-keys.key)
npm run tauri build
```

## Creating a Release

### Step 1: Increment Version

Update the version in both:

- `package.json`
- `src-tauri/tauri.conf.json`

Example: `0.1.1` → `0.1.2`

### Step 2: Build the Application

```bash
npm run tauri build
```

This creates signed installers in `src-tauri/target/release/bundle/`.

### Step 3: Create GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Draft a new release"
3. Tag version: `v0.1.2` (match your version number)
4. Release title: `Version 0.1.2`
5. Add release notes in the description
6. Upload the following files from `src-tauri/target/release/bundle/`:
   - **Windows**: `.msi` file and `.msi.zip` file
   - **macOS**: `.app.tar.gz` and `.dmg` files
   - **Linux**: `.AppImage.tar.gz` and `.deb` files

### Step 4: Generate Update Manifest

Tauri automatically generates a `latest.json` manifest during build. You need to upload this to your release:

1. Find `latest.json` in `src-tauri/target/release/`
2. Upload it to the GitHub release

The updater checks this URL for updates:

```
https://github.com/tur-ky/lineup/releases/latest/download/latest.json
```

## Testing the Updater

### Test Scenario 1: Manual Update Check

1. Build version `0.1.1` and install it
2. Create a GitHub release with version `0.1.2`
3. Launch the app (version `0.1.1`)
4. The UpdateModal should appear automatically
5. Click "Install Now" to test the update flow

### Test Scenario 2: Automatic Updates

1. In the UpdateModal, toggle "Enable Automatic Updates"
2. Restart the app
3. Create a new release (version `0.1.3`)
4. Launch the app again
5. Update should download automatically and notify when ready

### Test Scenario 3: No Internet

1. Disconnect from the internet
2. Launch the app
3. Verify graceful error handling in UpdateModal

### Test Scenario 4: Remind Me Later

1. When UpdateModal appears, click "Remind Me Later"
2. Modal should dismiss
3. Restart the app
4. Modal should appear again on next startup

## Troubleshooting

### Update Check Fails

**Symptom**: Error message "Failed to check for updates"

**Possible causes**:

- No internet connection
- GitHub API rate limit exceeded
- Invalid updater configuration

**Solution**: Check browser console for detailed error messages

### Invalid Signature Error

**Symptom**: Update fails with "Invalid signature" error

**Possible causes**:

- Public key in `tauri.conf.json` doesn't match private key used for signing
- Update wasn't signed properly

**Solution**: Regenerate keys and rebuild the release

### Update Not Detected

**Symptom**: App doesn't detect available update

**Possible causes**:

- `latest.json` not uploaded to GitHub release
- Version number in `latest.json` doesn't match release tag
- Updater endpoint URL is incorrect

**Solution**:

1. Verify `latest.json` exists in release
2. Check URL: `https://github.com/tur-ky/lineup/releases/latest/download/latest.json`
3. Verify version numbers match

### Settings Not Persisting

**Symptom**: Auto-update toggle resets after restart

**Possible causes**:

- Permission issues with app data directory
- Settings file corruption

**Solution**: Check app logs for file system errors

## File Locations

### Development

- Private key: `src-tauri/updater-keys.key` (gitignored)
- Configuration: `src-tauri/tauri.conf.json`

### Production

- Settings: `%APPDATA%\com.patri.cs-lineups\settings.json` (Windows)
- Settings: `~/Library/Application Support/com.patri.cs-lineups/settings.json` (macOS)
- Settings: `~/.config/com.patri.cs-lineups/settings.json` (Linux)

## GitHub Actions (Optional)

For automated builds and releases, you can set up a GitHub Actions workflow:

1. Add private key as a GitHub secret: `TAURI_SIGNING_PRIVATE_KEY`
2. Create `.github/workflows/release.yml`
3. Configure workflow to build and upload releases automatically

Example workflow structure:

```yaml
name: Release
on:
  push:
    tags:
      - "v*"
jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Build and release
        env:
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
        run: npm run tauri build
      - name: Upload release assets
        # ... upload logic
```

## Security Best Practices

1. **Never commit the private key** - It's in `.gitignore`, keep it that way
2. **Secure the private key** - Store it in a password manager or secure vault
3. **Rotate keys periodically** - Generate new keys every 6-12 months
4. **Use GitHub Secrets** - For CI/CD, store the key as a GitHub Secret
5. **Verify signatures** - The updater automatically verifies signatures before installing

## Update Flow Diagram

```
App Startup
    ↓
Check for Updates (useUpdateChecker hook)
    ↓
├─ No Update Available → Continue normally
├─ Update Available → Show UpdateModal
│   ├─ User clicks "Install Now" → Download & Install
│   ├─ User clicks "Remind Me Later" → Dismiss modal
│   └─ Auto-update enabled → Download automatically
└─ Error (no internet, etc.) → Show error in modal
```

## Support

For issues or questions:

- Check the [Tauri Updater Documentation](https://v2.tauri.app/plugin/updater/)
- Review GitHub Issues
- Check application logs for detailed error messages
