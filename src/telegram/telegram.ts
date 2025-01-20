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

  // Send a message with optional HTML formatting to chat ID set by env var.
  public sendMessage = async (text: string): Promise<TelegramResponse> => {
    return (await this.client.post<TelegramResponse>(`/bot${this.authToken}/sendMessage`, {
      chat_id: this.chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })).data;
  }

  // Send an image with a caption text
  public sendImage = async (imagePath: string, caption: string): Promise<TelegramResponse> => {
    const formData = new FormData();
    formData.append('chat_id', this.chatId);
    formData.append('caption', caption);
    formData.append('photo', fs.createReadStream(imagePath));

    return (await this.client.post<TelegramResponse>(`/bot${this.authToken}/sendPhoto`, formData, {
      headers: {
          ...formData.getHeaders(),
      },
    })).data;
  }

}
