import React from 'react';

interface AlertBannerProps {
  type: 'error' | 'success' | 'info';
  message: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message }) => {
  if (!message) return null;

  const icons = {
    error: '⚠️',
    success: '✅',
    info: 'ℹ️',
  };

  return (
    <div className={`alert-banner alert-${type}`}>
      <span className="alert-icon">{icons[type]}</span>
      <span className="alert-text">{message}</span>
    </div>
  );
};
