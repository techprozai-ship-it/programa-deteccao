<#
Helper script to deploy the project to Vercel using the Vercel CLI.
Usage:
  - Set the environment variable VERCEL_TOKEN (or pass it interactively).
  - Run in PowerShell:
      .\scripts\deploy-vercel.ps1

This script simply invokes the Vercel CLI with --prod and requires a valid
Vercel token with permissions to deploy the target project/org.
#>

if (-not $env:VERCEL_TOKEN) {
    Write-Host "VERCEL_TOKEN not found as environment variable."
    Write-Host "Create a token at https://vercel.com/account/tokens and set it in your shell:"
    Write-Host "  $env:VERCEL_TOKEN = 'your_token_here'"
    exit 1
}

Write-Host "Installing vercel CLI (if needed)..."
npx --yes vercel --version > $null 2>&1

Write-Host "Deploying to Vercel (production)..."
cmd /c "npx vercel --prod --token %VERCEL_TOKEN%"
