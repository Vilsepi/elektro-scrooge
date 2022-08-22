
export interface SpotPrice {
  priceArea: string, // Seems empty
  timeStamp: string, // e.g. "2022-08-22T01:00:00"
  timeStampDay: string, // e.g. "2022-08-22"
  timeStampHour: string, // e.g. "01:00"
  unit: string, // e.g. "snt/kWh"
  value: number // e.g. 55.39
}
