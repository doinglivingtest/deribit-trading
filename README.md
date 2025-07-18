# Deribit Test Automation Framework

A comprehensive, enterprise-ready test automation framework for Deribit trading platform built with TypeScript, Playwright, and modern testing practices.

## 🚀 Features

- **🔄 Dual Testing Approach**: API and UI testing in one framework
- **🏗️ Clean Architecture**: SOLID principles with Page Object Model
- **📊 Schema Validation**: Robust API response validation using Zod
- **🔐 Authentication Management**: Centralized auth handling across all services
- **⚡ Parallel Execution**: Multi-browser and multi-worker support
- **📈 Comprehensive Reporting**: HTML, Allure, JUnit, and JSON reports
- **🔧 CI/CD Ready**: GitHub Actions integration with secrets management
- **🧪 Test Fixtures**: Reusable test setup and teardown
- **📝 TypeScript**: Full type safety and IntelliSense support
- **🎯 Trading Domain**: Specialized for cryptocurrency trading scenarios

## 📁 Project Structure

```
src/
├── config/                 # Environment and configuration
│   ├── environments.ts     # Environment-specific settings
│   ├── constants.ts        # Application constants
│   └── test-data.ts        # Static test data
├── core/                   # Core framework components
│   ├── base/               # Base classes
│   │   ├── BasePage.ts     # Page Object base class
│   │   ├── BaseAPI.ts      # API service base class
│   │   └── BaseTest.ts     # Test base class
│   └── utils/              # Utility classes
│       ├── TestLogger.ts   # Logging utility
│       ├── TestDataFactory.ts # Test data generation
│       └── Helpers.ts      # Common helper functions
├── pages/                  # Page Object Model
│   ├── LoginPage.ts        # Login page interactions
│   ├── TradingPage.ts      # Trading interface
│   └── DashboardPage.ts    # Dashboard operations
├── api/                    # API testing components
│   ├── services/           # API service classes
│   │   ├── TradingService.ts # Trading operations
│   │   ├── UserService.ts   # User management
│   │   └── MarketService.ts # Market data
│   └── schemas/            # Zod validation schemas
│       ├── trading-schemas.ts
│       └── user-schemas.ts
│
└── tests/                  # Test specifications
    ├── api/                # API tests
    │   ├── trading/
    │   └── user/
    ├── ui/                 # UI tests
    │   ├── trading/
    │   └── user/
    └── e2e/                # End-to-end tests
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Quick Setup

```bash
# Clone the repository
git clone <repository-url>
cd deribit-test-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Copy environment template
cp .env.example .env

# Configure your credentials in .env file
```

### Environment Configuration

1. **Get Deribit Test Credentials**:
   - Visit [Deribit Test Environment](https://test.deribit.com)
   - Create a test account
   - Generate API credentials

2. **Update `.env` file**:
   ```bash
   TEST_ENV=test
   BASE_URL=https://test.deribit.com
   TEST_USERNAME=your-test-email@example.com
   TEST_PASSWORD=your-test-password
   TEST_API_KEY=your-api-key
   TEST_API_SECRET=your-api-secret
   ```

## 🎯 Usage

### Running Tests

```bash
# Run all tests
npm test

# API tests only
npm run test:api

# UI tests (Chrome only)
npm run test:ui

# UI tests (all browsers)
npm run test:ui:all

# E2E tests
npm run test:e2e

# Run with headed browsers
npm run test:headed

# Debug mode
npm run test:debug

# Generate and view reports
npm run test:report
```

### Test Types

#### API Tests
```bash
# All API tests
npm run test:api

# Specific API test suites
npx playwright test tests/api/trading/
npx playwright test tests/api/user/
```

#### UI Tests
```bash
# Chrome only
npm run test:ui

# All browsers
npm run test:ui:all

# Mobile browsers
npm run test:ui:mobile

# Specific browser
npx playwright test --project=ui-firefox
```

#### E2E Tests
```bash
# End-to-end workflows
npm run test:e2e

# All E2E browsers
npm run test:e2e:all
```

## 📖 Writing Tests

### API Test Example

```typescript
import { apiTest, expect } from '@fixtures/api-fixtures';

apiTest.describe('Trading API', () => {
  apiTest('should place order', async ({ authenticatedTradingService, logger }) => {
    const order = await authenticatedTradingService.placeOrder({
      instrument_name: 'BTC-PERPETUAL',
      amount: 10,
      price: 50000,
      type: 'limit',
      direction: 'buy'
    });
    
    expect(order.instrument_name).toBe('BTC-PERPETUAL');
    expect(order.amount).toBe(10);
    logger.info(`Order placed: ${order.order_id}`);
  });
});
```

### UI Test Example

```typescript
import { uiTest, expect } from '@fixtures/ui-fixtures';

uiTest.describe('Trading UI', () => {
  uiTest('should place order via UI', async ({ 
    authenticatedSession, 
    tradingPage, 
    logger 
  }) => {
    await tradingPage.navigateToTrading();
    
    await tradingPage.placeOrder({
      instrument: 'BTC-PERPETUAL',
      orderType: 'limit',
      side: 'buy',
      amount: 10,
      price: 50000
    });
    
    const orders = await tradingPage.getOpenOrders();
    expect(orders.length).toBeGreaterThan(0);
    logger.info('Order placed successfully');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@fixtures/test-fixtures';

test.describe('E2E Trading Flow', () => {
  test('complete trading workflow', async ({ 
    authenticatedPage,
    authenticatedAPI,
    tradingPage,
    tradingService,
    logger 
  }) => {
    // UI Actions
    await tradingPage.navigateToTrading();
    await tradingPage.placeOrder({
      instrument: 'BTC-PERPETUAL',
      orderType: 'limit',
      side: 'buy',
      amount: 10,
      price: 45000
    });
    
    // API Verification
    const orders = await tradingService.getOrderHistory('BTC-PERPETUAL');
    expect(orders.length).toBeGreaterThan(0);
    
    logger.info('E2E workflow completed successfully');
  });
});
```

## 🔧 Configuration

### Environment Variables

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_ENV` | Environment (test/staging/prod) | `test` |
| `BASE_URL` | Application base URL | `https://test.deribit.com` |
| `TEST_USERNAME` | Test account email | - |
| `TEST_PASSWORD` | Test account password | - |
| `TEST_API_KEY` | API key for authentication | - |
| `TEST_API_SECRET` | API secret for authentication | - |
| `HEADLESS` | Run in headless mode | `true` |
| `WORKERS` | Number of parallel workers | `2` |
| `LOG_LEVEL` | Logging level (info/debug/error) | `info` |

## 📊 Reporting

### Available Reports

- **HTML Report**: Interactive test results
- **Allure Report**: Enterprise-grade reporting
- **JUnit XML**: CI/CD integration
- **JSON Report**: Programmatic processing

### Generating Reports

```bash
# View HTML report
npm run test:report

# Generate Allure report
npx allure generate reports/allure-results --clean
npx allure open
```

## 🔄 CI/CD Integration

### GitHub Actions

TODO:
The framework will includes a complete CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
name: Test Automation CI/CD
on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run API tests
        run: npm run test:api
```

### Required Secrets

Add these secrets to your GitHub repository:

- `TEST_USERNAME`
- `TEST_PASSWORD`
- `TEST_API_KEY`
- `TEST_API_SECRET`

## 🧪 Test Data Management

### Static Test Data

```typescript
// src/config/test-data.ts
export const TEST_DATA = {
  INSTRUMENTS: {
    BTC_PERPETUAL: 'BTC-PERPETUAL',
    ETH_PERPETUAL: 'ETH-PERPETUAL'
  },
  CURRENCIES: ['BTC', 'ETH', 'USD'],
  ORDER_TYPES: ['limit', 'market']
};
```

### Dynamic Test Data

```typescript
// Using TestDataFactory
import { TestDataFactory } from '@core/utils/TestDataFactory';

const orderData = TestDataFactory.generateOrderData();
const userData = TestDataFactory.generateUserData();
```

## 🛡️ Best Practices

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Clean Code**: SOLID principles

### Testing Practices

- **Page Object Model**: Maintainable UI tests
- **API First**: API tests for business logic
- **E2E Validation**: Critical user journeys
- **Test Isolation**: Independent test execution


## 📚 Additional Resources

### Deribit API Documentation
- [Deribit API Docs](https://docs.deribit.com/)
- [Trading API Guide](https://docs.deribit.com/v2/#trading)


**Happy Testing!** 🎯
