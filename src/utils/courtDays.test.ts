import { describe, it, expect } from 'vitest';
import { getNextCourtDay } from './courtDays';

/**
 * Test helper: Format a date as YYYY-MM-DD for readable assertions
 */
function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('getNextCourtDay', () => {
  describe('weekdays', () => {
    it('should return same day for a regular weekday', () => {
      const tuesday = new Date(2024, 0, 9); // Jan 9, 2024 (Tuesday)
      const result = getNextCourtDay(tuesday);
      expect(formatDateISO(result)).toBe('2024-01-09');
    });

    it('should return same day for Monday through Friday (non-holiday)', () => {
      // Week of Jan 8-12, 2024 (no holidays)
      expect(formatDateISO(getNextCourtDay(new Date(2024, 0, 8)))).toBe('2024-01-08');  // Monday
      expect(formatDateISO(getNextCourtDay(new Date(2024, 0, 9)))).toBe('2024-01-09');  // Tuesday
      expect(formatDateISO(getNextCourtDay(new Date(2024, 0, 10)))).toBe('2024-01-10'); // Wednesday
      expect(formatDateISO(getNextCourtDay(new Date(2024, 0, 11)))).toBe('2024-01-11'); // Thursday
      expect(formatDateISO(getNextCourtDay(new Date(2024, 0, 12)))).toBe('2024-01-12'); // Friday
    });
  });

  describe('weekends', () => {
    it('should roll Saturday to Monday', () => {
      // Jan 20, 2024 (Saturday) -> Jan 22, 2024 (Monday)
      const saturday = new Date(2024, 0, 20);
      const result = getNextCourtDay(saturday);
      expect(result.getDay()).toBe(1); // Monday
      expect(formatDateISO(result)).toBe('2024-01-22');
    });

    it('should roll Sunday to Monday', () => {
      // Jan 21, 2024 (Sunday) -> Jan 22, 2024 (Monday)
      const sunday = new Date(2024, 0, 21);
      const result = getNextCourtDay(sunday);
      expect(result.getDay()).toBe(1); // Monday
      expect(formatDateISO(result)).toBe('2024-01-22');
    });
  });

  describe('legal holidays per RCW 1.16.050', () => {
    it('should roll MLK Day (3rd Monday Jan) to Tuesday', () => {
      // MLK Day 2024: Jan 15 (Monday)
      const mlk = new Date(2024, 0, 15);
      const result = getNextCourtDay(mlk);
      expect(result.getDay()).toBe(2); // Tuesday
      expect(formatDateISO(result)).toBe('2024-01-16');
    });

    it('should roll Presidents Day (3rd Monday Feb) to Tuesday', () => {
      // Presidents Day 2024: Feb 19 (Monday)
      const presidentsDay = new Date(2024, 1, 19);
      const result = getNextCourtDay(presidentsDay);
      expect(formatDateISO(result)).toBe('2024-02-20');
    });

    it('should roll Memorial Day (last Monday May) to Tuesday', () => {
      // Memorial Day 2024: May 27 (Monday)
      const memorialDay = new Date(2024, 4, 27);
      const result = getNextCourtDay(memorialDay);
      expect(formatDateISO(result)).toBe('2024-05-28');
    });

    it('should roll Juneteenth (June 19) to next court day', () => {
      // Juneteenth 2024: June 19 (Wednesday)
      const juneteenth = new Date(2024, 5, 19);
      const result = getNextCourtDay(juneteenth);
      expect(formatDateISO(result)).toBe('2024-06-20');
    });

    it('should roll Independence Day (July 4) to next court day', () => {
      // July 4, 2024: Thursday
      const july4 = new Date(2024, 6, 4);
      const result = getNextCourtDay(july4);
      expect(formatDateISO(result)).toBe('2024-07-05');
    });

    it('should roll Labor Day (1st Monday Sep) to Tuesday', () => {
      // Labor Day 2024: Sep 2 (Monday)
      const laborDay = new Date(2024, 8, 2);
      const result = getNextCourtDay(laborDay);
      expect(formatDateISO(result)).toBe('2024-09-03');
    });

    it('should roll Veterans Day (Nov 11) to next court day', () => {
      // Veterans Day 2024: Nov 11 (Monday)
      const veteransDay = new Date(2024, 10, 11);
      const result = getNextCourtDay(veteransDay);
      expect(formatDateISO(result)).toBe('2024-11-12');
    });

    it('should roll Thanksgiving (4th Thursday Nov) through weekend', () => {
      // Thanksgiving 2024: Nov 28 (Thu), Native American Heritage: Nov 29 (Fri)
      // Should roll to Monday Dec 2
      const thanksgiving = new Date(2024, 10, 28);
      const result = getNextCourtDay(thanksgiving);
      expect(formatDateISO(result)).toBe('2024-12-02');
    });

    it('should roll Native American Heritage Day (Fri after Thanksgiving) through weekend', () => {
      // Nov 29, 2024 (Friday) -> Sat -> Sun -> Mon Dec 2
      const nahd = new Date(2024, 10, 29);
      const result = getNextCourtDay(nahd);
      expect(formatDateISO(result)).toBe('2024-12-02');
    });

    it('should roll Christmas Day to next court day', () => {
      // Christmas 2024: Dec 25 (Wednesday)
      const christmas = new Date(2024, 11, 25);
      const result = getNextCourtDay(christmas);
      expect(formatDateISO(result)).toBe('2024-12-26');
    });

    it('should roll New Years Day to next court day', () => {
      // New Year's 2025: Jan 1 (Wednesday)
      const newYears = new Date(2025, 0, 1);
      const result = getNextCourtDay(newYears);
      expect(formatDateISO(result)).toBe('2025-01-02');
    });
  });

  describe('weekend observance rules', () => {
    it('should handle Saturday holiday observed on Friday (July 4, 2026)', () => {
      // July 4, 2026 is Saturday -> observed Friday July 3
      // Friday July 3 is the holiday, should roll to Monday July 6
      const observedHoliday = new Date(2026, 6, 3);
      const result = getNextCourtDay(observedHoliday);
      expect(formatDateISO(result)).toBe('2026-07-06');
    });

    it('should handle Sunday holiday observed on Monday (July 4, 2027)', () => {
      // July 4, 2027 is Sunday -> observed Monday July 5
      // Monday July 5 is the holiday, should roll to Tuesday July 6
      const observedHoliday = new Date(2027, 6, 5);
      const result = getNextCourtDay(observedHoliday);
      expect(formatDateISO(result)).toBe('2027-07-06');
    });

    it('should handle Christmas on Saturday (2021) observed Friday', () => {
      // Dec 25, 2021 is Saturday -> observed Friday Dec 24
      const observedChristmas = new Date(2021, 11, 24);
      const result = getNextCourtDay(observedChristmas);
      expect(formatDateISO(result)).toBe('2021-12-27'); // Monday
    });

    it('should handle Christmas on Sunday (2022) observed Monday', () => {
      // Dec 25, 2022 is Sunday -> observed Monday Dec 26
      const observedChristmas = new Date(2022, 11, 26);
      const result = getNextCourtDay(observedChristmas);
      expect(formatDateISO(result)).toBe('2022-12-27'); // Tuesday
    });
  });

  describe('cascading scenarios', () => {
    it('should handle weekend before MLK Day (Sat rolls past Mon holiday to Tue)', () => {
      // Jan 13, 2024 (Sat) -> Sun Jan 14 -> Mon Jan 15 (MLK) -> Tue Jan 16
      const saturday = new Date(2024, 0, 13);
      const result = getNextCourtDay(saturday);
      expect(formatDateISO(result)).toBe('2024-01-16');
    });

    it('should handle Saturday after Friday observed holiday', () => {
      // July 3, 2026 is observed holiday (July 4 on Saturday)
      // July 4, 2026 (Saturday) -> rolls to Monday July 6
      const saturday = new Date(2026, 6, 4);
      const result = getNextCourtDay(saturday);
      expect(formatDateISO(result)).toBe('2026-07-06');
    });

    it('should handle weekend after Christmas 2024', () => {
      // Dec 28, 2024 (Saturday) -> Dec 30 (Monday)
      const saturday = new Date(2024, 11, 28);
      const result = getNextCourtDay(saturday);
      expect(formatDateISO(result)).toBe('2024-12-30');
    });
  });
});
