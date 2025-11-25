import { SourceClient } from '../../src/datasource/datasource';

describe('Data source', () => {
  const client = new SourceClient();

  test('should return array of hourly spot prices', async () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = now.toISOString().substring(0,10);
    const endDate = tomorrow.toISOString().substring(0,10);

    const prices = await client.getLegacySpotPrices(startDate, endDate);

    // Depending on time of day, there should be either only today's or today's and tomorrow's prices
    expect(prices.length).toBeGreaterThanOrEqual(24);

    for (const hourlyPrice of prices) {
        expect(hourlyPrice).toHaveProperty('timeStampDay');
        expect(hourlyPrice).toHaveProperty('timeStampHour');
        expect(hourlyPrice).toHaveProperty('unit');
        expect(hourlyPrice).toHaveProperty('value');
    }
  });

});
