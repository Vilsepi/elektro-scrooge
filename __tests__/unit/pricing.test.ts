import { getPriceWithFeesAndTaxes } from '../../src/pricing';

describe('getPriceWithFeesAndTaxes', () => {
  test('should return correct total hourly price', () => {
    expect(getPriceWithFeesAndTaxes(4.075).toFixed(5)).toEqual("11.53164");
    expect(getPriceWithFeesAndTaxes(10).toFixed(5)).toEqual("18.96751");

    expect(getPriceWithFeesAndTaxes(17.37).toFixed(4)).toEqual("28.2169");
    expect(getPriceWithFeesAndTaxes(35).toFixed(4)).toEqual("50.3425");

    expect(getPriceWithFeesAndTaxes(12.423).toFixed(2)).toEqual("22.01");
    expect(getPriceWithFeesAndTaxes(4.123).toFixed(0)).toEqual("12");
  });

});
