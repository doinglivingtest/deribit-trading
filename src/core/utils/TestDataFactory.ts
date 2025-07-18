import { faker } from '@faker-js/faker';

export class TestDataFactory {
    static generateOrderData() {
        return {
            instrument: 'BTC-PERPETUAL',
            amount: faker.number.int({ min: 10, max: 100 }) * 10, // to avoid error "must be contract size" ,
            price: faker.number.float({ min: 30000, max: 70000, precision: 0.01 }),
            type: faker.helpers.arrayElement(['limit', 'market']),
            direction: faker.helpers.arrayElement(['buy', 'sell'])
        };
    }

    static generateUserData() {
        return {
            email: faker.internet.email(),
            password: faker.internet.password({ length: 12 }),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName()
        };
    }

    static generateInstrumentData() {
        return {
            currency: faker.helpers.arrayElement(['BTC', 'ETH', 'USD']),
            kind: faker.helpers.arrayElement(['future', 'option', 'perpetual']),
            expiration: faker.date.future()
        };
    }
}