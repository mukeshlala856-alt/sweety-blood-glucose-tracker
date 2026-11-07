import React from 'react';

interface AlertBannerProps {
  type: 'error' | 'success';
  message: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      {type === 'error' ? '⚠️ ' : '✅ '}
      {message}
    </div>
  );
};
