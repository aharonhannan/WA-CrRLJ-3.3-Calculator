import { useState, useRef, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BasicInfoSection from './components/BasicInfoSection';
import ResetsSection from './components/ResetsSection';
import ExclusionsSection from './components/ExclusionsSection';
import TrialInfoSection from './components/TrialInfoSection';
import Results from './components/Results/Results';
import Footer from './components/Footer';
import MessageOverlay from './components/MessageOverlay';
import ButtonContainer from './components/ButtonContainer';
import SavedSessions from './components/SavedSessions';
import { calculate } from './utils/trialCalculator';
import { validateCalculatorInput } from './utils/validation';
import { STRINGS } from './strings';
import type { FormData, ResetEvent, ExclusionPeriod, CalculationResults, Message, CalculatorParams } from './types';
import './App.css';

const initialFormData: FormData = {
  arraignmentDate: '',
  custodyStatus: '',
  releaseDate: '',
  scheduledTrialDate: '',
  useCurePeriod: false
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [resets, setResets] = useState<ResetEvent[]>([]);
  const [exclusions, setExclusions] = useState<ExclusionPeriod[]>([]);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showMessage = (text: string, type: Message['type'] = 'info', onConfirm?: () => void) => {
    setMessage({ text, type });
    setConfirmCallback(onConfirm ? () => onConfirm : null);
  };

  const closeMessage = () => {
    setMessage(null);
    setConfirmCallback(null);
  };

  const handleCalculate = () => {
    const { requiredErrors, validationErrors } = validateCalculatorInput(formData, resets, exclusions);

    if (requiredErrors.length > 0) {
      showMessage(STRINGS.errors.requiredFields(requiredErrors), 'error');
      return;
    }

    if (validationErrors.length > 0) {
      showMessage(STRINGS.errors.validationErrors(validationErrors), 'error');
      return;
    }

    const calculationParams: CalculatorParams = {
      ...formData,
      resets: resets.filter(r => r.date),
      exclusions: exclusions.filter(e => e.startDate && e.endDate)
    };

    const calculatedResults = calculate(calculationParams);
    setResults(calculatedResults);
  };

  const handleClearForm = () => {
    setFormData(initialFormData);
    setResets([]);
    setExclusions([]);
    setResults(null);
  };

  // Wrapper functions to clear results when form data changes
  const handleFormChange = (newFormData: FormData) => {
    setFormData(newFormData);
    setResults(null);
  };

  const handleResetsChange = (newResets: ResetEvent[]) => {
    setResets(newResets);
    setResults(null);
  };

  const handleExclusionsChange = (newExclusions: ExclusionPeriod[]) => {
    setExclusions(newExclusions);
    setResults(null);
  };

  const handleLoadSession = (data: CalculatorParams) => {
    setFormData({
      arraignmentDate: data.arraignmentDate,
      custodyStatus: data.custodyStatus,
      releaseDate: data.releaseDate ?? '',
      scheduledTrialDate: data.scheduledTrialDate ?? '',
      useCurePeriod: data.useCurePeriod
    });
    setResets(data.resets || []);
    setExclusions(data.exclusions || []);
    setResults(null);
  };

  // Scroll to results when they appear
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [results]);

  // Get full form data for export/save
  const fullFormData = useMemo((): CalculatorParams => ({
    ...formData,
    resets: resets.filter(r => r.date),
    exclusions: exclusions.filter(e => e.startDate && e.endDate)
  }), [formData, resets, exclusions]);

  return (
    <div className="container">
      <Header />

      <main>
        <SavedSessions
          currentData={fullFormData}
          onLoadSession={handleLoadSession}
          onMessage={showMessage}
        />

        <BasicInfoSection
          formData={formData}
          onFormChange={handleFormChange}
        />

        <ResetsSection
          resets={resets}
          onResetsChange={handleResetsChange}
        />

        <ExclusionsSection
          exclusions={exclusions}
          onExclusionsChange={handleExclusionsChange}
        />

        <TrialInfoSection
          formData={formData}
          onFormChange={handleFormChange}
        />

        <ButtonContainer
          onCalculate={handleCalculate}
          onClear={handleClearForm}
        />

        {results && (
          <Results ref={resultsRef} results={results} formData={fullFormData} />
        )}
      </main>

      <Footer />

      {message && (
        <MessageOverlay
          message={message.text}
          type={message.type}
          onClose={closeMessage}
          onConfirm={confirmCallback || undefined}
        />
      )}
    </div>
  );
}

export default App;
