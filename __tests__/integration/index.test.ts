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

  test('should return aggregated spot prices with 15-minute resolution', async () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliveryStart = Math.floor(now.getTime() / 1000);
    const deliveryEnd = Math.floor(tomorrow.getTime() / 1000);

    const response = await client.getAggregatedSpotPrices(deliveryStart, deliveryEnd);

    expect(response).toHaveProperty('averagePrice');
    expect(response).toHaveProperty('currency', 'EUR');
    expect(response).toHaveProperty('maxPrice');
    expect(response).toHaveProperty('minPrice');
    expect(response).toHaveProperty('prices');
    expect(response).toHaveProperty('resolution', '15mins');
    expect(response).toHaveProperty('timezone', 'EET');
    expect(response).toHaveProperty('unit', 'EURO_CENT/KWH');

    expect(Array.isArray(response.prices)).toBe(true);
    // 24 hours * 4 quarters = 96 prices for a full day
    expect(response.prices.length).toBe(96);

    for (const price of response.prices) {
      expect(price).toHaveProperty('day');
      expect(price).toHaveProperty('hour');
      expect(price).toHaveProperty('minute');
      expect(price).toHaveProperty('month');
      expect(price).toHaveProperty('year');
      expect(price).toHaveProperty('measurement');
      expect(price.measurement).toHaveProperty('unit');
      expect(price.measurement).toHaveProperty('value');
    }
  });

});
