import React from 'react';
import { todayInput } from '../utils/date.js';

const DateSelector = ({ label, value, onChange }) => {
  return (
    <label className="date-selector">
      <span>{label}</span>
      <input type="date" value={value} max={todayInput()} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
};

export default DateSelector;
