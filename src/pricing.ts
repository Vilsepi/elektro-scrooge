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
