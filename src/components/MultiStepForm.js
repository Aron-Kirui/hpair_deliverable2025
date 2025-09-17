// src/components/MultiStepForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import PersonalInfoStep from './steps/PersonalInfoStep';
import ContactStep from './steps/ContactStep';
import ProfessionalStep from './steps/ProfessionalStep';
import DocumentStep from './steps/DocumentStep';
import ReviewStep from './steps/ReviewStep';
import SubmissionComplete from './SubmissionComplete';

import ProgressIndicator, { defaultSteps } from './ui/ProgressIndicator';

import { submitForm } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../services/authService';

// Keep everything the steps may reference so we never hit undefined
const initialForm = {
  // Personal
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',

  // Contact
  email: '',
  emailConfirm: '',
  address: { address1: '', address2: '', city: '', state: '', postalCode: '', country: '' },
  phone: { countryCode: '', countryIso: '', number: '' },
  country: null, // { code, name, nationality }

  // Professional
  linkedin: '',
  socialMedia: { platforms: [], twitter: '', instagram: '', facebook: '', github: '' },
  languagePreference: '',
  otherLanguage: '',

  // Documents
  documents: { cv: null }, // File (in memory) until we sanitize on submit
};

// --- helpers to strip File before saving to Firestore ---
const fileToMeta = (f) =>
  f
    ? { name: f.name, size: f.size, type: f.type, lastModified: f.lastModified }
    : null;

function sanitizeForSave(data) {
  const cv = data?.documents?.cv;
  return {
    ...data,
    documents: {
      cv: cv instanceof File ? fileToMeta(cv) : (cv || null),
    },
  };
}

const MultiStepForm = () => {
  const { user, userId } = useAuth();
  const totalSteps = defaultSteps.length;

  // Auto-save key for this user's form data
  const AUTOSAVE_KEY = `form_progress_${userId}`;
  
  // Load saved data on mount
  const loadSavedData = () => {
    if (!userId) return { formData: initialForm, currentStep: 1, stepValidation: {} };
    
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Loaded saved data:', parsed);
        
        // Handle file restoration
        let restoredFormData = parsed.formData;
        let needsValidationReset = false;
        
        if (parsed.formData?.documents?.cv?.isFile) {
          // File was uploaded but can't be restored, show metadata but mark as missing
          restoredFormData = {
            ...parsed.formData,
            documents: {
              ...parsed.formData.documents,
              cv: {
                ...parsed.formData.documents.cv,
                isMissing: true // Flag to show user that file needs re-upload
              }
            }
          };
          needsValidationReset = true;
        }
        
        // Reset step validation if file is missing or if we're past the document step
        let validationState = parsed.stepValidation || {};
        if (needsValidationReset) {
          // Clear document and review step validation since file is missing
          validationState = {
            ...validationState,
            documents: false,
            review: false
          };
        }
        
        // Always ensure current step doesn't exceed document step if file is missing
        let currentStep = parsed.currentStep || 1;
        if (needsValidationReset && currentStep > 4) {
          currentStep = 4; // Reset to document step
        }
        
        return {
          formData: restoredFormData,
          currentStep,
          stepValidation: validationState
        };
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
    return {
      formData: initialForm,
      currentStep: 1,
      stepValidation: {}
    };
  };

  const savedState = loadSavedData();
  
  const [currentStep, setCurrentStep] = useState(savedState.currentStep);
  const [formData, setFormData] = useState(savedState.formData);
  const [stepValidation, setStepValidation] = useState(savedState.stepValidation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [complete, setComplete] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
  };

  // Auto-save function - wrapped in useCallback
  const saveProgress = useCallback(() => {
    if (!userId) return;
    
    try {
      // Create a serializable copy of formData
      const serializableFormData = {
        ...formData,
        documents: {
          ...formData.documents,
          // Convert File to metadata for storage, but keep a flag
          cv: formData.documents.cv instanceof File ? {
            isFile: true,
            name: formData.documents.cv.name,
            size: formData.documents.cv.size,
            type: formData.documents.cv.type,
            lastModified: formData.documents.cv.lastModified
          } : formData.documents.cv
        }
      };

      const dataToSave = {
        formData: serializableFormData,
        currentStep,
        stepValidation,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(dataToSave));
      console.log('Saved progress:', dataToSave);
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [userId, formData, currentStep, stepValidation, AUTOSAVE_KEY]);

  // Clear saved data
  const clearSavedData = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
  };

  // Auto-save when form data changes
  useEffect(() => {
    if (!userId) return;
    
    const timer = setTimeout(() => {
      saveProgress();
    }, 1000); // Save 1 second after changes stop

    return () => clearTimeout(timer);
  }, [formData, currentStep, stepValidation, userId, saveProgress]);

  // validation signal from each step
  const handleStepValidation = (stepKey, isValid) => {
    setStepValidation((prev) => {
      const newValidation = { ...prev, [stepKey]: isValid };
      
      // If document step becomes invalid, also invalidate review step
      if (stepKey === 'documents' && !isValid) {
        newValidation.review = false;
      }
      
      return newValidation;
    });
  };

  // Clear any global submit message whenever you navigate
  useEffect(() => {
    setSubmitMessage('');
  }, [currentStep]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.form-header-layout')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // navigation
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setSubmitMessage('');
      
      // Additional validation before moving to review step
      if (currentStep === 4) { // Moving from documents to review
        const documentsValid = stepValidation.documents === true;
        if (!documentsValid) {
          console.log('Cannot proceed to review - documents step not valid');
          return;
        }
      }
      
      setCurrentStep((s) => s + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setSubmitMessage('');
      setCurrentStep((s) => s - 1);
    }
  };
  
  const goToStep = (n) => {
    if (n >= 1 && n <= totalSteps) {
      setSubmitMessage('');
      
      // Don't allow jumping to review step if documents aren't valid
      if (n === 5 && stepValidation.documents !== true) {
        console.log('Cannot jump to review - documents step not valid');
        return;
      }
      
      setCurrentStep(n);
    }
  };

  // gate the Next/Submit buttons
  const isCurrentStepValid = () => {
    const key = defaultSteps[currentStep - 1]?.key;
    return stepValidation[key] === true;
  };

  // step renderer
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            setFormData={setFormData}
            onValidationChange={handleStepValidation}
          />
        );
      case 2:
        return (
          <ContactStep
            formData={formData}
            setFormData={setFormData}
            onValidationChange={handleStepValidation}
          />
        );
      case 3:
        return (
          <ProfessionalStep
            formData={formData}
            setFormData={setFormData}
            onValidationChange={handleStepValidation}
          />
        );
      case 4:
        return (
          <DocumentStep
            formData={formData}
            setFormData={setFormData}
            onValidationChange={handleStepValidation}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            onValidationChange={handleStepValidation}
            goToStep={goToStep}
          />
        );
      default:
        return null;
    }
  };

  // submit from Review step
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== totalSteps) return; // guard: only submit on Review
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Save a Firestore-friendly copy (no File objects)
      const submissionData = sanitizeForSave({ ...formData, userId });
      const result = await submitForm(submissionData);

      if (result.success) {
        // Clear saved progress after successful submission
        clearSavedData();
        
        // Keep a client-only copy that *preserves* the File for the closing page
        const clientCopy = {
          ...submissionData,
          documents: {
            ...submissionData.documents,
            cv: formData.documents.cv instanceof File
              ? formData.documents.cv
              : submissionData.documents.cv,
          },
        };

        setLastSubmitted(clientCopy);
        setComplete(true); // show closing page
      } else {
        setSubmitMessage(result.message || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitMessage('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // closing page after successful submit
  if (complete && lastSubmitted) {
    return (
      <SubmissionComplete
        submission={lastSubmitted}
        onRestart={() => {
          setComplete(false);
          setFormData(initialForm);
          setCurrentStep(1);
          setStepValidation({});
          setSubmitMessage('');
        }}
      />
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        {/* Header */}
        <div className="form-header-layout">
          <div className="form-title-section">
            <h1>Personal Information Form</h1>
          </div>
          
          <div className="header-actions">
            <Link 
              to="/submission-history"
              className="btn btn-secondary"
            >
              Submission History
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
          
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="hamburger">
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
          </button>
          
          {mobileMenuOpen && (
            <div className="mobile-menu show">
              <Link to="/submission-history" className="mobile-menu-item">
                Submission History
              </Link>
              <button onClick={handleLogout} className="mobile-menu-item">
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="user-info-display">
          <strong>Logged in as:</strong> {user.email}
        </div>

        {/* Progress - Desktop only */}
        <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} steps={defaultSteps} />
        
        {/* Progress - Mobile dots only */}
        <div className="progress-steps-redesign">
          {[1,2,3,4,5].map((step, index) => (
            <React.Fragment key={step}>
              <div className={`step-dot ${step < currentStep ? 'completed' : step === currentStep ? 'active' : ''}`}></div>
              {index < 4 && <div className={`step-divider ${step < currentStep ? 'completed' : ''}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Steps */}
        <form onSubmit={handleSubmit}>
          {renderCurrentStep()}

          {/* Show submit message only on the Review step */}
          {currentStep === totalSteps && submitMessage && (
            <div className={`submit-message ${submitMessage.toLowerCase().includes('success') ? 'success' : 'error'}`}>
              {submitMessage}
            </div>
          )}

          {/* Nav buttons */}
          <div className="form-actions">
            <div className="nav-buttons">
              {currentStep > 1 && (
                <button type="button" onClick={goToPreviousStep} className="btn btn-secondary">
                  Previous
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="btn btn-primary"
                  disabled={!isCurrentStepValid()}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !isCurrentStepValid()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiStepForm;