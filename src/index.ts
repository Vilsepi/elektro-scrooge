import { SourceClient } from './datasource/datasource';
import { renderMessage } from './telegram/render';
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
  const hourlySpotPrices = await sourceClient.getSpotPrices(startDate, endDate);

  if (hourlySpotPrices.length == 48) {
    const segmentedHourlySpotPrices = [
      hourlySpotPrices.slice(0, 7),
      hourlySpotPrices.slice(7, 24),
      hourlySpotPrices.slice(24, 31),
      hourlySpotPrices.slice(31)
    ];

    const priceDataForTimeSegments = []
    for (const segment of segmentedHourlySpotPrices) {
      priceDataForTimeSegments.push({
        date: segment[0].timeStampDay,
        hours: `${segment[0].timeStampHour}-${segment[segment.length - 1].timeStampHour}`,
        hourlyPrices: segment.map(hour => hour.value),
        priceLowest: Math.min(...segment.map(hour => hour.value)),
        priceHighest: Math.max(...segment.map(hour => hour.value)),
        priceAverage: segment.reduce((total, next) => total + next.value, 0) / segment.length
      })
    }

    if (!dryrun) {
      await telegramClient.sendMessage(renderMessage(priceDataForTimeSegments));
    }
    else {
      console.log("Dryrun, not sending a message to Telegram");
      console.log(priceDataForTimeSegments);
    }
  }
  else {
    console.error("Error: Unexpected size of input array");
    console.log(hourlySpotPrices);
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
