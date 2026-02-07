import { describe, it, expect, beforeEach } from 'vitest';
import { TrialCalculator, getResetTypeLabel, getExclusionTypeLabel, parseLocalDate, isValidDateString, isValidDateRange } from './trialCalculator';
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
      // Verify the deadline is 90 days from arraignment
      const expectedDeadline = calculator.addDays(parseLocalDate('2024-01-01'), 90);
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
    it('should apply 30-day minimum after exclusion ends when needed', () => {
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
  });

  describe('calculate - cure period', () => {
    it('should add 14-day cure period for detained', () => {
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

    it('should add 28-day cure period for not detained', () => {
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
