import { z } from 'zod';

export const UserSchema = z.object({
    user_id: z.string(),
    username: z.string(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string().optional(),
    country: z.string(),
    is_password_2fa_enabled: z.boolean(),
    system_name: z.string(),
    type: z.enum(['main', 'subaccount'])
});

export const AccountSummarySchema = z.object({
    delta_total_map: z.record(z.string(), z.number()),
    margin_balance: z.number(),
    futures_session_rpl: z.number(),
    options_session_rpl: z.number(),
    estimated_liquidation_ratio_map: z.record(z.string(), z.number()),
    session_upl: z.number(),
    email: z.string().optional(),
    system_name: z.string().optional(),
    username: z.string().optional(),
    interuser_transfers_enabled: z.boolean().optional(),
    id: z.number().optional(),
    estimated_liquidation_ratio: z.number(),
    options_gamma_map: z.record(z.string(), z.number()),
    options_vega: z.number(),
    options_value: z.number(),
    available_withdrawal_funds: z.number(),
    projected_delta_total: z.number(),
    maintenance_margin: z.number(),
    total_pl: z.number(),
    limits: z.object({
        limits_per_currency: z.boolean(),
        non_matching_engine: z.object({
            burst: z.number(),
            rate: z.number()
        }),
        matching_engine: z.object({
            trading: z.object({
                total: z.object({
                    burst: z.number(),
                    rate: z.number()
                })
            }),
            spot: z.object({
                burst: z.number(),
                rate: z.number()
            }),
            quotes: z.object({
                burst: z.number(),
                rate: z.number()
            }).optional(),
            max_quotes: z.object({
                burst: z.number(),
                rate: z.number()
            }).optional(),
            guaranteed_quotes: z.object({
                burst: z.number(),
                rate: z.number()
            }).optional(),
            cancel_all: z.object({
                burst: z.number(),
                rate: z.number()
            })
        })
    }),
    options_theta_map: z.record(z.string(), z.number()),
    projected_maintenance_margin: z.number(),
    available_funds: z.number(),
    login_enabled: z.boolean().optional(),
    options_delta: z.number(),
    balance: z.number(),
    security_keys_enabled: z.boolean().optional(),
    referrer_id: z.null().optional(),
    mmp_enabled: z.boolean().optional(),
    equity: z.number(),
    block_rfq_self_match_prevention: z.boolean().optional(),
    futures_session_upl: z.number(),
    fee_balance: z.number(),
    currency: z.string(),
    options_session_upl: z.number(),
    projected_initial_margin: z.number(),
    options_theta: z.number(),
    creation_timestamp: z.number().optional(),
    self_trading_extended_to_subaccounts: z.boolean().optional(),
    portfolio_margining_enabled: z.boolean(),
    cross_collateral_enabled: z.boolean(),
    margin_model: z.string(),
    options_vega_map: z.record(z.string(), z.number()),
    futures_pl: z.number(),
    options_pl: z.number(),
    type: z.string().optional(),
    self_trading_reject_mode: z.string().optional(),
    initial_margin: z.number(),
    spot_reserve: z.number(),
    delta_total: z.number(),
    options_gamma: z.number(),
    session_rpl: z.number(),
    fees: z.array(
        z.object({
            value: z.object({
                default: z.object({
                    type: z.string(),
                    taker: z.number(),
                    maker: z.number()
                }),
                block_trade: z.number()
            }),
            kind: z.string(),
            index_name: z.string()
        })
    ).optional()
});


export const PortfolioSchema = z.object({
    currency: z.string(),
    estimated_liquidation_ratio: z.number(),
    initial_margin: z.number(),
    maintenance_margin: z.number(),
    margin_balance: z.number(),
    total_pl: z.number(),
    session_rpl: z.number(),
    session_upl: z.number(),
    positions: z.array(z.object({
        instrument_name: z.string(),
        size: z.number(),
        direction: z.enum(['buy', 'sell', 'zero']),
        average_price: z.number(),
        mark_price: z.number(),
        floating_profit_loss: z.number(),
        realized_profit_loss: z.number(),
        total_profit_loss: z.number()
    }))
});

// Authentication schemas
export const AuthResponseSchema = z.object({
    jsonrpc: z.literal('2.0'),
    result: z.object({
        access_token: z.string(),
        expires_in: z.number(),
        refresh_token: z.string(),
        scope: z.string(),
        token_type: z.literal('bearer')
    }),
    id: z.union([z.string(), z.number()]).optional()
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type AccountSummary = z.infer<typeof AccountSummarySchema>;
export type Portfolio = z.infer<typeof PortfolioSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;