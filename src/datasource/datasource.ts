import axios, { AxiosInstance } from 'axios';
import { SpotPrice } from './datasourceTypes';

export class SourceClient {
  private readonly client: AxiosInstance;

  public constructor () {
    this.client = axios.create({
      baseURL: 'https://www.vattenfall.fi',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
  }

  public getSpotPrices = async (start_date: string, end_date: string) : Promise<SpotPrice[]> => {
    return (await this.client.get<SpotPrice[]>(`/api/price/spot/${start_date}/${end_date}?lang=fi`)).data;
  }

}
