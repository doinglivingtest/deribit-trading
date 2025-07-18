import {APIRequestContext} from '@playwright/test';
import {BaseAPI} from '@core/base/BaseAPI';
import {API_ENDPOINTS} from '@config/constants';
import {
    AccountSummary,
    AccountSummarySchema,
    AuthResponse,
    AuthResponseSchema,
    Portfolio,
    PortfolioSchema,
    User,
    UserSchema
} from '@api/schemas/user-schemas';

export class UserService extends BaseAPI {
    constructor(request: APIRequestContext) {
        super(request);
    }

    async login(): Promise<AuthResponse> {
        const response = await this.get(API_ENDPOINTS.AUTH.LOGIN, {
            params:{
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }, requireAuth: false, // Don't require auth for login
        });

        const data = await this.validateResponse(response);
        const parsed = AuthResponseSchema.parse(data);

        // Store token in base class for all services to use
        this.setAccessToken(parsed.result.access_token);

        return parsed;
    }

    async loginWithCredentials(username: string, password: string): Promise<AuthResponse> {
        const response = await this.get(API_ENDPOINTS.AUTH.LOGIN, {
            params:{
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }, requireAuth: false, // Don't require auth for login
        });

        const data = await this.validateResponse(response);
        const parsed = AuthResponseSchema.parse(data);

        // Store token in base class for all services to use
        this.setAccessToken(parsed.result.access_token);

        return parsed;
    }

    // Override the base authenticate method to use API key authentication
    async authenticate(apiKey?: string, apiSecret?: string): Promise<void> {
        await super.authenticate(apiKey, apiSecret);
    }

    async logout(): Promise<void> {
        await this.post(API_ENDPOINTS.AUTH.LOGOUT);

        // Clear token from base class
        this.clearAccessToken();
        this.logger.info('User logged out successfully');
    }

    async getAccountSummary(currency: string = 'BTC'): Promise<AccountSummary> {
        const response = await this.get(API_ENDPOINTS.USER.GET_ACCOUNT_SUMMARY, {
            params: {
                currency: currency
            },
            requireAuth: true,
        });
        const data = await this.validateResponse(response);

        return AccountSummarySchema.parse(data.result);
    }

    async getPortfolio(currency: string = 'BTC'): Promise<Portfolio> {
        const response = await this.get(API_ENDPOINTS.USER.GET_PORTFOLIO, {
            params: { currency }
        });
        const data = await this.validateResponse(response);

        return PortfolioSchema.parse(data.result);
    }

    async getCurrentUser(): Promise<User> {
        const response = await this.get('/private/get_current_user');
        const data = await this.validateResponse(response);

        return UserSchema.parse(data.result);
    }

    async getMarginFactor(instrumentName: string): Promise<number> {
        const response = await this.get('/private/get_margin_factor', {
            params: { instrument_name: instrumentName }
        });
        const data = await this.validateResponse(response);

        return data.result.margin_factor;
    }
}