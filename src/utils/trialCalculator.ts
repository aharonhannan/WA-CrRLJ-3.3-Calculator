// CrRLJ 3.3 Time for Trial Calculator
// Date calculation logic

import type {
  ResetEvent,
  ExclusionPeriod,
  CalculatedExclusionPeriod,
  CalculatorParams,
  CalculationResults
} from '../types';
import { getNextCourtDay } from './courtDays';
import { STRINGS } from '../strings';

/**
 * Parse a date string (YYYY-MM-DD) as local midnight.
 * This prevents timezone issues where UTC parsing shifts dates.
 * For example, '2024-01-01' parsed as UTC would be Dec 31, 2023 in Pacific time.
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) {
    return new Date(NaN); // Invalid date
  }
  // Parse as local date by splitting the string
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  if (isNaN(startTime) || isNaN(endTime)) return 0;
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((endTime - startTime) / oneDay);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get the effective commencement date considering resets
 */
export function getEffectiveCommencementDate(initialDate: Date, resets: ResetEvent[]): Date {
  if (!resets || resets.length === 0) {
    return initialDate;
  }

  const sortedResets = [...resets].sort((a, b) =>
    parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );
  return parseLocalDate(sortedResets[0].date);
}

/**
 * Calculate excluded days from exclusion periods
 */
export function calculateExcludedDays(
  commencementDate: Date,
  exclusions: ExclusionPeriod[]
): { totalDays: number; periods: CalculatedExclusionPeriod[] } {
  if (!exclusions || exclusions.length === 0) {
    return { totalDays: 0, periods: [] };
  }

  let totalDays = 0;
  const periods: CalculatedExclusionPeriod[] = [];

  for (const exclusion of exclusions) {
    const startDate = parseLocalDate(exclusion.startDate);
    const endDate = parseLocalDate(exclusion.endDate);

    if (startDate >= commencementDate) {
      const days = daysBetween(startDate, endDate) + 1; // Inclusive
      totalDays += days;
      periods.push({
        type: exclusion.type,
        startDate: startDate,
        endDate: endDate,
        days: days
      });
    }
  }

  return { totalDays, periods };
}

/**
 * Get the latest excluded period end date
 */
export function getLatestExclusionEndDate(exclusions: ExclusionPeriod[]): Date | null {
  if (!exclusions || exclusions.length === 0) {
    return null;
  }

  const sortedExclusions = [...exclusions].sort((a, b) =>
    parseLocalDate(b.endDate).getTime() - parseLocalDate(a.endDate).getTime()
  );
  return parseLocalDate(sortedExclusions[0].endDate);
}

/**
 * Main calculation function
 */
export function calculate(params: CalculatorParams): CalculationResults {
  const {
    arraignmentDate,
    custodyStatus,
    releaseDate,
    resets,
    exclusions,
    scheduledTrialDate,
    useCurePeriod
  } = params;

  const initialCommencementDate = parseLocalDate(arraignmentDate);
  const effectiveCommencementDate = getEffectiveCommencementDate(
    initialCommencementDate,
    resets
  );

  let baseTimeLimit = custodyStatus === 'detained' ? 60 : 90;
  let wasReleased = false;

  if (custodyStatus === 'detained' && releaseDate) {
    const release = parseLocalDate(releaseDate);
    const sixtyDayMark = addDays(effectiveCommencementDate, 60);

    if (release < sixtyDayMark) {
      baseTimeLimit = 90;
      wasReleased = true;
    }
  }

  const excludedInfo = calculateExcludedDays(effectiveCommencementDate, exclusions);
  const latestExclusionEnd = getLatestExclusionEndDate(exclusions);

  const baseDeadline = addDays(
    effectiveCommencementDate,
    baseTimeLimit + excludedInfo.totalDays
  );

  // Apply 30-day minimum rule after excluded period (section b)(5))
  let finalDeadline = baseDeadline;
  if (latestExclusionEnd) {
    const thirtyDaysAfterExclusion = addDays(latestExclusionEnd, 30);
    if (thirtyDaysAfterExclusion > finalDeadline) {
      finalDeadline = thirtyDaysAfterExclusion;
    }
  }

  // Apply CRLJ 6(a): If deadline falls on Saturday, Sunday, or legal holiday,
  // extend to next court business day per RCW 1.16.050
  finalDeadline = getNextCourtDay(finalDeadline);

  let cureDeadline: Date | null = null;
  let cureDays = 0;
  if (useCurePeriod) {
    cureDays = custodyStatus === 'detained' ? 14 : 28;
    // Apply CRLJ 6(a) court day adjustment to cure deadline as well
    cureDeadline = getNextCourtDay(addDays(finalDeadline, cureDays));
  }

  let isTimely: boolean | null = null;
  let daysUntilDeadline: number | null = null;
  if (scheduledTrialDate) {
    const trialDate = parseLocalDate(scheduledTrialDate);
    const applicableDeadline = useCurePeriod && cureDeadline ? cureDeadline : finalDeadline;
    isTimely = trialDate <= applicableDeadline;
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    daysUntilDeadline = daysBetween(todayMidnight, applicableDeadline);
  }

  return {
    initialCommencementDate,
    effectiveCommencementDate,
    baseTimeLimit,
    wasReleased,
    excludedDays: excludedInfo.totalDays,
    excludedPeriods: excludedInfo.periods,
    baseDeadline,
    finalDeadline,
    useCurePeriod,
    cureDays,
    cureDeadline,
    scheduledTrialDate: scheduledTrialDate ? parseLocalDate(scheduledTrialDate) : null,
    isTimely,
    daysUntilDeadline,
    resets: resets || []
  };
}

export const RESET_TYPE_LABELS = {
  'waiver': 'Waiver',
  'failure-to-appear': 'Failure to Appear',
  'new-trial': 'New Trial/Mistrial',
  'appellate-review': 'Appellate Review/Stay',
  'collateral': 'Collateral Proceeding',
  'venue-change': 'Change of Venue',
  'disqualification': 'Disqualification of Counsel',
  'deferred-prosecution': 'Deferred Prosecution'
} as const;

export const EXCLUSION_TYPE_LABELS = {
  'competency': 'Competency Proceedings',
  'unrelated': 'Proceedings on Unrelated Charges',
  'continuance': 'Continuance',
  'dismissal-refiling': 'Period Between Dismissal and Refiling',
  'related-charge': 'Disposition of Related Charge',
  'foreign-custody': 'Foreign or Federal Custody',
  'juvenile': 'Juvenile Proceedings',
  'unavoidable': 'Unavoidable/Unforeseen Circumstances',
  'judge-disqualification': 'Judge Disqualification'
} as const;

export type ResetType = keyof typeof RESET_TYPE_LABELS;
export type ExclusionType = keyof typeof EXCLUSION_TYPE_LABELS;

export const getResetTypeLabel = (type: string): string => RESET_TYPE_LABELS[type as ResetType] || type;
export const getExclusionTypeLabel = (type: string): string => EXCLUSION_TYPE_LABELS[type as ExclusionType] || type;

export const generateExportText = (
  formData: CalculatorParams,
  calculated: CalculationResults
): string => {
  let text = `${STRINGS.export.title}\n`;
  text += '='.repeat(50) + '\n\n';
  text += `${STRINGS.export.generated} ${new Date().toLocaleString()}\n\n`;
  text += `${STRINGS.export.arraignmentDate} ${formatDate(parseLocalDate(formData.arraignmentDate))}\n`;
  text += `${STRINGS.export.custodyStatus} ${formData.custodyStatus === 'detained' ? STRINGS.export.custodyDetained : STRINGS.export.custodyNotDetained}\n`;
  text += `${STRINGS.export.baseTimeLimit} ${calculated.baseTimeLimit} days\n\n`;

  if (calculated.resets.length > 0) {
    text += `${STRINGS.export.commencementResets}\n`;
    calculated.resets.forEach((reset, i) => {
      text += `  ${i + 1}. ${getResetTypeLabel(reset.type)} - ${formatDate(parseLocalDate(reset.date))}\n`;
    });
    text += '\n';
  }

  if (calculated.excludedPeriods.length > 0) {
    text += `${STRINGS.export.excludedPeriods}\n`;
    calculated.excludedPeriods.forEach((period, i) => {
      text += `  ${i + 1}. ${getExclusionTypeLabel(period.type)}\n`;
      text += `     ${formatDate(period.startDate)} to ${formatDate(period.endDate)} (${period.days} days)\n`;
    });
    text += `\n${STRINGS.export.totalExcludedDays} ${calculated.excludedDays}\n\n`;
  }

  const deadline = calculated.useCurePeriod && calculated.cureDeadline
    ? calculated.cureDeadline
    : calculated.finalDeadline;

  text += `${STRINGS.export.trialDeadline} ${formatDate(deadline)}\n`;

  if (calculated.useCurePeriod) {
    text += `${STRINGS.results.includesCurePeriod(calculated.cureDays)}\n`;
  }

  if (calculated.scheduledTrialDate) {
    text += `\n${STRINGS.export.scheduledTrial} ${formatDate(calculated.scheduledTrialDate)}\n`;
    text += `${STRINGS.export.status} ${calculated.isTimely ? STRINGS.export.timely : STRINGS.export.untimely}\n`;
  }

  return text;
};
