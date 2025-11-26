import { AggregatedSpotPricesResponse } from '../datasource/datasourceTypes';
import { getPriceWithFeesAndTaxes } from '../pricing';

// Used kWh per euro (100 eurocents) per one use
const sauna_cost_multiplier = 10/100;
const white_appliance_cost_multiplier = 1.25/100;

export const getDifferenceBetweenDays = (priceToday: number, priceTomorrow: number): string => {
  const difference = (100 * (priceTomorrow - priceToday) / priceToday);
  if (difference > 0) {
    return `+${+Number(difference).toFixed(0)}% enemmän`;
  }
  return `${+Number(difference).toFixed(0)}% vähemmän`;
}

// Renders a simple summary of prices, meant for image caption
export const renderCaption = (today: AggregatedSpotPricesResponse, tomorrow: AggregatedSpotPricesResponse): string => {
  const todayAverage = getPriceWithFeesAndTaxes(today.averagePrice);
  const tomorrowAverage = getPriceWithFeesAndTaxes(tomorrow.averagePrice);
  const tomorrowHighest = getPriceWithFeesAndTaxes(tomorrow.maxPrice);

  const baseMessage =
    `Sähkön hinta on huomenna ~${+Number(tomorrowAverage).toFixed(0)}c/kWh, ` +
    `joka on ${getDifferenceBetweenDays(todayAverage, tomorrowAverage)} kuin tänään.` +
    '\n\n' +
    `Saunominen maksaa jopa ${+Number(tomorrowHighest*sauna_cost_multiplier).toFixed(1)}€ ja ` +
    `muut kodinkoneet ${+Number(tomorrowHighest*white_appliance_cost_multiplier).toFixed(1)}€ per kerta.\n\n`;
  return baseMessage;
}
