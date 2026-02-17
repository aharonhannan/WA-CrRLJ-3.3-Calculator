import { STRINGS } from '../strings';
import type { FormData, ResetEvent, ExclusionPeriod } from '../types';

export function validateCalculatorInput(
  formData: FormData,
  resets: ResetEvent[],
  exclusions: ExclusionPeriod[]
): { requiredErrors: string[]; validationErrors: string[] } {
  const requiredErrors: string[] = [];
  if (!formData.arraignmentDate) {
    requiredErrors.push('Arraignment Date');
  }
  if (!formData.custodyStatus) {
    requiredErrors.push('Custody Status');
  }

  const validationErrors: string[] = [];

  // Validate exclusion periods have both dates if any exclusion exists
  const incompleteExclusions = exclusions.filter(e => !e.startDate || !e.endDate);
  if (incompleteExclusions.length > 0) {
    validationErrors.push(STRINGS.errors.incompleteExclusion);
  }

  // Validate exclusion date ranges (end date must be >= start date)
  exclusions.forEach((exclusion, index) => {
    if (exclusion.startDate && exclusion.endDate && new Date(exclusion.endDate) < new Date(exclusion.startDate)) {
      validationErrors.push(STRINGS.errors.exclusionEndBeforeStart(index + 1));
    }
  });

  // Validate reset dates are filled
  const incompleteResets = resets.filter(r => !r.date);
  if (incompleteResets.length > 0) {
    validationErrors.push(STRINGS.errors.incompleteReset);
  }

  // Date order validations
  const arraignmentDate = new Date(formData.arraignmentDate);

  // Validate release date is not before arraignment
  if (formData.releaseDate && new Date(formData.releaseDate) < arraignmentDate) {
    validationErrors.push(STRINGS.errors.releaseBeforeArraignment);
  }

  // Validate reset dates are not before arraignment
  resets.forEach((reset, index) => {
    if (reset.date && new Date(reset.date) < arraignmentDate) {
      validationErrors.push(STRINGS.errors.resetBeforeArraignment(index + 1));
    }
  });

  // Validate exclusion start dates are not before arraignment
  exclusions.forEach((exclusion, index) => {
    if (exclusion.startDate && new Date(exclusion.startDate) < arraignmentDate) {
      validationErrors.push(STRINGS.errors.exclusionBeforeArraignment(index + 1));
    }
  });

  return { requiredErrors, validationErrors };
}
