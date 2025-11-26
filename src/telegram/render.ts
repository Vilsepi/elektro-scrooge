import { TimeSegment } from '../datasource/datasourceTypes';

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
export const renderCaption = (today: TimeSegment, tomorrow: TimeSegment): string => {
  const baseMessage =
    `Sähkön hinta on huomenna ~${+Number(tomorrow.priceAverage).toFixed(0)}c/kWh, ` +
    `joka on ${getDifferenceBetweenDays(today.priceAverage, tomorrow.priceAverage)} kuin tänään.` +
    '\n\n' +
    `Saunominen maksaa ${+Number(tomorrow.priceHighest*sauna_cost_multiplier).toFixed(1)}€ ja ` +
    `muut kodinkoneet ${+Number(tomorrow.priceHighest*white_appliance_cost_multiplier).toFixed(1)}€ per kerta.\n\n`;
  return baseMessage;
}
