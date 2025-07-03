'use client';

import { StoredQuizData, QuizResult } from '@/types/quiz';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface QuizCreationContextType {
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  documentText: string | null;
  setDocumentText: React.Dispatch<React.SetStateAction<string | null>>;
  quizData: StoredQuizData | null;
  setQuizData: React.Dispatch<React.SetStateAction<StoredQuizData | null>>;
  quizResult: QuizResult | null;
  setQuizResult: React.Dispatch<React.SetStateAction<QuizResult | null>>;
  clearQuizState: () => void;
}

const QuizCreationContext = createContext<QuizCreationContextType | undefined>(undefined);

export function QuizCreationProvider({ children }: { children: ReactNode }) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<StoredQuizData | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const clearQuizState = () => {
    setUploadedFiles([]);
    setDocumentText(null);
    setQuizData(null);
    setQuizResult(null);
  };

  const value = {
    uploadedFiles,
    setUploadedFiles,
    documentText,
    setDocumentText,
    quizData,
    setQuizData,
    quizResult,
    setQuizResult,
    clearQuizState,
  };

  return (
    <QuizCreationContext.Provider value={value}>
      {children}
    </QuizCreationContext.Provider>
  );
}

export function useQuizCreation() {
  const context = useContext(QuizCreationContext);
  if (context === undefined) {
    throw new Error('useQuizCreation must be used within a QuizCreationProvider');
  }
  return context;
}
