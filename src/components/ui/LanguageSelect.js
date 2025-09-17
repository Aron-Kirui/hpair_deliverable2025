import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LANGUAGES, getMostSpokenLanguages, searchLanguages } from '../../data/languages';

const LanguageSelect = ({ value, onChange, error, touched, placeholder = 'Search languages…' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const selected = useMemo(
    () => (value && value !== 'other' ? LANGUAGES.find(l => l.code === value) : null),
    [value]
  );

  const popular = useMemo(() => getMostSpokenLanguages(20).sort((a, b) => a.name.localeCompare(b.name)), []);
  const results = useMemo(() => {
    if (!open) return [];
    if (!query.trim()) return popular;
    return searchLanguages(query).sort((a, b) => a.name.localeCompare(b.name)); // Sort search results alphabetically
  }, [query, popular, open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const choose = (code) => {
    onChange(code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="language-selector" ref={ref}>
      <div
        className={`form-input ${error && touched ? 'error' : ''}`}
        onClick={() => setOpen(!open)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingRight: 12
        }}
      >
        <span>{selected ? selected.name : (value === 'other' ? 'Other (not listed)' : 'Select a language')}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>▼</span>
      </div>

      {open && (
        <div className="language-dropdown">
          <div className="language-search">
            <input
              className="form-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              style={{ margin: 0 }}
              autoFocus
            />
          </div>

          <div className="language-list">
            {results.length === 0 && (
              <div style={{ padding: 14, textAlign: 'center', color: '#666' }}>No languages found</div>
            )}

            {results.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className="language-option"
                onClick={() => choose(lang.code)}
              >
                <span className="language-name">{lang.name}</span>
                <span className="language-meta">{lang.continent}</span>
              </button>
            ))}

            {/* Always show "Other" */}
            <button
              type="button"
              className="language-option"
              onClick={() => choose('other')}
            >
              <span className="language-name">Other (not listed)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelect;