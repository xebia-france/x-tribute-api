import {_getPreviousPeriod} from './statistics';

describe('Statistics', () => {
  it('should get previous period', () => {
    // GIVEN
    const today = new Date(Date.parse('01 Jan 1970 10:00:00 GMT'));
    // WHEN
    const period = _getPreviousPeriod(today);
    // THEN
    expect(period.getFullYear()).toEqual(1969);
    expect(period.getMonth()).toEqual(11);
  });
});