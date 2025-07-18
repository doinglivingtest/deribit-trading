import { Page, Locator } from '@playwright/test';
import { BasePage } from '@core/base/BasePage';
import { SELECTORS } from '@config/constants';

export interface OrderFormData {
    instrument: string;
    orderType: 'limit' | 'market';
    side: 'buy' | 'sell';
    amount: number;
    price?: number;
    timeInForce?: string;
}

export class TradingPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // Page elements
    get orderBook() { return this.page.getByTestId(SELECTORS.TRADING.ORDER_BOOK); }
    get priceInput() { return this.page.getByTestId(SELECTORS.TRADING.PRICE_INPUT).locator('input'); }
    get amountInput() { return this.page.getByTestId(SELECTORS.TRADING.AMOUNT_INPUT).locator('input'); }
    get orderTypeSelect() { return this.page.locator('#OrderForm-default').getByText('Limit'); }
    get placeOrderButton() { return this.page.locator(SELECTORS.TRADING.PLACE_ORDER_BUTTON); }
    get limitOrderButton() { return this.page.getByTestId(SELECTORS.TRADING.LIMIT_ORDER_BUTTON_MENU); }
    get createOrderButtonModal() { return this.page.getByTestId(SELECTORS.TRADING.CREATE_ORDER_BUTTON_MODAL); }
    get notificationToast() { return this.page.getByTestId(SELECTORS.TRADING.NOTIFICATION_TOAST); }
    get openOrdersTitleDashboard() { return this.page.getByTestId(SELECTORS.TRADING.OPEN_ORDERS_TITLE_DASHBOARD); }
    get cancelOrderButtonDashboard() { return this.page.getByTestId(SELECTORS.TRADING.CANCEL_ORDER_BUTTON_DASHBOARD); }

    getInstrumentSelector(instrument: string): Locator {
        return this.page.getByRole('link', { name: `Star Empty ${instrument}` })
    }

    getDirectionButton(direction: string): Locator {
        return this.page.getByTestId(`${direction}Btn`);
    }

    getOrderRow(orderId: string): Locator {
        return this.page.locator(`[data-testid="order-${orderId}"]`);
    }

    getPositionRow(instrument: string): Locator {
        return this.page.locator(`[data-testid="position-${instrument}"]`);
    }

    async selectInstrument(instrument: string): Promise<void> {
        await this.clickElement(this.getInstrumentSelector(instrument));
        await this.waitForOrderBookToLoad();
        this.logger.info(`Selected instrument: ${instrument}`);
    }

    async selectOrderType(orderType: string): Promise<void> {
        await this.clickElement(this.orderTypeSelect);
        await this.waitForOrderBookToLoad();
        await this.clickElement(this.limitOrderButton);
        this.logger.info(`Selected Order Type: ${orderType}`);
    }

    async placeOrder(orderData: OrderFormData): Promise<void> {
        this.logger.info(`Placing ${orderData.side} order for ${orderData.instrument}`);

        await this.selectOrderType(orderData.orderType);
        await this.fillInput(this.amountInput, orderData.amount.toString());

        if (orderData.orderType === 'limit' && orderData.price) {
            await this.fillInput(this.priceInput, orderData.price.toString());
        }
        await this.clickElement(this.getDirectionButton(orderData.side));
        await this.clickElement(this.createOrderButtonModal)
        await this.waitForOrderConfirmation();
    }

    async cancelLastOrder(): Promise<void> {
        await this.clickElement(this.openOrdersTitleDashboard);
        await this.clickElement(this.cancelOrderButtonDashboard.first());
        await this.waitForLastOrderCancellation();

        this.logger.info(`Cancelled last order`);
    }

    async getOrderBookBids(count: number = 5): Promise<Array<{price: number, amount: number}>> {
        const bids = [];
        for (let i = 0; i < count; i++) {
            const bidRow = this.orderBook.locator(`[data-testid="bid-${i}"]`);
            const price = await bidRow.locator('[data-testid="price"]').textContent();
            const amount = await bidRow.locator('[data-testid="amount"]').textContent();

            bids.push({
                price: parseFloat(price || '0'),
                amount: parseFloat(amount || '0')
            });
        }
        return bids;
    }

    async getOrderBookAsks(count: number = 5): Promise<Array<{price: number, amount: number}>> {
        const asks = [];
        for (let i = 0; i < count; i++) {
            const askRow = this.orderBook.locator(`[data-testid="ask-${i}"]`);
            const price = await askRow.locator('[data-testid="price"]').textContent();
            const amount = await askRow.locator('[data-testid="amount"]').textContent();

            asks.push({
                price: parseFloat(price || '0'),
                amount: parseFloat(amount || '0')
            });
        }
        return asks;
    }


    // Helper methods
    async waitForOrderBookToLoad(): Promise<void> {
        await this.waitForElement(this.orderBook);
        await this.waitForLoadingToDisappear();
    }

    async waitForOrderConfirmation(): Promise<void> {
        await this.waitForElement(this.notificationToast.getByTestId("order"));
    }

    async waitForLastOrderCancellation(): Promise<void> {
        await this.waitForElement(this.notificationToast.getByTestId("instrumentName"));
    }

    // Validation methods
    async assertOrderBookVisible(): Promise<void> {
        await this.assertElementVisible(this.orderBook);
    }

    async assertOrderFormVisible(): Promise<void> {
        await this.assertElementVisible(this.priceInput);
        await this.assertElementVisible(this.amountInput);
        await this.assertElementVisible(this.getDirectionButton('buy'));
        await this.assertElementVisible(this.getDirectionButton('sell'));
    }
}