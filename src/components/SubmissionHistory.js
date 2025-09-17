import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFormSubmissions, getSubmissionCount } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../services/authService';
import { getLanguageByCode } from '../data/languages';

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, userId } = useAuth();

  const handleLogout = async () => {
    await signOutUser();
  };

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const [submissionsResult, countResult] = await Promise.all([
        getFormSubmissions(),
        getSubmissionCount()
      ]);

      if (submissionsResult.success) {
        const userSubmissions = submissionsResult.data.filter((s) => s.userId === userId);
        setSubmissions(userSubmissions);
      } else {
        setError(submissionsResult.message);
      }

      if (countResult.success) {
        setSubmissionCount(countResult.count);
      }
    } catch (err) {
      setError('Failed to load submissions');
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const getLanguageName = (languageCode) => {
    if (!languageCode) return 'N/A';
    const language = getLanguageByCode(languageCode);
    return language ? language.name : languageCode; // Fallback to code if not found
  };

  // Helper function to get country name from new or old structure
  const getCountryName = (submission) => {
    // New structure
    if (submission.country?.countryOfResidence?.name) {
      return submission.country.countryOfResidence.name;
    }
    // Old structure (fallback)
    if (submission.country?.name) {
      return submission.country.name;
    }
    return 'N/A';
  };

  // Helper function to get nationality from new or old structure
  const getNationality = (submission) => {
    // New structure
    if (submission.country?.nationality?.nationality) {
      return submission.country.nationality.nationality;
    }
    // Old structure (fallback)
    if (submission.country?.nationality) {
      return submission.country.nationality;
    }
    return 'N/A';
  };

  // Helper function to get social media platforms
  const getSocialMediaPlatforms = (submission) => {
    const socialMedia = submission.socialMedia;
    if (!socialMedia || submission.hasSocialMedia === 'no') return [];
    
    return socialMedia.platforms || [];
  };

  if (loading) {
    return (
      <div className="container">
        <div className="form-container">
          <h2>Loading your submission history...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <div className="history-header">
          <div className="history-title">
            <h1>Your Submission History</h1>
            <p className="history-description">
              View all your submitted forms and track your application history.
            </p>
          </div>
          <div className="history-actions">
            <Link to="/" className="btn btn-primary">
              Back to Form
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
        
        <div className="user-info-card">
          <div className="user-info-grid">
            <div className="user-info-item">
              <div className="user-info-label">Logged in as</div>
              <div className="user-info-value">{user.email}</div>
            </div>
            <div className="user-info-item">
              <div className="user-info-label">Your submissions</div>
              <div className="user-info-value">{submissions.length}</div>
            </div>
            <div className="user-info-item">
              <div className="user-info-label">Total submissions</div>
              <div className="user-info-value">{submissionCount}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="submit-message error">
            {error}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No submissions yet</h3>
            <p>You haven't submitted any forms yet. Start by filling out your first application!</p>
            <Link to="/" className="btn btn-primary">
              Create First Submission
            </Link>
          </div>
        ) : (
          <div>
            <div className="applications-header">
              <h2 className="applications-count">Your Applications ({submissions.length})</h2>
              <button 
                onClick={loadSubmissions} 
                className="btn btn-secondary refresh-btn"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="submissions-list">
              {submissions.map((submission, index) => {
                const platforms = getSocialMediaPlatforms(submission);
                
                return (
                  <div key={submission.id} className="history-submission-item">
                    <div className="history-submission-header">
                      <h3>Application #{submissions.length - index}</h3>
                      <span className="history-submission-date">
                        {formatDate(submission.submittedAt)}
                      </span>
                    </div>
                    
                    <div className="history-submission-details">
                      <div className="submission-basic-info">
                        <div className="info-section">
                          <div className="info-item">
                            <span className="info-label">Name</span>
                            <span className="info-value">{submission.firstName} {submission.lastName}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Date of Birth</span>
                            <span className="info-value">{submission.dateOfBirth || 'N/A'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Gender</span>
                            <span className="info-value">{submission.gender || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="info-section">
                          <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value">{submission.email || 'N/A'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Country of Residence</span>
                            <span className="info-value">{getCountryName(submission)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Nationality</span>
                            <span className="info-value">{getNationality(submission)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Language</span>
                            <span className="info-value">{getLanguageName(submission.languagePreference)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {(submission.linkedin || platforms.length > 0) && (
                        <div className="professional-section">
                          <h4>Professional Information</h4>
                          
                          {submission.linkedin && (
                            <div>
                              <a 
                                href={submission.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="linkedin-link"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                          
                          {submission.hasSocialMedia === 'yes' && platforms.length > 0 && (
                            <div className="social-media-grid">
                              {platforms.map(platform => {
                                const url = submission.socialMedia[platform];
                                if (!url) return null;
                                return (
                                  <a 
                                    key={platform}
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="social-link"
                                  >
                                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                          
                          {submission.hasSocialMedia === 'no' && (
                            <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                              No social media presence
                            </div>
                          )}
                        </div>
                      )}

                      <div className="history-submission-id">
                        <strong>Submission ID:</strong> {submission.id}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bottom-action">
          <Link to="/" className="btn btn-primary">
            Submit Another Application
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubmissionHistory;