import React, { createContext, useState, useContext, ReactNode } from 'react';

interface GeneratedContentContextType {
  generatedContent: string;
  setGeneratedContent: (content: string) => void;
}

const GeneratedContentContext = createContext<GeneratedContentContextType | undefined>(undefined);

export const GeneratedContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [generatedContent, setGeneratedContent] = useState('');

  return (
    <GeneratedContentContext.Provider value={{ generatedContent, setGeneratedContent }}>
      {children}
    </GeneratedContentContext.Provider>
  );
};

export const useGeneratedContent = () => {
  const context = useContext(GeneratedContentContext);
  if (context === undefined) {
    throw new Error('useGeneratedContent must be used within a GeneratedContentProvider');
  }
  return context;
};