import { useState, useRef, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';

interface DateInputProps {
  id?: string;
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
}

// Convert YYYY-MM-DD string to Date object
function parseISODate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

// Convert Date object to YYYY-MM-DD string
function toISODate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert YYYY-MM-DD to MM/DD/YYYY for display
function toDisplayFormat(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
}

// Parse various date formats and return YYYY-MM-DD
function parseUserInput(input: string, allowTwoDigitYear = true): string {
  if (!input) return '';

  // Remove extra spaces
  input = input.trim();

  // Try to parse M/D/YYYY, MM/DD/YYYY, M-D-YYYY, MM-DD-YYYY formats
  const patterns: [RegExp, boolean][] = [
    [/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, true], // M/D/YYYY or MM/DD/YYYY
    [/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/, false],  // M/D/YY or MM/DD/YY (only on blur)
  ];

  for (const [pattern, alwaysAllow] of patterns) {
    if (!alwaysAllow && !allowTwoDigitYear) continue;

    const match = input.match(pattern);
    if (match) {
      let [, month, day, year] = match;
      // Handle 2-digit year
      if (year.length === 2) {
        const currentCentury = Math.floor(new Date().getFullYear() / 100) * 100;
        year = String(currentCentury + parseInt(year));
      }
      const m = parseInt(month, 10);
      const d = parseInt(day, 10);
      const y = parseInt(year, 10);

      // Validate ranges
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
        // Validate that the date actually exists in the calendar
        const candidate = new Date(y, m - 1, d);
        if (
          candidate.getFullYear() === y &&
          candidate.getMonth() + 1 === m &&
          candidate.getDate() === d
        ) {
          return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      }
    }
  }

  return '';
}

function DateInput({ id, value, onChange, placeholder = 'MM/DD/YYYY', isClearable = false }: DateInputProps) {
  // Calculate date limits (+/- 3 years from today) - recalculated if component remounts
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    return {
      minDate: new Date(today.getFullYear() - 3, 0, 1), // January 1st, 3 years ago
      maxDate: new Date(today.getFullYear() + 3, 11, 31) // December 31st, 3 years from now
    };
  }, []);
  const [inputValue, setInputValue] = useState(toDisplayFormat(value));
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(toDisplayFormat(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse as user types (for copy-paste scenarios)
    // Only accept 4-digit years while typing to avoid premature completion
    const parsed = parseUserInput(newValue, false);
    if (parsed) {
      onChange(parsed);
    }
  };

  const handleInputBlur = () => {
    // On blur, try to parse and format the input
    const parsed = parseUserInput(inputValue);
    if (parsed) {
      onChange(parsed);
      setInputValue(toDisplayFormat(parsed));
    } else if (inputValue && !parsed) {
      // Invalid input, revert to last valid value
      setInputValue(toDisplayFormat(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handleDatePickerChange = (date: Date | null) => {
    const isoDate = toISODate(date);
    onChange(isoDate);
    setInputValue(toDisplayFormat(isoDate));
    setIsPickerOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleIconClick = () => {
    setIsPickerOpen(!isPickerOpen);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  return (
    <div className="date-input-container" ref={containerRef}>
      <div className="date-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          id={id}
          className="date-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <div className="date-input-icons">
          {isClearable && inputValue && (
            <button
              type="button"
              className="date-input-clear"
              onClick={handleClear}
              aria-label="Clear date"
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="date-input-calendar"
            onClick={handleIconClick}
            aria-label="Open calendar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
      </div>
      {isPickerOpen && (
        <div className="date-picker-dropdown">
          <DatePicker
            selected={parseISODate(value)}
            onChange={handleDatePickerChange}
            inline
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  );
}

export default DateInput;
