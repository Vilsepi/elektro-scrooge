import {
  hasCompletePriceData,
  generateMessage,
  FIFTEEN_MINUTE_SEGMENTS_IN_DAY,
  MESSAGE_PRICES_NOT_YET_AVAILABLE
} from '../../src/telegram/render';
import { AggregatedSpotPricesResponse } from '../../src/datasource/datasourceTypes';

import completePriceData from './datasource/responses/15min_aggregate_prices.json';
import partialPriceData from './datasource/responses/incomplete_data_for_tomorrow.json';

describe('hasCompletePriceData', () => {
  test('should return true when prices array has 96 entries (full day)', () => {
    expect(completePriceData.prices.length).toBe(FIFTEEN_MINUTE_SEGMENTS_IN_DAY);
    expect(hasCompletePriceData(completePriceData as AggregatedSpotPricesResponse)).toBe(true);
  });

  test('should return false when prices array has less than 96 entries (partial data)', () => {
    expect(partialPriceData.prices.length).toBe(4); // Only first hour (4 x 15min segments)
    expect(hasCompletePriceData(partialPriceData as AggregatedSpotPricesResponse)).toBe(false);
  });

  test('should return false when prices array is empty', () => {
    const emptyPrices: AggregatedSpotPricesResponse = {
      ...completePriceData,
      prices: []
    } as AggregatedSpotPricesResponse;
    expect(hasCompletePriceData(emptyPrices)).toBe(false);
  });
});

describe('generateMessage', () => {
  test('should return caption when tomorrow has complete price data', () => {
    const message = generateMessage(
      completePriceData as AggregatedSpotPricesResponse,
      completePriceData as AggregatedSpotPricesResponse
    );
    // Should return rendered caption, not the fallback message
    expect(message).not.toBe(MESSAGE_PRICES_NOT_YET_AVAILABLE);
    expect(message).toContain('Sähkön hinta on huomenna');
  });

  test('should return fallback message when tomorrow has partial price data', () => {
    const message = generateMessage(
      completePriceData as AggregatedSpotPricesResponse,
      partialPriceData as AggregatedSpotPricesResponse
    );
    expect(message).toBe(MESSAGE_PRICES_NOT_YET_AVAILABLE);
  });

  test('should return fallback message when tomorrow prices array is empty', () => {
    const emptyTomorrow: AggregatedSpotPricesResponse = {
      ...completePriceData,
      prices: []
    } as AggregatedSpotPricesResponse;

    const message = generateMessage(
      completePriceData as AggregatedSpotPricesResponse,
      emptyTomorrow
    );
    expect(message).toBe(MESSAGE_PRICES_NOT_YET_AVAILABLE);
  });
});
