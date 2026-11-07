import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string | null | undefined;
  unit?: string;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'rose';
  icon?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  color = 'blue',
  icon,
}) => {
  const displayValue = value !== null && value !== undefined ? value : '—';

  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <div className="stat-value-container">
        <span className="stat-value">{displayValue}</span>
        {unit && value !== null && value !== undefined && (
          <span className="stat-unit">{unit}</span>
        )}
      </div>
    </div>
  );
};
