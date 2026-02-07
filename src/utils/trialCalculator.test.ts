import { describe, it, expect, beforeEach } from 'vitest';
import { TrialCalculator, getResetTypeLabel, getExclusionTypeLabel, parseLocalDate, isValidDateString, isValidDateRange } from './trialCalculator';
import { getNextCourtDay } from './courtDays';
import type { CalculatorParams, ResetEvent, ExclusionPeriod } from '../types';

describe('TrialCalculator', () => {
  let calculator: TrialCalculator;

  beforeEach(() => {
    calculator = new TrialCalculator();
  });

  describe('addDays', () => {
    it('should add positive days correctly', () => {
      const date = new Date(2024, 0, 1); // Jan 1, 2024 local time
      const result = calculator.addDays(date, 10);
      expect(result.getDate()).toBe(11);
      expect(result.getMonth()).toBe(0); // January
    });

    it('should handle month boundary', () => {
      const date = new Date(2024, 0, 25); // Jan 25
      const result = calculator.addDays(date, 10);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(4);
    });

    it('should handle year boundary', () => {
      const date = new Date(2024, 11, 25); // Dec 25
      const result = calculator.addDays(date, 10);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(4);
    });

    it('should handle leap year', () => {
      const date = new Date(2024, 1, 28); // Feb 28, 2024 (leap year)
      const result = calculator.addDays(date, 1);
      expect(result.getMonth()).toBe(1); // Still February
      expect(result.getDate()).toBe(29);
    });

    it('should correctly calculate 60 days from Jan 1, 2024 (leap year)', () => {
      // Jan 1 + 60 days = Mar 1, 2024 (2024 is leap year)
      // Jan: 31 days, Feb: 29 days = 60 days total
      const start = parseLocalDate('2024-01-01');
      const result = calculator.addDays(start, 60);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // March (0-indexed)
      expect(result.getDate()).toBe(1);
    });

    it('should correctly calculate 90 days from Jan 1, 2024', () => {
      // Jan 1 + 90 days = Mar 31, 2024
      // Jan: 31, Feb: 29, Mar: 30 more = 90 days
      const start = parseLocalDate('2024-01-01');
      const result = calculator.addDays(start, 90);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getDate()).toBe(31);
    });

    it('should correctly calculate 60 days from Jan 1, 2023 (non-leap year)', () => {
      // Jan 1 + 60 days in non-leap year = Mar 2, 2023
      // Jan: 31 days, Feb: 28 days = 59 days, +1 = Mar 2
      const start = parseLocalDate('2023-01-01');
      const result = calculator.addDays(start, 60);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getDate()).toBe(2);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const start = new Date(2024, 0, 1);
      const end = new Date(2024, 0, 11);
      expect(calculator.daysBetween(start, end)).toBe(10);
    });

    it('should return 0 for same date', () => {
      const date = new Date(2024, 0, 1);
      expect(calculator.daysBetween(date, date)).toBe(0);
    });

    it('should handle negative difference', () => {
      const start = new Date(2024, 0, 11);
      const end = new Date(2024, 0, 1);
      expect(calculator.daysBetween(start, end)).toBe(-10);
    });

    it('should verify inclusive day counting for exclusions', () => {
      // Jan 10 to Jan 15 inclusive = 6 days (10, 11, 12, 13, 14, 15)
      const start = parseLocalDate('2024-01-10');
      const end = parseLocalDate('2024-01-15');
      const daysBetween = calculator.daysBetween(start, end);
      const inclusiveDays = daysBetween + 1;
      expect(inclusiveDays).toBe(6);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024 local
      const formatted = calculator.formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2024');
    });
  });

  describe('getEffectiveCommencementDate', () => {
    it('should return initial date when no resets', () => {
      const initial = new Date(2024, 0, 1);
      const result = calculator.getEffectiveCommencementDate(initial, []);
      expect(result.getTime()).toBe(initial.getTime());
    });

    it('should return latest reset date when resets exist', () => {
      const initial = new Date(2024, 0, 1);
      const resets: ResetEvent[] = [
        { id: 1, type: 'waiver', date: '2024-01-15', notes: '' },
        { id: 2, type: 'waiver', date: '2024-02-01', notes: '' },
        { id: 3, type: 'waiver', date: '2024-01-20', notes: '' },
      ];
      const result = calculator.getEffectiveCommencementDate(initial, resets);
      // Should be the latest date (Feb 1)
      const feb1 = parseLocalDate('2024-02-01');
      expect(result.getTime()).toBe(feb1.getTime());
    });
  });

  describe('calculateExcludedDays', () => {
    it('should return 0 for no exclusions', () => {
      const commencement = new Date(2024, 0, 1);
      const result = calculator.calculateExcludedDays(commencement, []);
      expect(result.totalDays).toBe(0);
      expect(result.periods).toHaveLength(0);
    });

    it('should calculate excluded days correctly (inclusive)', () => {
      const commencement = new Date(2024, 0, 1);
      const exclusions: ExclusionPeriod[] = [
        { id: 1, type: 'continuance', startDate: '2024-01-10', endDate: '2024-01-15', notes: '' }
      ];
      const result = calculator.calculateExcludedDays(commencement, exclusions);
      expect(result.totalDays).toBe(6); // Jan 10-15 inclusive
      expect(result.periods).toHaveLength(1);
    });

    it('should sum multiple exclusion periods', () => {
      const commencement = new Date(2024, 0, 1);
      const exclusions: ExclusionPeriod[] = [
        { id: 1, type: 'continuance', startDate: '2024-01-10', endDate: '2024-01-15', notes: '' },
        { id: 2, type: 'competency', startDate: '2024-01-20', endDate: '2024-01-25', notes: '' }
      ];
      const result = calculator.calculateExcludedDays(commencement, exclusions);
      expect(result.totalDays).toBe(12); // 6 + 6
      expect(result.periods).toHaveLength(2);
    });

    it('should ignore exclusions before commencement date', () => {
      const commencement = new Date(2024, 1, 1); // Feb 1
      const exclusions: ExclusionPeriod[] = [
        { id: 1, type: 'continuance', startDate: '2024-01-10', endDate: '2024-01-15', notes: '' }
      ];
      const result = calculator.calculateExcludedDays(commencement, exclusions);
      expect(result.totalDays).toBe(0);
      expect(result.periods).toHaveLength(0);
    });

    it('should count single day exclusion as 1 day (inclusive)', () => {
      const commencement = new Date(2024, 0, 1);
      const exclusions: ExclusionPeriod[] = [
        { id: 1, type: 'continuance', startDate: '2024-01-15', endDate: '2024-01-15', notes: '' }
      ];
      const result = calculator.calculateExcludedDays(commencement, exclusions);
      expect(result.totalDays).toBe(1);
      expect(result.periods).toHaveLength(1);
      expect(result.periods[0].days).toBe(1);
    });

    it('should sum overlapping exclusions independently (current behavior)', () => {
      // NOTE: Current implementation counts each period independently,
      // which may result in double-counting overlapping days.
      // This documents the current behavior.
      const commencement = new Date(2024, 0, 1);
      const exclusions: ExclusionPeriod[] = [
        { id: 1, type: 'continuance', startDate: '2024-01-10', endDate: '2024-01-20', notes: '' }, // 11 days
        { id: 2, type: 'competency', startDate: '2024-01-15', endDate: '2024-01-25', notes: '' }  // 11 days
      ];
      const result = calculator.calculateExcludedDays(commencement, exclusions);
      // Current behavior: 11 + 11 = 22 days (double counts Jan 15-20)
      // Note: Actual calendar days would be 16 (Jan 10-25)
      expect(result.totalDays).toBe(22);
      expect(result.periods).toHaveLength(2);
    });

    it('should ignore exclusion that starts before commencement date entirely', () => {
      // Current behavior: if exclusion starts before commencement, entire exclusion is ignored
      const commencement = new Date(2024, 0, 15); // Jan 15
      const exclusions: ExclusionPeriod[] = [
        { id: 1, type: 'continuance', startDate: '2024-01-10', endDate: '2024-01-20', notes: '' }
      ];
      const result = calculator.calculateExcludedDays(commencement, exclusions);
      // Current behavior: startDate (Jan 10) < commencement (Jan 15), so excluded = 0
      // Note: Arguably should count Jan 15-20 = 6 days
      expect(result.totalDays).toBe(0);
      expect(result.periods).toHaveLength(0);
    });

    it('should count exclusion that starts exactly on commencement date', () => {
      const commencement = new Date(2024, 0, 15); // Jan 15
      const exclusions: ExclusionPeriod[] = [
        { id: 1, type: 'continuance', startDate: '2024-01-15', endDate: '2024-01-20', notes: '' }
      ];
      const result = calculator.calculateExcludedDays(commencement, exclusions);
      expect(result.totalDays).toBe(6); // Jan 15-20 inclusive
      expect(result.periods).toHaveLength(1);
    });
  });

  describe('calculate - basic time limits', () => {
    it('should use 60-day limit for detained defendant', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.baseTimeLimit).toBe(60);
      // Verify the deadline is 60 days from arraignment
      const expectedDeadline = calculator.addDays(parseLocalDate('2024-01-01'), 60);
      expect(result.finalDeadline.getTime()).toBe(expectedDeadline.getTime());
    });

    it('should use 90-day limit for not detained defendant', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'not-detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.baseTimeLimit).toBe(90);
      // Verify the deadline is 90 days from arraignment, adjusted for court days per CRLJ 6(a)
      // Jan 1 + 90 = Mar 31, 2024 (Sunday) -> rolls to Monday Apr 1
      const rawDeadline = calculator.addDays(parseLocalDate('2024-01-01'), 90);
      const expectedDeadline = getNextCourtDay(rawDeadline);
      expect(result.finalDeadline.getTime()).toBe(expectedDeadline.getTime());
    });
  });

  describe('calculate - release before 60-day limit', () => {
    it('should extend to 90 days when released before 60-day mark', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '2024-01-15', // Released on day 14
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.baseTimeLimit).toBe(90);
      expect(result.wasReleased).toBe(true);
    });

    it('should keep 60 days when released after 60-day mark', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '2024-03-15', // Released after 60 days
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.baseTimeLimit).toBe(60);
      expect(result.wasReleased).toBe(false);
    });

    it('should NOT extend to 90 days when released exactly on day 60 - Section (b)(3)', () => {
      // Rule: "If a defendant is released from jail BEFORE the 60-day time limit
      // has expired, the limit shall be extended to 90 days"
      // Released ON day 60 means the limit has expired, so no extension
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '2024-03-01', // Exactly day 60 (Jan has 31, Feb has 29 in 2024)
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      // Day 60 from Jan 1 = Mar 1 (31 days in Jan + 29 days in Feb = 60)
      // Release ON day 60 should NOT trigger extension (rule says "before")
      expect(result.baseTimeLimit).toBe(60);
      expect(result.wasReleased).toBe(false);
    });

    it('should extend to 90 days when released on day 59', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '2024-02-29', // Day 59 (one day before 60-day mark)
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.baseTimeLimit).toBe(90);
      expect(result.wasReleased).toBe(true);
    });
  });

  describe('calculate - resets', () => {
    it('should use reset date as effective commencement date', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [
          { id: 1, type: 'waiver', date: '2024-02-01', notes: '' }
        ],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      // Effective commencement should match reset date
      expect(result.effectiveCommencementDate.getTime()).toBe(parseLocalDate('2024-02-01').getTime());
      // Deadline should be 60 days from reset date
      const expectedDeadline = calculator.addDays(parseLocalDate('2024-02-01'), 60);
      expect(result.finalDeadline.getTime()).toBe(expectedDeadline.getTime());
    });

    it('should handle failure-to-appear reset - Section (c)(2)(ii)', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [
          { id: 1, type: 'failure-to-appear', date: '2024-02-15', notes: 'Defendant FTA on scheduled date' }
        ],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.effectiveCommencementDate.getTime()).toBe(parseLocalDate('2024-02-15').getTime());
      const expectedDeadline = calculator.addDays(parseLocalDate('2024-02-15'), 60);
      expect(result.finalDeadline.getTime()).toBe(expectedDeadline.getTime());
    });

    it('should handle new-trial reset (mistrial/new trial granted) - Section (c)(2)(iii)', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'not-detained',
        releaseDate: '',
        resets: [
          { id: 1, type: 'new-trial', date: '2024-03-01', notes: 'Mistrial declared' }
        ],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.effectiveCommencementDate.getTime()).toBe(parseLocalDate('2024-03-01').getTime());
    });

    it('should handle multiple different reset types and use latest - Section (c)(2)', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [
          { id: 1, type: 'waiver', date: '2024-01-20', notes: '' },
          { id: 2, type: 'failure-to-appear', date: '2024-02-10', notes: '' },
          { id: 3, type: 'venue-change', date: '2024-02-05', notes: '' }
        ],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      // Latest reset is Feb 10 (failure-to-appear)
      expect(result.effectiveCommencementDate.getTime()).toBe(parseLocalDate('2024-02-10').getTime());
    });
  });

  describe('calculate - exclusions', () => {
    it('should add excluded days to deadline', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [
          { id: 1, type: 'continuance', startDate: '2024-01-10', endDate: '2024-01-19', notes: '' }
        ],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.excludedDays).toBe(10);
      // Deadline should be 60 + 10 = 70 days from arraignment
      const expectedDeadline = calculator.addDays(parseLocalDate('2024-01-01'), 70);
      expect(result.finalDeadline.getTime()).toBe(expectedDeadline.getTime());
    });
  });

  describe('calculate - 30-day minimum rule', () => {
    it('should apply 30-day minimum after exclusion ends when needed - Section (b)(5)', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [
          // Long exclusion that ends close to what would be the deadline
          { id: 1, type: 'competency', startDate: '2024-01-05', endDate: '2024-02-25', notes: '' }
        ],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);

      // 30 days after Feb 25 exclusion end
      const thirtyDaysAfterExclusion = calculator.addDays(parseLocalDate('2024-02-25'), 30);

      // The deadline should be at least 30 days after exclusion end
      expect(result.finalDeadline.getTime()).toBeGreaterThanOrEqual(thirtyDaysAfterExclusion.getTime());
    });

    it('should use standard deadline when already past 30 days after exclusion end', () => {
      // When standard deadline is already > 30 days after exclusion end,
      // use the standard deadline (the longer of the two)
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'not-detained', // 90 days
        releaseDate: '',
        resets: [],
        exclusions: [
          { id: 1, type: 'continuance', startDate: '2024-01-10', endDate: '2024-01-15', notes: '' } // 6 days
        ],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);

      // Standard deadline: Jan 1 + 90 + 6 = Jan 1 + 96 days = Apr 6, 2024 (Saturday)
      // Per CRLJ 6(a), Saturday rolls to Monday Apr 8, 2024
      // 30 days after exclusion end: Jan 15 + 30 = Feb 14, 2024
      // Apr 8 > Feb 14, so use Apr 8

      const rawDeadline = calculator.addDays(parseLocalDate('2024-01-01'), 96);
      const expectedStandardDeadline = getNextCourtDay(rawDeadline);
      const thirtyAfterExclusion = calculator.addDays(parseLocalDate('2024-01-15'), 30);

      expect(result.finalDeadline.getTime()).toBe(expectedStandardDeadline.getTime());
      expect(result.finalDeadline.getTime()).toBeGreaterThan(thirtyAfterExclusion.getTime());
    });

    it('should correctly apply 30-day minimum with multiple exclusions (use latest end date)', () => {
      // Use the LATEST exclusion end date for 30-day minimum calculation
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained', // 60 days
        releaseDate: '',
        resets: [],
        exclusions: [
          { id: 1, type: 'continuance', startDate: '2024-01-10', endDate: '2024-01-15', notes: '' }, // 6 days
          { id: 2, type: 'competency', startDate: '2024-02-20', endDate: '2024-02-28', notes: '' }  // 9 days, ends later
        ],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);

      // 30 days after LATEST exclusion end (Feb 28)
      const thirtyAfterLatestExclusion = calculator.addDays(parseLocalDate('2024-02-28'), 30);
      expect(result.finalDeadline.getTime()).toBeGreaterThanOrEqual(thirtyAfterLatestExclusion.getTime());
    });
  });

  describe('calculate - cure period', () => {
    it('should add 14-day cure period for detained - Section (g)', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: true
      };
      const result = calculator.calculate(params);
      expect(result.cureDays).toBe(14);
      expect(result.cureDeadline).not.toBeNull();
      // Cure deadline should be 14 days after final deadline
      const expectedCureDeadline = calculator.addDays(result.finalDeadline, 14);
      expect(result.cureDeadline!.getTime()).toBe(expectedCureDeadline.getTime());
    });

    it('should add 28-day cure period for not detained - Section (g)', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'not-detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: true
      };
      const result = calculator.calculate(params);
      expect(result.cureDays).toBe(28);
      expect(result.cureDeadline).not.toBeNull();
      // Cure deadline should be 28 days after final deadline
      const expectedCureDeadline = calculator.addDays(result.finalDeadline, 28);
      expect(result.cureDeadline!.getTime()).toBe(expectedCureDeadline.getTime());
    });

    it('should not add cure period when not requested', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.cureDays).toBe(0);
      expect(result.cureDeadline).toBeNull();
    });

    it('should mark untimely when after regular deadline but before cure, without cure enabled', () => {
      // Ensures cure period only applies when explicitly requested
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-03-10', // Day 69 (after 60-day deadline)
        useCurePeriod: false // Cure NOT enabled
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBe(false);
    });

    it('should mark timely when same date falls within cure period when enabled', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-03-10', // Day 69 (within 60+14=74 day cure)
        useCurePeriod: true // Cure enabled
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBe(true);
    });
  });

  describe('calculate - timeliness check', () => {
    it('should mark trial as timely when before deadline', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-02-15', // Well before deadline
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBe(true);
    });

    it('should mark trial as untimely when after deadline', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-04-15', // Well after 60-day deadline
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBe(false);
    });

    it('should use cure deadline for timeliness when cure period applied', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-03-10', // After normal deadline but before cure
        useCurePeriod: true
      };
      const result = calculator.calculate(params);
      // With cure period, Mar 10 should be within the extended deadline
      expect(result.isTimely).toBe(true);
    });

    it('should return null isTimely when no trial date provided', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '',
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBeNull();
    });

    it('should mark trial as timely when scheduled exactly on deadline', () => {
      // Trial on the deadline should be timely (rule uses "within" which is inclusive)
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-03-01', // Exactly day 60
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBe(true);
    });

    it('should mark trial as untimely when scheduled one day after deadline', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-03-02', // Day 61
        useCurePeriod: false
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBe(false);
    });

    it('should mark trial as timely when exactly on cure deadline', () => {
      // Arraignment Jan 1 + 60 days = Mar 1 + 14 days cure = Mar 15
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-03-15', // Exactly on cure deadline
        useCurePeriod: true
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBe(true);
    });

    it('should mark trial as untimely when one day after cure deadline', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '',
        resets: [],
        exclusions: [],
        scheduledTrialDate: '2024-03-16', // One day after cure deadline
        useCurePeriod: true
      };
      const result = calculator.calculate(params);
      expect(result.isTimely).toBe(false);
    });
  });

  describe('calculate - complex scenario', () => {
    it('should handle multiple resets, exclusions, and cure period', () => {
      const params: CalculatorParams = {
        arraignmentDate: '2024-01-01',
        custodyStatus: 'detained',
        releaseDate: '2024-01-20', // Released before 60 days - extends to 90
        resets: [
          { id: 1, type: 'waiver', date: '2024-02-01', notes: '' }
        ],
        exclusions: [
          { id: 1, type: 'continuance', startDate: '2024-02-10', endDate: '2024-02-19', notes: '' },
          { id: 2, type: 'competency', startDate: '2024-03-01', endDate: '2024-03-10', notes: '' }
        ],
        scheduledTrialDate: '2024-06-15',
        useCurePeriod: true
      };
      const result = calculator.calculate(params);

      // Effective commencement: Feb 1 (from reset)
      expect(result.effectiveCommencementDate.getTime()).toBe(parseLocalDate('2024-02-01').getTime());

      // Base time limit: 90 days (released before 60)
      expect(result.baseTimeLimit).toBe(90);
      expect(result.wasReleased).toBe(true);

      // Excluded days: 10 + 10 = 20
      expect(result.excludedDays).toBe(20);

      // Cure period: 14 days (detained status)
      expect(result.cureDays).toBe(14);
      expect(result.cureDeadline).not.toBeNull();

      // Scheduled trial should be marked untimely (Jun 15 is way past any deadline)
      expect(result.isTimely).toBe(false);
    });
  });
});

describe('parseLocalDate', () => {
  it('should parse YYYY-MM-DD as local midnight', () => {
    const date = parseLocalDate('2024-01-15');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0); // January (0-indexed)
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  it('should return invalid date for empty string', () => {
    const date = parseLocalDate('');
    expect(isNaN(date.getTime())).toBe(true);
  });

  it('should handle different months correctly', () => {
    const date = parseLocalDate('2024-12-25');
    expect(date.getMonth()).toBe(11); // December (0-indexed)
    expect(date.getDate()).toBe(25);
  });
});

describe('isValidDateString', () => {
  it('should return true for valid YYYY-MM-DD format', () => {
    expect(isValidDateString('2024-01-15')).toBe(true);
    expect(isValidDateString('2024-12-31')).toBe(true);
    expect(isValidDateString('2023-06-01')).toBe(true);
  });

  it('should return false for invalid formats', () => {
    expect(isValidDateString('')).toBe(false);
    expect(isValidDateString('01-15-2024')).toBe(false);
    expect(isValidDateString('2024/01/15')).toBe(false);
    expect(isValidDateString('not-a-date')).toBe(false);
    expect(isValidDateString('2024-1-15')).toBe(false); // Missing leading zero
  });

  it('should return false for strings of wrong length', () => {
    expect(isValidDateString('2024-01-1')).toBe(false);
    expect(isValidDateString('2024-01-150')).toBe(false);
  });
});

describe('isValidDateRange', () => {
  it('should return true when end date is after start date', () => {
    expect(isValidDateRange('2024-01-01', '2024-01-15')).toBe(true);
    expect(isValidDateRange('2024-01-01', '2024-12-31')).toBe(true);
  });

  it('should return true when end date equals start date', () => {
    expect(isValidDateRange('2024-01-15', '2024-01-15')).toBe(true);
  });

  it('should return false when end date is before start date', () => {
    expect(isValidDateRange('2024-01-15', '2024-01-01')).toBe(false);
    expect(isValidDateRange('2024-12-31', '2024-01-01')).toBe(false);
  });

  it('should return false for invalid date strings', () => {
    expect(isValidDateRange('invalid', '2024-01-15')).toBe(false);
    expect(isValidDateRange('2024-01-01', 'invalid')).toBe(false);
    expect(isValidDateRange('', '')).toBe(false);
  });
});

describe('Label functions', () => {
  it('getResetTypeLabel should return correct labels', () => {
    expect(getResetTypeLabel('waiver')).toBe('Waiver');
    expect(getResetTypeLabel('failure-to-appear')).toBe('Failure to Appear');
    expect(getResetTypeLabel('unknown')).toBe('unknown');
  });

  it('getExclusionTypeLabel should return correct labels', () => {
    expect(getExclusionTypeLabel('competency')).toBe('Competency Proceedings');
    expect(getExclusionTypeLabel('continuance')).toBe('Continuance');
    expect(getExclusionTypeLabel('unknown')).toBe('unknown');
  });
});

describe('CRLJ 6(a) Court Day Adjustment', () => {
  let calculator: TrialCalculator;

  beforeEach(() => {
    calculator = new TrialCalculator();
  });

  it('should roll Saturday deadline to Monday - detained 60 days', () => {
    // Nov 15, 2024 (Friday) + 60 days = Jan 14, 2025 (Tuesday) - no adjustment needed
    // Let's find a date that lands on Saturday:
    // Nov 2, 2024 (Saturday) + 60 days = Jan 1, 2025 (Wednesday, holiday) -> Jan 2
    // Actually: Oct 31, 2024 (Thursday) + 60 days = Dec 30, 2024 (Monday) - fine
    // Oct 26, 2024 (Saturday) + 60 days = Dec 25, 2024 (Wednesday, Christmas) -> Dec 26
    // Let's try: Nov 9, 2024 (Saturday) + 60 = Jan 8, 2025 (Wednesday) - fine
    // We need arraignment where +60 = Saturday
    // Jan 3, 2025 (Friday) + 60 = Mar 4, 2025 (Tuesday) - fine
    // Jan 4, 2025 (Saturday) - can't arraign on weekend
    // Let's use: Dec 6, 2024 (Friday) + 60 = Feb 4, 2025 (Tuesday) - fine
    // Dec 5, 2024 (Thursday) + 60 = Feb 3, 2025 (Monday) - fine
    // Need: arraignment on X where X + 60 = Saturday
    // Feb 1, 2025 (Saturday) - 60 = Dec 3, 2024 (Tuesday)
    const params: CalculatorParams = {
      arraignmentDate: '2024-12-03', // Tuesday
      custodyStatus: 'detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: false
    };
    const result = calculator.calculate(params);
    // Dec 3 + 60 = Feb 1, 2025 (Saturday) -> should roll to Monday Feb 3
    expect(result.finalDeadline.getFullYear()).toBe(2025);
    expect(result.finalDeadline.getMonth()).toBe(1); // February
    expect(result.finalDeadline.getDate()).toBe(3);
    expect(result.finalDeadline.getDay()).toBe(1); // Monday
  });

  it('should roll Sunday deadline to Monday - not detained 90 days', () => {
    // Need arraignment where +90 = Sunday
    // Feb 2, 2025 (Sunday) - 90 = Nov 4, 2024 (Monday)
    const params: CalculatorParams = {
      arraignmentDate: '2024-11-04', // Monday
      custodyStatus: 'not-detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: false
    };
    const result = calculator.calculate(params);
    // Nov 4 + 90 = Feb 2, 2025 (Sunday) -> should roll to Monday Feb 3
    expect(result.finalDeadline.getFullYear()).toBe(2025);
    expect(result.finalDeadline.getMonth()).toBe(1); // February
    expect(result.finalDeadline.getDate()).toBe(3);
    expect(result.finalDeadline.getDay()).toBe(1); // Monday
  });

  it('should roll holiday deadline to next court day - Christmas 2024', () => {
    // Need arraignment where +60 = Dec 25, 2024 (Wednesday, Christmas)
    // Dec 25 - 60 = Oct 26, 2024 (Saturday) - can't use
    // Let's use not-detained: Dec 25 - 90 = Sep 26, 2024 (Thursday)
    const params: CalculatorParams = {
      arraignmentDate: '2024-09-26', // Thursday
      custodyStatus: 'not-detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: false
    };
    const result = calculator.calculate(params);
    // Sep 26 + 90 = Dec 25, 2024 (Christmas) -> should roll to Thursday Dec 26
    expect(result.finalDeadline.getFullYear()).toBe(2024);
    expect(result.finalDeadline.getMonth()).toBe(11); // December
    expect(result.finalDeadline.getDate()).toBe(26);
    expect(result.finalDeadline.getDay()).toBe(4); // Thursday
  });

  it('should roll MLK Day 2025 deadline to Tuesday', () => {
    // MLK Day 2025 is Jan 20 (Monday)
    // Need +60 = Jan 20: Jan 20 - 60 = Nov 21, 2024 (Thursday)
    const params: CalculatorParams = {
      arraignmentDate: '2024-11-21', // Thursday
      custodyStatus: 'detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: false
    };
    const result = calculator.calculate(params);
    // Nov 21 + 60 = Jan 20, 2025 (MLK Day) -> should roll to Tuesday Jan 21
    expect(result.finalDeadline.getFullYear()).toBe(2025);
    expect(result.finalDeadline.getMonth()).toBe(0); // January
    expect(result.finalDeadline.getDate()).toBe(21);
    expect(result.finalDeadline.getDay()).toBe(2); // Tuesday
  });

  it('should handle weekend before MLK Day - Saturday rolls past holiday to Tuesday', () => {
    // Jan 18, 2025 (Saturday) before MLK Day (Jan 20)
    // Saturday -> Sunday -> MLK Monday -> Tuesday Jan 21
    // Need +60 = Jan 18: Jan 18 - 60 = Nov 19, 2024 (Tuesday)
    const params: CalculatorParams = {
      arraignmentDate: '2024-11-19', // Tuesday
      custodyStatus: 'detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: false
    };
    const result = calculator.calculate(params);
    // Nov 19 + 60 = Jan 18, 2025 (Saturday) -> Sun -> MLK Mon -> Tuesday Jan 21
    expect(result.finalDeadline.getFullYear()).toBe(2025);
    expect(result.finalDeadline.getMonth()).toBe(0); // January
    expect(result.finalDeadline.getDate()).toBe(21);
    expect(result.finalDeadline.getDay()).toBe(2); // Tuesday
  });

  it('should apply court day adjustment to cure deadline', () => {
    // Set up so cure deadline lands on weekend
    // Use detained (14 day cure) where final + 14 = Saturday
    // Final deadline: Jan 18, 2025 (Sat->Tue Jan 21)
    // Jan 21 + 14 = Feb 4, 2025 (Tuesday) - no adjustment
    // Let's try: final = Monday Jan 20 (MLK, rolls to Tue Jan 21)
    // Jan 21 + 14 = Feb 4 (Tue) - fine
    // Need final + 14 = Saturday
    // If final = Fri Jan 17 -> + 14 = Sat Jan 31 -> Mon Feb 2 (wait, check if holiday)
    // Need arraignment where +60 = Jan 17: Jan 17 - 60 = Nov 18, 2024 (Monday)
    const params: CalculatorParams = {
      arraignmentDate: '2024-11-18', // Monday
      custodyStatus: 'detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: true
    };
    const result = calculator.calculate(params);
    // Nov 18 + 60 = Jan 17, 2025 (Friday, regular day)
    // finalDeadline = Jan 17 (Friday, no adjustment needed)
    // cureDeadline = Jan 17 + 14 = Jan 31, 2025 (Friday, regular day)
    expect(result.finalDeadline.getDate()).toBe(17);
    expect(result.cureDeadline?.getDate()).toBe(31);

    // Now test with deadline landing on Saturday for cure
    // Final = Wed Jan 15, cure +14 = Wed Jan 29 - fine
    // Need final = Sat: Dec 3, 2024 + 60 = Feb 1, 2025 (Sat) -> Mon Feb 3
    // cure: Feb 3 + 14 = Feb 17, 2025 (Monday, Presidents Day) -> Tue Feb 18
    const params2: CalculatorParams = {
      arraignmentDate: '2024-12-03',
      custodyStatus: 'detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: true
    };
    const result2 = calculator.calculate(params2);
    // finalDeadline = Feb 3 (Monday)
    // cureDeadline = Feb 3 + 14 = Feb 17, 2025 (Presidents Day) -> Tue Feb 18
    expect(result2.cureDeadline?.getMonth()).toBe(1); // February
    expect(result2.cureDeadline?.getDate()).toBe(18);
    expect(result2.cureDeadline?.getDay()).toBe(2); // Tuesday
  });

  it('should handle Thanksgiving week - Thursday and Friday both holidays', () => {
    // Thanksgiving 2024: Nov 28 (Thu), Native American Heritage: Nov 29 (Fri)
    // If deadline = Nov 28, rolls to Mon Dec 2
    // Need +60 = Nov 28: Nov 28 - 60 = Sep 29, 2024 (Sunday) - can't
    // Use not-detained 90: Nov 28 - 90 = Aug 30, 2024 (Friday)
    const params: CalculatorParams = {
      arraignmentDate: '2024-08-30', // Friday
      custodyStatus: 'not-detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: false
    };
    const result = calculator.calculate(params);
    // Aug 30 + 90 = Nov 28, 2024 (Thanksgiving) -> Fri Nov 29 (holiday) -> Sat -> Sun -> Mon Dec 2
    expect(result.finalDeadline.getFullYear()).toBe(2024);
    expect(result.finalDeadline.getMonth()).toBe(11); // December
    expect(result.finalDeadline.getDate()).toBe(2);
    expect(result.finalDeadline.getDay()).toBe(1); // Monday
  });

  it('should not change deadline on regular weekday', () => {
    // Verify no false adjustments - pick a date that lands on Wednesday
    // Jan 1, 2025 (Wednesday, but New Year's) - skip
    // Jan 8, 2025 (Wednesday, regular)
    // +60 = Jan 8: Jan 8 - 60 = Nov 9, 2024 (Saturday) - can't
    // +90 = Jan 8: Jan 8 - 90 = Oct 10, 2024 (Thursday)
    const params: CalculatorParams = {
      arraignmentDate: '2024-10-10', // Thursday
      custodyStatus: 'not-detained',
      releaseDate: null,
      resets: [],
      exclusions: [],
      scheduledTrialDate: null,
      useCurePeriod: false
    };
    const result = calculator.calculate(params);
    // Oct 10 + 90 = Jan 8, 2025 (Wednesday, regular day)
    expect(result.finalDeadline.getFullYear()).toBe(2025);
    expect(result.finalDeadline.getMonth()).toBe(0); // January
    expect(result.finalDeadline.getDate()).toBe(8);
    expect(result.finalDeadline.getDay()).toBe(3); // Wednesday
  });
});
