import { SourceClient } from './datasource/datasource';
import { getTodayTomorrowBoundaries } from './timestamps';
/*import { TimeSegment } from './datasource/datasourceTypes';
import { renderCaption, renderGraph } from './telegram/render';
import { TelegramClient } from './telegram/telegram';
*/

const FIFTEEN_MINUTE_SEGMENTS_IN_DAY: number = 24 * 4; // 96

export const mainApp = async (dryrun: boolean): Promise<void> => {
  const sourceClient: SourceClient = new SourceClient();
  //const telegramClient: TelegramClient = new TelegramClient();

  const { today, tomorrow } = getTodayTomorrowBoundaries();

  console.log(`Fetching prices for today from ${today.beginning} to ${today.end}`);
  console.log(`Fetching prices for tomorrow from ${tomorrow.beginning} to ${tomorrow.end}`);

  const pricesToday = await sourceClient.getAggregatedSpotPrices(today.beginning, today.end);
  const pricesTomorrow = await sourceClient.getAggregatedSpotPrices(tomorrow.beginning, tomorrow.end);

  if (pricesToday.prices.length == FIFTEEN_MINUTE_SEGMENTS_IN_DAY && pricesTomorrow.prices.length == FIFTEEN_MINUTE_SEGMENTS_IN_DAY) {

    //const graphImagePath = await renderGraph(pricesToday, pricesTomorrow);
    /*const message = renderCaption(todaysDaytimePrices, tomorrowsDaytimePrices);
    */
    if (!dryrun) {
      console.log("Sending message to Telegram");
      //await telegramClient.sendImage(graphImagePath, message);

    }
    else {
      console.log("Dryrun, not sending a message to Telegram");
      console.log(`Prices today: ${JSON.stringify(pricesToday)}`);
      console.log(`Prices tomorrow: ${JSON.stringify(pricesTomorrow)}`);
      //console.log(message);
    }
  }
  else {
    console.error(`Error: Unexpected size of price arrays`);
    console.log(JSON.stringify(pricesToday), JSON.stringify(pricesTomorrow));
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
