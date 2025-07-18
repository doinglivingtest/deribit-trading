import {APIRequestContext} from '@playwright/test';
import {BaseAPI} from '@core/base/BaseAPI';
import {API_ENDPOINTS} from '@config/constants';
import {
    Instrument,
    InstrumentsResponseSchema,
    Order,
    OrderBook,
    OrderBookSchema,
    OrderSchema,
    Position,
    PositionsResponseSchema
} from '@api/schemas/trading-schemas';

export class TradingService extends BaseAPI {
    constructor(request: APIRequestContext) {
        super(request);
    }

    async getInstruments(currency: string = 'BTC'): Promise<Instrument[]> {
        const response = await this.get(API_ENDPOINTS.TRADING.GET_INSTRUMENTS, {
            params: { currency },
            requireAuth: false // Public endpoint
        });
        const data = await this.validateResponse(response);

        const parsed = InstrumentsResponseSchema.parse(data);
        return parsed.result;
    }

    async getOrderBook(instrumentName: string, depth: number = 5): Promise<OrderBook> {
        const response = await this.get(API_ENDPOINTS.TRADING.GET_ORDER_BOOK, {
            params: {
                instrument_name: instrumentName,
                depth
            },
            requireAuth: false // Public endpoint
        });
        const data = await this.validateResponse(response);

        const parsed = OrderBookSchema.parse(data.result);
        return parsed;
    }

    async placeOrder(orderData: {
        instrument_name: string;
        amount: number;
        price?: number;
        type: 'limit' | 'market';
        direction: 'buy' | 'sell';
        time_in_force?: string;
        label?: string;
    }): Promise<Order> {
        const endpoint = orderData.direction === 'buy' ? API_ENDPOINTS.TRADING.PLACE_ORDER_BUY : API_ENDPOINTS.TRADING.PLACE_ORDER_SELL;
        const response = await this.get(endpoint, {
            params: {
                amount: orderData.amount,
                instrument_name: orderData.instrument_name,
                type: orderData.type,
                price: orderData.price,
            },
            requireAuth: true,
        }); // Auto-authenticated via BaseAPI
        const data = await this.validateResponse(response);

        return OrderSchema.parse(data.result.order);
    }

    async cancelOrder(orderId: string): Promise<Order> {
        const response = await this.get(API_ENDPOINTS.TRADING.CANCEL_ORDER, {
            params: {
                order_id: orderId
            },
            requireAuth: true,
        }); // Auto-authenticated via BaseAPI
        const data = await this.validateResponse(response);

        const parsed = OrderSchema.parse(data.result);
        return parsed;
    }

    async getPositions(currency: string = 'BTC'): Promise<Position[]> {
        const response = await this.get(API_ENDPOINTS.TRADING.GET_POSITIONS, {
            params: { currency },
            requireAuth: true,
        });
        const data = await this.validateResponse(response);

        const parsed = PositionsResponseSchema.parse(data);
        return parsed.result;
    }

    async getOrderHistory(instrumentName?: string, count: number = 20): Promise<Order[]> {
        const response = await this.get(API_ENDPOINTS.TRADING.GET_ORDER_HISTORY_BY_INSTRUMENT, {
            params: {
                count: count,
                instrument_name: instrumentName,
                historical: true
            },
            requireAuth: true,
        });
        const data = await this.validateResponse(response);

        return data.result.map((order: any) => OrderSchema.parse(order));
    }

    async modifyOrder(orderId: string, amount: number, price: number): Promise<Order> {
        const response = await this.get(API_ENDPOINTS.TRADING.MODIFY_ORDER, {
            params: {
                amount: amount,
                order_id: orderId,
                price: price
            },
            requireAuth: true,
        });
        const data = await this.validateResponse(response);

        return OrderSchema.parse(data.result.order);
    }

    async getOpenOrders(instrumentName?: string): Promise<Order[]> {
        const params: any = {};
        if (instrumentName) {
            params.instrument_name = instrumentName;
        }

        const response = await this.get('/private/get_open_orders', {
            params
            // Auto-authenticated via BaseAPI
        });
        const data = await this.validateResponse(response);

        return data.result.map((order: any) => OrderSchema.parse(order));
    }

    async getTradeHistory(instrumentName?: string, count: number = 20): Promise<any[]> {
        const params: any = { count };
        if (instrumentName) {
            params.instrument_name = instrumentName;
        }

        const response = await this.get('/private/get_user_trades_by_instrument', {
            params
            // Auto-authenticated via BaseAPI
        });
        const data = await this.validateResponse(response);

        return data.result.trades || [];
    }
}