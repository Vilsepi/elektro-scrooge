import { TimeSegment } from "../datasource/datasourceTypes";

export const renderMessage = (segments: TimeSegment[]): string => {
  const message =
    `Sähkön hinta on huomenna ${+Number(segments[3].priceAverage).toFixed(0)} snt/kWh.\n\n` +
    `Saunominen maksaa jopa ${+Number(segments[3].priceHighest*10/100).toFixed(0)} € per kerta.`;
  return message;
}
