import { getPriceWithFeesAndTaxes } from '../../src/index';

describe('getPriceWithFeesAndTaxes', () => {
  test('should return correct total hourly price', () => {
    expect(getPriceWithFeesAndTaxes(4.075).toFixed(5)).toEqual("12.34672");
    expect(getPriceWithFeesAndTaxes(10).toFixed(5)).toEqual("19.69372");
    expect(getPriceWithFeesAndTaxes(17.37).toFixed(5)).toEqual("28.83252");
    expect(getPriceWithFeesAndTaxes(35).toFixed(5)).toEqual("50.69372");
  });

});
