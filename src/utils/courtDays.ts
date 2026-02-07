/**
 * Washington State Court Day Calculations
 *
 * Implements CRLJ 6(a) time computation rules and RCW 1.16.050 legal holidays.
 *
 * References:
 * - CRLJ 6(a): Time computation rules for court deadlines
 * - RCW 1.16.050: Washington State legal holidays
 *   https://app.leg.wa.gov/rcw/default.aspx?cite=1.16.050
 */

/**
 * Get the Nth occurrence of a weekday in a given month
 * @param year - The year
 * @param month - The month (0-indexed, 0 = January)
 * @param weekday - Day of week (0 = Sunday, 1 = Monday, etc.)
 * @param n - Which occurrence (1 = first, 2 = second, etc.)
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();

  // Calculate days until the first occurrence of the target weekday
  let daysUntilFirst = weekday - firstWeekday;
  if (daysUntilFirst < 0) {
    daysUntilFirst += 7;
  }

  // Calculate the date of the Nth occurrence
  const day = 1 + daysUntilFirst + (n - 1) * 7;
  return new Date(year, month, day);
}

/**
 * Get the last occurrence of a weekday in a given month
 * @param year - The year
 * @param month - The month (0-indexed)
 * @param weekday - Day of week (0 = Sunday, 1 = Monday, etc.)
 */
function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  // Start from the last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const lastWeekday = lastDay.getDay();

  // Calculate days back to the target weekday
  let daysBack = lastWeekday - weekday;
  if (daysBack < 0) {
    daysBack += 7;
  }

  return new Date(year, month + 1, -daysBack);
}

/**
 * Apply weekend observance rules per RCW 1.16.050:
 * - Holiday on Saturday → observed on preceding Friday
 * - Holiday on Sunday → observed on following Monday
 */
function getObservedDate(date: Date): Date {
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 6) {
    // Saturday → Friday
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  } else if (dayOfWeek === 0) {
    // Sunday → Monday
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  }

  return date;
}

/**
 * Get all Washington State legal holidays for a given year.
 * Returns the actual observed dates (accounting for weekend observance rules).
 *
 * Per RCW 1.16.050, the legal holidays are:
 * 1. Sunday (handled separately in isCourtDay)
 * 2. New Year's Day - January 1
 * 3. MLK Jr. Day - Third Monday in January
 * 4. Presidents' Day - Third Monday in February
 * 5. Memorial Day - Last Monday in May
 * 6. Juneteenth - June 19
 * 7. Independence Day - July 4
 * 8. Labor Day - First Monday in September
 * 9. Veterans Day - November 11
 * 10. Thanksgiving Day - Fourth Thursday in November
 * 11. Native American Heritage Day - Friday after Thanksgiving
 * 12. Christmas Day - December 25
 */
function getWashingtonHolidays(year: number): Date[] {
  const holidays: Date[] = [];

  // Fixed date holidays (apply weekend observance)
  const fixedHolidays = [
    new Date(year, 0, 1),   // New Year's Day - Jan 1
    new Date(year, 5, 19),  // Juneteenth - Jun 19
    new Date(year, 6, 4),   // Independence Day - Jul 4
    new Date(year, 10, 11), // Veterans Day - Nov 11
    new Date(year, 11, 25), // Christmas Day - Dec 25
  ];

  for (const holiday of fixedHolidays) {
    holidays.push(getObservedDate(holiday));
  }

  // Calculated holidays (always fall on weekdays, no observance needed)
  holidays.push(getNthWeekdayOfMonth(year, 0, 1, 3));  // MLK Day - 3rd Monday Jan
  holidays.push(getNthWeekdayOfMonth(year, 1, 1, 3));  // Presidents' Day - 3rd Monday Feb
  holidays.push(getLastWeekdayOfMonth(year, 4, 1));    // Memorial Day - Last Monday May
  holidays.push(getNthWeekdayOfMonth(year, 8, 1, 1));  // Labor Day - 1st Monday Sep

  const thanksgiving = getNthWeekdayOfMonth(year, 10, 4, 4); // Thanksgiving - 4th Thursday Nov
  holidays.push(thanksgiving);

  // Native American Heritage Day - Friday after Thanksgiving
  const nativeAmericanHeritageDay = new Date(thanksgiving);
  nativeAmericanHeritageDay.setDate(thanksgiving.getDate() + 1);
  holidays.push(nativeAmericanHeritageDay);

  return holidays;
}

/**
 * Check if a date is a Washington State legal holiday.
 * Compares only the date portion (year, month, day), ignoring time.
 */
function isLegalHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getWashingtonHolidays(year);

  // Normalize the input date to midnight for comparison
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return holidays.some(holiday =>
    holiday.getFullYear() === normalizedDate.getFullYear() &&
    holiday.getMonth() === normalizedDate.getMonth() &&
    holiday.getDate() === normalizedDate.getDate()
  );
}

/**
 * Check if a date is a court business day.
 * A court day is a day that is NOT:
 * - Saturday
 * - Sunday
 * - A legal holiday per RCW 1.16.050
 */
function isCourtDay(date: Date): boolean {
  const dayOfWeek = date.getDay();

  // Saturday (6) or Sunday (0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  return !isLegalHoliday(date);
}

/**
 * Get the next court business day on or after the given date.
 *
 * Per CRLJ 6(a): "The last day of the period so computed shall be included,
 * unless it is a Saturday, a Sunday, or a legal holiday, in which event the
 * period runs until the end of the next day which is neither a Saturday,
 * a Sunday, nor a legal holiday."
 *
 * This function rolls forward from the given date until a court day is found.
 */
export function getNextCourtDay(date: Date): Date {
  let current = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Safety limit to prevent infinite loops (max 14 days should cover any scenario)
  const maxIterations = 14;
  let iterations = 0;

  while (!isCourtDay(current) && iterations < maxIterations) {
    current.setDate(current.getDate() + 1);
    iterations++;
  }

  return current;
}

