import { RESET_TYPE_LABELS } from '../utils/trialCalculator';
import type { ResetEvent } from '../types';

interface ResetsSectionProps {
  resets: ResetEvent[];
  onResetsChange: (resets: ResetEvent[]) => void;
}

function ResetsSection({ resets, onResetsChange }: ResetsSectionProps) {
  const addReset = () => {
    const newReset: ResetEvent = {
      id: Date.now(),
      type: 'waiver',
      date: '',
      notes: ''
    };
    onResetsChange([...resets, newReset]);
  };

  const removeReset = (id: number) => {
    onResetsChange(resets.filter(reset => reset.id !== id));
  };

  const updateReset = (id: number, field: keyof ResetEvent, value: string) => {
    onResetsChange(resets.map(reset =>
      reset.id === id ? { ...reset, [field]: value } : reset
    ));
  };

  return (
    <section className="card">
      <h2>2. Commencement Date Resets</h2>
      <p className="info-text">Add any events that reset the commencement date and elapsed time to zero:</p>

      <div id="resetsContainer">
        {resets.map((reset, index) => (
          <div key={reset.id} className="dynamic-field">
            <div className="field-header">
              <h4>Reset Event {index + 1}</h4>
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeReset(reset.id)}
                aria-label={`Remove reset event ${index + 1}`}
              >
                ✕ Remove
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Reset Type:</label>
                <select
                  value={reset.type}
                  onChange={(e) => updateReset(reset.id, 'type', e.target.value)}
                >
                  {Object.entries(RESET_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>New Commencement Date: <span className="required">*</span></label>
                <input
                  type="date"
                  value={reset.date}
                  onChange={(e) => updateReset(reset.id, 'date', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <input
                type="text"
                value={reset.notes}
                onChange={(e) => updateReset(reset.id, 'notes', e.target.value)}
                placeholder="Additional details..."
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-secondary" onClick={addReset}>
        + Add Commencement Date Reset
      </button>
    </section>
  );
}

export default ResetsSection;
