export const TIMEOUTS = {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    EXTRA_LONG: 60000
} as const;

export const SELECTORS = {
    COMMON: {
        LOADING: '[data-testid="loading"]',
        ERROR_MESSAGE: 'errorMsg',
        SUCCESS_MESSAGE: '[data-testid="success-message"]'
    },
    TRADING: {
        ORDER_BOOK: 'orderBookTitle',
        PLACE_ORDER_BUTTON: '[data-testid="place-order-btn"]',
        ORDER_FORM: '[data-testid="order-form"]',
        PRICE_INPUT: 'priceInput',
        AMOUNT_INPUT: 'amountInput',
        ORDER_TYPE_SELECT: '[data-testid="order-type-select"]',
        LIMIT_ORDER_BUTTON_MENU: 'limitBtn',
        CREATE_ORDER_BUTTON_MODAL: 'createOrderButton',
        NOTIFICATION_TOAST: 'notification',
        OPEN_ORDERS_TITLE_DASHBOARD: 'openOrdersTitle',
        CANCEL_ORDER_BUTTON_DASHBOARD: 'cancelOrderBtn'
    },
    LOGIN: {
        EMAIL_INPUT: '#email',
        PASSWORD_INPUT: '#password',
        TWO_FA_CODE_INPUT: '#tfaCode',
        LOGIN_BUTTON: '//button[@type=\'submit\']',
    },
    DASHBOARD: {
        USERNAME: 'username',
        TOTAL_ACCOUNT_VALUE: 'totalAccountValue',
        MY_ACCOUNT: 'myAccountBtn',
        LOGOUT_BUTTON: 'accountMenuLogOut',
        SPOT_HEADER_MENU: 'navigationItem-spot',
        FUTURES_HEADER_MENU: 'navigationItem-futures',
        OPTIONS_HEADER_MENU: 'navigationItem-options',
    }
} as const;

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/public/auth',
        LOGOUT: '/private/logout'
    },
    TRADING: {
        GET_INSTRUMENTS: '/public/get_instruments',
        GET_ORDER_BOOK: '/public/get_order_book',
        PLACE_ORDER_BUY: '/private/buy',
        PLACE_ORDER_SELL: '/private/sell',
        MODIFY_ORDER: '/private/edit',
        CANCEL_ORDER: '/private/cancel',
        GET_POSITIONS: '/private/get_positions',
        GET_ORDER_HISTORY_BY_INSTRUMENT: '/private/get_order_history_by_instrument'
    },
    MARKET: {
        GET_MARK_PRICE_HISTORY: '/public/get_mark_price_history',
        GET_INDEX_PRICE: '/public/get_index',
        GET_TICKER: '/public/ticker',
        GET_LAST_TRADES_BY_INSTRUMENT: '/public/get_last_trades_by_instrument'
    },
    USER: {
        GET_ACCOUNT_SUMMARY: '/private/get_account_summary',
        GET_PORTFOLIO: '/private/get_portfolio'
    }
} as const;

export const COPY = {
    AUTH: {
        WRONG_CREDENTIALS: 'Wrong username, password, 2FA or the account has not been activated yet.',
    }
} as const;