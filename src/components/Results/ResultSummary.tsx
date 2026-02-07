import { formatDate } from '../../utils/trialCalculator';
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
          <h3>{results.isTimely ? '✓ TIMELY' : '✗ UNTIMELY'}</h3>
          <p>Scheduled Trial: {formatDate(results.scheduledTrialDate)}</p>
        </div>
      )}

      <div className="deadline-info">
        <div className="deadline-item">
          <label>Trial Deadline:</label>
          <span className="deadline-date">{formatDate(applicableDeadline)}</span>
        </div>
        {results.daysUntilDeadline !== null && (
          <div className="deadline-item">
            <label>Days Until Deadline:</label>
            <span className="days-count">{results.daysUntilDeadline} days</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultSummary;
