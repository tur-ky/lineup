import { Page } from '@playwright/test';

/**
 * Helper to inject a mock Supabase session into localStorage
 * This bypasses the need for actual OAuth login flow in tests
 */
export async function setupMockAuth(page: Page) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';

    // Extract project ref from Supabase URL (e.g., "brwockuouqlbulojsvnx" from "https://brwockuouqlbulojsvnx.supabase.co")
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'test';
    const storageKey = `sb-${projectRef}-auth-token`;

    // Mock session object that matches Supabase's expected structure
    const mockSession = {
        access_token: 'mock-access-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
            id: 'test-user-id',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'test@example.com',
            email_confirmed_at: new Date().toISOString(),
            phone: '',
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {},
            identities: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    };

    // Inject the session into localStorage before the page loads
    await page.addInitScript(({ key, session }) => {
        localStorage.setItem(key, JSON.stringify(session));
    }, { key: storageKey, session: mockSession });

    // Also set a fallback flag if the app uses it (like TEST_SESSION)
    await page.addInitScript(() => {
        // @ts-ignore
        window.TEST_SESSION = true;
    });

    // Mock the Supabase Auth API endpoints to return valid responses
    await page.route('**/auth/v1/user', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockSession.user)
        });
    });

    await page.route('**/auth/v1/token**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockSession)
        });
    });
}
