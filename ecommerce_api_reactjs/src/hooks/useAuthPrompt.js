import { useContext } from 'react';
import { AuthPromptContext } from '../contexts/AuthPromptContext';

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error('useAuthPrompt must be used within AuthPromptProvider');
  }
  return context;
}
