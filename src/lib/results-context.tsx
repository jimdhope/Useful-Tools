"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface ResultsSection {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface GroupedResults {
  title: string;
  groups: ResultsSection[][];
  groupTitles?: (string | undefined)[];
}

interface ResultsContextType {
  results: GroupedResults | null;
  setResults: (results: GroupedResults | null) => void;
}

const ResultsContext = createContext<ResultsContextType>({
  results: null,
  setResults: () => {},
});

export function ResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<GroupedResults | null>(null);
  return (
    <ResultsContext.Provider value={{ results, setResults }}>
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults() {
  return useContext(ResultsContext);
}
