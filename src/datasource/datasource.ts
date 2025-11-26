import axios, { AxiosInstance } from 'axios';
import { AggregatedSpotPricesResponse } from './datasourceTypes';

export class SourceClient {
  private readonly client: AxiosInstance;

  public constructor () {
    this.client = axios.create({
      baseURL: 'https://www.vattenfall.fi',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
      }
    });
  }

  /**
   * Fetches aggregated electricity spot prices
   * @param deliveryStart - Start time of time range as UNIX timestamp in seconds e.g. "1764115200". Timezone is dictated by the "timezone" field
   * @param deliveryEnd - End time of time range as UNIX timestamp in seconds e.g. "1764201600". Timezone is dictated by the "timezone" field. NOTE: This should be 00:00:00 of the next day, and not 23:59:59 of the same day.
   * @param resolution - Price resolution, e.g. '15mins' or '60mins' (default: '15mins')
   * @param deliveryAreas - Comma-separated delivery area codes (default: 'FI')
   * @param currency - Currency code for prices (default: 'EUR')
   * @param timezone - Timezone for timestamps (default: 'EET')
   * @returns Aggregated spot prices response containing price data and metadata
   *
   * NOTE: Contrary to what you might expect, regardless of deliveryStart and deliveryEnd, the API seems to return prices for the whole day.
   * The API easily throws HTTP 500 error if the start and end times are not aligned as full resolution segments.
   */
  public getAggregatedSpotPrices = async (deliveryStart: number, deliveryEnd: number, resolution: string = '15mins', deliveryAreas: string = 'FI', currency: string = 'EUR', timezone: string = 'EET') : Promise<AggregatedSpotPricesResponse> => {
    return (await this.client.get<AggregatedSpotPricesResponse>('/fi-order-prd/api/nordpool/aggregated-spot-prices', {
      params: {
        deliveryStart,
        deliveryEnd,
        resolution,
        deliveryAreas,
        currency,
        timezone
      }
    })).data;
  }

}
