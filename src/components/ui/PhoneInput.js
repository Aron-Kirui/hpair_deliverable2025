import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES } from '../../data/countries';

const PhoneInput = ({ value, onChange, error, touched }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sort countries by most commonly used first, then alphabetically
  const sortedCountries = [...COUNTRIES].sort((a, b) => {
    const commonCodes = ['+1', '+44', '+33', '+49', '+39', '+34', '+31', '+86', '+91', '+81', '+82'];
    const aCommon = commonCodes.indexOf(a.phoneCode);
    const bCommon = commonCodes.indexOf(b.phoneCode);
    if (aCommon !== -1 && bCommon !== -1) return aCommon - bCommon;
    if (aCommon !== -1) return -1;
    if (bCommon !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  // Prefer ISO match first; fall back to dial code; default to US
  const selectedCountry =
    COUNTRIES.find(c => c.code === value?.countryIso) ||
    COUNTRIES.find(c => c.phoneCode === value?.countryCode) ||
    COUNTRIES.find(c => c.code === 'US');

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When a country is chosen, store BOTH the dial code and ISO code
  const handleCountrySelect = (country) => {
    onChange({
      countryCode: country.phoneCode,
      countryIso: country.code,
      number: value?.number || ''
    });
    setIsDropdownOpen(false);
  };

  // Preserve selected country info while typing
  const handleNumberChange = (e) => {
    const number = e.target.value;
    onChange({
      countryCode: value?.countryCode || selectedCountry.phoneCode,
      countryIso: value?.countryIso || selectedCountry.code,
      number
    });
  };

  const getPhoneFormat = (phoneCode) => {
    const formats = {
      '+1': '(XXX) XXX-XXXX',
      '+44': 'XXXX XXXXXX',
      '+33': 'XX XX XX XX XX',
      '+49': 'XXX XXXXXXX',
      '+39': 'XXX XXX XXXX',
      '+34': 'XXX XXX XXX',
      '+31': 'XX XXX XXXX',
      '+86': 'XXX XXXX XXXX',
      '+91': 'XXXXX XXXXX',
      '+81': 'XX XXXX XXXX',
      '+82': 'XX XXXX XXXX'
    };
    return formats[phoneCode] || 'XXX XXX XXXX';
  };

  const formatPlaceholder = () => {
    const format = getPhoneFormat(selectedCountry?.phoneCode || '+1');
    return format.replace(/X/g, '9');
  };

  return (
    <div className="phone-input-container">
      <div className={`phone-input-wrapper ${error && touched ? 'error' : ''}`}>
        <div className="country-code-selector" ref={dropdownRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className={`country-code-button ${error && touched ? 'error' : ''}`}
          >
            <span className="flag">{selectedCountry?.flag || '🇺🇸'}</span>
            <span className="phone-code">{selectedCountry?.phoneCode || '+1'}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {isDropdownOpen && (
            <div className="country-dropdown">
              <div className="country-list">
                {sortedCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCountrySelect(country);
                    }}
                    className="country-option"
                  >
                    <span className="flag">{country.flag}</span>
                    <div className="country-info">
                      <div className="country-name">{country.name}</div>
                      <div className="phone-code">{country.phoneCode}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          type="tel"
          value={value?.number || ''}
          onChange={handleNumberChange}
          placeholder={formatPlaceholder()}
          className={`phone-number-input ${error && touched ? 'error' : ''}`}
          autoComplete="tel-national"
        />
      </div>

      <div className="phone-hint">
        Format: {selectedCountry?.phoneCode || '+1'} {getPhoneFormat(selectedCountry?.phoneCode || '+1')}
      </div>

      {error && touched && (
        <div className="error-message">
          {typeof error === 'object' ? error.number || error.countryCode : error}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;
