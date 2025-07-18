import { test, expect } from '@core/base/BaseTest';
import { LoginPage } from '@pages/LoginPage';
import { TradingPage } from '@pages/TradingPage';
import { getCurrentEnvironment } from '@config/environments';
import {DashboardPage} from "@pages/DashboardPage";

test.describe('Trading UI - Place Orders', () => {
    let loginPage: LoginPage;
    let tradingPage: TradingPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page, logger }) => {
        loginPage = new LoginPage(page);
        tradingPage = new TradingPage(page);
        dashboardPage = new DashboardPage(page)

        // Login before each test
        const env = getCurrentEnvironment();
        await loginPage.navigateToLogin();
        await loginPage.login(env.credentials.username, env.credentials.password, env.credentials.otp_seed);
        await loginPage.assertLoginSuccess();

        logger.info('User logged in successfully');
    });

    test('should display trading interface correctly', async ({ page, logger }) => {
        // 2. Navigate to trading and place an order
        await dashboardPage.navigateToTrading("futures");
        await tradingPage.selectInstrument('BTC-PERPETUAL');

        await tradingPage.assertOrderBookVisible();
        await tradingPage.assertOrderFormVisible();

        logger.info('Trading interface loaded successfully');
    });
});