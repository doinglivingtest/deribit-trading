export interface Environment {
    name: string;
    baseUrl: string;
    apiUrl: string;
    wsUrl: string;
    credentials: {
        username: string;
        password: string;
        otp_seed: string;
        apiKey?: string;
        apiSecret?: string;
    };
}

export const environments: Record<string, Environment> = {
    test: {
        name: 'test',
        baseUrl: 'https://test.deribit.com',
        apiUrl: 'https://test.deribit.com/api/v2',
        wsUrl: 'wss://test.deribit.com/ws/api/v2',
        credentials: {
            username: process.env.TEST_USERNAME || 'test@example.com',
            password: process.env.TEST_PASSWORD || 'password123',
            otp_seed: process.env.TEST_OTP_SEED || '',
            apiKey: process.env.TEST_API_KEY,
            apiSecret: process.env.TEST_API_SECRET
        }
    },
    staging: {
        name: 'staging',
        baseUrl: 'https://staging.deribit.com',
        apiUrl: 'https://staging.deribit.com/api/v2',
        wsUrl: 'wss://staging.deribit.com/ws/api/v2',
        credentials: {
            username: process.env.STAGING_USERNAME || 'staging@example.com',
            password: process.env.STAGING_PASSWORD || 'password123',
            otp_seed: process.env.TEST_OTP_SEED || '',
            apiKey: process.env.STAGING_API_KEY,
            apiSecret: process.env.STAGING_API_SECRET
        }
    }
};

export const getCurrentEnvironment = (): Environment => {
    const env = process.env.TEST_ENV || 'test';
    return environments[env];
};