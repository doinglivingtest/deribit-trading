import { test, expect } from '@core/base/BaseTest';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { getCurrentEnvironment } from '@config/environments';
import {COPY} from '@config/constants';

test.describe('User Login UI', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);

        await loginPage.navigateToLogin();
    });

    test('should display login form', async ({ logger }) => {
        await loginPage.assertLoginFormVisible();
        logger.info('Login form displayed correctly');
    });

    test.skip('should login with valid credentials', async ({ logger }) => {
        const env = getCurrentEnvironment();

        await loginPage.login(env.credentials.username, env.credentials.password, env.credentials.otp_seed);
        await loginPage.assertLoginSuccess();

        logger.info('Login successful');
    });

    test.skip('should reject invalid credentials', async ({ logger }) => {
        await loginPage.login('invalid@email.com', 'wrongpassword', '0000000');
        await loginPage.waitForLoginError();

        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain(COPY.AUTH.WRONG_CREDENTIALS);

        logger.info('Invalid credentials rejected with error message');
    });

    test.skip('should redirect to dashboard after successful login', async ({ logger }) => {
        const env = getCurrentEnvironment();

        await loginPage.login(env.credentials.username, env.credentials.password, env.credentials.otp_seed);
        await dashboardPage.assertDashboardLoaded();

        logger.info('Redirected to dashboard after login');
    });

    test('should logout successfully', async ({ logger }) => {
        const env = getCurrentEnvironment();

        await loginPage.login(env.credentials.username, env.credentials.password, env.credentials.otp_seed);
        await loginPage.assertLoginSuccess();

        await loginPage.logout();

        logger.info('Logout successful');
    });

});