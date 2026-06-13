import React, { useEffect, useMemo, useRef } from 'react';

const RichEditor = ({ value, onChange }) => {
  const ref = useRef(null);
  const toolbarId = useMemo(() => `rt-${Math.random().toString(36).slice(2)}`, []);

  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;
    const nextValue = value || '';
    if (ref.current.innerHTML !== nextValue) {
      ref.current.innerHTML = nextValue;
    }
  }, [value]);

  const syncContent = () => {
    onChange(ref.current?.innerHTML || '');
  };

  const apply = (command, commandValue = null) => {
    ref.current?.focus();
    document.execCommand(command, false, commandValue);
    syncContent();
  };

  const link = () => {
    const url = window.prompt('Enter URL');
    if (!url) return;
    apply('createLink', url);
  };

  return (
    <div className="rich-editor">
      <div className="rich-toolbar" id={toolbarId}>
        <button type="button" className="secondary" onClick={() => apply('bold')}>B</button>
        <button type="button" className="secondary" onClick={() => apply('italic')}>I</button>
        <button type="button" className="secondary" onClick={() => apply('insertUnorderedList')}>• List</button>
        <button type="button" className="secondary" onClick={() => apply('insertOrderedList')}>1. List</button>
        <button type="button" className="secondary" onClick={link}>Link</button>
      </div>
      <div
        ref={ref}
        className="rich-editor__area"
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        spellCheck
        style={{ direction: 'ltr', textAlign: 'left' }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={syncContent}
      />
    </div>
  );
};

const RichTextInput = ({ label, value, onChange }) => {
  const setLang = (lang, next) => onChange({ ...value, [lang]: next });

  return (
    <div className="bilingual-input">
      <label>
        {label} - English (ఆంగ్లం)
        <RichEditor value={value?.en || ''} onChange={(next) => setLang('en', next)} />
      </label>
      <label>
        {label} - Telugu (తెలుగు)
        <RichEditor value={value?.te || ''} onChange={(next) => setLang('te', next)} />
      </label>
      <label>
        {label} - Hindi (हिंदी)
        <RichEditor value={value?.hi || ''} onChange={(next) => setLang('hi', next)} />
      </label>
    </div>
  );
};

export default RichTextInput;
