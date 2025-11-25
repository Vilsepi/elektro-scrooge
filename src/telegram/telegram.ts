import axios, { AxiosInstance } from 'axios';
import { TelegramResponse } from './telegramTypes';
import FormData from 'form-data';
import * as fs from 'fs';

export class TelegramClient {
  private readonly client: AxiosInstance;
  private readonly authToken: string;
  private readonly chatId: string;

  public constructor () {
    this.authToken = process.env.TELEGRAM_BOT_AUTH_TOKEN as string;
    this.chatId = process.env.TELEGRAM_CHAT_ID as string;
    this.client = axios.create({
      baseURL: 'https://api.telegram.org',
      timeout: 10000
    });
  }

  // Send an image with an optional caption text
  public sendImage = async (imagePath: string, caption?: string): Promise<TelegramResponse> => {
    const formData = new FormData();
    formData.append('chat_id', this.chatId);
    if (caption !== undefined) {
      formData.append('caption', caption);
    }
    formData.append('photo', fs.createReadStream(imagePath));

    return (await this.client.post<TelegramResponse>(`/bot${this.authToken}/sendPhoto`, formData, {
      headers: {
          ...formData.getHeaders(),
      },
    })).data;
  }

}
