// Local storage utilities for saving/loading calculator sessions

import type { CalculatorParams } from '../types';

export interface SavedSession {
  name: string;
  data: CalculatorParams;
  savedAt: string;
}

const STORAGE_KEY = 'crrlj3-saved-sessions';

function isValidSession(value: unknown): value is SavedSession {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.name !== 'string' || typeof obj.savedAt !== 'string') return false;
  if (typeof obj.data !== 'object' || obj.data === null) return false;
  const data = obj.data as Record<string, unknown>;
  return typeof data.arraignmentDate === 'string' && typeof data.custodyStatus === 'string';
}

export function getSavedSessions(): SavedSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter(isValidSession);
      }
    }
  } catch (e) {
    console.error('Failed to load saved sessions:', e);
  }
  return [];
}

export function saveSession(name: string, data: CalculatorParams): boolean {
  try {
    const sessions = getSavedSessions();
    const existingIndex = sessions.findIndex(s => s.name === name);

    const newSession: SavedSession = {
      name,
      data,
      savedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = newSession;
    } else {
      sessions.push(newSession);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch (e) {
    console.error('Failed to save session:', e);
    return false;
  }
}

export function deleteSession(name: string): boolean {
  try {
    const sessions = getSavedSessions();
    const filtered = sessions.filter(s => s.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete session:', e);
    return false;
  }
}

export function sessionExists(name: string): boolean {
  const sessions = getSavedSessions();
  return sessions.some(s => s.name === name);
}
