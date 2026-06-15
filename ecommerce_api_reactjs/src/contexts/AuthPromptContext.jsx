import { createContext, useCallback, useState, useMemo } from 'react';
import LoginPromptModal from '../components/common/LoginPromptModal';

export const AuthPromptContext = createContext(null);

export function AuthPromptProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openLoginPrompt = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeLoginPrompt = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openLoginPrompt,
      closeLoginPrompt,
    }),
    [isOpen, openLoginPrompt, closeLoginPrompt],
  );

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <LoginPromptModal />
    </AuthPromptContext.Provider>
  );
}
