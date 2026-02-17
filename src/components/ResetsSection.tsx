import DateInput from './DateInput';
import { RESET_TYPE_LABELS } from '../utils/trialCalculator';
import { STRINGS } from '../strings';
import { useDynamicList } from '../hooks/useDynamicList';
import type { ResetEvent } from '../types';

interface ResetsSectionProps {
  resets: ResetEvent[];
  onResetsChange: (resets: ResetEvent[]) => void;
}

function ResetsSection({ resets, onResetsChange }: ResetsSectionProps) {
  const { addItem, removeItem, updateItem } = useDynamicList(resets, onResetsChange);

  const addReset = () => {
    addItem({ type: 'waiver', date: '', notes: '' });
  };

  return (
    <section className="card">
      <h2>{STRINGS.sections.resets}</h2>
      <p className="info-text">{STRINGS.helpText.resetInfo}</p>

      <div id="resetsContainer">
        {resets.map((reset, index) => (
          <div key={reset.id} className="dynamic-field">
            <div className="field-header">
              <h4>{STRINGS.labels.resetEventTitle(index + 1)}</h4>
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeItem(reset.id)}
                aria-label={`Remove reset event ${index + 1}`}
              >
                {STRINGS.buttons.remove}
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{STRINGS.labels.resetType}</label>
                <select
                  value={reset.type}
                  onChange={(e) => updateItem(reset.id, 'type', e.target.value)}
                >
                  {Object.entries(RESET_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{STRINGS.labels.newCommencementDate} <span className="required">{STRINGS.status.required}</span></label>
                <DateInput
                  value={reset.date}
                  onChange={(value) => updateItem(reset.id, 'date', value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>{STRINGS.labels.notes}</label>
              <input
                type="text"
                value={reset.notes}
                onChange={(e) => updateItem(reset.id, 'notes', e.target.value)}
                placeholder={STRINGS.placeholders.notes}
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-secondary" onClick={addReset}>
        {STRINGS.buttons.addReset}
      </button>
    </section>
  );
}

export default ResetsSection;
