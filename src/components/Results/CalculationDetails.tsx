import { useMemo } from 'react';
import { formatDate, addDays } from '../../utils/trialCalculator';
import { STRINGS } from '../../strings';
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
      <h3>{STRINGS.results.calculationBreakdown}</h3>
      <table className="calculation-table">
        <thead>
          <tr>
            <th>{STRINGS.results.component}</th>
            <th>{STRINGS.results.detailsHeader}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{STRINGS.results.effectiveCommencementDate}</td>
            <td>{formatDate(results.effectiveCommencementDate)}</td>
          </tr>
          <tr>
            <td>{STRINGS.results.baseTimeLimit}</td>
            <td>{results.baseTimeLimit} {STRINGS.results.days} (Defendant {results.baseTimeLimit === 60 ? STRINGS.results.detainedInJail : STRINGS.results.notDetainedInJail})</td>
          </tr>
          <tr>
            <td>{STRINGS.results.excludedDays}</td>
            <td>{results.excludedDays} {STRINGS.results.days}</td>
          </tr>
          <tr>
            <td>{STRINGS.results.baseCalculation}</td>
            <td>
              {formatDate(results.effectiveCommencementDate)} + {results.baseTimeLimit} {STRINGS.results.days} + {results.excludedDays} excluded = {formatDate(results.baseDeadline)}
            </td>
          </tr>

          {thirtyDayRuleInfo && (
            <tr>
              <td>{STRINGS.results.thirtyDayRule}</td>
              <td>
                Latest exclusion ended {formatDate(thirtyDayRuleInfo.latestEndDate)}<br />
                30 days after = {formatDate(thirtyDayRuleInfo.thirtyDaysAfter)}<br />
                {thirtyDayRuleInfo.applied
                  ? <strong>{STRINGS.results.appliedExtends}</strong>
                  : STRINGS.results.notNeeded
                }
              </td>
            </tr>
          )}

          <tr className="total-row">
            <td><strong>{STRINGS.results.finalDeadline}</strong></td>
            <td><strong>{formatDate(results.finalDeadline)}</strong></td>
          </tr>

          {results.useCurePeriod && results.cureDeadline && (
            <tr className="cure-row">
              <td><strong>{STRINGS.results.withCurePeriod}</strong></td>
              <td><strong>{formatDate(results.cureDeadline)}</strong> (+{results.cureDays} {STRINGS.results.days})</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CalculationDetails;
