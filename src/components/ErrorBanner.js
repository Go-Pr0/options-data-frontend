import React, { useState } from 'react';

const ErrorBanner = ({ error, onDismiss, onRetry }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="error-banner animate-slide-up">
      <div className="error-content">
        <div className="error-icon">
          ⚠️
        </div>
        <div className="error-message">
          <h4 className="error-title">Connection Error</h4>
          <p className="error-description">{error}</p>
        </div>
        <div className="error-actions">
          {onRetry && (
            <button className="btn btn-sm btn-outline" onClick={onRetry}>
              Retry
            </button>
          )}
          <button className="btn btn-sm btn-ghost" onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;