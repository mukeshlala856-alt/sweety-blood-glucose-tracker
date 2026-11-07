import React from 'react';
import type { ReportStats } from '../types';

interface ReportCardProps {
  title: string;
  stats: ReportStats | null;
  children?: React.ReactNode;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  stats,
  children,
}) => {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>

      {!stats || !stats.has_data ? (
        <div className="empty-box">
          <p>{stats?.message || 'No readings recorded for this period.'}</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Highest</div>
              <div className="stat-number">{stats.highest} mg/dl</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Lowest</div>
              <div className="stat-number">{stats.lowest} mg/dl</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Average</div>
              <div className="stat-number">{stats.average} mg/dl</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Readings</div>
              <div className="stat-number">{stats.total_readings}</div>
            </div>
          </div>

          {children}
        </>
      )}
    </div>
  );
};
