import { getDayBoundaries, getTodayTomorrowBoundaries } from '../../src/timestamps';

describe('getDayBoundaries', () => {
  it('should return the beginning and end of a day in UTC', () => {
    // 2025-11-25 in UTC
    const date = new Date('2025-11-25T12:30:00Z');
    const boundaries = getDayBoundaries(date);

    // 2025-11-25 00:00:00 UTC = 1764028800
    expect(boundaries.beginning).toBe(1764028800);
    // 2025-11-25 23:59:59.999 UTC = 1764115199
    expect(boundaries.end).toBe(1764115199);
  });

  it('should handle dates near midnight correctly', () => {
    // Date just before midnight UTC
    const beforeMidnight = new Date('2025-11-25T23:59:59Z');
    const boundariesBefore = getDayBoundaries(beforeMidnight);

    // Date just after midnight UTC
    const afterMidnight = new Date('2025-11-26T00:00:01Z');
    const boundariesAfter = getDayBoundaries(afterMidnight);

    // Should be different days
    expect(boundariesBefore.beginning).not.toBe(boundariesAfter.beginning);
    // 2025-11-25 00:00:00 UTC
    expect(boundariesBefore.beginning).toBe(1764028800);
    // 2025-11-26 00:00:00 UTC
    expect(boundariesAfter.beginning).toBe(1764115200);
  });

  it('should return UTC boundaries regardless of local timezone offset in input', () => {
    // Same instant, different representations
    const date1 = new Date('2025-11-25T00:00:00Z');
    const date2 = new Date('2025-11-25T12:00:00Z');
    const date3 = new Date('2025-11-25T23:59:59Z');

    const boundaries1 = getDayBoundaries(date1);
    const boundaries2 = getDayBoundaries(date2);
    const boundaries3 = getDayBoundaries(date3);

    // All should return the same day boundaries since they're the same UTC day
    expect(boundaries1.beginning).toBe(boundaries2.beginning);
    expect(boundaries2.beginning).toBe(boundaries3.beginning);
    expect(boundaries1.end).toBe(boundaries2.end);
  });
});

describe('getTodayTomorrowBoundaries', () => {
  beforeEach(() => {
    // Mock Date to return 2025-11-25 12:00:00 UTC
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-11-25T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return correct boundaries for today and tomorrow', () => {
    const boundaries = getTodayTomorrowBoundaries();

    // Today: 2025-11-25 UTC
    // Beginning: 2025-11-25 00:00:00 UTC = 1764028800
    expect(boundaries.today.beginning).toBe(1764028800);
    // End: 2025-11-25 23:59:59.999 UTC = 1764115199
    expect(boundaries.today.end).toBe(1764115199);

    // Tomorrow: 2025-11-26 UTC
    // Beginning: 2025-11-26 00:00:00 UTC = 1764115200
    expect(boundaries.tomorrow.beginning).toBe(1764115200);
    // End: 2025-11-26 23:59:59.999 UTC = 1764201599
    expect(boundaries.tomorrow.end).toBe(1764201599);
  });

  it('should handle year boundary correctly', () => {
    // Set time to 2025-12-31
    jest.setSystemTime(new Date('2025-12-31T12:00:00Z'));

    const boundaries = getTodayTomorrowBoundaries();

    // Tomorrow should be 2026-01-01
    // 2026-01-01 00:00:00 UTC = 1767225600
    expect(boundaries.tomorrow.beginning).toBe(1767225600);
  });
});
