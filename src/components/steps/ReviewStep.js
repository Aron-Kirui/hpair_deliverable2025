import React, { useEffect, useState } from 'react';
import { formatSize } from '../../services/pdfService';
import { getLanguageByCode } from '../../data/languages';

const Row = ({ label, value }) => (
  <div className="summary-item">
    <span className="summary-label">{label}</span>
    <span className="summary-value">{value || '—'}</span>
  </div>
);

const Section = ({ title, children, onEdit }) => (
  <div className="summary-section">
    <div className="summary-section-header">
      <div className="summary-title">{title}</div>
      {onEdit && (
        <button type="button" className="btn btn-secondary" onClick={onEdit}>
          Edit
        </button>
      )}
    </div>
    {children}
  </div>
);

const ReviewStep = ({ formData = {}, onValidationChange, goToStep }) => {
  useEffect(() => {
    onValidationChange && onValidationChange('review', true);
  }, [onValidationChange]);

  const addr = formData.address || {};
  const phone = formData.phone || {};
  const sm = formData.socialMedia || {};
  const cv = formData.documents?.cv || null;

  // human-readable language
  const langDisplay =
    formData.languagePreference === 'other'
      ? (formData.otherLanguage || '')
      : (getLanguageByCode(formData.languagePreference)?.name ||
         formData.languagePreference || '');

  // Handle new country structure
  const countryOfResidence = formData.country?.countryOfResidence?.name || '—';
  const nationality = formData.country?.nationality?.nationality || '—';

  // Handle social media presence
  const hasSocialMedia = formData.hasSocialMedia;
  const socialMediaPlatforms = sm?.platforms || [];

  // PDF preview url (create + cleanup here; DocumentStep has its own)
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    if (cv instanceof File && cv.type === 'application/pdf') {
      const url = URL.createObjectURL(cv);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [cv]);

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Review & Submit</h2>
        <p>Confirm your information before submitting your application.</p>
      </div>

      {/* Personal */}
      <Section title="Personal Information" onEdit={() => goToStep?.(1)}>
        <Row label="First name" value={formData.firstName} />
        <Row label="Last name" value={formData.lastName} />
        <Row label="Date of birth" value={formData.dateOfBirth} />
        <Row label="Gender" value={formData.gender} />
        <Row label="Email" value={formData.email} />
      </Section>

      {/* Contact */}
      <Section title="Contact Details" onEdit={() => goToStep?.(2)}>
        <Row label="Address line 1" value={addr.address1} />
        <Row label="Address line 2" value={addr.address2} />
        <Row label="City" value={addr.city} />
        <Row label="State/Province" value={addr.state} />
        <Row label="Postal Code" value={addr.postalCode} />
        <Row label="Country" value={addr.country} />
        <Row label="Phone" value={`${phone.countryCode || ''} ${phone.number || ''}`.trim()} />
        <Row label="Country of Residence" value={countryOfResidence} />
        <Row label="Nationality" value={nationality} />
      </Section>

      {/* Professional */}
      <Section title="Professional Info" onEdit={() => goToStep?.(3)}>
        <Row label="LinkedIn" value={formData.linkedin} />
        <Row label="Social Media Presence" value={hasSocialMedia === 'yes' ? 'Yes' : hasSocialMedia === 'no' ? 'No' : '—'} />
        
        {hasSocialMedia === 'yes' && socialMediaPlatforms?.length > 0 ? (
          <>
            {socialMediaPlatforms.includes('twitter') && <Row label="Twitter/X" value={sm.twitter} />}
            {socialMediaPlatforms.includes('instagram') && <Row label="Instagram" value={sm.instagram} />}
            {socialMediaPlatforms.includes('facebook') && <Row label="Facebook" value={sm.facebook} />}
            {socialMediaPlatforms.includes('github') && <Row label="GitHub" value={sm.github} />}
            {socialMediaPlatforms.includes('tiktok') && <Row label="TikTok" value={sm.tiktok} />}
            {socialMediaPlatforms.includes('youtube') && <Row label="YouTube" value={sm.youtube} />}
            {socialMediaPlatforms.includes('snapchat') && <Row label="Snapchat" value={sm.snapchat} />}
            {socialMediaPlatforms.includes('reddit') && <Row label="Reddit" value={sm.reddit} />}
            {socialMediaPlatforms.includes('twitch') && <Row label="Twitch" value={sm.twitch} />}
            {socialMediaPlatforms.includes('threads') && <Row label="Threads" value={sm.threads} />}
            {socialMediaPlatforms.includes('signal') && <Row label="Signal" value={sm.signal} />}
          </>
        ) : hasSocialMedia === 'yes' ? (
          <Row label="Social profiles" value="(no platforms selected)" />
        ) : null}
        
        <Row label="Preferred language" value={langDisplay} />
      </Section>

      {/* Documents */}
      <Section title="Documents" onEdit={() => goToStep?.(4)}>
        <Row
          label="CV (PDF)"
          value={
            cv
              ? `${cv.name || 'cv.pdf'} • ${
                  typeof cv.size === 'number' ? formatSize(cv.size) : '—'
                }`
              : '(not uploaded)'
          }
        />

        {previewUrl && (
          <div className="pdf-preview-card">
            <object data={previewUrl} type="application/pdf" className="pdf-object" aria-label="CV preview">
              <iframe title="CV preview" src={previewUrl} className="pdf-object" />
              <p className="pdf-fallback">
                Your browser can't display PDFs inline.{' '}
                <a href={previewUrl} target="_blank" rel="noreferrer">Open PDF</a>
              </p>
            </object>
          </div>
        )}
      </Section>

      <div className="auto-save-indicator">
        <div className="save-status" style={{ color: '#16a34a' }}>✔ Ready to submit</div>
      </div>
    </div>
  );
};

export default ReviewStep;