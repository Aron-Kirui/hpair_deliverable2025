import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import LanguageSelect from '../ui/LanguageSelect';

// --- inline brand icons
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18 2h3l-7.5 8.5L22 22h-6L10.7 13.9 5 22H2l8.3-9.4L2 2h6l4.7 7.1L18 2z" fill="currentColor"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" fill="currentColor"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.3-1.8 1.9-1.8H17V2.2C16.6 2.1 15.4 2 14 2c-3 0-5 1.8-5 5.1V10H6v4h3v8h4z" fill="currentColor"/>
  </svg>
);
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.6-4-1.6a3.2 3.2 0 0 0-1.3-1.8c-1-.7.1-.7.1-.7a2.5 2.5 0 0 1 1.8 1.2 2.6 2.6 0 0 0 3.6 1 2.6 2.6 0 0 1 .8-1.6c-2.7-.3-5.6-1.3-5.6-6a4.7 4.7 0 0 1 1.2-3.2 4.3 4.3 0 0 1 .1-3.1s1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.4 1 .4 2.1.1 3.1a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.9 5.6-5.6 6 .5.4.9 1.2.9 2.5v3.7c0 .4.2.7.8.6A12 12 0 0 0 12 .5z" fill="currentColor"/>
  </svg>
);
const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="currentColor"/>
  </svg>
);
const YouTubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
  </svg>
);
const SnapchatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.89 2.744.099.118.112.222.085.344-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.840-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" fill="currentColor"/>
  </svg>
);
const RedditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" fill="currentColor"/>
  </svg>
);
const TwitchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" fill="currentColor"/>
  </svg>
);
const ThreadsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.74-1.811-.37-.48-.84-.84-1.393-1.07-.475-.197-1.092-.338-1.83-.338-.739 0-1.355.141-1.83.338-.553.23-1.023.59-1.393 1.07-.297.384-.503.835-.615 1.34l-1.858-.51c.266-.968.63-1.779 1.106-2.438.697-.965 1.611-1.654 2.718-2.046.734-.26 1.57-.396 2.487-.396.916 0 1.753.136 2.487.396 1.107.392 2.021 1.081 2.718 2.046.697.965 1.174 2.145 1.421 3.518 1.048.68 1.786 1.647 2.175 2.91.52 1.691.402 4.386-1.966 6.871-1.738 1.825-4.056 2.64-7.304 2.663zm-.047-10.814c-.748.036-1.313.24-1.676.6-.344.342-.504.78-.459 1.29.037.413.262.85.655 1.237.394.389.918.608 1.553.608.635 0 1.159-.219 1.553-.608.394-.389.618-.824.655-1.237.045-.51-.115-.948-.459-1.29-.363-.36-.928-.564-1.676-.6-.145-.008-.293-.008-.438 0z" fill="currentColor"/>
  </svg>
);
const SignalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16.706a.5.5 0 0 1-.708 0l-2.5-2.5a.5.5 0 0 1 0-.707l.354-.354a.5.5 0 0 1 .707 0l1.793 1.794L20.086 12a.5.5 0 0 1 .707 0l.354.354a.5.5 0 0 1 0 .707l-3.253 3.645zm-5.541-5.412a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5zm0-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" fill="currentColor"/>
  </svg>
);

// --- helpers: accept handle OR URL; normalize to canonical URL
const handleOrUrl = (val) => !val || /^https?:\/\//i.test(val) || /^@?[A-Za-z0-9_.-]+$/.test(val);
const normalizeSocial = (platform, val) => {
  if (!val) return '';
  let v = val.trim();
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      v = u.pathname.replace(/^\/@?/, '');
    } catch { /* keep raw */ }
  } else {
    v = v.replace(/^@/, '');
  }
  const bases = {
    twitter: 'https://x.com/',
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    github: 'https://github.com/',
    tiktok: 'https://tiktok.com/@',
    youtube: 'https://youtube.com/@',
    snapchat: 'https://snapchat.com/add/',
    reddit: 'https://reddit.com/u/',
    twitch: 'https://twitch.tv/',
    threads: 'https://threads.net/@',
    signal: '',
  };
  return bases[platform] !== undefined ? (bases[platform] + v) : val;
};

// --- validation
const ProfessionalSchema = Yup.object().shape({
  linkedin: Yup.string()
    .url('Please enter a valid URL')
    .matches(
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
      'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/your-profile)'
    )
    .required('LinkedIn URL is required'),

  hasSocialMedia: Yup.string()
    .oneOf(['yes', 'no'], 'Please select an option')
    .required('Please select whether you have social media presence'),

  socialMedia: Yup.object().shape({
    platforms: Yup.array().of(Yup.string()),
    twitter: Yup.string().test('handle-or-url', 'Enter a URL or @handle', handleOrUrl),
    instagram: Yup.string().test('handle-or-url', 'Enter a URL or @handle', handleOrUrl),
    facebook: Yup.string().test('handle-or-url', 'Enter a URL or @handle', handleOrUrl),
    github: Yup.string().test('handle-or-url', 'Enter a URL or username', handleOrUrl),
    tiktok: Yup.string().test('handle-or-url', 'Enter a URL or @handle', handleOrUrl),
    youtube: Yup.string().test('handle-or-url', 'Enter a URL or @handle', handleOrUrl),
    snapchat: Yup.string().test('handle-or-url', 'Enter a URL or username', handleOrUrl),
    reddit: Yup.string().test('handle-or-url', 'Enter a URL or username', handleOrUrl),
    twitch: Yup.string().test('handle-or-url', 'Enter a URL or username', handleOrUrl),
    threads: Yup.string().test('handle-or-url', 'Enter a URL or @handle', handleOrUrl),
    signal: Yup.string().test('handle-or-url', 'Enter username', handleOrUrl),
  }),

  languagePreference: Yup.string()
    .required('Language preference is required'),

  otherLanguage: Yup.string().when('languagePreference', {
    is: 'other',
    then: (schema) => schema.required('Please specify your preferred language').min(2, 'Too short'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const ProfessionalStep = ({ formData = {}, setFormData, onNext, onValidationChange }) => {
  const [lastValidState, setLastValidState] = useState(null);

  const socialMediaPlatforms = [
    { id: 'twitter', name: 'Twitter/X', Icon: XIcon },
    { id: 'instagram', name: 'Instagram', Icon: InstagramIcon },
    { id: 'facebook', name: 'Facebook', Icon: FacebookIcon },
    { id: 'github', name: 'GitHub', Icon: GitHubIcon },
    { id: 'tiktok', name: 'TikTok', Icon: TikTokIcon },
    { id: 'youtube', name: 'YouTube', Icon: YouTubeIcon },
    { id: 'snapchat', name: 'Snapchat', Icon: SnapchatIcon },
    { id: 'reddit', name: 'Reddit', Icon: RedditIcon },
    { id: 'twitch', name: 'Twitch', Icon: TwitchIcon },
    { id: 'threads', name: 'Threads', Icon: ThreadsIcon },
    { id: 'signal', name: 'Signal', Icon: SignalIcon },
  ];

  const handleValidationChange = (isValid) => {
    if (onValidationChange && lastValidState !== isValid) {
      onValidationChange('professional', isValid);
      setLastValidState(isValid);
    }
  };

  const validateLinkedInUrl = (url) => {
    if (!url) return false;
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinRegex.test(url);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Professional Information</h2>
        <p>Share your professional presence and communication preferences.</p>
      </div>

      <Formik
        initialValues={{
          linkedin: formData.linkedin || '',
          hasSocialMedia: formData.hasSocialMedia || '',
          socialMedia: {
            platforms: formData.socialMedia?.platforms || [],
            twitter: formData.socialMedia?.twitter || '',
            instagram: formData.socialMedia?.instagram || '',
            facebook: formData.socialMedia?.facebook || '',
            github: formData.socialMedia?.github || '',
            tiktok: formData.socialMedia?.tiktok || '',
            youtube: formData.socialMedia?.youtube || '',
            snapchat: formData.socialMedia?.snapchat || '',
            reddit: formData.socialMedia?.reddit || '',
            twitch: formData.socialMedia?.twitch || '',
            threads: formData.socialMedia?.threads || '',
            signal: formData.socialMedia?.signal || ''
          },
          languagePreference: formData.languagePreference || '',
          otherLanguage: formData.otherLanguage || ''
        }}
        validationSchema={ProfessionalSchema}
        enableReinitialize={true}
        validate={(values) => {
          // normalize optional socials to canonical URLs in saved formData (UX-friendly)
          const norm = { ...values, socialMedia: { ...values.socialMedia } };
          socialMediaPlatforms.forEach(({ id }) => {
            norm.socialMedia[id] = normalizeSocial(id, values.socialMedia[id]);
          });
          setFormData(prev => ({ ...prev, ...norm }));
        }}
      >
        {({ values, errors, touched, setFieldValue }) => {
          const hasLinkedIn = values.linkedin && validateLinkedInUrl(values.linkedin);
          const hasSocialMediaChoice = values.hasSocialMedia;
          const hasLanguage = values.languagePreference &&
            (values.languagePreference !== 'other' || (values.otherLanguage && values.otherLanguage.trim().length >= 2));
          
          const currentlyValid = hasLinkedIn && hasSocialMediaChoice && hasLanguage && Object.keys(errors).length === 0;

          if (lastValidState !== currentlyValid) handleValidationChange(currentlyValid);

          return (
            <Form className="professional-form">
              {/* LinkedIn URL */}
              <div className="form-group">
                <label htmlFor="linkedin" className="form-label">
                  LinkedIn Profile URL <span className="required">*</span>
                </label>
                <Field
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  className={`form-input ${errors.linkedin && touched.linkedin ? 'error' : ''}`}
                  placeholder="https://linkedin.com/in/your-profile"
                  autoComplete="url"
                />
                <ErrorMessage name="linkedin" component="div" className="error-message" />
                <div className="field-hint">Paste your LinkedIn profile URL.</div>
              </div>

              {/* Social Media Presence Question */}
              <div className="form-group">
                <label className="form-label">
                  Do you have social media presence? <span className="required">*</span>
                </label>
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <Field
                      type="radio"
                      name="hasSocialMedia"
                      value="yes"
                      className="checkbox-input"
                      onChange={(e) => {
                        setFieldValue('hasSocialMedia', 'yes');
                      }}
                    />
                    <span className="checkbox-label">Yes, I have social media profiles</span>
                  </label>
                  <label className="checkbox-item">
                    <Field
                      type="radio"
                      name="hasSocialMedia"
                      value="no"
                      className="checkbox-input"
                      onChange={(e) => {
                        setFieldValue('hasSocialMedia', 'no');
                        // Clear all social media data when selecting "no"
                        setFieldValue('socialMedia.platforms', []);
                        socialMediaPlatforms.forEach(({ id }) => {
                          setFieldValue(`socialMedia.${id}`, '');
                        });
                      }}
                    />
                    <span className="checkbox-label">No, I don't use social media</span>
                  </label>
                </div>
                <ErrorMessage name="hasSocialMedia" component="div" className="error-message" />
              </div>

              {/* Social media selection (only if user has social media) */}
              {values.hasSocialMedia === 'yes' && (
                <div className="form-group">
                  <label className="form-label">Select Your Social Media Platforms (Optional)</label>
                  <div className="checkbox-group">
                    {socialMediaPlatforms.map(({ id, name, Icon }) => (
                      <label key={id} className="checkbox-item">
                        <Field
                          type="checkbox"
                          name="socialMedia.platforms"
                          value={id}
                          className="checkbox-input"
                          onChange={(e) => {
                            const list = values.socialMedia.platforms || [];
                            if (e.target.checked) {
                              setFieldValue('socialMedia.platforms', [...list, id]);
                            } else {
                              setFieldValue('socialMedia.platforms', list.filter(p => p !== id));
                              setFieldValue(`socialMedia.${id}`, '');
                            }
                          }}
                        />
                        <span className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Icon /> {name}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="field-hint">
                    Select the platforms where you have profiles. You can enter a full URL or just your @handle/username.
                  </div>
                </div>
              )}

              {/* Dynamic URL/handle inputs for selected platforms */}
              {values.hasSocialMedia === 'yes' && socialMediaPlatforms.map(({ id, name }) => {
                const selected = values.socialMedia.platforms?.includes(id);
                if (!selected) return null;
                const fieldName = `socialMedia.${id}`;
                const fieldError = errors.socialMedia?.[id];
                const fieldTouched = touched?.socialMedia?.[id];

                const placeholders = {
                  twitter: 'https://x.com/yourname or @yourname',
                  instagram: 'https://instagram.com/yourname or @yourname',
                  facebook: 'https://facebook.com/yourname or yourname',
                  github: 'https://github.com/yourname or yourname',
                  tiktok: 'https://tiktok.com/@yourname or @yourname',
                  youtube: 'https://youtube.com/@yourname or @yourname',
                  snapchat: 'https://snapchat.com/add/yourname or yourname',
                  reddit: 'https://reddit.com/u/yourname or yourname',
                  twitch: 'https://twitch.tv/yourname or yourname',
                  threads: 'https://threads.net/@yourname or @yourname',
                  signal: 'yourname.01 or username'
                };

                return (
                  <div key={id} className="form-group social-media-url-group">
                    <label htmlFor={fieldName} className="form-label">
                      {name} Profile (Optional)
                    </label>
                    <Field
                      type="text"
                      id={fieldName}
                      name={fieldName}
                      className={`form-input ${fieldError && fieldTouched ? 'error' : ''}`}
                      placeholder={placeholders[id]}
                    />
                    <ErrorMessage name={fieldName} component="div" className="error-message" />
                  </div>
                );
              })}

              {/* Language preference (searchable) */}
              <div className="form-group">
                <label className="form-label">
                  Preferred Communication Language <span className="required">*</span>
                </label>
                <LanguageSelect
                  value={values.languagePreference}
                  onChange={(code) => setFieldValue('languagePreference', code)}
                  error={errors.languagePreference}
                  touched={touched.languagePreference}
                />
                <ErrorMessage name="languagePreference" component="div" className="error-message" />
                <div className="field-hint">We'll try to contact you in this language.</div>
              </div>

              {values.languagePreference === 'other' && (
                <div className="form-group">
                  <label htmlFor="otherLanguage" className="form-label">
                    Specify Language <span className="required">*</span>
                  </label>
                  <Field
                    type="text"
                    id="otherLanguage"
                    name="otherLanguage"
                    className={`form-input ${errors.otherLanguage && touched.otherLanguage ? 'error' : ''}`}
                    placeholder="Type your preferred language"
                  />
                  <ErrorMessage name="otherLanguage" component="div" className="error-message" />
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ProfessionalStep;