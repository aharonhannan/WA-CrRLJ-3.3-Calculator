import DateInput from './DateInput';
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
      <h2>1. Basic Information</h2>
      <div className="form-group">
        <label htmlFor="arraignmentDate">
          Arraignment Date (Initial Commencement Date): <span className="required">*</span>
        </label>
        <DateInput
          id="arraignmentDate"
          name="arraignmentDate"
          value={formData.arraignmentDate}
          onChange={handleArraignmentDateChange}
          required
          aria-required="true"
        />
        <small>The date determined under CrRLJ 4.1(b)</small>
      </div>

      <div className="form-group">
        <label>
          Defendant&apos;s Custody Status: <span className="required">*</span>
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
            <span>Detained in Jail (60-day limit)</span>
          </label>
          <label className={`radio-label ${formData.custodyStatus === 'not-detained' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="custodyStatus"
              value="not-detained"
              checked={formData.custodyStatus === 'not-detained'}
              onChange={() => handleCustodyChange('not-detained')}
            />
            <span>Not Detained in Jail (90-day limit)</span>
          </label>
        </div>
        <small>If released before 60-day limit expires, the limit extends to 90 days</small>
      </div>

      {formData.custodyStatus === 'detained' && (
        <div className="form-group">
          <label htmlFor="releaseDate">Date Released from Jail (if applicable):</label>
          <DateInput
            id="releaseDate"
            value={formData.releaseDate}
            onChange={handleReleaseDateChange}
            isClearable
          />
          <small>If released before the 60-day limit expired, the limit extends to 90 days</small>
        </div>
      )}
    </section>
  );
}

export default BasicInfoSection;
