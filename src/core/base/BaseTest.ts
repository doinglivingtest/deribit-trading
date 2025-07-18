import { test as baseTest } from '@playwright/test';
import { Logger } from '@core/utils/Logger';

export interface TestFixtures {
    logger: Logger;
    testName: string;
}

export const test = baseTest.extend<TestFixtures>({
    logger: async ({}, use, testInfo) => {
        const logger = new Logger(testInfo.title);
        await use(logger);
    },

    testName: async ({}, use, testInfo) => {
        await use(testInfo.title);
    }
});

export { expect } from '@playwright/test';