import nock from 'nock';
import { SourceClient } from '../../../src/datasource/datasource';

afterEach( () => {
  nock.cleanAll();
});

const baseURL = 'https://www.vattenfall.fi';
import expected_response from './responses/hourly_prices.json';

describe('getSpotPrices', () => {
  const client = new SourceClient();

  test('should return array of hourly spot prices', async () => {
    nock(baseURL)
      .get('/api/price/spot/2022-08-25/2022-08-26?lang=fi')
      .reply(200, JSON.stringify(expected_response));

    const response = await client.getSpotPrices("2022-08-25", "2022-08-26");
    expect(response).toEqual(Object.values(expected_response));

    for (const hourlyPrice of response) {
      expect(hourlyPrice).toHaveProperty('timeStampDay');
      expect(hourlyPrice).toHaveProperty('timeStampHour');
      expect(hourlyPrice).toHaveProperty('unit');
      expect(hourlyPrice).toHaveProperty('value');
    }
  });

});
