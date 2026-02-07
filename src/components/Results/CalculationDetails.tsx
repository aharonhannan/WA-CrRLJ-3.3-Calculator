import { useMemo } from 'react';
import { formatDate, addDays } from '../../utils/trialCalculator';
import type { CalculationResults } from '../../types';

interface CalculationDetailsProps {
  results: CalculationResults;
}

function CalculationDetails({ results }: CalculationDetailsProps) {
  // Memoize 30-day rule calculation
  const thirtyDayRuleInfo = useMemo(() => {
    if (!results.excludedPeriods || results.excludedPeriods.length === 0) {
      return null;
    }

    const latestExclusion = results.excludedPeriods.reduce((latest, period) =>
      period.endDate > latest.endDate ? period : latest
    );
    const thirtyDaysAfter = addDays(latestExclusion.endDate, 30);
    return {
      latestEndDate: latestExclusion.endDate,
      thirtyDaysAfter,
      applied: thirtyDaysAfter > results.baseDeadline
    };
  }, [results.excludedPeriods, results.baseDeadline]);

  return (
    <div className="details-container">
      <h3>Calculation Breakdown</h3>
      <table className="calculation-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Effective Commencement Date</td>
            <td>{formatDate(results.effectiveCommencementDate)}</td>
          </tr>
          <tr>
            <td>Base Time Limit</td>
            <td>{results.baseTimeLimit} days (Defendant {results.baseTimeLimit === 60 ? 'detained in jail' : 'not detained in jail'})</td>
          </tr>
          <tr>
            <td>Excluded Days</td>
            <td>{results.excludedDays} days</td>
          </tr>
          <tr>
            <td>Base Calculation</td>
            <td>
              {formatDate(results.effectiveCommencementDate)} + {results.baseTimeLimit} days + {results.excludedDays} excluded = {formatDate(results.baseDeadline)}
            </td>
          </tr>

          {thirtyDayRuleInfo && (
            <tr>
              <td>30-Day Minimum Rule</td>
              <td>
                Latest exclusion ended {formatDate(thirtyDayRuleInfo.latestEndDate)}<br />
                30 days after = {formatDate(thirtyDayRuleInfo.thirtyDaysAfter)}<br />
                {thirtyDayRuleInfo.applied
                  ? <strong>Applied (extends deadline)</strong>
                  : 'Not needed (base deadline is later)'
                }
              </td>
            </tr>
          )}

          <tr className="total-row">
            <td><strong>Final Trial Deadline</strong></td>
            <td><strong>{formatDate(results.finalDeadline)}</strong></td>
          </tr>

          {results.useCurePeriod && results.cureDeadline && (
            <tr className="cure-row">
              <td><strong>With Cure Period</strong></td>
              <td><strong>{formatDate(results.cureDeadline)}</strong> (+{results.cureDays} days)</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CalculationDetails;
