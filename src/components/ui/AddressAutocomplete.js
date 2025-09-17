import React, { useState, useRef } from 'react';

const AddressAutocomplete = ({ value, onChange, error, touched }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  // Debounced search function
  const searchAddresses = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&` +
        `addressdetails=1&limit=5&countrycodes=us,ca,gb,au,de,fr,es,it,nl,mx,br,jp,kr,cn,in`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      } else {
        console.error('Address search failed');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    setShowSuggestions(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchAddresses(query);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const address = suggestion.address || {};
    
    const formattedAddress = {
      address1: `${address.house_number || ''} ${address.road || ''}`.trim() || suggestion.display_name.split(',')[0],
      address2: '',
      city: address.city || address.town || address.village || '',
      state: address.state || address.province || '',
      postalCode: address.postcode || '',
      country: address.country || ''
    };

    onChange(formattedAddress);
    setSearchTerm('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle manual field changes
  const handleFieldChange = (field, fieldValue) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  return (
    <div className="address-section">
      {/* Address Search Field */}
      <div className="form-group">
        <label htmlFor="addressSearch" className="form-label">
          Search Address
        </label>
        <div className="address-search-container">
          <input
            type="text"
            id="addressSearch"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Start typing your address..."
            className="form-input"
            autoComplete="off"
          />
          
          {isLoading && (
            <div className="search-loading">Searching...</div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="suggestion-item"
                >
                  <div className="suggestion-text">
                    {suggestion.display_name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Address Fields */}
      <div className="form-group">
        <label htmlFor="address1" className="form-label">
          Address Line 1 <span className="required">*</span>
        </label>
        <input
          type="text"
          id="address1"
          value={value?.address1 || ''}
          onChange={(e) => handleFieldChange('address1', e.target.value)}
          placeholder="Street address"
          className={`form-input ${error?.address1 && touched?.address1 ? 'error' : ''}`}
          autoComplete="address-line1"
        />
        {error?.address1 && touched?.address1 && (
          <div className="error-message">{error.address1}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="address2" className="form-label">
          Address Line 2
        </label>
        <input
          type="text"
          id="address2"
          value={value?.address2 || ''}
          onChange={(e) => handleFieldChange('address2', e.target.value)}
          placeholder="Apartment, suite, etc. (optional)"
          className="form-input"
          autoComplete="address-line2"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city" className="form-label">
            City <span className="required">*</span>
          </label>
          <input
            type="text"
            id="city"
            value={value?.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="City"
            className={`form-input ${error?.city && touched?.city ? 'error' : ''}`}
            autoComplete="address-level2"
          />
          {error?.city && touched?.city && (
            <div className="error-message">{error.city}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="state" className="form-label">
            State/Province <span className="required">*</span>
          </label>
          <input
            type="text"
            id="state"
            value={value?.state || ''}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            placeholder="State or Province"
            className={`form-input ${error?.state && touched?.state ? 'error' : ''}`}
            autoComplete="address-level1"
          />
          {error?.state && touched?.state && (
            <div className="error-message">{error.state}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="postalCode" className="form-label">
            Postal Code <span className="required">*</span>
          </label>
          <input
            type="text"
            id="postalCode"
            value={value?.postalCode || ''}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            placeholder="Postal/ZIP code"
            className={`form-input ${error?.postalCode && touched?.postalCode ? 'error' : ''}`}
            autoComplete="postal-code"
          />
          {error?.postalCode && touched?.postalCode && (
            <div className="error-message">{error.postalCode}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="country" className="form-label">
            Country <span className="required">*</span>
          </label>
          <input
            type="text"
            id="country"
            value={value?.country || ''}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            placeholder="Country"
            className={`form-input ${error?.country && touched?.country ? 'error' : ''}`}
            autoComplete="country-name"
          />
          {error?.country && touched?.country && (
            <div className="error-message">{error.country}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressAutocomplete;