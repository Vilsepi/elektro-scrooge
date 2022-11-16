import { TimeSegment } from "../datasource/datasourceTypes";

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

export const renderMessage = (today: TimeSegment, tomorrow: TimeSegment, detailedHours: TimeSegment[]): string => {
  const baseMessage =
    `Sähkön hinta on huomenna <b>~${+Number(tomorrow.priceAverage).toFixed(0)}c/kWh</b>, ` +
    `joka on <b>${getDifferenceBetweenDays(today.priceAverage, tomorrow.priceAverage)}</b> kuin tänään.` +
    '\n\n' +
    `Saunominen maksaa ${+Number(tomorrow.priceHighest*sauna_cost_multiplier).toFixed(1)}€/kerta, ` +
    `muut kodinkoneet ${+Number(tomorrow.priceHighest*white_appliance_cost_multiplier).toFixed(1)}€/kerta.\n\n`;

  let tableOfPrices = '';
  for (const segment of detailedHours) {
    tableOfPrices += `${segment.hours}: ${+Number(segment.priceLowest).toFixed(0)}-${+Number(segment.priceHighest).toFixed(0)}c/kWh\n`;
  }

    return baseMessage + tableOfPrices;
}
