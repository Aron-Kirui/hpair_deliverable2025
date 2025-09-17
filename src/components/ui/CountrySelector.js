import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES } from '../../data/countries';

const CountrySelector = ({ value, onChange, error, touched }) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [nationalitySearchTerm, setNationalitySearchTerm] = useState('');
  const countryDropdownRef = useRef(null);
  const nationalityDropdownRef = useRef(null);

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  // Filter nationalities based on search
  const filteredNationalities = COUNTRIES.filter(country =>
    country.nationality.toLowerCase().includes(nationalitySearchTerm.toLowerCase())
  );

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryOpen(false);
        setCountrySearchTerm('');
      }
      if (nationalityDropdownRef.current && !nationalityDropdownRef.current.contains(event.target)) {
        setIsNationalityOpen(false);
        setNationalitySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    onChange({
      ...value,
      countryOfResidence: {
        code: country.code,
        name: country.name,
        flag: country.flag
      }
    });
    setIsCountryOpen(false);
    setCountrySearchTerm('');
  };

  const handleNationalitySelect = (country) => {
    onChange({
      ...value,
      nationality: {
        code: country.code,
        name: country.name,
        nationality: country.nationality,
        flag: country.flag
      }
    });
    setIsNationalityOpen(false);
    setNationalitySearchTerm('');
  };

  const selectedCountry = value?.countryOfResidence ? 
    COUNTRIES.find(c => c.code === value.countryOfResidence.code) : null;
  
  const selectedNationality = value?.nationality ? 
    COUNTRIES.find(c => c.code === value.nationality.code) : null;

  return (
    <div>
      {/* Country of Residence */}
      <div className="form-group">
        <label className="form-label">
          Country of Residence <span className="required">*</span>
        </label>
        
        <div className="country-selector country-selector-constrained" ref={countryDropdownRef}>
          <div 
            className={`form-input country-selector-input ${error?.countryOfResidence && touched?.countryOfResidence ? 'error' : ''}`}
            onClick={() => setIsCountryOpen(!isCountryOpen)}
          >
            {value?.countryOfResidence ? (
              <span>{selectedCountry?.flag} {value.countryOfResidence.name}</span>
            ) : (
              <span className="country-selector-placeholder">Select country of residence</span>
            )}
            <span className={`country-selector-arrow ${isCountryOpen ? 'open' : ''}`}>▼</span>
          </div>

          {isCountryOpen && (
            <div className="country-selector-dropdown">
              <div className="country-dropdown-search">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearchTerm}
                  onChange={(e) => setCountrySearchTerm(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="country-dropdown-list">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <div
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                      className="country-dropdown-option"
                    >
                      <span className="country-dropdown-flag">{country.flag}</span>
                      <span className="country-dropdown-name">{country.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error?.countryOfResidence && touched?.countryOfResidence && (
          <div className="error-message">
            {typeof error.countryOfResidence === 'string' ? error.countryOfResidence : 'Please select your country of residence'}
          </div>
        )}
      </div>

      {/* Nationality */}
      <div className="form-group">
        <label className="form-label">
          Nationality <span className="required">*</span>
        </label>
        
        <div className="country-selector country-selector-constrained" ref={nationalityDropdownRef}>
          <div 
            className={`form-input country-selector-input ${error?.nationality && touched?.nationality ? 'error' : ''}`}
            onClick={() => setIsNationalityOpen(!isNationalityOpen)}
          >
            {value?.nationality ? (
              <span>{selectedNationality?.flag} {value.nationality.nationality}</span>
            ) : (
              <span className="country-selector-placeholder">Select your nationality</span>
            )}
            <span className={`country-selector-arrow ${isNationalityOpen ? 'open' : ''}`}>▼</span>
          </div>

          {isNationalityOpen && (
            <div className="country-selector-dropdown">
              <div className="country-dropdown-search">
                <input
                  type="text"
                  placeholder="Search nationalities..."
                  value={nationalitySearchTerm}
                  onChange={(e) => setNationalitySearchTerm(e.target.value)}
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="country-dropdown-list">
                {filteredNationalities.length > 0 ? (
                  filteredNationalities.map((country) => (
                    <div
                      key={`nationality-${country.code}`}
                      onClick={() => handleNationalitySelect(country)}
                      className="country-dropdown-option"
                    >
                      <span className="country-dropdown-flag">{country.flag}</span>
                      <span className="country-dropdown-name">{country.nationality}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    No nationalities found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error?.nationality && touched?.nationality && (
          <div className="error-message">
            {typeof error.nationality === 'string' ? error.nationality : 'Please select your nationality'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountrySelector;