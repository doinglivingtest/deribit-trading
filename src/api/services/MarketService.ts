import { APIRequestContext } from '@playwright/test';
import { BaseAPI } from '@core/base/BaseAPI';
import {API_ENDPOINTS} from "@config/constants";

export interface MarketData {
    timestamp: number;
    instrument_name: string;
    last_price: number;
    mark_price: number;
    index_price: number;
    best_bid_price: number;
    best_ask_price: number;
    best_bid_amount: number;
    best_ask_amount: number;
    volume: number;
    open_interest: number;
    price_change: number;
    price_change_percent: number;
    high: number;
    low: number;
}

export class MarketService extends BaseAPI {
    constructor(request: APIRequestContext) {
        super(request);
    }

    async getTicker(instrumentName: string): Promise<MarketData> {
        const response = await this.get(API_ENDPOINTS.MARKET.GET_TICKER, {
            params: {
                instrument_name: instrumentName,
            },
            requireAuth: false,
        });
        const data = await this.validateResponse(response);

        return data.result;
    }

    async getIndexPrice(index_name: string): Promise<{ index_price: number; estimated_delivery_price: number }> {
        const response = await this.get(API_ENDPOINTS.MARKET.GET_INDEX_PRICE, {
            params: {
                index_name: index_name,
            },
            requireAuth: false,
        });
        const data = await this.validateResponse(response);

        return data.result;
    }



    async getMarkPriceHistory(instrumentName: string, startTimestamp: number, endTimestamp: number): Promise<any[]> {
        const response = await this.get(API_ENDPOINTS.MARKET.GET_MARK_PRICE_HISTORY, {
            params: {
                instrument_name: instrumentName,
                start_timestamp: startTimestamp,
                end_timestamp: endTimestamp
            },
            requireAuth: false,
        });
        const data = await this.validateResponse(response);

        return data.result;
    }

    async getTradeHistory(instrumentName: string, count: number = 100): Promise<any[]> {
        const response = await this.get(API_ENDPOINTS.MARKET.GET_LAST_TRADES_BY_INSTRUMENT, {
            params: {
                instrument_name: instrumentName,
                count: count,
            },
            requireAuth: false,
        });
        const data = await this.validateResponse(response);

        return data.result.trades;
    }

}