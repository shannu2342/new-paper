import React from 'react';

const DateSelector = ({ label, value, onChange }) => {
  return (
    <label className="date-selector">
      <span>{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
};

export default DateSelector;
