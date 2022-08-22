import { SourceClient } from './datasource/datasource';
import { TelegramClient } from './telegram/telegram';

export const mainApp = async (dryrun: boolean): Promise<void> => {
  const sourceClient: SourceClient = new SourceClient();
  const telegramClient: TelegramClient = new TelegramClient();

  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDate = now.toISOString().substring(0,10);
  const endDate = tomorrow.toISOString().substring(0,10);

  console.log(`Fetching prices from ${startDate} to ${endDate}`);
  const prices = await sourceClient.getSpotPrices(startDate, endDate);

  if (prices.length == 48) {
    const slicedPrices = [
      prices.slice(0, 7),
      prices.slice(7, 24),
      prices.slice(24, 31),
      prices.slice(31)
    ];

    const timeSegments = []
    for (const slice of slicedPrices) {
      timeSegments.push({
        date: slice[0].timeStampDay,
        hours: `${slice[0].timeStampHour}-${slice[slice.length - 1].timeStampHour}`,
        prices: slice.map(hour => hour.value),
        priceLow: Math.min(...slice.map(hour => hour.value)),
        priceHigh: Math.max(...slice.map(hour => hour.value)),
        priveAverage: slice.reduce((total, next) => total + next.value, 0) / slice.length
      })
    }

    console.log(timeSegments);

    if (!dryrun) {
      await telegramClient.sendMessage("hei");
    }
    else {
      console.log("Dryrun, not sending a message to Telegram");
    }
  }
  else {
    console.error("Error: Unexpected size of input array");
    console.log(prices);
  }
};

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  console.log(JSON.stringify(event));
  const dryrunMessageSending = event.source == 'local-dryrun' ? true : false;
  await mainApp(dryrunMessageSending);
  return {
    statusCode: 200,
    body: "OK"
  };
};

if (require.main == module) {
  void handler({source: 'local-dryrun'});
}

export interface LambdaEvent {
  source: string
}

export interface LambdaResponse {
  statusCode: number,
  body: string
}
