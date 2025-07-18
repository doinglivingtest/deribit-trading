import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '@core/utils/Logger';
import { getCurrentEnvironment } from '@config/environments';
import {TokenStore} from "@core/utils/TokenStore";

export abstract class BaseAPI {
    protected readonly request: APIRequestContext;
    protected readonly logger: Logger;
    protected readonly baseUrl: string;
    private accessToken?: string;

    constructor(request: APIRequestContext) {
        this.request = request;
        this.logger = new Logger(this.constructor.name);
        this.baseUrl = getCurrentEnvironment().apiUrl;
    }

    // Token management methods
    protected setAccessToken(token: string): void {
        TokenStore.setToken(token);
        this.logger.info('Access token updated');
    }

    protected getAccessToken(): string | undefined {
        return TokenStore.getToken();
    }

    protected clearAccessToken(): void {
        TokenStore.clearToken();
        this.logger.info('Access token cleared');
    }

    // Common authentication headers method
    protected getAuthHeaders(): Record<string, string> {
        const token = TokenStore.getToken();
        if (token) {
            return {
                'Authorization': `Bearer ${token}`
            };
        }
        return {};
    }

    // Enhanced HTTP methods that automatically include auth headers
    async get(endpoint: string, options?: { params?: Record<string, any>; headers?: Record<string, string>; requireAuth?: boolean }): Promise<APIResponse> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const config: any = {};

            // Merge parameters
            if (options?.params) {
                config.params = options.params;
            }

            // Merge headers with auth headers
            const authHeaders = options?.requireAuth !== false ? this.getAuthHeaders() : {};
            config.headers = {
                ...authHeaders,
                ...options?.headers
            };
            this.logger.info(
                `FULL URL GET ${url}\n` +
                `params: ${JSON.stringify(config.params, null, 2)}\n` +
                `headers: ${JSON.stringify(config.headers, null, 2)}`
            );

            const response = await this.request.get(url, config);
            this.logger.info(`GET ${url} - Status: ${response.status()}`);
            return response;
        } catch (error) {
            this.logger.error(`GET request failed: ${error}`);
            throw error;
        }
    }

    async post(endpoint: string, data?: any, options?: { headers?: Record<string, string>; requireAuth?: boolean }): Promise<APIResponse> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const config: any = { data };

            // Merge headers with auth headers
            const authHeaders = options?.requireAuth !== false ? this.getAuthHeaders() : {};
            config.headers = {
                ...authHeaders,
                ...options?.headers
            };

            const response = await this.request.post(url, config);
            this.logger.info(`POST ${url} - Status: ${response.status()}`);
            return response;
        } catch (error) {
            this.logger.error(`POST request failed: ${error}`);
            throw error;
        }
    }

    async put(endpoint: string, data?: any, options?: { headers?: Record<string, string>; requireAuth?: boolean }): Promise<APIResponse> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const config: any = { data };

            // Merge headers with auth headers
            const authHeaders = options?.requireAuth !== false ? this.getAuthHeaders() : {};
            config.headers = {
                ...authHeaders,
                ...options?.headers
            };

            const response = await this.request.put(url, config);
            this.logger.info(`PUT ${url} - Status: ${response.status()}`);
            return response;
        } catch (error) {
            this.logger.error(`PUT request failed: ${error}`);
            throw error;
        }
    }

    async delete(endpoint: string, options?: { headers?: Record<string, string>; requireAuth?: boolean }): Promise<APIResponse> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const config: any = {};

            // Merge headers with auth headers
            const authHeaders = options?.requireAuth !== false ? this.getAuthHeaders() : {};
            config.headers = {
                ...authHeaders,
                ...options?.headers
            };

            const response = await this.request.delete(url, config);
            this.logger.info(`DELETE ${url} - Status: ${response.status()}`);
            return response;
        } catch (error) {
            this.logger.error(`DELETE request failed: ${error}`);
            throw error;
        }
    }

    // Response validation
    async validateResponse(response: APIResponse, expectedStatus: number = 200): Promise<any> {
        if (response.status() !== expectedStatus) {
            throw new Error(`Expected status ${expectedStatus}, got ${response.status()}`);
        }
        return await response.json();
    }

    // Authentication helper for API key authentication
    async authenticate(apiKey?: string, apiSecret?: string): Promise<void> {
        const env = getCurrentEnvironment();
        const key = apiKey || env.credentials.apiKey;
        const secret = apiSecret || env.credentials.apiSecret;

        if (key && secret) {
            // For Deribit API key authentication
            const timestamp = Date.now();
            const nonce = Math.random().toString(36).substring(7);

            // Create signature (simplified - actual implementation depends on Deribit's requirements)
            const stringToSign = `${timestamp}\n${nonce}\n`;
            const signature = this.createSignature(stringToSign, secret);

            this.setAccessToken(`${key}:${signature}:${timestamp}:${nonce}`);
            this.logger.info('Authenticated with API key');
        }
    }

    private createSignature(data: string, secret: string): string {
        // Simplified signature creation - implement according to Deribit's spec
        const crypto = require('crypto');
        return crypto.createHmac('sha256', secret).update(data).digest('hex');
    }
}