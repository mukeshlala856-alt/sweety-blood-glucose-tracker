import React from 'react';
import { StatCard } from './StatCard';
import type { ReportStats } from '../types';

interface ReportCardProps {
  title: string;
  subtitle: string;
  stats: ReportStats | null;
  children?: React.ReactNode;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  subtitle,
  stats,
  children,
}) => {
  return (
    <div className="report-card-container">
      <div className="report-card-header">
        <h3 className="report-card-title">{title}</h3>
        <span className="report-card-subtitle">{subtitle}</span>
      </div>

      {!stats || !stats.has_data ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">📋</div>
          <h4>No Readings Found</h4>
          <p>
            {stats?.message || 'No blood glucose readings recorded for this period.'}
          </p>
        </div>
      ) : (
        <>
          <div className="report-stats-grid">
            <StatCard
              title="Highest"
              value={stats.highest}
              unit="mg/dl"
              color="rose"
              icon="📈"
            />
            <StatCard
              title="Lowest"
              value={stats.lowest}
              unit="mg/dl"
              color="green"
              icon="📉"
            />
            <StatCard
              title="Average"
              value={stats.average}
              unit="mg/dl"
              color="blue"
              icon="📊"
            />
            <StatCard
              title="Total Readings"
              value={stats.total_readings}
              color="purple"
              icon="🔢"
            />
          </div>

          {children && <div className="report-card-body">{children}</div>}
        </>
      )}
    </div>
  );
};
