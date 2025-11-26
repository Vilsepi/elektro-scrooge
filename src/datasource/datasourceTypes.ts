
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
