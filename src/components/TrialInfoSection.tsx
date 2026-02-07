import type { FormData } from '../types';

interface TrialInfoSectionProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
}

function TrialInfoSection({ formData, onFormChange }: TrialInfoSectionProps) {
  const handleTrialDateChange = (value: string) => {
    onFormChange({ ...formData, scheduledTrialDate: value });
  };

  return (
    <section className="card">
      <h2>4. Trial Information</h2>

      <div className="form-group">
        <label htmlFor="trialDate">Scheduled Trial Date:</label>
        <input
          type="date"
          id="trialDate"
          value={formData.scheduledTrialDate}
          onChange={(e) => handleTrialDateChange(e.target.value)}
        />
        <small>Enter the currently scheduled trial date to check if it&apos;s within the allowable time</small>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.useCurePeriod}
            onChange={(e) => onFormChange({ ...formData, useCurePeriod: e.target.checked })}
          />
          Apply Cure Period (if trial limit has expired)
        </label>
        <small>Extends deadline by 14 days (detained) or 28 days (not detained). Can only be used once per case.</small>
      </div>
    </section>
  );
}

export default TrialInfoSection;
