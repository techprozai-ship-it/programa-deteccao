<#
Full automated production deployment script.
Usage: powershell -ExecutionPolicy Bypass -File .\automated-prod-setup.ps1

This script:
1. Validates .env.local and build
2. Commits all changes with production-ready message
3. Pushes to GitHub
4. Displays deployment options (Vercel, Railway, Render, Docker)

IMPORTANT: Ensure .env.local is properly configured before running this!
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log { param($m, $color = 'Cyan') Write-Host "[prod-setup] $m" -ForegroundColor $color }
function Write-Success { param($m) Write-Host "[OK] $m" -ForegroundColor Green }
function Write-Error-Log { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red }
function Write-Warning-Log { param($m) Write-Host "[WARNING] $m" -ForegroundColor Yellow }

$cwd = Get-Location
Write-Log "Production setup script started"
Write-Log "Working directory: $cwd"

# 1. Check Git
Write-Log "Checking Git..."
try {
    $gitV = & git --version
    Write-Success $gitV
} catch {
    Write-Error-Log "Git not found. Please install Git from https://git-scm.com/download/win"
    exit 1
}

# 2. Validate .env.local
Write-Log "Validating .env.local..."
$envLocal = Join-Path $cwd '.env.local'
if (-not (Test-Path $envLocal)) {
    Write-Error-Log ".env.local not found!"
    Write-Warning-Log "Please create .env.local from .env.example and set COMPANY_SEARCH_API_KEY"
    exit 1
}

$envContent = Get-Content $envLocal -Raw
if ($envContent -notmatch 'COMPANY_SEARCH_API_KEY\s*=\s*\S+') {
    Write-Error-Log "COMPANY_SEARCH_API_KEY not set in .env.local"
    exit 1
}
Write-Success ".env.local is properly configured"

# 3. Run validation script
Write-Log "Running deployment validation..."
$validateScript = Join-Path $cwd 'validate-deployment.ps1'
if (Test-Path $validateScript) {
    & powershell -ExecutionPolicy Bypass -File $validateScript
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "Validation failed"
        exit 1
    }
} else {
    Write-Warning-Log "validate-deployment.ps1 not found, skipping detailed validation"
}

# 4. Git status check
Write-Log "Checking Git status..."
$status = & git status --porcelain
if ($status) {
    Write-Log "Files to be committed:"
    $status | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Warning-Log "No changes detected. Do you want to force commit? (Y/N)"
    $response = Read-Host
    if ($response -ne 'Y' -and $response -ne 'y') {
        Write-Log "Aborted"
        exit 0
    }
}

# 5. Confirm before commit
Write-Host "`n" -ForegroundColor Cyan
Write-Log "Ready to commit and push to production?"
Write-Host "
  This will:
  1. Stage all changes (git add .)
  2. Commit with message: 'Production ready: Programa Detecção'
  3. Push to 'main' branch
  
  Continue? (Y/N)
" -ForegroundColor Cyan

$confirm = Read-Host
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Log "Aborted by user"
    exit 0
}

# 6. Git operations
Write-Log "Staging changes..."
& git add .

Write-Log "Committing..."
& git commit -m "Production ready: Programa Detecção [automated deployment]"
if ($LASTEXITCODE -ne 0) {
    Write-Error-Log "Commit failed. Please check Git configuration."
    exit 1
}
Write-Success "Commit successful"

Write-Log "Pushing to remote (main/master)..."
try {
    & git push origin main
    if ($LASTEXITCODE -ne 0) {
        & git push origin master
    }
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Pushed successfully to GitHub"
    } else {
        Write-Error-Log "Push failed"
    }
} catch {
    Write-Error-Log "Push failed. Possible reasons: no remote configured, no internet, auth issues"
    Write-Log "You can manually push later with: git push origin main"
}

# 7. Show deployment options
Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          CHOOSE YOUR DEPLOYMENT PLATFORM                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host @"

CHOOSE YOUR DEPLOYMENT PLATFORM

[1] VERCEL (Recommended - 2 minutes)
    $ npm install -g vercel
    $ vercel
    Then add env vars in Vercel dashboard

[2] RAILWAY (2-3 minutes)
    Visit: https://railway.app
    Connect GitHub → Configure env vars → Auto-deploy

[3] RENDER (2-3 minutes)
    Visit: https://render.com
    Connect GitHub → Configure build/start → Deploy

[4] DOCKER (Your own server)
    $ docker build -t programa-deteccao .
    $ docker run -e COMPANY_SEARCH_API_KEY=... -p 3000:3000 programa-deteccao

[0] EXIT - I'll deploy manually

Choose (0-4):
"@ -ForegroundColor Cyan

$choice = Read-Host
switch ($choice) {
    "1" {
        Write-Log "Opening Vercel instructions..."
        Write-Host @"

To deploy with Vercel:

1. Install Vercel CLI:
   npm install -g vercel

2. Deploy:
   vercel

3. After deployment, add environment variables:
   - Vercel Dashboard → Your Project → Settings
   - Environment Variables
   - Add COMPANY_SEARCH_API_KEY and OPENCORPORATES_API_KEY

4. Vercel will auto-deploy after you push changes to GitHub

Full instructions: QUICKSTART_PROD.md
"@ -ForegroundColor Green
    }
    "2" {
        Write-Log "Opening Railway..."
        Start-Process "https://railway.app"
        Write-Host "
Railway selected! Follow these steps:
1. Visit https://railway.app and log in
2. Create new project → Deploy from GitHub
3. Select this repository
4. Configure environment variables
5. Done! Auto-deploy on each push

Full instructions: DEPLOYMENT.md
" -ForegroundColor Green
    }
    "3" {
        Write-Log "Opening Render..."
        Start-Process "https://render.com"
        Write-Host "
Render selected! Follow these steps:
1. Visit https://render.com and log in
2. New Web Service → Deploy from GitHub
3. Select this repository
4. Configure build/start commands
5. Add environment variables
6. Deploy!

Full instructions: DEPLOYMENT.md
" -ForegroundColor Green
    }
    "4" {
        Write-Host @"
Docker selected! Commands:

Build image:
  docker build -t programa-deteccao .

Run locally (test):
  docker run -e COMPANY_SEARCH_API_KEY=your_key -p 3000:3000 programa-deteccao

Push to registry (Docker Hub example):
  docker tag programa-deteccao:latest yourusername/programa-deteccao:latest
  docker push yourusername/programa-deteccao:latest

Then deploy to your server from that image.

Full instructions: DEPLOYMENT.md
"@ -ForegroundColor Green
    }
    "0" {
        Write-Success "Good luck! See you at deployment :)"
        exit 0
    }
    default {
        Write-Warning-Log "Invalid choice, showing QUICKSTART_PROD.md..."
        notepad.exe (Join-Path $cwd "QUICKSTART_PROD.md")
    }
}

Write-Host "`n"
Write-Success "=== Git operations complete! ==="
Write-Log "Your code is now on GitHub and ready for deployment."
Write-Log "Next: Follow the deployment platform instructions above."
Write-Log "For detailed help, see: QUICKSTART_PROD.md or DEPLOYMENT.md"
