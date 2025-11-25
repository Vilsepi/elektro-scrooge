
// TODO replaced by AggregatePrice
export interface SpotPrice {
  priceArea: string, // Seems empty
  timeStamp: string, // e.g. "2022-08-22T01:00:00"
  timeStampDay: string, // e.g. "2022-08-22"
  timeStampHour: string, // e.g. "01:00"
  unit: string, // e.g. "snt/kWh"
  value: number // e.g. 55.39
}

// TODO deprecate or refactor to support any size segments
export interface TimeSegment {
  date: string,
  hours: string,
  hourlyOriginalSpotPrices: number[],
  hourlyPrices: number[],
  priceLowest: number,
  priceHighest: number,
  priceAverage: number
}

export interface AggregatedPriceMeasurement {
  unit: string, // e.g. "EURO_CENT/KWH"
  value: number // e.g. 8.623
}

export interface AggregatedPrice {
  day: number,
  hour: number,
  minute: number,
  month: number,
  week: number,
  year: number,
  measurement: AggregatedPriceMeasurement
}

export interface AggregatedSpotPricesResponse {
  averagePrice: number,
  currency: string,
  deliveryAreas: string | null,
  deliveryEnd: string,
  deliveryStart: string,
  market: string | null,
  marketMainCurrency: string | null,
  maxPrice: number,
  minPrice: number,
  prices: AggregatedPrice[],
  resolution: string, // e.g. "15mins"
  status: string | null,
  timezone: string, // e.g. "EET"
  unit: string // e.g. "EURO_CENT/KWH"
}
