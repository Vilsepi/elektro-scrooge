import { SourceClient } from '../../src/datasource/datasource';

describe('Data source', () => {
  const client = new SourceClient();

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

  test('should have summary values that match the prices array', async () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliveryStart = Math.floor(now.getTime() / 1000);
    const deliveryEnd = Math.floor(tomorrow.getTime() / 1000);

    const response = await client.getAggregatedSpotPrices(deliveryStart, deliveryEnd);
    const priceValues = response.prices.map(price => price.measurement.value);

    const actualMinPrice = Math.min(...priceValues);
    const actualMaxPrice = Math.max(...priceValues);
    const actualAveragePrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;

    // Verify that summary values match the calculated values
    expect(response.minPrice).toBeCloseTo(actualMinPrice, 3);
    expect(response.maxPrice).toBeCloseTo(actualMaxPrice, 3);
    expect(response.averagePrice).toBeCloseTo(actualAveragePrice, 2);
  });

});
