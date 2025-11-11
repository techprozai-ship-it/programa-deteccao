<#
Pre-deployment validation script for Programa Detecção.
Usage: powershell -ExecutionPolicy Bypass -File .\validate-deployment.ps1

This script:
1. Checks Node.js and pnpm availability
2. Validates .env.local exists and has COMPANY_SEARCH_API_KEY
3. Runs build: pnpm run build
4. Checks for TypeScript errors
5. Validates that .gitignore protects secrets
6. Lists files that would be deployed
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log { param($m, $color = 'Cyan') Write-Host "[validate] $m" -ForegroundColor $color }
function Write-Error-Log { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red }
function Write-Success { param($m) Write-Host "[OK] $m" -ForegroundColor Green }

$cwd = Get-Location
Write-Log "Working directory: $cwd"

# 1. Check Node.js and pnpm
Write-Log "Checking Node.js and pnpm..."
try {
    $nodeV = & node -v
    $pnpmV = & pnpm -v
    Write-Success "Node.js: $nodeV"
    Write-Success "pnpm: $pnpmV"
} catch {
    Write-Error-Log "Node.js or pnpm not found"
    exit 1
}

# 2. Validate .env.local
Write-Log "Checking .env.local..."
$envLocal = Join-Path $cwd '.env.local'
if (-not (Test-Path $envLocal)) {
    Write-Error-Log ".env.local not found. Please create it from .env.example and set COMPANY_SEARCH_API_KEY"
    exit 1
}

$envContent = Get-Content $envLocal -Raw
if ($envContent -notmatch 'COMPANY_SEARCH_API_KEY\s*=\s*\S+') {
    Write-Error-Log "COMPANY_SEARCH_API_KEY not set in .env.local"
    exit 1
}

Write-Success ".env.local exists and COMPANY_SEARCH_API_KEY is set"

# 3. Check .gitignore
Write-Log "Checking .gitignore..."
$gitignore = Join-Path $cwd '.gitignore'
if (Test-Path $gitignore) {
    $gitContent = Get-Content $gitignore -Raw
    $hasEnvIgnore = $gitContent -match '\.env'
    if ($hasEnvIgnore) {
        Write-Success ".gitignore protects .env files"
    } else {
        Write-Log ".gitignore may not protect .env files (warning, but not critical)" Yellow
    }
} else {
    Write-Error-Log ".gitignore not found"
}

# 4. Check if dependencies are installed
Write-Log "Checking dependencies..."
$nodeModules = Join-Path $cwd 'node_modules'
if (-not (Test-Path $nodeModules)) {
    Write-Log "Dependencies not installed. Running pnpm install..."
    & pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "pnpm install failed"
        exit 1
    }
    Write-Success "Dependencies installed"
} else {
    Write-Success "Dependencies already installed"
}

# 5. Build the project
Write-Log "Building project (pnpm run build)..."
& pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error-Log "Build failed"
    exit 1
}
Write-Success "Build completed successfully"

# 6. Check .next output
Write-Log "Checking build output..."
$nextDir = Join-Path $cwd '.next'
if (Test-Path $nextDir) {
    $nextSize = (Get-ChildItem -Recurse $nextDir | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Success ".next directory created (~$([Math]::Round($nextSize, 2)) MB)"
} else {
    Write-Error-Log ".next directory not found after build"
    exit 1
}

# 7. List what will be deployed
Write-Log "Files that will be deployed (approximate):"
$deployFiles = @(
    '.next',
    'public',
    'package.json',
    'pnpm-lock.yaml',
    'next.config.mjs',
    'tsconfig.json',
    'tailwind.config.cjs',
    'postcss.config.mjs'
)

foreach ($f in $deployFiles) {
    $path = Join-Path $cwd $f
    if (Test-Path $path) {
        if ((Get-Item $path).PSIsContainer) {
            $size = (Get-ChildItem -Recurse $path | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "  ✓ $f/ (~$([Math]::Round($size, 2)) MB)" -ForegroundColor Green
        } else {
            $size = (Get-Item $path).Length / 1KB
            Write-Host "  ✓ $f (~$([Math]::Round($size, 2)) KB)" -ForegroundColor Green
        }
    }
}

Write-Log "Sensitive files (should NOT be deployed):" Yellow
$sensitiveFiles = @(
    '.env.local',
    '.env.production',
    'node_modules',
    '.git',
    'dist'
)

foreach ($f in $sensitiveFiles) {
    $path = Join-Path $cwd $f
    if (Test-Path $path) {
        Write-Host "  ⚠ $f found (will be excluded by .gitignore if properly configured)" -ForegroundColor Yellow
    }
}

# Final summary
Write-Host "`n" -ForegroundColor Cyan
Write-Success "=== Deployment Validation Complete ==="
Write-Host @"
✅ Project is ready for deployment

Next steps:
1. Commit and push to GitHub:
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main

2. Choose a deployment platform:
   - Vercel (recommended): vercel
   - Railway: https://railway.app
   - Render: https://render.com
   - Docker: docker build -t programa-deteccao .

3. Configure environment variables on the platform:
   - COMPANY_SEARCH_API_KEY (required)
   - OPENCORPORATES_API_KEY (optional)

4. Test after deployment:
   curl -X GET "https://seu-dominio.com/api/search?companyName=rafitec"

For detailed instructions, see: DEPLOYMENT.md
"@ -ForegroundColor Green

Write-Log "Validation complete!"
