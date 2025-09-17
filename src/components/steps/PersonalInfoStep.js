import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema for personal information
const PersonalInfoSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .required('First name is required'),
  
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .required('Last name is required'),
  
  dateOfBirth: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .min(new Date('1900-01-01'), 'Please enter a valid birth date')
    .required('Date of birth is required'),
  
  gender: Yup.string()
    .oneOf(['male', 'female', 'other', 'prefer-not-to-say'], 'Please select a valid gender option')
    .required('Gender selection is required')
});

const PersonalInfoStep = ({ formData, setFormData, onNext, onValidationChange }) => {
  const [lastValidState, setLastValidState] = React.useState(null);

  const handleSubmit = (values, { setSubmitting }) => {
    // Update parent form data
    setFormData(prev => ({
      ...prev,
      ...values
    }));
    
    // Trigger next step if provided
    if (onNext) {
      onNext();
    }
    
    setSubmitting(false);
  };

  const handleValidationChange = (isValid) => {
    if (onValidationChange && lastValidState !== isValid) {
      onValidationChange('personal', isValid);
      setLastValidState(isValid);
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Personal Information</h2>
        <p>Please provide your basic personal details.</p>
      </div>

      <Formik
        initialValues={{
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          dateOfBirth: formData.dateOfBirth || '',
          gender: formData.gender || ''
        }}
        validationSchema={PersonalInfoSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validate={(values) => {
          // Auto-save on validation
          setFormData(prev => ({
            ...prev,
            ...values
          }));
        }}
      >
        {({ isValid, isSubmitting, values, errors, touched, setFieldValue }) => {
          // Check validation state and notify parent if changed
          const hasAllRequiredFields = values.firstName && values.lastName && values.dateOfBirth && values.gender;
          const hasNoErrors = Object.keys(errors).length === 0;
          const currentlyValid = hasAllRequiredFields && hasNoErrors;
          
          // Only call validation change if state actually changed
          if (lastValidState !== currentlyValid) {
            handleValidationChange(currentlyValid);
          }

          return (
            <Form className="personal-info-form">
              {/* First Name Field */}
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name <span className="required">*</span>
                </label>
                <Field
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={`form-input ${errors.firstName && touched.firstName ? 'error' : ''}`}
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                />
                <ErrorMessage name="firstName" component="div" className="error-message" />
              </div>

              {/* Last Name Field */}
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name <span className="required">*</span>
                </label>
                <Field
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={`form-input ${errors.lastName && touched.lastName ? 'error' : ''}`}
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                />
                <ErrorMessage name="lastName" component="div" className="error-message" />
              </div>

              {/* Date of Birth Field */}
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth <span className="required">*</span>
                </label>
                <Field
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className={`form-input ${errors.dateOfBirth && touched.dateOfBirth ? 'error' : ''}`}
                  max={new Date().toISOString().split('T')[0]} // Today's date
                  autoComplete="bday"
                />
                <ErrorMessage name="dateOfBirth" component="div" className="error-message" />
              </div>

              {/* Gender Field */}
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Gender <span className="required">*</span>
                </label>
                <Field
                  as="select"
                  id="gender"
                  name="gender"
                  className={`form-input ${errors.gender && touched.gender ? 'error' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </Field>
                <ErrorMessage name="gender" component="div" className="error-message" />
              </div>


            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default PersonalInfoStep;