import DateInput from './DateInput';
import { EXCLUSION_TYPE_LABELS } from '../utils/trialCalculator';
import { STRINGS } from '../strings';
import { useDynamicList } from '../hooks/useDynamicList';
import type { ExclusionPeriod } from '../types';

interface ExclusionsSectionProps {
  exclusions: ExclusionPeriod[];
  onExclusionsChange: (exclusions: ExclusionPeriod[]) => void;
}

function ExclusionsSection({ exclusions, onExclusionsChange }: ExclusionsSectionProps) {
  const { addItem, removeItem, updateItem } = useDynamicList(exclusions, onExclusionsChange);

  const addExclusion = () => {
    addItem({ type: 'competency', startDate: '', endDate: '', notes: '' });
  };

  return (
    <section className="card">
      <h2>{STRINGS.sections.exclusions}</h2>
      <p className="info-text">{STRINGS.helpText.exclusionInfo}</p>

      <div id="exclusionsContainer">
        {exclusions.map((exclusion, index) => (
          <div key={exclusion.id} className="dynamic-field">
            <div className="field-header">
              <h4>{STRINGS.labels.excludedPeriodTitle(index + 1)}</h4>
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeItem(exclusion.id)}
                aria-label={`Remove exclusion period ${index + 1}`}
              >
                {STRINGS.buttons.remove}
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{STRINGS.labels.exclusionType}</label>
                <select
                  value={exclusion.type}
                  onChange={(e) => updateItem(exclusion.id, 'type', e.target.value)}
                >
                  {Object.entries(EXCLUSION_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{STRINGS.labels.startDate} <span className="required">{STRINGS.status.required}</span></label>
                <DateInput
                  value={exclusion.startDate}
                  onChange={(value) => updateItem(exclusion.id, 'startDate', value)}
                />
              </div>
              <div className="form-group">
                <label>{STRINGS.labels.endDate} <span className="required">{STRINGS.status.required}</span></label>
                <DateInput
                  value={exclusion.endDate}
                  onChange={(value) => updateItem(exclusion.id, 'endDate', value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>{STRINGS.labels.notes}</label>
              <input
                type="text"
                value={exclusion.notes}
                onChange={(e) => updateItem(exclusion.id, 'notes', e.target.value)}
                placeholder={STRINGS.placeholders.notes}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-secondary" onClick={addExclusion}>
        {STRINGS.buttons.addExclusion}
      </button>
    </section>
  );
}

export default ExclusionsSection;
