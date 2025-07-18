import {expect, Locator, Page} from '@playwright/test';
import {BasePage} from '@core/base/BasePage';
import {SELECTORS} from '@config/constants';

export class DashboardPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Page elements
    get accountSummary() { return this.page.locator('[data-testid="account-summary"]'); }
    get portfolioValue() { return this.page.getByTestId(SELECTORS.DASHBOARD.TOTAL_ACCOUNT_VALUE); }
    get availableBalance() { return this.page.locator('[data-testid="available-balance"]'); }
    get totalPnL() { return this.page.locator('[data-testid="total-pnl"]'); }
    get openPositions() { return this.page.locator('[data-testid="open-positions"]'); }
    get recentTrades() { return this.page.locator('[data-testid="recent-trades"]'); }
    get marketOverview() { return this.page.locator('[data-testid="market-overview"]'); }

    // Page actions
    async navigateToDashboard(): Promise<void> {
        await this.page.goto('/dashboard');
        await this.waitForPageLoad();
    }

    getTradingOptionMenuSelector(option: string): Locator {
        return this.page.getByTestId(`navigationItem-${option}`);
    }

    async getAccountBalance(): Promise<number> {
        const balanceText = await this.getText(this.portfolioValue);
        return parseFloat(balanceText.replace(/[^0-9.-]+/g, ''));
    }

    async getPortfolioValue(): Promise<number> {
        const valueText = await this.getText(this.portfolioValue);
        return parseFloat(valueText.replace(/[^0-9.-]+/g, ''));
    }

    async getTotalPnL(): Promise<number> {
        const pnlText = await this.getText(this.totalPnL);
        return parseFloat(pnlText.replace(/[^0-9.-]+/g, ''));
    }

    async getOpenPositionsCount(): Promise<number> {
        const text = await this.openPositions
            .locator('//button[@data-id="positionsTab"]//div//span//span')
            .innerText();

        const count = parseInt(text, 10);
        return isNaN(count) ? 0 : count;
    }

    async navigateToTrading(option: string): Promise<void> {
        await this.clickElement(this.getTradingOptionMenuSelector(option))
        await this.waitForPageLoad();
    }


    async getRecentTradesCount(): Promise<number> {
        const tradeRows = this.recentTrades.locator('[data-testid^="trade-"]');
        return await tradeRows.count();
    }

    async refreshDashboard(): Promise<void> {
        await this.page.reload();
        await this.waitForPageLoad();
    }

    // Validation methods
    async assertDashboardLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/.*\/dashboard/);
        await this.assertElementVisible(this.portfolioValue);
    }

    async assertPositiveBalance(): Promise<void> {
        const balance = await this.getAccountBalance();
        if (balance <= 0) {
            throw new Error(`Expected positive balance, got: ${balance}`);
        }
    }

    async assertPnLDisplayed(): Promise<void> {
        await this.assertElementVisible(this.totalPnL);
    }
}