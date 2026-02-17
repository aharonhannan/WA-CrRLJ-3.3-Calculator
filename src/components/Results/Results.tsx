import { forwardRef } from 'react';
import ResultSummary from './ResultSummary';
import Timeline from './Timeline';
import CalculationDetails from './CalculationDetails';
import { generateExportText } from '../../utils/trialCalculator';
import { STRINGS } from '../../strings';
import type { CalculationResults, CalculatorParams } from '../../types';

interface ResultsProps {
  results: CalculationResults;
  formData: CalculatorParams;
}

const Results = forwardRef<HTMLDivElement, ResultsProps>(function Results({ results, formData }, ref) {
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const text = generateExportText(formData, results);

    // Download as text file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CrRLJ3.3-Calculation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={ref} className="card results-section">
      <h2>{STRINGS.sections.results}</h2>

      <ResultSummary results={results} />
      <Timeline results={results} />
      <CalculationDetails results={results} />

      <div className="button-container">
        <button type="button" className="btn-secondary" onClick={handlePrint}>
          {STRINGS.buttons.print}
        </button>
        <button type="button" className="btn-secondary" onClick={handleExport}>
          {STRINGS.buttons.exportText}
        </button>
      </div>
    </div>
  );
});

export default Results;
