import { formatDate } from '../../utils/trialCalculator';
import { STRINGS } from '../../strings';
import type { CalculationResults } from '../../types';

interface ResultSummaryProps {
  results: CalculationResults;
}

function ResultSummary({ results }: ResultSummaryProps) {
  const applicableDeadline = results.useCurePeriod && results.cureDeadline
    ? results.cureDeadline
    : results.finalDeadline;

  return (
    <div className="result-box">
      {results.scheduledTrialDate && (
        <div className={`result-status ${results.isTimely ? 'status-timely' : 'status-untimely'}`}>
          <h3>{results.isTimely ? STRINGS.status.timely : STRINGS.status.untimely}</h3>
          <p>{STRINGS.results.scheduledTrial} {formatDate(results.scheduledTrialDate)}</p>
        </div>
      )}

      <div className="deadline-info">
        <div className="deadline-item">
          <label>{STRINGS.results.trialDeadline}</label>
          <span className="deadline-date">{formatDate(applicableDeadline)}</span>
        </div>
        {results.daysUntilDeadline !== null && (
          <div className="deadline-item">
            <label>{STRINGS.results.daysUntilDeadline}</label>
            <span className="days-count">{results.daysUntilDeadline} {STRINGS.results.days}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultSummary;
