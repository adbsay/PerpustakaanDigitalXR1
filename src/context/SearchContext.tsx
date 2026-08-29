'use client';

import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

// ============================================================
// SEARCH CONTEXT
// Allows NavbarSearch to update query and page to listen
// WITHOUT triggering any router navigation (no focus loss!)
// ============================================================

interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  query: '',
  setQuery: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryRaw] = useState('');

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
  }, []);

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
