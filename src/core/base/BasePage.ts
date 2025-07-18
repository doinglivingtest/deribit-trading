import { Page, Locator, expect } from '@playwright/test';
import { TIMEOUTS, SELECTORS } from '@config/constants';
import { Logger } from '@core/utils/Logger';

export abstract class BasePage {
    protected readonly page: Page;
    protected readonly logger: Logger;

    constructor(page: Page) {
        this.page = page;
        this.logger = new Logger(this.constructor.name);
    }

    // Common page operations following DRY principle
    async waitForPageLoad(timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
        await this.page.waitForLoadState('networkidle', { timeout });
        await this.waitForLoadingToDisappear();
    }

    async waitForLoadingToDisappear(): Promise<void> {
        const loadingElement = this.page.locator(SELECTORS.COMMON.LOADING);
        if (await loadingElement.isVisible()) {
            await loadingElement.waitFor({ state: 'hidden' });
        }
    }

    async clickElement(selector: string | Locator): Promise<void> {
        const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await element.waitFor({ state: 'visible' });
        await element.click();
        this.logger.info(`Clicked element: ${selector}`);
    }

    async fillInput(selector: string | Locator, value: string): Promise<void> {
        const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await expect(element).toBeVisible()
        await element.clear();
        await element.fill(value);
        this.logger.info(`Filled input: ${selector} with value: ${value}`);
    }

    async selectOption(selector: string | Locator, value: string): Promise<void> {
        const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await element.waitFor({ state: 'visible' });
        await element.selectOption(value);
        this.logger.info(`Selected option: ${value} in ${selector}`);
    }

    async getText(selector: string | Locator): Promise<string> {
        const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await element.waitFor({ state: 'visible' });
        return await element.textContent() || '';
    }

    async waitForElement(selector: string | Locator, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
        const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await element.waitFor({ state: 'visible', timeout });
    }

    async assertElementVisible(selector: string | Locator): Promise<void> {
        const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await expect(element).toBeVisible();
    }

    async assertElementHidden(selector: string | Locator): Promise<void> {
        const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await expect(element).toBeHidden();
    }

    async assertElementText(selector: string | Locator, expectedText: string): Promise<void> {
        const element = typeof selector === 'string' ? this.page.locator(selector) : selector;
        await expect(element).toHaveText(expectedText);
    }

    async takeScreenshot(name: string): Promise<void> {
        await this.page.screenshot({ path: `screenshots/${name}.png` });
        this.logger.info(`Screenshot taken: ${name}`);
    }

    // Error handling
    async handleError(error: Error): Promise<void> {
        await this.takeScreenshot(`error-${Date.now()}`);
        this.logger.error(`Error occurred: ${error.message}`);
        throw error;
    }
}