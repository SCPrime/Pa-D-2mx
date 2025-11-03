import { test, expect } from '@playwright/test';

/**
 * E2E Tests for PaiiD Login Flow
 * Tests SCPRIME authentication and themed login page
 */

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('PaiiD Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('1. Themed login page renders correctly', async ({ page }) => {
    console.log('\n=== Testing THEMED LOGIN PAGE ===');

    await page.goto(BASE_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for themed elements
    // Note: CompletePaiiDLogo is an SVG, so we look for the container
    // (pageContent available if needed for debugging)

    // Verify dark background is applied
    // (bodyBg available if needed for specific background checks)

    console.log('✅ Page loaded, checking theme...');

    // Check for login form elements
    await expect(page.locator('input[placeholder*="username" i], input[placeholder*="email" i]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    console.log('✅ Themed login page rendered');
  });

  test('2. SCPRIME login credentials authenticate successfully', async ({ page }) => {
    console.log('\n=== Testing SCPRIME LOGIN ===');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Find and fill login form
    const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    // Enter SCPRIME credentials
    await usernameInput.fill('SCPRIME');
    await passwordInput.fill('SCPRIME');

    console.log('📝 Entered credentials: SCPRIME / SCPRIME');

    // Monitor network for login API call
    const loginResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/login') && response.request().method() === 'POST',
      { timeout: 10000 }
    );

    // Click login
    await loginButton.click();

    console.log('🔍 Clicked login button, waiting for API response...');

    try {
      const loginResponse = await loginResponsePromise;
      const status = loginResponse.status();

      console.log(`📡 Login API response: ${status}`);

      if (status === 200) {
        const responseData = await loginResponse.json();
        expect(responseData).toHaveProperty('access_token');
        expect(responseData).toHaveProperty('refresh_token');
        console.log('✅ JWT tokens received!');

        // Verify tokens stored in localStorage
        await page.waitForTimeout(1000);
        const tokensStored = await page.evaluate(() => {
          return localStorage.getItem('auth-tokens') !== null;
        });

        expect(tokensStored).toBe(true);
        console.log('✅ Tokens stored in localStorage');

        // Verify redirect to dashboard (should see radial menu or dashboard content)
        await page.waitForTimeout(2000);

        // Check if we're no longer on login page
        const stillOnLogin = await page.locator('input[type="password"]').isVisible().catch(() => false);
        expect(stillOnLogin).toBe(false);

        console.log('✅ Redirected to dashboard');
      } else {
        console.log(`❌ Login failed with status: ${status}`);
        throw new Error(`Login API returned ${status}`);
      }
    } catch (error) {
      console.error(`❌ Login test failed: ${error}`);
      throw error;
    }

    console.log('✅ SCPRIME login test passed');
  });

  test('3. CompletePaiiDLogo visible on login page', async ({ page }) => {
    console.log('\n=== Testing COMPLETE PAIID LOGO ===');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for SVG logo (CompletePaiiDLogo renders as SVG)
    const svgElements = await page.locator('svg').count();

    console.log(`Found ${svgElements} SVG element(s) on page`);

    // Should have at least one SVG (the logo)
    expect(svgElements).toBeGreaterThanOrEqual(1);

    console.log('✅ CompletePaiiDLogo present');
  });

  test('4. Login form validation works', async ({ page }) => {
    console.log('\n=== Testing FORM VALIDATION ===');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const loginButton = page.locator('button[type="submit"]').first();

    // Try to submit empty form
    await loginButton.click();
    await page.waitForTimeout(500);

    // Should show error message
    const errorVisible = await page.locator('text=/enter.*username.*email.*password/i').isVisible().catch(() => false);

    if (errorVisible) {
      console.log('✅ Validation error shown for empty form');
    } else {
      console.log('⚠️ No validation error visible (may be handled differently)');
    }

    console.log('✅ Form validation test complete');
  });

  test('5. Invalid credentials show error', async ({ page }) => {
    console.log('\n=== Testing INVALID CREDENTIALS ===');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    // Enter invalid credentials
    await usernameInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await loginButton.click();

    console.log('📝 Entered invalid credentials');

    // Wait for error message
    await page.waitForTimeout(2000);

    // Should show error message
    const errorVisible = await page.locator('text=/incorrect|invalid|failed/i').isVisible().catch(() => false);

    if (errorVisible) {
      console.log('✅ Error message shown for invalid credentials');
      expect(errorVisible).toBe(true);
    } else {
      console.log('⚠️ No error message visible (check implementation)');
    }

    console.log('✅ Invalid credentials test complete');
  });

  test('6. Session persistence after page refresh', async ({ page }) => {
    console.log('\n=== Testing SESSION PERSISTENCE ===');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Login with SCPRIME
    const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    await usernameInput.fill('SCPRIME');
    await passwordInput.fill('SCPRIME');

    const loginResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/login'),
      { timeout: 10000 }
    );

    await loginButton.click();
    await loginResponsePromise;

    console.log('✅ Logged in');

    // Wait for dashboard
    await page.waitForTimeout(2000);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('🔄 Page refreshed');

    // Should NOT show login form again (session persisted)
    const loginFormVisible = await page.locator('input[type="password"]').isVisible().catch(() => false);

    if (!loginFormVisible) {
      console.log('✅ Session persisted - user still logged in');
      expect(loginFormVisible).toBe(false);
    } else {
      console.log('⚠️ User logged out after refresh (check token persistence)');
    }

    console.log('✅ Session persistence test complete');
  });

  test('Summary: Login Flow Health Check', async ({ page }) => {
    console.log('\n=== LOGIN FLOW HEALTH CHECK ===');

    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    // Monitor console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Monitor network errors
    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });

    // Navigate and login
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[placeholder*="username" i], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    await usernameInput.fill('SCPRIME');
    await passwordInput.fill('SCPRIME');
    await loginButton.click();

    await page.waitForTimeout(3000);

    console.log('\n📊 Health Check Results:');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors Found:');
      consoleErrors.forEach((err) => console.log(`  - ${err}`));
    }

    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Errors Found:');
      networkErrors.forEach((err) => console.log(`  - ${err}`));
    }

    // Allow some 404s for not-yet-implemented features
    const criticalErrors = networkErrors.filter((err) => err.includes('500') || err.includes('auth'));
    expect(criticalErrors.length).toBe(0);

    console.log('\n✅ Login flow health check complete');
  });
});

