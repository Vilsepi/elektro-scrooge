import { AggregatedSpotPricesResponse } from '../datasource/datasourceTypes';
import { getPriceWithFeesAndTaxes } from '../pricing';

export const FIFTEEN_MINUTE_SEGMENTS_IN_DAY: number = 24 * 4; // 96

export const MESSAGE_PRICES_NOT_YET_AVAILABLE = "Huomisen hinnat eivät ole vielä saatavilla";

// Used kWh per euro (100 eurocents) per one use
const sauna_cost_multiplier = 10/100;
const white_appliance_cost_multiplier = 1.25/100;

/**
 * Determines whether we have complete price data for a day.
 * Prices for the next day are published around 14:00-15:00 and before that we may receive partial data.
 */
export const hasCompletePriceData = (prices: AggregatedSpotPricesResponse): boolean => {
  return prices.prices.length === FIFTEEN_MINUTE_SEGMENTS_IN_DAY;
};

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

/**
 * Generates the message caption based on today's and tomorrow's price data.
 * Returns a fallback message if tomorrow's data is incomplete.
 */
export const generateMessage = (
  pricesToday: AggregatedSpotPricesResponse,
  pricesTomorrow: AggregatedSpotPricesResponse
): string => {
  if (hasCompletePriceData(pricesTomorrow)) {
    return renderCaption(pricesToday, pricesTomorrow);
  }
  return MESSAGE_PRICES_NOT_YET_AVAILABLE;
};
