import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { todayInput } from '../utils/date.js';

const DateContext = createContext(null);

const STORAGE_KEY = 'news-date';

const normalizeDate = (value, { allowPast = false } = {}) => {
  const today = todayInput();
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return today;
  if (!allowPast && value !== today) return today;
  return value > today ? today : value;
};

export const DateProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return normalizeDate(stored);
  });

  const updateDate = (next) => {
    if (!next) return;
    const normalized = normalizeDate(next, { allowPast: true });
    setSelectedDate(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
  };

  useEffect(() => {
    const normalized = normalizeDate(selectedDate, { allowPast: true });
    if (normalized !== selectedDate) {
      setSelectedDate(normalized);
      localStorage.setItem(STORAGE_KEY, normalized);
    }
  }, [selectedDate]);

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
