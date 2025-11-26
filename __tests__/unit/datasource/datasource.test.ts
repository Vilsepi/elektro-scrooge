import nock from 'nock';
import { SourceClient } from '../../../src/datasource/datasource';

afterEach( () => {
  nock.cleanAll();
});

const baseURL = 'https://www.vattenfall.fi';
import expected_aggregated_response from './responses/15min_aggregate_prices.json';

describe('getAggregatedSpotPrices', () => {
  const client = new SourceClient();

  test('should return aggregated spot prices with 15-minute resolution', async () => {
    nock(baseURL)
      .get('/fi-order-prd/api/nordpool/aggregated-spot-prices')
      .query({
        deliveryStart: 1764028800,
        deliveryEnd: 1764115200,
        resolution: '15mins',
        deliveryAreas: 'FI',
        currency: 'EUR',
        timezone: 'EET'
      })
      .reply(200, expected_aggregated_response);

    const response = await client.getAggregatedSpotPrices(1764028800, 1764115200);

    expect(response).toEqual(expected_aggregated_response);
    expect(response).toHaveProperty('averagePrice');
    expect(response).toHaveProperty('currency', 'EUR');
    expect(response).toHaveProperty('maxPrice');
    expect(response).toHaveProperty('minPrice');
    expect(response).toHaveProperty('prices');
    expect(response).toHaveProperty('resolution', '15mins');
    expect(response).toHaveProperty('timezone', 'EET');
    expect(response).toHaveProperty('unit', 'EURO_CENT/KWH');

    expect(Array.isArray(response.prices)).toBe(true);
    expect(response.prices.length).toBe(96); // 24 hours * 4 quarters

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
