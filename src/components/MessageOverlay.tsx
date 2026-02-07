import { useEffect, useRef } from 'react';
import type { MessageType } from '../types';

interface MessageOverlayProps {
  message: string;
  type?: MessageType;
  onClose: () => void;
  onConfirm?: () => void;
}

function MessageOverlay({ message, type = 'info', onClose, onConfirm }: MessageOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isConfirm = type === 'confirm';

  useEffect(() => {
    // Focus the overlay for accessibility
    if (overlayRef.current) {
      overlayRef.current.focus();
    }

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className={`overlay-content overlay-${type}`}
        onClick={(e) => e.stopPropagation()}
        ref={overlayRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="overlay-message">{message}</div>
        <div className="overlay-buttons">
          {isConfirm ? (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleConfirm}>
                Confirm
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageOverlay;
