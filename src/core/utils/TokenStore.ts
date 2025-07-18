export class TokenStore {
    private static accessToken?: string;

    static setToken(token: string): void {
        this.accessToken = token;
    }

    static getToken(): string | undefined {
        return this.accessToken;
    }

    static clearToken(): void {
        this.accessToken = undefined;
    }
}