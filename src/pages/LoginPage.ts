import { Page } from '@playwright/test';
import { BasePage } from '@core/base/BasePage';
import { SELECTORS } from '@config/constants';
import { authenticator } from 'otplib';

export class LoginPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Page elements
    get emailInput() { return this.page.locator(SELECTORS.LOGIN.EMAIL_INPUT); }
    get passwordInput() { return this.page.locator(SELECTORS.LOGIN.PASSWORD_INPUT); }
    get twoFaInput() { return this.page.locator(SELECTORS.LOGIN.TWO_FA_CODE_INPUT); }
    get loginButton() { return this.page.locator(SELECTORS.LOGIN.LOGIN_BUTTON); }
    get logoutButton() { return this.page.getByTestId(SELECTORS.DASHBOARD.LOGOUT_BUTTON); }
    get myAccount() { return this.page.getByTestId(SELECTORS.DASHBOARD.MY_ACCOUNT); }
    get errorMessage() { return this.page.getByTestId(SELECTORS.COMMON.ERROR_MESSAGE); }
    get successMessage() { return this.page.locator(SELECTORS.COMMON.SUCCESS_MESSAGE); }
    get usernameDashboard() { return this.page.getByTestId(SELECTORS.DASHBOARD.USERNAME); }

    // Page actions
    async navigateToLogin(): Promise<void> {
        await this.page.goto('/login');
        await this.waitForPageLoad();
    }

    async login(email: string, password: string, otpSeed: string): Promise<void> {
        this.logger.info(`Attempting login with email: ${email}`);

        await this.fillInput(this.emailInput, email);
        await this.fillInput(this.passwordInput, password);
        // Generate the 2FA code using the seed
        const otpCode = authenticator.generate(otpSeed);
        this.logger.info(`Generated OTP code: ${otpCode}`);
        await this.fillInput(this.twoFaInput, otpCode);
        await this.clickElement(this.loginButton);

        await this.waitForPageLoad();
    }

    async logout(): Promise<void> {
        await this.clickElement(this.myAccount);
        const button = this.logoutButton;
        await button.scrollIntoViewIfNeeded();
        await this.clickElement(button);
        await this.waitForPageLoad();
        this.logger.info('User logged out successfully');
    }

    async isLoggedIn(): Promise<boolean> {
        return await this.logoutButton.isVisible();
    }

    async getErrorMessage(): Promise<string> {
        return await this.getText(this.errorMessage);
    }

    async waitForLoginError(): Promise<void> {
        await this.waitForElement(this.errorMessage);
    }

    // Validation methods
    async assertLoginFormVisible(): Promise<void> {
        await this.assertElementVisible(this.emailInput);
        await this.assertElementVisible(this.passwordInput);
        await this.assertElementVisible(this.loginButton);
    }

    async assertLoginSuccess(): Promise<void> {
        await this.waitForElement(this.usernameDashboard);
        await this.assertElementHidden(this.emailInput);
    }

    async assertLoginError(expectedMessage: string): Promise<void> {
        await this.assertElementVisible(this.errorMessage);
        await this.assertElementText(this.errorMessage, expectedMessage);
    }
}