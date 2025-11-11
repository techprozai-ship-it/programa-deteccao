<#
Run the full local setup for the project.
Usage: in PowerShell (run as normal user from repo root):

  powershell -ExecutionPolicy Bypass -File .\run_setup.ps1

What it does:
- Runs ./apply_changes.ps1 (if present) to write updated files
- Ensures .env.local exists (copies from .env.example if missing) and opens it for you to edit
- Verifies or installs pnpm (via corepack or npm) and runs `pnpm install`
- Starts the dev server in a new PowerShell window (runs `pnpm run dev`)

This script DOES NOT upload anything to remote or commit changes. It only automates local steps.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log { param($m) Write-Host "[run_setup] $m" }

Push-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Definition)
$cwd = Get-Location
Write-Log "Working directory: $cwd"

# 1) Run apply_changes.ps1 if present
$applyScript = Join-Path $cwd 'apply_changes.ps1'
if (Test-Path $applyScript) {
    Write-Log "Found apply_changes.ps1 — executing it to write updated files..."
    try {
        powershell -ExecutionPolicy Bypass -File $applyScript
        Write-Log "apply_changes.ps1 finished."
    } catch {
        Write-Host "WARNING: apply_changes.ps1 failed: $_" -ForegroundColor Yellow
    }
} else {
    Write-Log "apply_changes.ps1 not found — skipping file generation step."
}

# 2) Ensure .env.local exists; if not, copy from .env.example and open for editing
$envLocal = Join-Path $cwd '.env.local'
$envExample = Join-Path $cwd '.env.example'
if (-not (Test-Path $envLocal)) {
    if (Test-Path $envExample) {
        Copy-Item -LiteralPath $envExample -Destination $envLocal -Force
        Write-Log "Copied .env.example -> .env.local"
        Write-Log "Please edit .env.local and set COMPANY_SEARCH_API_KEY (required). The editor will open now."
        Start-Process notepad.exe $envLocal -Wait
        Read-Host "After editing .env.local press Enter to continue"
    } else {
        Write-Host "ERROR: .env.example not found. Please create a .env.local with COMPANY_SEARCH_API_KEY and OPENCORPORATES_API_KEY (optional)." -ForegroundColor Red
        Pop-Location
        exit 1
    }
} else {
    Write-Log ".env.local already exists. Opening it so you can verify COMPANY_SEARCH_API_KEY is set."
    Start-Process notepad.exe $envLocal -Wait
    Read-Host "Verify .env.local and press Enter to continue"
}

# 3) Ensure pnpm is available; try corepack first
function Ensure-Pnpm {
    try {
        $v = & pnpm -v 2>$null
        if ($LASTEXITCODE -eq 0 -and $v) {
            Write-Log "pnpm is available: $v"
            return $true
        }
    } catch { }

    Write-Log "pnpm not found. Attempting to enable via corepack..."
    try {
        & corepack enable
        & corepack prepare pnpm@latest --activate
        $v2 = & pnpm -v
        Write-Log "pnpm installed via corepack: $v2"
        return $true
    } catch {
        Write-Host "corepack approach failed or corepack not available: $_" -ForegroundColor Yellow
    }

    Write-Log "Trying to install pnpm globally via npm..."
    try {
        & npm install -g pnpm
        $v3 = & pnpm -v
        Write-Log "pnpm installed via npm: $v3"
        return $true
    } catch {
        Write-Host "Could not install pnpm automatically. Please install pnpm manually and re-run the script. See https://pnpm.io/installation" -ForegroundColor Red
        return $false
    }
}

if (-not (Ensure-Pnpm)) {
    Pop-Location
    exit 1
}

# 4) Run pnpm install
Write-Log "Running 'pnpm install' — this may take a while..."
try {
    & pnpm install
    Write-Log "Dependencies installed."
} catch {
    Write-Host "pnpm install failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# 5) Start dev server in a new PowerShell window so the current session can remain free
Write-Log "Starting dev server in a new PowerShell window (pnpm run dev). A new window will remain open."
try {
    $startArgs = "-NoExit","-Command","cd `"$cwd`"; pnpm run dev"
    Start-Process powershell -ArgumentList $startArgs -WorkingDirectory $cwd
    Write-Log "Dev server started in a new window. If it didn't open, run 'pnpm run dev' manually."
} catch {
    Write-Host "Failed to start dev server in a new window: $_" -ForegroundColor Yellow
    Write-Host "You can run 'pnpm run dev' manually in this directory: $cwd" -ForegroundColor Yellow
}

Write-Host "\nNext: open a new PowerShell tab and test the endpoint after the dev server reports it is listening (usually http://localhost:3000). Example test command:" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri 'http://localhost:3000/api/search?companyName=rafitec' -Method Get | ConvertTo-Json -Depth 5" -ForegroundColor Green

Pop-Location
