import { TimeSegment } from "../datasource/datasourceTypes";

export const getDifferenceBetweenDays = (priceToday: number, priceTomorrow: number): string => {
  const difference = (100 * (priceTomorrow - priceToday) / priceToday);
  if (difference > 0) {
    return `+${+Number(difference).toFixed(0)}% enemmän`;
  }
  return `${+Number(difference).toFixed(0)}% vähemmän`;
}

export const renderMessage = (segments: TimeSegment[]): string => {
  const baseMessage =
    `Sähkön hinta on huomenna <b>~${+Number(segments[3].priceAverage).toFixed(0)} snt/kWh</b> ` +
    `(${+Number(segments[3].priceLowest).toFixed(0)}-${+Number(segments[3].priceHighest).toFixed(0)} snt/kWh), ` +
    `joka on <b>${getDifferenceBetweenDays(segments[1].priceAverage, segments[3].priceAverage)}</b> kuin tänään.` +
    '\n\n' +
    `Saunominen maksaa jopa ${+Number(segments[3].priceHighest*10/100).toFixed(0)} € per kerta.\n` +
    `Muut (uuni, pesukoneet, pelaaminen) maksaa ${+Number(segments[3].priceHighest*1.25/100).toFixed(1)} € per kerta.\n\n`;

  let tableOfPrices = '';
  for (const segment of segments) {
    tableOfPrices += `${segment.date} ${segment.hours}: ${+Number(segment.priceLowest).toFixed(1)}-${+Number(segment.priceHighest).toFixed(1)} snt/kWh\n`;
  }

    return baseMessage + tableOfPrices;
}
