import React, { useMemo, useRef } from 'react';

const RichEditor = ({ value, onChange }) => {
  const ref = useRef(null);
  const toolbarId = useMemo(() => `rt-${Math.random().toString(36).slice(2)}`, []);

  const apply = (command) => {
    ref.current?.focus();
    document.execCommand(command, false, null);
    onChange(ref.current?.innerHTML || '');
  };

  const link = () => {
    const url = window.prompt('Enter URL');
    if (!url) return;
    ref.current?.focus();
    document.execCommand('createLink', false, url);
    onChange(ref.current?.innerHTML || '');
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
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value || '' }}
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
    </div>
  );
};

export default RichTextInput;
