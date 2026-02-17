import DateInput from './DateInput';
import { STRINGS } from '../strings';
import type { FormData, CustodyStatus } from '../types';

interface BasicInfoSectionProps {
  formData: FormData;
  onFormChange: (data: FormData) => void;
}

function BasicInfoSection({ formData, onFormChange }: BasicInfoSectionProps) {
  const handleCustodyChange = (value: CustodyStatus) => {
    onFormChange({
      ...formData,
      custodyStatus: value,
      releaseDate: value === 'not-detained' ? '' : formData.releaseDate
    });
  };

  const handleArraignmentDateChange = (value: string) => {
    onFormChange({ ...formData, arraignmentDate: value });
  };

  const handleReleaseDateChange = (value: string) => {
    onFormChange({ ...formData, releaseDate: value });
  };

  return (
    <section className="card">
      <h2>{STRINGS.sections.basicInfo}</h2>
      <div className="form-group">
        <label htmlFor="arraignmentDate">
          {STRINGS.labels.arraignmentDate} <span className="required">{STRINGS.status.required}</span>
        </label>
        <DateInput
          id="arraignmentDate"
          value={formData.arraignmentDate}
          onChange={handleArraignmentDateChange}
        />
        <small>{STRINGS.helpText.arraignmentDate}</small>
      </div>

      <div className="form-group">
        <label>
          {STRINGS.labels.custodyStatus} <span className="required">{STRINGS.status.required}</span>
        </label>
        <div className="radio-group">
          <label className={`radio-label ${formData.custodyStatus === 'detained' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="custodyStatus"
              value="detained"
              checked={formData.custodyStatus === 'detained'}
              onChange={() => handleCustodyChange('detained')}
            />
            <span>{STRINGS.helpText.custodyDetained}</span>
          </label>
          <label className={`radio-label ${formData.custodyStatus === 'not-detained' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="custodyStatus"
              value="not-detained"
              checked={formData.custodyStatus === 'not-detained'}
              onChange={() => handleCustodyChange('not-detained')}
            />
            <span>{STRINGS.helpText.custodyNotDetained}</span>
          </label>
        </div>
        <small>{STRINGS.helpText.releaseExtension}</small>
      </div>

      {formData.custodyStatus === 'detained' && (
        <div className="form-group">
          <label htmlFor="releaseDate">{STRINGS.labels.releaseDate}</label>
          <DateInput
            id="releaseDate"
            value={formData.releaseDate}
            onChange={handleReleaseDateChange}
            isClearable
          />
          <small>{STRINGS.helpText.releaseExtension}</small>
        </div>
      )}
    </section>
  );
}

export default BasicInfoSection;
