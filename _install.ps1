$env:SAFE_RM_AUTO_ADD_TEMP = $null
$env:SAFE_RM_DENIED_PATH = $null
$env:SAFE_RM_ALLOWED_PATH = $null
$env:SAFE_RM_PROTECTION_FLAG = $null
Set-Location "d:\2026qkl\frontend"
Write-Host "=== Running npm install ==="
npm install 2>&1 | Tee-Object -FilePath "d:\2026qkl\_install_out.txt"
Write-Host "=== Installing ethers ==="
npm install ethers@6 2>&1 | Tee-Object -FilePath "d:\2026qkl\_install_out.txt" -Append
Write-Host "=== Done ==="