export class Helpers {
    static async waitForCondition(
        condition: () => Promise<boolean>,
        timeout: number = 5000,
        interval: number = 100
    ): Promise<void> {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            if (await condition()) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error(`Condition not met within ${timeout}ms`);
    }

    static formatPrice(price: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(price);
    }

    static generateRandomString(length: number = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

}