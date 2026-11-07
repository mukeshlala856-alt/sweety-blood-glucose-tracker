import React, { useState, useEffect } from 'react';
import api from '../api/client';
import type { ReportStats } from '../types';
import { ReportCard } from '../components/ReportCard';
import { SlotBadge } from '../components/SlotBadge';
import { AlertBanner } from '../components/AlertBanner';

export const Reports: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [dailyStats, setDailyStats] = useState<ReportStats | null>(null);
  const [monthToDateStats, setMonthToDateStats] = useState<ReportStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<ReportStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllReports = async (date: string) => {
    try {
      setLoading(true);
      setError('');

      const [dailyRes, mtdRes, monthlyRes] = await Promise.all([
        api.get(`/reports/daily?date=${date}`),
        api.get(`/reports/month-to-date?date=${date}`),
        api.get(`/reports/monthly?date=${date}`),
      ]);

      setDailyStats(dailyRes.data);
      setMonthToDateStats(mtdRes.data);
      setMonthlyStats(monthlyRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports(selectedDate);
  }, [selectedDate]);

  return (
    <div className="reports-container">
      <div className="reports-header-section">
        <div>
          <h1 className="page-title">Blood Glucose Reports</h1>
          <p className="page-subtitle">
            View aggregated daily, month-to-date, and previous month health insights
          </p>
        </div>

        {/* Date Selector */}
        <div className="date-filter-box">
          <label htmlFor="reportDate">Select Date:</label>
          <input
            id="reportDate"
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input date-input"
          />
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} />}

      {loading ? (
        <div className="loading-state">Calculating health statistics...</div>
      ) : (
        <div className="reports-stack">
          {/* 1. Daily Report */}
          <ReportCard
            title="📅 Daily Report"
            subtitle={`Readings for ${selectedDate}`}
            stats={dailyStats}
          >
            {dailyStats?.readings && dailyStats.readings.length > 0 && (
              <div className="daily-readings-list">
                <h4 className="readings-list-title">Today's Recorded Slots</h4>
                <div className="slots-grid">
                  {dailyStats.readings.map((r) => (
                    <div key={r.id} className="slot-reading-item">
                      <SlotBadge slot={r.time_slot} />
                      <span className="slot-reading-val">
                        <strong>{r.glucose_value}</strong> mg/dl
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ReportCard>

          {/* 2. Month-to-Date Report */}
          <ReportCard
            title="🗓️ Month-to-Date Report"
            subtitle={`${monthToDateStats?.start_date || ''} to ${monthToDateStats?.end_date || selectedDate}`}
            stats={monthToDateStats}
          />

          {/* 3. Monthly (Previous Month) Report */}
          <ReportCard
            title="📆 Monthly Report (Previous Calendar Month)"
            subtitle={`${monthlyStats?.start_date || ''} to ${monthlyStats?.end_date || ''}`}
            stats={monthlyStats}
          />
        </div>
      )}
    </div>
  );
};
