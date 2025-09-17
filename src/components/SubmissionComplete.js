// src/components/SubmissionComplete.js
import React from 'react';
import { downloadSubmissionPdf } from '../services/summaryService';

const SubmissionComplete = ({ submission, onRestart }) => {
  return (
    <div className="container">
      <div className="form-container complete-container">
        <header className="complete-hero">
          <div className="complete-emoji" aria-hidden>🎉</div>
          <h2 className="complete-title">Application Submitted</h2>
          <p className="complete-subtitle">
            Thanks for applying! You can download a PDF copy of your submission below.
          </p>
        </header>

        <section className="complete-card">
          <h3 className="complete-card-title">Keep a Copy</h3>
          <p className="complete-card-sub">Download</p>

          <div className="complete-actions">
            <button
              type="button"
              className="btn btn-primary cta-btn-lg"
              onClick={() => downloadSubmissionPdf(submission)}
            >
              Download PDF
            </button>
          </div>
        </section>

        <div className="complete-footer">
          <button className="btn btn-secondary" type="button" onClick={onRestart}>
            Back to form
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionComplete;
