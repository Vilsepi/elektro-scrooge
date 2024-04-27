import { getPriceWithFeesAndTaxes } from '../../src/index';

describe('getPriceWithFeesAndTaxes', () => {
  test('should return correct total hourly price', () => {
    expect(getPriceWithFeesAndTaxes(4.075).toFixed(5)).toEqual("11.16672");
    expect(getPriceWithFeesAndTaxes(10).toFixed(5)).toEqual("18.51372");
    expect(getPriceWithFeesAndTaxes(17.37).toFixed(5)).toEqual("27.65252");
    expect(getPriceWithFeesAndTaxes(35).toFixed(5)).toEqual("49.51372");
    expect(getPriceWithFeesAndTaxes(12.423).toFixed(2)).toEqual("21.52");
    expect(getPriceWithFeesAndTaxes(4.123).toFixed(0)).toEqual("11");
  });

});
