import { test, expect } from '@playwright/test';
import { setupMockAuth } from '../helpers/auth';

/**
 * E2E Test Suite - Dashboard Access with Mocked Auth
 * 
 * This test verifies that the application loads correctly when a valid
 * Supabase session is injected programmatically, bypassing the UI login flow.
 * 
 * IMPORTANT: This approach is necessary because the test environment cannot
 * reach the Supabase Auth backend for real OAuth flows.
 */
test.describe('Dashboard - Authenticated State', () => {
    test.beforeEach(async ({ page }) => {
        // Set up mock authentication before each test
        await setupMockAuth(page);
    });

    test('should load dashboard when authenticated via mocked session', async ({ page }) => {
        // Navigate to the application
        await page.goto('/');

        // The app should bypass the login screen and load directly into the dashboard
        // Verify that we're seeing authenticated content (e.g., map interface, not login screen)

        // Wait for the main dashboard elements to be visible
        // Adjust these selectors based on your actual dashboard UI
        await expect(page.locator('body')).not.toContainText('Login');

        // Verify core dashboard elements are present
        // Example: Check for map container or navigation elements
        const mapContainer = page.locator('.w-full.h-full.relative.overflow-hidden').first();
        await expect(mapContainer).toBeVisible({ timeout: 10000 });

        // Take a screenshot for visual verification
        await page.screenshot({ path: 'test-results/dashboard-authenticated.png', fullPage: true });

        console.log('✓ Dashboard loaded successfully with mocked auth');
    });

    test('should have valid user session in browser context', async ({ page }) => {
        await page.goto('/');

        // Verify that localStorage contains our mocked session
        const storageKey = await page.evaluate(() => {
            const keys = Object.keys(localStorage);
            return keys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
        });

        expect(storageKey).toBeTruthy();

        const sessionData = await page.evaluate((key) => {
            return localStorage.getItem(key || '');
        }, storageKey);

        expect(sessionData).toBeTruthy();

        const session = JSON.parse(sessionData || '{}');
        expect(session.user?.email).toBe('test@example.com');
        expect(session.access_token).toContain('mock-access-token');

        console.log('✓ Session data correctly injected into localStorage');
    });
});
