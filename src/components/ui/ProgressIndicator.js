// src/components/ui/ProgressIndicator.js
import React from 'react';

const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="progress-indicator">
      <div className="progress-steps">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step.key} className="progress-step-wrapper">
              {/* Step Circle */}
              <div className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? (
                    <span className="checkmark">✓</span>
                  ) : (
                    <span className="step-number">{stepNumber}</span>
                  )}
                </div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className={`step-connector ${isCompleted ? 'completed' : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    </div>
  );
};

// Default step configuration
export const defaultSteps = [
  {
    key: 'personal',
    title: 'Personal Information',
    description: 'Basic details'
  },
  {
    key: 'contact',
    title: 'Contact Details',
    description: 'Address & phone'
  },
  {
    key: 'professional',
    title: 'Professional Info',
    description: 'Languages & social media'
  },
  {
    key: 'documents',
    title: 'Documents',
    description: 'CV upload'
  },
  {
    key: 'review',
    title: 'Review',
    description: 'Confirm & submit'
  }
];

export default ProgressIndicator;