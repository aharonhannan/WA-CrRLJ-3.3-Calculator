// Centralized UI strings for the CrRLJ 3.3 Calculator
// This allows for easy modification and potential localization

export const STRINGS = {
  // Application Info
  app: {
    pdfLink: 'View CrRLJ 3.3 Rule (PDF)',
    pdfNote: 'Note: Laws may change. Always verify with the current rule.',
    subtitle: 'Washington State Criminal Court - Speedy Trial Deadline Calculator',
    title: 'CrRLJ 3.3 Time for Trial Calculator',
    version: 'Based on CrRLJ 3.3 (Effective July 9, 2024)',
  },

  // Buttons
  buttons: {
    addExclusion: '+ Add Exclusion Period',
    addReset: '+ Add Commencement Date Reset',
    calculate: 'Calculate Trial Deadline',
    cancel: 'Cancel',
    clearForm: 'Clear Form',
    close: 'Close',
    confirm: 'Confirm',
    delete: 'Delete',
    export: 'Export as Text',
    exportText: 'Export to Text',
    load: 'Load',
    ok: 'OK',
    print: 'Print Results',
    remove: '✕ Remove',
    save: 'Save Session',
  },

  // Confirmation Messages
  confirm: {
    areYouSure: 'Are you sure?',
    deleteSession: (name: string) => `Are you sure you want to delete "${name}"?`,
    overwriteSession: (name: string) => `A session named "${name}" already exists. Do you want to overwrite it?`,
  },

  // Disclaimer
  disclaimer: {
    localStorage: 'All saved sessions are stored locally on your device and are never transmitted to any server.',
    text: 'This calculator is provided for informational purposes only and does not constitute legal advice. Always verify calculations and consult the current version of CrRLJ 3.3 and relevant case law. Court deadlines may vary based on specific circumstances not captured by this calculator.',
    title: 'Disclaimer:',
  },

  // Error Messages
  errors: {
    exclusionBeforeArraignment: (exclusionNum: number) => `Excluded Period ${exclusionNum}: Start date cannot be before arraignment`,
    exclusionEndBeforeStart: (exclusionNum: number) => `Excluded Period ${exclusionNum}: End date must be on or after start date`,
    incompleteExclusion: 'All exclusion periods must have both start and end dates',
    incompleteReset: 'All reset events must have a date',
    loadError: 'Failed to load session.',
    releaseBeforeArraignment: 'Release date cannot be before arraignment date',
    requiredFields: (fields: string[]) => `Please complete the following required fields: ${fields.join(', ')}`,
    resetBeforeArraignment: (resetNum: number) => `Reset Event ${resetNum}: Date cannot be before arraignment`,
    saveError: 'Failed to save session. Please try again.',
    sessionNameRequired: 'Please enter a name for the session.',
    validationErrors: (errors: string[]) => `Please fix the following issues:\n\n• ${errors.join('\n• ')}`,
  },

  // Export Text
  export: {
    arraignmentDate: 'Arraignment Date:',
    baseTimeLimit: 'Base Time Limit:',
    commencementResets: 'COMMENCEMENT DATE RESETS:',
    custodyDetained: 'Detained in Jail',
    custodyNotDetained: 'Not Detained in Jail',
    custodyStatus: 'Custody Status:',
    excludedPeriods: 'EXCLUDED PERIODS:',
    generated: 'Generated:',
    scheduledTrial: 'Scheduled Trial:',
    status: 'Status:',
    timely: 'TIMELY',
    title: 'WA CrRLJ 3.3 TIME FOR TRIAL CALCULATION',
    totalExcludedDays: 'Total Excluded Days:',
    trialDeadline: 'TRIAL DEADLINE:',
    untimely: 'UNTIMELY',
  },

  // Form Help Text
  helpText: {
    arraignmentDate: 'The date determined under CrRLJ 4.1(b)',
    curePeriod: 'Extends deadline by 14 days (detained) or 28 days (not detained). Can only be used once per case.',
    custodyDetained: 'Detained in Jail (60-day limit)',
    custodyNotDetained: 'Not Detained in Jail (90-day limit)',
    exclusionInfo: 'Add any time periods that are excluded from the speedy trial calculation:',
    releaseExtension: 'If released before the 60-day limit expired, the limit extends to 90 days',
    resetInfo: 'Add any events that reset the commencement date and elapsed time to zero:',
    scheduledTrial: "Enter the currently scheduled trial date to check if it's within the allowable time",
  },

  // Form Labels
  labels: {
    arraignmentDate: 'Arraignment Date (Initial Commencement Date):',
    custodyStatus: "Defendant's Custody Status:",
    endDate: 'End Date:',
    excludedPeriodTitle: (n: number) => `Excluded Period ${n}`,
    exclusionType: 'Exclusion Type:',
    newCommencementDate: 'New Commencement Date:',
    notes: 'Notes:',
    releaseDate: 'Date Released from Jail (if applicable):',
    resetEventTitle: (n: number) => `Reset Event ${n}`,
    resetType: 'Reset Type:',
    scheduledTrialDate: 'Scheduled Trial Date:',
    sessionName: 'Session Name:',
    startDate: 'Start Date:',
    useCurePeriod: 'Apply Cure Period (if trial limit has expired)',
  },

  placeholders: {
    notes: 'Additional details...',
    sessionName: 'Enter a name for this session...',
  },

  results: {
    appliedExtends: 'Applied (extends deadline)',
    baseCalculation: 'Base Calculation',
    baseDeadline: 'Base Deadline',
    baseTimeLimit: 'Base Time Limit',
    calculationBreakdown: 'Calculation Breakdown',
    component: 'Component',
    cureDeadlineLabel: 'Cure Period Deadline',
    days: 'days',
    daysUntilDeadline: 'Days Until Deadline:',
    detailsHeader: 'Details',
    detainedInJail: 'detained in jail',
    effectiveCommencementDate: 'Effective Commencement Date',
    excludedDays: 'Total Excluded Days',
    finalDeadline: 'Final Trial Deadline',
    includesCurePeriod: (days: number) => `(Includes ${days}-day cure period)`,
    initialCommencementDate: 'Initial Commencement Date',
    notDetainedInJail: 'not detained in jail',
    notNeeded: 'Not needed (base deadline is later)',
    scheduledTrial: 'Scheduled Trial:',
    thirtyDayRule: '30-Day Minimum Applied',
    trialDeadline: 'Trial Deadline:',
    withCurePeriod: 'With Cure Period',
  },

  // Saved Sessions
  savedSessions: {
    empty: 'No saved sessions yet. Save your current form to access it later.',
  },

  // Section Headers
  sections: {
    basicInfo: '1. Basic Information',
    calculationDetails: 'Calculation Details',
    exclusions: '3. Excluded Periods',
    resets: '2. Commencement Date Resets',
    results: 'Calculation Results',
    savedSessions: 'Saved Sessions',
    timeline: 'Timeline',
    trialInfo: '4. Trial Information',
  },

  status: {
    required: '*',
    timely: '✓ TIMELY',
    untimely: '✗ UNTIMELY',
  },

  // Success Messages
  success: {
    sessionDeleted: 'Session deleted.',
    sessionLoaded: 'Session loaded successfully.',
    sessionSaved: 'Session saved successfully.',
  },

  // Timeline Labels
  timeline: {
    cureDeadlineDesc: (cureDays: number) => `Extended by ${cureDays} days (one-time extension)`,
    cureDeadlineTitle: 'Cure Period Deadline',
    deadline: 'Deadline',
    deadlineDesc: (baseLimit: number, excludedDays: number) => `${baseLimit} days + ${excludedDays} excluded days`,
    excludedPeriodTitle: (days: number) => `Excluded Period (${days} days)`,
    exclusion: 'Exclusion',
    initialArraignment: 'Initial Arraignment',
    initialCommencementDesc: 'Initial commencement date',
    outsideTime: 'OUTSIDE ALLOWABLE TIME',
    reset: 'Reset',
    resetTitle: 'Commencement Date Reset',
    scheduledTrial: 'Scheduled Trial',
    start: 'Start',
    statusChangeDesc: 'Defendant released from jail before 60-day limit expired. Time limit extended to 90 days.',
    statusChangeTitle: 'Status Change',
    trial: 'Trial',
    trialDeadline: 'Trial Deadline',
    withinTime: 'Within allowable time',
  },
} as const;

export default STRINGS;
