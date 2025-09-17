import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AddressAutocomplete from '../ui/AddressAutocomplete';
import PhoneInput from '../ui/PhoneInput';
import CountrySelector from '../ui/CountrySelector';

// Complete validation schema
const ContactSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),

  emailConfirm: Yup.string()
    .oneOf([Yup.ref('email'), null], 'Email addresses must match')
    .required('Please confirm your email'),

  address: Yup.object().shape({
    address1: Yup.string().required('Address line 1 is required'),
    address2: Yup.string(),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State/Province is required'),
    postalCode: Yup.string().required('Postal code is required'),
    country: Yup.string().required('Country is required')
  }).required('Address is required'),

  phone: Yup.object().shape({
    countryCode: Yup.string().required('Country code is required'),
    number: Yup.string()
      .matches(/^[\d\s\-()]+$/, 'Phone number contains invalid characters')
      .min(7, 'Phone number is too short')
      .required('Phone number is required')
  }).required('Phone number is required'),

  country: Yup.object().shape({
    countryOfResidence: Yup.object().shape({
      code: Yup.string().required(),
      name: Yup.string().required(),
      flag: Yup.string().required()
    }).required('Country of residence is required'),
    nationality: Yup.object().shape({
      code: Yup.string().required(),
      name: Yup.string().required(),
      nationality: Yup.string().required(),
      flag: Yup.string().required()
    }).required('Nationality is required')
  }).required('Country and nationality selection is required')
});

const ContactStep = ({ formData = {}, setFormData, onNext, onValidationChange }) => {
  const [lastValidState, setLastValidState] = useState(null);

  const handleValidationChange = (isValid) => {
    if (onValidationChange && lastValidState !== isValid) {
      onValidationChange('contact', isValid);
      setLastValidState(isValid);
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Contact Details</h2>
        <p>Please provide your contact information and address.</p>
      </div>

      <Formik
        initialValues={{
          email: formData.email || '',
          emailConfirm: formData.emailConfirm || '',
          address: formData.address || {
            address1: '',
            address2: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          phone: formData.phone || {
            countryCode: '',
            countryIso: '',
            number: ''
          },
          country: formData.country || {
            countryOfResidence: null,
            nationality: null
          }
        }}
        validationSchema={ContactSchema}
        enableReinitialize={true}
        validate={(values) => {
          setFormData(prev => ({
            ...prev,
            ...values
          }));
        }}
      >
        {({ isValid, values, errors, touched, setFieldValue }) => {
          // Complete validation check
          const hasAllRequiredFields =
            values.email && values.emailConfirm &&
            values.address?.address1 && values.address?.city && values.address?.state &&
            values.address?.postalCode && values.address?.country &&
            values.phone?.countryCode && values.phone?.number && 
            values.country?.countryOfResidence && values.country?.nationality;

          const hasNoErrors = Object.keys(errors).length === 0;
          const currentlyValid = hasAllRequiredFields && hasNoErrors;

          if (lastValidState !== currentlyValid) {
            handleValidationChange(currentlyValid);
          }

          return (
            <Form className="contact-form">
              {/* Email Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                    placeholder="your.email@example.com"
                    autoComplete="email"
                  />
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="emailConfirm" className="form-label">
                    Confirm Email <span className="required">*</span>
                  </label>
                  <Field
                    type="email"
                    id="emailConfirm"
                    name="emailConfirm"
                    className={`form-input ${errors.emailConfirm && touched.emailConfirm ? 'error' : ''}`}
                    placeholder="Confirm your email address"
                    autoComplete="email"
                  />
                  <ErrorMessage name="emailConfirm" component="div" className="error-message" />
                </div>
              </div>

              {/* Address Section */}
              <AddressAutocomplete
                value={values.address}
                onChange={(address) => setFieldValue('address', address)}
                error={errors.address}
                touched={touched.address}
              />

              {/* Phone Input - uses form-group for better sizing */}
              <div className="form-group">
                <label className="form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <div style={{ maxWidth: '400px' }}>
                  <PhoneInput
                    value={values.phone}
                    onChange={(phone) => setFieldValue('phone', phone)}
                    error={errors.phone}
                    touched={touched.phone}
                  />
                </div>
              </div>

              {/* Country/Nationality Selector */}
              <CountrySelector
                value={values.country}
                onChange={(country) => setFieldValue('country', country)}
                error={errors.country}
                touched={touched.country}
              />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ContactStep;