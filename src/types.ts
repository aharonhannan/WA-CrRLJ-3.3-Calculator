// Custody Status Type
export type CustodyStatus = '' | 'detained' | 'not-detained';

// Form Data Types
export interface FormData {
  arraignmentDate: string;
  custodyStatus: CustodyStatus;
  releaseDate: string;
  scheduledTrialDate: string;
  useCurePeriod: boolean;
}

// Reset Event
export interface ResetEvent {
  id: number;
  type: string;
  date: string;
  notes: string;
}

// Exclusion Period
export interface ExclusionPeriod {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  notes: string;
}

// Calculated Exclusion Period (with days computed)
export interface CalculatedExclusionPeriod {
  type: string;
  startDate: Date;
  endDate: Date;
  days: number;
}

// Calculator Input Parameters
export interface CalculatorParams {
  arraignmentDate: string;
  custodyStatus: CustodyStatus;
  releaseDate: string;
  resets: ResetEvent[];
  exclusions: ExclusionPeriod[];
  scheduledTrialDate: string;
  useCurePeriod: boolean;
}

// Calculator Results
export interface CalculationResults {
  initialCommencementDate: Date;
  effectiveCommencementDate: Date;
  baseTimeLimit: number;
  wasReleased: boolean;
  excludedDays: number;
  excludedPeriods: CalculatedExclusionPeriod[];
  baseDeadline: Date;
  finalDeadline: Date;
  useCurePeriod: boolean;
  cureDays: number;
  cureDeadline: Date | null;
  scheduledTrialDate: Date | null;
  isTimely: boolean | null;
  daysUntilDeadline: number | null;
  resets: ResetEvent[];
}

// Message Overlay Types
export type MessageType = 'info' | 'error' | 'confirm';

export interface Message {
  text: string;
  type: MessageType;
}
