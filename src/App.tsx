import { useState, useRef, useEffect } from 'react';
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
    // Validate mandatory fields first
    const requiredFields: string[] = [];
    if (!formData.arraignmentDate) {
      requiredFields.push('Arraignment Date');
    }
    if (!formData.custodyStatus) {
      requiredFields.push('Custody Status');
    }

    if (requiredFields.length > 0) {
      showMessage(STRINGS.errors.requiredFields(requiredFields), 'error');
      return;
    }

    // Validation errors
    const validationErrors: string[] = [];

    // Validate exclusion periods have both dates if any exclusion exists
    const incompleteExclusions = exclusions.filter(e => !e.startDate || !e.endDate);
    if (incompleteExclusions.length > 0) {
      validationErrors.push(STRINGS.errors.incompleteExclusion);
    }

    // Validate exclusion date ranges (end date must be >= start date)
    exclusions.forEach((exclusion, index) => {
      if (exclusion.startDate && exclusion.endDate && new Date(exclusion.endDate) < new Date(exclusion.startDate)) {
        validationErrors.push(STRINGS.errors.exclusionEndBeforeStart(index + 1));
      }
    });

    // Validate reset dates are filled
    const incompleteResets = resets.filter(r => !r.date);
    if (incompleteResets.length > 0) {
      validationErrors.push(STRINGS.errors.incompleteReset);
    }

    // Date order validations
    const arraignmentDate = new Date(formData.arraignmentDate);

    // Validate release date is not before arraignment
    if (formData.releaseDate && new Date(formData.releaseDate) < arraignmentDate) {
      validationErrors.push(STRINGS.errors.releaseBeforeArraignment);
    }

    // Validate reset dates are not before arraignment
    resets.forEach((reset, index) => {
      if (reset.date && new Date(reset.date) < arraignmentDate) {
        validationErrors.push(STRINGS.errors.resetBeforeArraignment(index + 1));
      }
    });

    // Validate exclusion start dates are not before arraignment
    exclusions.forEach((exclusion, index) => {
      if (exclusion.startDate && new Date(exclusion.startDate) < arraignmentDate) {
        validationErrors.push(STRINGS.errors.exclusionBeforeArraignment(index + 1));
      }
    });

    if (validationErrors.length > 0) {
      showMessage(STRINGS.errors.validationErrors(validationErrors), 'error');
      return;
    }

    // Filter out empty exclusions (no dates at all)
    const validResets = resets.filter(r => r.date);
    const validExclusions = exclusions.filter(e => e.startDate && e.endDate);

    const calculationParams: CalculatorParams = {
      ...formData,
      resets: validResets,
      exclusions: validExclusions
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
      releaseDate: data.releaseDate,
      scheduledTrialDate: data.scheduledTrialDate,
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
  const getFullFormData = (): CalculatorParams => ({
    ...formData,
    resets: resets.filter(r => r.date),
    exclusions: exclusions.filter(e => e.startDate && e.endDate)
  });

  return (
    <div className="container">
      <Header />

      <main>
        <SavedSessions
          currentData={getFullFormData()}
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
          <Results ref={resultsRef} results={results} formData={getFullFormData()} />
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
