import React from 'react';

const BilingualInput = ({ label, value, onChange, multiline }) => {
  const handleChange = (lang, next) => {
    onChange({ ...value, [lang]: next });
  };

  return (
    <div className="bilingual-input">
      <label>
        {label} - English (ఆంగ్లం)
        {multiline ? (
          <textarea value={value?.en || ''} onChange={(e) => handleChange('en', e.target.value)} />
        ) : (
          <input value={value?.en || ''} onChange={(e) => handleChange('en', e.target.value)} />
        )}
      </label>
      <label>
        {label} - Telugu (తెలుగు)
        {multiline ? (
          <textarea value={value?.te || ''} onChange={(e) => handleChange('te', e.target.value)} />
        ) : (
          <input value={value?.te || ''} onChange={(e) => handleChange('te', e.target.value)} />
        )}
      </label>
    </div>
  );
};

export default BilingualInput;
