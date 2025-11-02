# Run Login E2E Tests
# MOD SQUAD TEAM MAX - Automated Testing

param(
    [string]$Environment = "production",
    [switch]$Headed = $false
)

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║         🧪 PAIID LOGIN E2E TESTS 🧪                          ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Set environment
if ($Environment -eq "production") {
    $env:FRONTEND_URL = "https://paiid-frontend.onrender.com"
    Write-Host "🌐 Testing against: PRODUCTION" -ForegroundColor Yellow
    Write-Host "   URL: $env:FRONTEND_URL" -ForegroundColor White
} else {
    $env:FRONTEND_URL = "http://localhost:3000"
    Write-Host "🌐 Testing against: LOCAL DEVELOPMENT" -ForegroundColor Yellow
    Write-Host "   URL: $env:FRONTEND_URL" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 Test Suite: Login Flow (6 tests)" -ForegroundColor Cyan
Write-Host "   1. Themed login page renders" -ForegroundColor White
Write-Host "   2. SCPRIME authentication" -ForegroundColor White
Write-Host "   3. CompletePaiiDLogo visible" -ForegroundColor White
Write-Host "   4. Form validation" -ForegroundColor White
Write-Host "   5. Invalid credentials error" -ForegroundColor White
Write-Host "   6. Session persistence" -ForegroundColor White
Write-Host ""

# Navigate to frontend directory
cd frontend

# Check if Playwright is installed
Write-Host "🔍 Checking Playwright installation..." -ForegroundColor Cyan
$playwrightInstalled = Test-Path "node_modules\@playwright\test"

if (-not $playwrightInstalled) {
    Write-Host "⚠️ Playwright not found, installing..." -ForegroundColor Yellow
    npm install -D @playwright/test
    npx playwright install chromium
}

Write-Host "✅ Playwright ready" -ForegroundColor Green
Write-Host ""

# Run tests
Write-Host "🚀 Running E2E tests..." -ForegroundColor Cyan
Write-Host ""

if ($Headed) {
    Write-Host "👀 Running in HEADED mode (browser visible)" -ForegroundColor Yellow
    npx playwright test tests/e2e/login-flow.spec.ts --headed
} else {
    Write-Host "🤖 Running in HEADLESS mode (background)" -ForegroundColor Yellow
    npx playwright test tests/e2e/login-flow.spec.ts
}

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                              ║" -ForegroundColor Green
    Write-Host "║         ✅ ALL LOGIN E2E TESTS PASSED! ✅                    ║" -ForegroundColor Green
    Write-Host "║                                                              ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎊 Login flow is working perfectly!" -ForegroundColor Green
    Write-Host "🚀 Ready for production deployment!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║                                                              ║" -ForegroundColor Red
    Write-Host "║         ❌ SOME TESTS FAILED ❌                              ║" -ForegroundColor Red
    Write-Host "║                                                              ║" -ForegroundColor Red
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️ Check test output above for details" -ForegroundColor Yellow
    Write-Host "💡 Run with -Headed to see browser: .\run-login-e2e-test.ps1 -Headed" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📁 Test artifacts saved to: frontend/test-results/" -ForegroundColor Cyan
Write-Host ""

cd ..

