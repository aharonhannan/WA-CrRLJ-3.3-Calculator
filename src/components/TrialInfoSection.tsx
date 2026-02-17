import DateInput from './DateInput';
import { STRINGS } from '../strings';
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
      <h2>{STRINGS.sections.trialInfo}</h2>

      <div className="form-group">
        <label htmlFor="trialDate">{STRINGS.labels.scheduledTrialDate}</label>
        <DateInput
          id="trialDate"
          value={formData.scheduledTrialDate}
          onChange={handleTrialDateChange}
          isClearable
        />
        <small>{STRINGS.helpText.scheduledTrial}</small>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.useCurePeriod}
            onChange={(e) => onFormChange({ ...formData, useCurePeriod: e.target.checked })}
          />
          {STRINGS.labels.useCurePeriod}
        </label>
        <small>{STRINGS.helpText.curePeriod}</small>
      </div>
    </section>
  );
}

export default TrialInfoSection;
