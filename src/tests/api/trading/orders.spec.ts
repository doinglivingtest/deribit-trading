import { test, expect } from '@core/base/BaseTest';
import { TradingService } from '@api/services/TradingService';
import { UserService } from '@api/services/UserService';
import { TestDataFactory } from '@core/utils/TestDataFactory';
import { getCurrentEnvironment } from '@config/environments';
import {MarketService} from "@api/services/MarketService";

test.describe('Trading Orders API', () => {
    let tradingService: TradingService;
    let userService: UserService;
    let marketService: MarketService;
    let authToken: string;

    test.beforeEach(async ({ request, logger }) => {
        tradingService = new TradingService(request);
        userService = new UserService(request);
        marketService = new MarketService(request);

        // Authenticate before each test
        const env = getCurrentEnvironment();
        const authResponse = await userService.login();

        authToken = authResponse.result.access_token;
        logger.info('Authentication successful');
    });

    test.describe('Place Orders', () => {
        test('should place a valid limit buy order', async ({ logger }) => {
            const orderData = TestDataFactory.generateOrderData();
            const getTickerResponse = await marketService.getTicker(orderData.instrument);
            const price = Math.floor(getTickerResponse.mark_price);

            const order = await tradingService.placeOrder({
                instrument_name: orderData.instrument,
                amount: orderData.amount,
                price: price, // we need price of the asset, fix it
                type: orderData.type as 'limit' | 'market',
                direction: orderData.direction as 'buy' | 'sell'
            });

            expect(order).toBeDefined();
            expect(order.instrument_name).toBe(orderData.instrument);
            expect(order.amount).toBe(orderData.amount);
            expect(order.direction).toBe(orderData.direction);
            expect(order.order_type).toBe(orderData.type);
            expect(['filled', 'open']).toContain(order.order_state);


            logger.info(`Order placed successfully: ${order.order_id}`);
        });

        test('should place a valid market sell order', async ({ logger }) => {
            const orderData = TestDataFactory.generateOrderData();
            orderData.type = "market";
            orderData.direction = 'sell';

            const order = await tradingService.placeOrder({
                instrument_name: orderData.instrument,
                amount: orderData.amount,
                type: orderData.type as 'limit' | 'market',
                direction: orderData.direction as 'buy' | 'sell'
            });

            expect(order).toBeDefined();
            expect(order.instrument_name).toBe(orderData.instrument);
            expect(order.amount).toBe(orderData.amount);
            expect(order.direction).toBe(orderData.direction);
            expect(order.order_type).toBe(orderData.type);
            expect(['open', 'filled']).toContain(order.order_state);

            logger.info(`Market order placed: ${order.order_id}`);
        });

        test('should reject order with invalid instrument', async ({ logger }) => {
            const orderData = TestDataFactory.generateOrderData();
            orderData.instrument = 'INVALID-INSTRUMENT';

            await expect(tradingService.placeOrder({
                instrument_name: orderData.instrument,
                amount: orderData.amount,
                price: orderData.price,
                type: orderData.type as 'limit' | 'market',
                direction: orderData.direction as 'buy' | 'sell'
            })).rejects.toThrow();

            logger.info('Invalid instrument order rejected as expected');
        });

        test('should reject order with invalid amount', async ({ logger }) => {
            const orderData = TestDataFactory.generateOrderData();
            orderData.amount = -100; // Invalid negative amount

            await expect(tradingService.placeOrder({
                instrument_name: orderData.instrument,
                amount: orderData.amount,
                price: orderData.price,
                type: orderData.type as 'limit' | 'market',
                direction: orderData.direction as 'buy' | 'sell'
            })).rejects.toThrow();

            logger.info('Invalid amount order rejected as expected');
        });
    });

    test.describe('Cancel Orders', () => {
        test('should cancel an open order', async ({ logger }) => {
            // First place an order
            const orderData = TestDataFactory.generateOrderData();
            orderData.type = 'limit';
            orderData.direction = 'buy'
            const getTickerResponse = await marketService.getTicker(orderData.instrument);
            const price = Math.floor(getTickerResponse.mark_price - (Math.random()*10000));

            const placedOrder = await tradingService.placeOrder({
                instrument_name: orderData.instrument,
                amount: orderData.amount,
                price: price,
                type: orderData.type as 'limit' | 'market',
                direction: orderData.direction as 'buy' | 'sell'
            });

            expect(['open', 'filled']).toContain(placedOrder.order_state);

            // Cancel the order
            const cancelledOrder = await tradingService.cancelOrder(placedOrder.order_id);

            expect(cancelledOrder.order_id).toBe(placedOrder.order_id);
            expect(cancelledOrder.order_state).toBe('cancelled');

            logger.info(`Order cancelled successfully: ${cancelledOrder.order_id}`);
        });

        test('should fail to cancel non-existent order', async ({ logger }) => {
            const fakeOrderId = 'fake-order-id-12345';

            await expect(tradingService.cancelOrder(fakeOrderId))
                .rejects.toThrow();

            logger.info('Non-existent order cancellation failed as expected');
        });
    });

    test.describe('Order History', () => {
        test('should retrieve order history by instrument', async ({ logger }) => {
            const orders = await tradingService.getOrderHistory('BTC-PERPETUAL', 10);

            expect(Array.isArray(orders)).toBe(true);
            expect(orders.length).toBeGreaterThanOrEqual(0);

            if (orders.length > 0) {
                const firstOrder = orders[0];
                expect(firstOrder).toHaveProperty('order_id');
                expect(firstOrder).toHaveProperty('instrument_name');
                expect(firstOrder).toHaveProperty('direction');
                expect(firstOrder).toHaveProperty('amount');
                expect(firstOrder).toHaveProperty('order_state');
            }

            logger.info(`Retrieved ${orders.length} orders from history`);
        });
    });

    test.describe('Order Modification', () => {
        test('should modify an open order - Limit Buy', async ({ logger }) => {
            // Place initial order
            const orderData = TestDataFactory.generateOrderData();
            orderData.type = 'limit';
            orderData.direction = 'buy'
            const getTickerResponse = await marketService.getTicker(orderData.instrument);
            const price = Math.floor(getTickerResponse.mark_price - (Math.random()*10000));

            const placedOrder = await tradingService.placeOrder({
                instrument_name: orderData.instrument,
                amount: orderData.amount,
                price: price,
                type: orderData.type as 'limit' | 'market',
                direction: orderData.direction as 'buy' | 'sell'
            });

            // Modify the order
            const newAmount = orderData.amount + 10;

            const modifiedOrder = await tradingService.modifyOrder(
                placedOrder.order_id,
                newAmount,
                price
            );

            expect(modifiedOrder.order_id).toBe(placedOrder.order_id);
            expect(modifiedOrder.amount).toBe(newAmount);

            logger.info(`Order modified successfully: ${modifiedOrder.order_id}`);

            // Clean up
            await tradingService.cancelOrder(modifiedOrder.order_id);
        });
    });
});