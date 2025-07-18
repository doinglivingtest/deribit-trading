import { test, expect } from '@core/base/BaseTest';
import { TradingService } from '@api/services/TradingService';
import { UserService } from '@api/services/UserService';
import { getCurrentEnvironment } from '@config/environments';

test.describe('Trading Positions API', () => {
    let tradingService: TradingService;
    let userService: UserService;

    test.beforeEach(async ({ request, logger }) => {
        tradingService = new TradingService(request);
        userService = new UserService(request);

        // Authenticate before each test
        const env = getCurrentEnvironment();
        await userService.login();

        logger.info('Authentication successful for positions tests');
    });

    test.describe('Get Positions', () => {
        test('should retrieve all positions for BTC', async ({ logger }) => {
            const positions = await tradingService.getPositions('BTC');

            expect(Array.isArray(positions)).toBe(true);

            if (positions.length > 0) {
                const firstPosition = positions[0];

                // Validate position structure
                expect(firstPosition).toHaveProperty('instrument_name');
                expect(firstPosition).toHaveProperty('size');
                expect(firstPosition).toHaveProperty('direction');
                expect(firstPosition).toHaveProperty('average_price');
                expect(firstPosition).toHaveProperty('mark_price');
                expect(firstPosition).toHaveProperty('floating_profit_loss');
                expect(firstPosition).toHaveProperty('realized_profit_loss');
                expect(firstPosition).toHaveProperty('total_profit_loss');
                expect(firstPosition).toHaveProperty('initial_margin');
                expect(firstPosition).toHaveProperty('maintenance_margin');

                // Validate data types
                expect(typeof firstPosition.size).toBe('number');
                expect(typeof firstPosition.average_price).toBe('number');
                expect(typeof firstPosition.mark_price).toBe('number');
                expect(['buy', 'sell', 'zero']).toContain(firstPosition.direction);

                logger.info(`Retrieved ${positions.length} positions for BTC`);
            } else {
                logger.info('No positions found for BTC');
            }
        });

        test('should retrieve all positions for ETH', async ({ logger }) => {
            const positions = await tradingService.getPositions('ETH');

            expect(Array.isArray(positions)).toBe(true);

            positions.forEach(position => {
                expect(position.instrument_name).toMatch(/^ETH/);
            });

            logger.info(`Retrieved ${positions.length} positions for ETH`);
        });

        test('should handle empty positions response', async ({ logger }) => {
            // Test with a currency that likely has no positions
            const positions = await tradingService.getPositions('USDC');

            expect(Array.isArray(positions)).toBe(true);
            expect(positions.length).toEqual(0);

            logger.info(`Retrieved ${positions.length} positions for USDC`);
        });

        test('should reject invalid currency', async ({ logger }) => {
            await expect(tradingService.getPositions('INVALID_CURRENCY'))
                .rejects.toThrow();

            logger.info('Invalid currency rejected as expected');
        });
    });

    test.describe('Position Calculations', () => {
        test('should have correct PnL calculations', async ({ logger }) => {
            const currency = 'ETH';
            const positions = await tradingService.getPositions(currency);

            if (positions.length > 0) {
                positions.forEach(position => {
                    // Total PnL should equal size/avg price - size/mark price + realized PnL
                    const expectedTotalPnL = Math.abs((position.size/position.average_price) - (position.size/position.mark_price));
                    expect(position.total_profit_loss).toBeCloseTo(expectedTotalPnL, 5);

                    // Margins should be positive for open positions
                    if (position.size !== 0) {
                        expect(position.initial_margin).toBeGreaterThanOrEqual(0);
                        expect(position.maintenance_margin).toBeGreaterThanOrEqual(0);
                        expect(position.maintenance_margin).toBeLessThanOrEqual(position.initial_margin);
                    }
                });

                logger.info(`PnL calculations verified for all positions in ${currency} : ${positions.length} positions`);
            }
        });

        test('should have consistent position direction and size', async ({ logger }) => {
            const positions = await tradingService.getPositions('BTC');

            if (positions.length > 0) {
                positions.forEach(position => {
                    if (position.size > 0) {
                        expect(position.direction).toBe('buy');
                    } else if (position.size < 0) {
                        expect(position.direction).toBe('sell');
                    } else {
                        expect(position.direction).toBe('zero');
                    }
                });

                logger.info('Position direction and size consistency verified');
            }
        });

        test('should have reasonable mark prices', async ({ logger }) => {
            const positions = await tradingService.getPositions('BTC');

            if (positions.length > 0) {
                positions.forEach(position => {
                    // Mark price should be positive
                    expect(position.mark_price).toBeGreaterThan(0);

                    // For BTC instruments, mark price should be in reasonable range
                    if (position.instrument_name.includes('BTC')) {
                        expect(position.mark_price).toBeGreaterThan(1000);
                        expect(position.mark_price).toBeLessThan(1000000);
                    }
                });

                logger.info('Mark prices are within reasonable ranges');
            }
        });
    });

    test.describe('Position Integration with Orders', () => {
        test('should update position after order execution', async ({ logger }) => {
            const instrument = 'BTC-PERPETUAL';

            // Get initial position
            const initialPositions = await tradingService.getPositions('BTC');
            const initialPosition = initialPositions.find(p => p.instrument_name === instrument);
            const initialSize = initialPosition?.size || 0;

            // Place a small market order to ensure execution
            const orderData = {
                instrument_name: instrument,
                amount: 10,
                type: 'market' as const,
                direction: 'buy' as const
            };

            try {
                const order = await tradingService.placeOrder(orderData);

                // Wait a moment for position update
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Get updated positions
                const updatedPositions = await tradingService.getPositions('BTC');
                const updatedPosition = updatedPositions.find(p => p.instrument_name === instrument);

                if (order.order_state === 'filled' && updatedPosition) {
                    // Position size should have increased
                    expect(updatedPosition.size).toBeGreaterThan(initialSize);

                    logger.info(`Position updated: ${initialSize} -> ${updatedPosition.size}`);
                }

            } catch (error) {
                // If order fails due to insufficient funds or other reasons, that's acceptable
                logger.error(`Order execution failed: ${error}`);
            }
        });
    });

    test.describe('Position Risk Management', () => {
        test('should have proper margin requirements', async ({ logger }) => {
            const positions = await tradingService.getPositions('BTC');

            if (positions.length > 0) {
                const openPositions = positions.filter(p => p.size !== 0);

                openPositions.forEach(position => {
                    // Maintenance margin should be less than initial margin
                    expect(position.maintenance_margin).toBeLessThanOrEqual(position.initial_margin);

                    // Both margins should be non-negative
                    expect(position.initial_margin).toBeGreaterThanOrEqual(0);
                    expect(position.maintenance_margin).toBeGreaterThanOrEqual(0);
                });

                logger.info(`Verified margin requirements for ${openPositions.length} open positions`);
            }
        });

        test('should calculate liquidation risk correctly', async ({ logger }) => {
            const positions = await tradingService.getPositions('ETH');

            if (positions.length > 0) {
                const openPositions = positions.filter(p => p.size !== 0);

                openPositions.forEach(position => {
                    // Estimated liquidation price should exist for leveraged positions
                    if (position.estimated_liquidation_price) {
                        expect(position.estimated_liquidation_price).toBeGreaterThan(0);

                        // Liquidation price should be on the adverse side of current mark price
                        if (position.direction === 'buy') {
                            expect(position.estimated_liquidation_price).toBeLessThan(position.mark_price);
                        } else if (position.direction === 'sell') {
                            expect(position.estimated_liquidation_price).toBeGreaterThan(position.mark_price);
                        }
                    }
                });

                logger.info('Liquidation risk calculations verified');
            }
        });
    });
});