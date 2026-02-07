import { EXCLUSION_TYPE_LABELS } from '../utils/trialCalculator';
import type { ExclusionPeriod } from '../types';

interface ExclusionsSectionProps {
  exclusions: ExclusionPeriod[];
  onExclusionsChange: (exclusions: ExclusionPeriod[]) => void;
}

function ExclusionsSection({ exclusions, onExclusionsChange }: ExclusionsSectionProps) {
  const addExclusion = () => {
    const newExclusion: ExclusionPeriod = {
      id: Date.now(),
      type: 'competency',
      startDate: '',
      endDate: '',
      notes: ''
    };
    onExclusionsChange([...exclusions, newExclusion]);
  };

  const removeExclusion = (id: number) => {
    onExclusionsChange(exclusions.filter(exclusion => exclusion.id !== id));
  };

  const updateExclusion = (id: number, field: keyof ExclusionPeriod, value: string) => {
    onExclusionsChange(exclusions.map(exclusion =>
      exclusion.id === id ? { ...exclusion, [field]: value } : exclusion
    ));
  };

  return (
    <section className="card">
      <h2>3. Excluded Periods</h2>
      <p className="info-text">Add any periods that should be excluded from the time calculation:</p>

      <div id="exclusionsContainer">
        {exclusions.map((exclusion, index) => (
          <div key={exclusion.id} className="dynamic-field">
            <div className="field-header">
              <h4>Excluded Period {index + 1}</h4>
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeExclusion(exclusion.id)}
                aria-label={`Remove exclusion period ${index + 1}`}
              >
                ✕ Remove
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Exclusion Type:</label>
                <select
                  value={exclusion.type}
                  onChange={(e) => updateExclusion(exclusion.id, 'type', e.target.value)}
                >
                  {Object.entries(EXCLUSION_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date: <span className="required">*</span></label>
                <input
                  type="date"
                  value={exclusion.startDate}
                  onChange={(e) => updateExclusion(exclusion.id, 'startDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date: <span className="required">*</span></label>
                <input
                  type="date"
                  value={exclusion.endDate}
                  onChange={(e) => updateExclusion(exclusion.id, 'endDate', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <input
                type="text"
                value={exclusion.notes}
                onChange={(e) => updateExclusion(exclusion.id, 'notes', e.target.value)}
                placeholder="Additional details..."
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-secondary" onClick={addExclusion}>
        + Add Excluded Period
      </button>
    </section>
  );
}

export default ExclusionsSection;
