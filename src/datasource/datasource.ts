import axios, { AxiosInstance } from 'axios';
import { SpotPrice } from './datasourceTypes';

export class SourceClient {
  private readonly client: AxiosInstance;

  public constructor () {
    this.client = axios.create({
      baseURL: 'https://www.vattenfall.fi',
      timeout: 10000
    });
  }

  public getSpotPrices = async (start_date: string, end_date: string) : Promise<[SpotPrice]> => {
    return (await this.client.get<[SpotPrice]>(`/api/price/spot/${start_date}/${end_date}?lang=fi`)).data;
  }

}
