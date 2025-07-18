import { test, expect } from '@core/base/BaseTest';
import { UserService } from '@api/services/UserService';
import { getCurrentEnvironment } from '@config/environments';
import {API_ENDPOINTS} from "@config/constants";
import {AuthResponseSchema} from "@api/schemas/user-schemas";

test.describe('User Authentication API', () => {
    let userService: UserService;

    test.beforeEach(async ({ request }) => {
        userService = new UserService(request);
    });

    test('should reject invalid credentials', async ({ logger }) => {
        const response = await userService.get(API_ENDPOINTS.AUTH.LOGIN, {
            params:{
                grant_type: 'client_credentials',
                client_id: 'INVALID_CLIENT_ID',
                client_secret: 'INVALID_CLIENT_SECRET',
            }, requireAuth: false, // Don't require auth for login
        });

        expect(response.ok()).toBeFalsy();

        logger.info('Invalid credentials rejected as expected');
    });

    test('should get account summary after authentication', async ({ logger }) => {
        const env = getCurrentEnvironment();

        await userService.login();

        const accountSummary = await userService.getAccountSummary('BTC');

        expect(accountSummary).toBeDefined();
        expect(accountSummary.currency).toBe('BTC');
        expect(typeof accountSummary.balance).toBe('number');
        expect(typeof accountSummary.available_funds).toBe('number');
        expect(typeof accountSummary.equity).toBe('number');

        logger.info(`Account balance: ${accountSummary.balance} BTC`);
    });
});