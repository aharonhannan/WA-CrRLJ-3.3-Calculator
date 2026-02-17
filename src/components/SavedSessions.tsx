import { useState, useEffect, useCallback, useRef } from 'react';
import { STRINGS } from '../strings';
import { getSavedSessions, saveSession, deleteSession, sessionExists } from '../utils/storage';
import type { SavedSession } from '../utils/storage';
import type { CalculatorParams } from '../types';
import ChevronDown from '../assets/icons/chevron-down.svg?react';
import ChevronUp from '../assets/icons/chevron-up.svg?react';

interface SavedSessionsProps {
  currentData: CalculatorParams;
  onLoadSession: (data: CalculatorParams) => void;
  onMessage: (text: string, type: 'info' | 'error' | 'confirm', onConfirm?: () => void) => void;
}

function SavedSessions({ currentData, onLoadSession, onMessage }: SavedSessionsProps) {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const confirmTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setSessions(getSavedSessions());
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
    };
  }, []);

  const refreshSessions = () => {
    setSessions(getSavedSessions());
  };

  const doSave = useCallback((name: string) => {
    const success = saveSession(name, currentData);
    if (success) {
      onMessage(STRINGS.success.sessionSaved, 'info');
      setSessionName('');
      refreshSessions();
    } else {
      onMessage(STRINGS.errors.saveError, 'error');
    }
  }, [currentData, onMessage]);

  const handleSave = () => {
    const trimmedName = sessionName.trim();
    if (!trimmedName) {
      onMessage(STRINGS.errors.sessionNameRequired, 'error');
      return;
    }

    if (sessionExists(trimmedName)) {
      onMessage(
        STRINGS.confirm.overwriteSession(trimmedName),
        'confirm',
        () => doSave(trimmedName)
      );
      return;
    }

    doSave(trimmedName);
  };

  const handleLoad = (session: SavedSession) => {
    onLoadSession(session.data);
    onMessage(STRINGS.success.sessionLoaded, 'info');
  };

  const handleDelete = (name: string) => {
    if (confirmDelete === name) {
      const success = deleteSession(name);
      if (success) {
        onMessage(STRINGS.success.sessionDeleted, 'info');
        refreshSessions();
      }
      setConfirmDelete(null);
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
        confirmTimeoutRef.current = null;
      }
    } else {
      // Clear any existing timeout
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
      setConfirmDelete(name);
      // Auto-reset confirmation after 3 seconds
      confirmTimeoutRef.current = window.setTimeout(() => {
        setConfirmDelete(null);
        confirmTimeoutRef.current = null;
      }, 3000);
    }
  };

  const formatDateTime = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className={`card saved-sessions ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        type="button"
        className="collapsible-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="saved-sessions-content"
      >
        <h2>{STRINGS.sections.savedSessions}</h2>
        <span className="collapse-icon" aria-hidden="true">
          {!isExpanded ? <ChevronDown /> : <ChevronUp />}
        </span>
      </button>

      {isExpanded && (
        <div id="saved-sessions-content" className="saved-sessions-content">
          <div className="save-form">
            <div className="form-group">
              <label htmlFor="sessionName">{STRINGS.labels.sessionName}</label>
              <div className="save-input-group">
                <input
                  type="text"
                  id="sessionName"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder={STRINGS.placeholders.sessionName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
                >
                  {STRINGS.buttons.save}
                </button>
              </div>
            </div>
          </div>

          {sessions.length > 0 && (
            <div className="sessions-list" role="list" aria-label="Saved sessions">
              {sessions.map((session) => (
                <div key={session.name} className="session-item" role="listitem">
                  <div className="session-info">
                    <strong>{session.name}</strong>
                    <small>{formatDateTime(session.savedAt)}</small>
                  </div>
                  <div className="session-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={() => handleLoad(session)}
                      aria-label={`Load session: ${session.name}`}
                    >
                      {STRINGS.buttons.load}
                    </button>
                    <button
                      type="button"
                      className={`btn-remove btn-small ${confirmDelete === session.name ? 'confirm' : ''}`}
                      onClick={() => handleDelete(session.name)}
                      aria-label={confirmDelete === session.name ? `Confirm delete: ${session.name}` : `Delete session: ${session.name}`}
                    >
                      {confirmDelete === session.name ? STRINGS.confirm.areYouSure : STRINGS.buttons.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sessions.length === 0 && (
            <p className="no-sessions">{STRINGS.savedSessions.empty}</p>
          )}

          <p className="local-storage-note">{STRINGS.disclaimer.localStorage}</p>
        </div>
      )}
    </section>
  );
}

export default SavedSessions;
