import { z } from 'zod';

// Order schemas
export const OrderSchema = z.object({
    order_id: z.string(),
    instrument_name: z.string(),
    direction: z.enum(['buy', 'sell']),
    amount: z.number().positive(),
    price: z.number().positive(),
    order_type: z.enum(['limit', 'market', 'stop_limit', 'stop_market']),
    order_state: z.enum(['open', 'filled', 'cancelled', 'rejected']),
    creation_timestamp: z.number(),
    last_update_timestamp: z.number(),
    filled_amount: z.number().min(0),
    average_price: z.number().optional(),
    commission: z.number().optional(),
    label: z.string().optional(),
    time_in_force: z.enum(['good_til_cancelled', 'good_til_day', 'fill_or_kill', 'immediate_or_cancel']).optional()
});

export const OrderBookSchema = z.object({
    timestamp: z.number(),
    instrument_name: z.string(),
    change_id: z.number(),
    bids: z.array(z.tuple([z.number(), z.number()])),
    asks: z.array(z.tuple([z.number(), z.number()])),
    mark_price: z.number(),
    index_price: z.number(),
    estimated_delivery_price: z.number().optional()
});

export const PositionSchema = z.object({
    average_price: z.number(),
    average_price_usd: z.number().optional(),
    delta: z.number(),
    direction: z.enum(['buy', 'sell', 'zero']),
    estimated_liquidation_price: z.number().nullable(),
    floating_profit_loss: z.number(),
    floating_profit_loss_usd: z.number().optional(),
    gamma: z.number().optional(),
    index_price: z.number(),
    initial_margin: z.number(),
    instrument_name: z.string(),
    interest_value: z.number().optional(),
    kind: z.string(),
    leverage: z.number().int(),
    maintenance_margin: z.number(),
    mark_price: z.number(),
    open_orders_margin: z.number(),
    realized_funding: z.number(),
    realized_profit_loss: z.number(),
    settlement_price: z.number().optional(),
    size: z.number(),
    size_currency: z.number().optional(),
    theta: z.number().optional(),
    total_profit_loss: z.number(),
    vega: z.number().optional(),
});

export const InstrumentSchema = z.object({
    instrument_name: z.string(),
    instrument_type: z.enum(['future', 'option', 'perpetual']),
    base_currency: z.string(),
    quote_currency: z.string(),
    settlement_currency: z.string(),
    contract_size: z.number(),
    min_trade_amount: z.number(),
    max_trade_amount: z.number(),
    tick_size: z.number(),
    creation_timestamp: z.number(),
    expiration_timestamp: z.number().optional(),
    is_active: z.boolean(),
    option_type: z.enum(['call', 'put']).optional(),
    strike: z.number().optional()
});

// Response schemas
export const ApiResponseSchema = z.object({
    jsonrpc: z.literal('2.0'),
    result: z.unknown(),
    error: z.object({
        code: z.number(),
        message: z.string(),
        data: z.unknown().optional()
    }).optional(),
    id: z.union([z.string(), z.number()]).optional()
});

export const OrderResponseSchema = ApiResponseSchema.extend({
    result: z.object({
        order: OrderSchema
    })
});

export const OrderBookResponseSchema = ApiResponseSchema.extend({
    result: OrderBookSchema
});

export const PositionsResponseSchema = ApiResponseSchema.extend({
    result: z.array(PositionSchema)
});

export const InstrumentsResponseSchema = ApiResponseSchema.extend({
    result: z.array(InstrumentSchema)
});

// Type exports
export type Order = z.infer<typeof OrderSchema>;
export type OrderBook = z.infer<typeof OrderBookSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Instrument = z.infer<typeof InstrumentSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
