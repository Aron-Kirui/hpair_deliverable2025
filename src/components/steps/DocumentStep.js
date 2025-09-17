import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const DocSchema = Yup.object().shape({
  documents: Yup.object({
    cv: Yup.mixed()
      .required('Please upload your CV (PDF)')
      .test('file-type', 'Only PDF files are allowed', (f) => {
        if (!f) return false;
        // Allow file metadata from auto-save
        if (f.isFile || f.isMissing) return true;
        return f.type === 'application/pdf';
      })
      .test('file-size', `File must be ≤ ${MAX_MB} MB`, (f) => {
        if (!f) return false;
        // Allow file metadata from auto-save
        if (f.isFile || f.isMissing) return f.size <= MAX_BYTES;
        return f.size <= MAX_BYTES;
      }),
  }),
});

const DocumentStep = ({ formData = {}, setFormData, onValidationChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const lastObjectUrl = useRef(null);
  const [localError, setLocalError] = useState('');
  const [restorationMessage, setRestorationMessage] = useState('');

  const initial = useMemo(
    () => ({
      documents: { cv: formData.documents?.cv || null },
    }),
    [formData.documents]
  );

  // Handle file restoration from auto-save
  useEffect(() => {
    const cv = formData.documents?.cv;
    
    if (cv?.isMissing) {
      // File was uploaded before but needs re-selection
      setRestorationMessage(`Your previously uploaded file "${cv.name}" needs to be re-selected due to browser limitations.`);
      // Mark as valid since user had uploaded a file before
      onValidationChange && onValidationChange('documents', true);
    } else if (cv?.isFile && !cv?.isMissing) {
      // File metadata exists, mark as valid
      setRestorationMessage(`File "${cv.name}" was previously uploaded. You can continue or re-upload if needed.`);
      onValidationChange && onValidationChange('documents', true);
    } else {
      setRestorationMessage('');
    }
  }, [formData.documents?.cv, onValidationChange]);

  // Build & cleanup preview URL whenever file changes
  useEffect(() => {
    const file = initial.documents.cv;
    if (file instanceof File && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      lastObjectUrl.current = url;
      return () => {
        if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
      };
    }
    setPreviewUrl(null);
  }, [initial.documents.cv]);

  const handleFile = (file, setFieldValue) => {
    setLocalError('');
    setRestorationMessage(''); // Clear restoration message when new file is selected
    
    if (!file) {
      setFieldValue('documents.cv', null);
      setFormData((prev) => ({ ...prev, documents: { ...prev.documents, cv: null } }));
      onValidationChange && onValidationChange('documents', false);
      return;
    }
    
    if (file.type !== 'application/pdf') {
      setLocalError('Only PDF files are allowed');
      onValidationChange && onValidationChange('documents', false);
      return;
    }
    
    if (file.size > MAX_BYTES) {
      setLocalError(`File must be ≤ ${MAX_MB} MB`);
      onValidationChange && onValidationChange('documents', false);
      return;
    }

    // Update Formik and parent once
    setFieldValue('documents.cv', file);
    setFormData((prev) => ({ ...prev, documents: { ...prev.documents, cv: file } }));
    onValidationChange && onValidationChange('documents', true);
  };

  const getFileLabel = (file) => {
    if (!file) return '(none)';
    
    if (file instanceof File) {
      return `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
    }
    
    // Handle file metadata from auto-save
    if (file.isFile || file.isMissing) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const status = file.isMissing ? ' (needs re-selection)' : ' (previously uploaded)';
      return `${file.name} • ${sizeMB} MB${status}`;
    }
    
    return '(none)';
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Documents</h2>
        <p>Upload your CV (PDF only, max {MAX_MB}MB). A preview will appear below.</p>
      </div>

      <Formik
        initialValues={initial}
        validationSchema={DocSchema}
        enableReinitialize={false}
      >
        {({ values, errors, setFieldValue }) => {
          const file = values.documents.cv;
          const fileLabel = getFileLabel(file);

          return (
            <Form className="professional-form">
              {/* Show restoration message if file needs to be re-uploaded */}
              {restorationMessage && (
                <div className="restoration-message">
                  <div className="restoration-icon">ℹ️</div>
                  <div className="restoration-text">{restorationMessage}</div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  CV (PDF) <span className="required">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-input"
                  onChange={(e) => handleFile(e.currentTarget.files?.[0], setFieldValue)}
                />
                <div className="field-hint">Selected: {fileLabel}</div>
                {(localError || errors.documents?.cv) && (
                  <div className="error-message">{localError || errors.documents.cv}</div>
                )}
              </div>

              {/* Preview area */}
              <div className="form-group">
                <div className="pdf-preview-card">
                  {previewUrl ? (
                    <object data={previewUrl} type="application/pdf" className="pdf-object" aria-label="PDF preview">
                      <iframe title="PDF preview" src={previewUrl} className="pdf-object" />
                      <p className="pdf-fallback">
                        Your browser can't display PDFs inline.{' '}
                        <a href={previewUrl} target="_blank" rel="noreferrer">Open PDF</a>
                      </p>
                    </object>
                  ) : file?.isFile || file?.isMissing ? (
                    <div className="pdf-missing">
                      <div className="pdf-missing-icon">📄</div>
                      <div className="pdf-missing-text">
                        <strong>{file.name}</strong>
                        <br />
                        {file.isMissing ? 'File needs to be re-selected to show preview' : 'Previously uploaded file - re-select to preview'}
                      </div>
                    </div>
                  ) : (
                    <div className="pdf-empty">No file selected</div>
                  )}
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default DocumentStep;