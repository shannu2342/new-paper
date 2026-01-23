import React, { createContext, useContext, useMemo, useState } from 'react';
import { todayInput } from '../utils/date.js';

const DateContext = createContext(null);

const STORAGE_KEY = 'news-date';

export const DateProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || todayInput();
  });

  const updateDate = (next) => {
    if (!next) return;
    setSelectedDate(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ selectedDate, setDate: updateDate }), [selectedDate]);

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
};

export const useDate = () => {
  const ctx = useContext(DateContext);
  if (!ctx) {
    throw new Error('useDate must be used within DateProvider');
  }
  return ctx;
};
