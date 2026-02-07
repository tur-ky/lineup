# PowerShell script to generate Tauri updater key pair
# This script generates a cryptographic key pair for signing app updates

Write-Host "Generating Tauri Updater Key Pair..." -ForegroundColor Cyan
Write-Host ""

# Navigate to src-tauri directory
Set-Location "src-tauri"

# Generate the key pair using Tauri CLI
Write-Host "Running: npm run tauri signer generate -- -w updater-keys.key" -ForegroundColor Yellow
npm run tauri signer generate -- -w updater-keys.key

Write-Host ""
Write-Host "Key generation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. The PRIVATE key has been saved to: src-tauri/updater-keys.key" -ForegroundColor White
Write-Host "   -> Keep this file SECURE and DO NOT commit it to git!" -ForegroundColor Red
Write-Host ""
Write-Host "2. The PUBLIC key has been printed above." -ForegroundColor White
Write-Host "   -> Copy the public key and add it to tauri.conf.json" -ForegroundColor Cyan
Write-Host "   -> Look for the 'updater' section in the config" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. The private key will be used when building releases:" -ForegroundColor White
Write-Host "   -> Set as environment variable: TAURI_SIGNING_PRIVATE_KEY" -ForegroundColor Cyan
Write-Host ""

# Return to root directory
Set-Location ..

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
