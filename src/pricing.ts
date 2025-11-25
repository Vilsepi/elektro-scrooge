import { SpotPrice, TimeSegment } from './datasource/datasourceTypes';

// General multiplier for VAT 25.5%. Spot prices from API are in VAT 0%
const ELECTRICITY_TAX_MULTIPLIER = 1.255;

// Electricity service company margin, eurocents per kWh, including VAT 25.5%
const ELECTRICITY_COMPANY_MARGIN = 0.39;

// Electricity transfer fee for grid operator, including VAT 25.5%
const GRID_SERVICE_FEE = 3.20;

// Electricity grid tax for households (Tax Class 1), eurocents per kWh including VAT 25.5% and including "Huoltovarmuusmaksu" 0,01612 c/kWh
const GRID_SERVICE_TAX_FOR_HOUSEHOLDS = 2.827515;

// Returns total electricity cost including all taxes and grid fees when given only the service provider price with VAT 0%
// The only thing missing here are the fixed monthly costs
export const getPriceWithFeesAndTaxes = (basePrice: number): number => {
  return (basePrice * ELECTRICITY_TAX_MULTIPLIER) + ELECTRICITY_COMPANY_MARGIN + GRID_SERVICE_FEE + GRID_SERVICE_TAX_FOR_HOUSEHOLDS;
};

export const getSimpleHour = (timeStampHour: string): string => {
  return timeStampHour.split(':')[0];
}

export const getSegment = (segment: SpotPrice[]): TimeSegment => {
  return {
    date: segment[0].timeStampDay,
    hours: `${getSimpleHour(segment[0].timeStampHour)}-${getSimpleHour(segment[segment.length - 1].timeStampHour)}`,
    hourlyOriginalSpotPrices: segment.map(hour => hour.value),
    hourlyPrices: segment.map(hour => getPriceWithFeesAndTaxes(hour.value)),
    priceLowest: getPriceWithFeesAndTaxes(Math.min(...segment.map(hour => hour.value))),
    priceHighest: getPriceWithFeesAndTaxes(Math.max(...segment.map(hour => hour.value))),
    priceAverage: getPriceWithFeesAndTaxes(segment.reduce((total, next) => total + next.value, 0) / segment.length)
  }
}
