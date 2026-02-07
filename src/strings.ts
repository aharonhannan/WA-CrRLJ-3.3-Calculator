// Centralized UI strings for the CrRLJ 3.3 Calculator
// This allows for easy modification and potential localization

export const STRINGS = {
  // Application Info
  app: {
    title: 'CrRLJ 3.3 Time for Trial Calculator',
    subtitle: 'Washington State Criminal Court - Speedy Trial Deadline Calculator',
    version: 'Based on CrRLJ 3.3 (Effective July 9, 2024)',
    pdfLink: 'View CrRLJ 3.3 Rule (PDF)',
    pdfNote: 'Note: Laws may change. Always verify with the current rule.',
  },

  // Disclaimer
  disclaimer: {
    title: 'Disclaimer:',
    text: 'This calculator is provided for informational purposes only and does not constitute legal advice. Always verify calculations and consult the current version of CrRLJ 3.3 and relevant case law. Court deadlines may vary based on specific circumstances not captured by this calculator.',
    localStorage: 'All saved sessions are stored locally on your device and are never transmitted to any server.',
  },

  // Section Headers
  sections: {
    basicInfo: '1. Basic Information',
    resets: '2. Commencement Date Resets',
    exclusions: '3. Excluded Periods',
    trialInfo: '4. Trial Information',
    results: 'Calculation Results',
    timeline: 'Timeline',
    calculationDetails: 'Calculation Details',
    savedSessions: 'Saved Sessions',
  },

  // Form Labels
  labels: {
    arraignmentDate: 'Arraignment Date (Initial Commencement Date):',
    custodyStatus: "Defendant's Custody Status:",
    releaseDate: 'Date Released from Jail (if applicable):',
    scheduledTrialDate: 'Scheduled Trial Date:',
    useCurePeriod: 'Apply Cure Period (if trial limit has expired)',
    resetType: 'Reset Type:',
    newCommencementDate: 'New Commencement Date:',
    exclusionType: 'Exclusion Type:',
    startDate: 'Start Date:',
    endDate: 'End Date:',
    notes: 'Notes:',
    sessionName: 'Session Name:',
  },

  // Form Help Text
  helpText: {
    arraignmentDate: 'The date determined under CrRLJ 4.1(b)',
    custodyDetained: 'Detained in Jail (60-day limit)',
    custodyNotDetained: 'Not Detained in Jail (90-day limit)',
    releaseExtension: 'If released before the 60-day limit expired, the limit extends to 90 days',
    scheduledTrial: "Enter the currently scheduled trial date to check if it's within the allowable time",
    curePeriod: 'Extends deadline by 14 days (detained) or 28 days (not detained). Can only be used once per case.',
    resetInfo: 'Add any events that reset the commencement date and elapsed time to zero:',
    exclusionInfo: 'Add any time periods that are excluded from the speedy trial calculation:',
  },

  // Buttons
  buttons: {
    calculate: 'Calculate Trial Deadline',
    clearForm: 'Clear Form',
    addReset: '+ Add Commencement Date Reset',
    addExclusion: '+ Add Exclusion Period',
    remove: '✕ Remove',
    print: 'Print Results',
    export: 'Export as Text',
    save: 'Save Session',
    load: 'Load',
    delete: 'Delete',
    close: 'Close',
    ok: 'OK',
    cancel: 'Cancel',
  },

  // Placeholders
  placeholders: {
    notes: 'Additional details...',
    sessionName: 'Enter a name for this session...',
  },

  // Status Labels
  status: {
    timely: '✓ TIMELY',
    untimely: '✗ UNTIMELY',
    required: '*',
  },

  // Result Labels
  results: {
    trialDeadline: 'Trial Deadline:',
    daysUntilDeadline: 'Days Until Deadline:',
    days: 'days',
    initialCommencementDate: 'Initial Commencement Date',
    effectiveCommencementDate: 'Effective Commencement Date',
    baseTimeLimit: 'Base Time Limit',
    excludedDays: 'Total Excluded Days',
    baseDeadline: 'Base Deadline',
    thirtyDayRule: '30-Day Minimum Applied',
    cureDeadlineLabel: 'Cure Period Deadline',
    finalDeadline: 'Final Trial Deadline',
    scheduledTrial: 'Scheduled Trial:',
    includesCurePeriod: (days: number) => `(Includes ${days}-day cure period)`,
  },

  // Timeline Labels
  timeline: {
    start: 'Start',
    deadline: 'Deadline',
    reset: 'Reset',
    exclusion: 'Exclusion',
    trial: 'Trial',
  },

  // Error Messages
  errors: {
    requiredFields: (fields: string[]) => `Please complete the following required fields: ${fields.join(', ')}`,
    validationErrors: (errors: string[]) => `Please fix the following issues:\n\n• ${errors.join('\n• ')}`,
    saveError: 'Failed to save session. Please try again.',
    loadError: 'Failed to load session.',
    sessionNameRequired: 'Please enter a name for the session.',
    resetBeforeArraignment: (resetNum: number) => `Reset Event ${resetNum}: Date cannot be before arraignment`,
    exclusionBeforeArraignment: (exclusionNum: number) => `Excluded Period ${exclusionNum}: Start date cannot be before arraignment`,
    releaseBeforeArraignment: 'Release date cannot be before arraignment date',
    exclusionEndBeforeStart: (exclusionNum: number) => `Excluded Period ${exclusionNum}: End date must be on or after start date`,
    incompleteExclusion: 'All exclusion periods must have both start and end dates',
    incompleteReset: 'All reset events must have a date',
  },

  // Confirmation Messages
  confirm: {
    deleteSession: (name: string) => `Are you sure you want to delete "${name}"?`,
    overwriteSession: (name: string) => `A session named "${name}" already exists. Do you want to overwrite it?`,
  },

  // Success Messages
  success: {
    sessionSaved: 'Session saved successfully.',
    sessionLoaded: 'Session loaded successfully.',
    sessionDeleted: 'Session deleted.',
  },

  // Export Text
  export: {
    title: 'WA CrRLJ 3.3 TIME FOR TRIAL CALCULATION',
    generated: 'Generated:',
    commencementResets: 'COMMENCEMENT DATE RESETS:',
    excludedPeriods: 'EXCLUDED PERIODS:',
    totalExcludedDays: 'Total Excluded Days:',
    trialDeadline: 'TRIAL DEADLINE:',
    custodyDetained: 'Detained in Jail',
    custodyNotDetained: 'Not Detained in Jail',
  },
} as const;

export default STRINGS;
