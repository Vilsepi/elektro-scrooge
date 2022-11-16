import { SourceClient } from './datasource/datasource';
import { SpotPrice, TimeSegment } from './datasource/datasourceTypes';
import { renderMessage } from './telegram/render';
import { TelegramClient } from './telegram/telegram';

const ELECTRICITY_COMPANY_MARGIN = 1.25;
const ELECTRICITY_TAX_MULTIPLIER = 1.24;
const GRID_SERVICE_FEE = 3.25;
const GRID_SERVICE_TAX_FOR_HOUSEHOLDS = 2.79372;

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

    const interestingSlices = [
      hourlySpotPrices.slice(24, 31),
      hourlySpotPrices.slice(31, 40),
      hourlySpotPrices.slice(41, 44),
      hourlySpotPrices.slice(44, 48),
    ];

    const todaysDaytimePrices: TimeSegment = getSegment(hourlySpotPrices.slice(7, 24));
    const tomorrowsDaytimePrices: TimeSegment = getSegment(hourlySpotPrices.slice(31));
    const tomorrowsDetailedPrices: TimeSegment[] = interestingSlices.map(slice => getSegment(slice));

    const message = renderMessage(todaysDaytimePrices, tomorrowsDaytimePrices, tomorrowsDetailedPrices);
    if (!dryrun) {
      await telegramClient.sendMessage(message);
    }
    else {
      console.log("Dryrun, not sending a message to Telegram");
      console.log(tomorrowsDaytimePrices);
      console.log(message);
    }
  }
  else {
    console.error(`Error: Unexpected size of input array (${hourlySpotPrices.length})`);
    console.log(hourlySpotPrices);
  }
};

export const getSimpleHour = (timeStampHour: string): string => {
  return timeStampHour.split(':')[0];
}

export const getSegment = (segment: SpotPrice[]): TimeSegment => {
  return {
    date: segment[0].timeStampDay,
    hours: `${getSimpleHour(segment[0].timeStampHour)}-${getSimpleHour(segment[segment.length - 1].timeStampHour)}`,
    hourlyOriginalSpotPrices: segment.map(hour => hour.value),
    hourlyPrices: segment.map(hour => getPriceWithFeesAndTaxes(hour.value)),
    priceLowest: getPriceWithFeesAndTaxes(Math.min(...segment.map(hour => hour.value))),
    priceHighest: getPriceWithFeesAndTaxes(Math.max(...segment.map(hour => hour.value))),
    priceAverage: getPriceWithFeesAndTaxes(segment.reduce((total, next) => total + next.value, 0) / segment.length)
  }
}

export const getPriceWithFeesAndTaxes = (basePrice: number): number => {
  return (basePrice * ELECTRICITY_TAX_MULTIPLIER) + ELECTRICITY_COMPANY_MARGIN + GRID_SERVICE_FEE + GRID_SERVICE_TAX_FOR_HOUSEHOLDS;
}

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
