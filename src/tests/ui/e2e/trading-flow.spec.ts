import { test, expect } from '@core/base/BaseTest';
import { LoginPage } from '@pages/LoginPage';
import { TradingPage } from '@pages/TradingPage';
import { DashboardPage } from '@pages/DashboardPage';
import { TradingService } from '@api/services/TradingService';
import { UserService } from '@api/services/UserService';
import { getCurrentEnvironment } from '@config/environments';

test.describe('End-to-End Trading Flow', () => {
    let loginPage: LoginPage;
    let tradingPage: TradingPage;
    let dashboardPage: DashboardPage;
    let tradingService: TradingService;
    let userService: UserService;

    test.beforeEach(async ({ page, request, logger }) => {
        loginPage = new LoginPage(page);
        tradingPage = new TradingPage(page);
        dashboardPage = new DashboardPage(page);
        tradingService = new TradingService(request);
        userService = new UserService(request);

        const env = getCurrentEnvironment();

        // Login via UI
        await loginPage.navigateToLogin();
        await loginPage.login(env.credentials.username, env.credentials.password, env.credentials.otp_seed);
        await loginPage.assertLoginSuccess();

        // Authenticate API
        await userService.login();

        logger.info('Setup complete - UI and API authenticated');
    });

    test('complete trading workflow', async ({ logger }) => {
        // 1. Check initial account state
        await dashboardPage.navigateToDashboard();
        const initialBalance = await dashboardPage.getAccountBalance();

        logger.info(`Initial balance: ${initialBalance}`);

        // 2. Navigate to trading and place an order
        await dashboardPage.navigateToTrading("futures");
        await tradingPage.selectInstrument('BTC-PERPETUAL');



        const orderData = {
            instrument: 'BTC-PERPETUAL',
            orderType: 'limit' as const,
            side: 'buy' as const,
            amount: 10,
            price: 4500
        };

        await tradingPage.placeOrder(orderData);

        // 3. Verify order via API
        const orders = await tradingService.getOrderHistory('BTC-PERPETUAL', 5);
        const recentOrder = orders.find(order =>
            order.amount === orderData.amount &&
            order.direction === orderData.side
        );

        expect(recentOrder).toBeDefined();
        logger.info(`Order verified via API: ${recentOrder?.order_id}`);

        // 4. Cancel last order via UI
        await tradingPage.cancelLastOrder();


        // 5. Verify final state
        await dashboardPage.navigateToDashboard();
        await dashboardPage.refreshDashboard();

        const finalBalance = await dashboardPage.getAccountBalance();
        expect(Math.abs(finalBalance - initialBalance)).toBeLessThanOrEqual(10000);

        logger.info('Complete trading workflow executed successfully');
    });
});