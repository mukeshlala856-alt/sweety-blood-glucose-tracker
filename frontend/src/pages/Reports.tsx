import React, { useState, useEffect } from 'react';
import api from '../api/client';
import type { ReportStats } from '../types';
import { ReportCard } from '../components/ReportCard';
import { AlertBanner } from '../components/AlertBanner';

export const Reports: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [dailyStats, setDailyStats] = useState<ReportStats | null>(null);
  const [monthToDateStats, setMonthToDateStats] = useState<ReportStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<ReportStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async (date: string) => {
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
      setError(err.response?.data?.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedDate);
  }, [selectedDate]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Blood Glucose Reports</h2>
        <div>
          <label style={{ marginRight: 10, fontWeight: 'bold' }}>Select Date:</label>
          <input
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <AlertBanner type="error" message={error} />

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          {/* Daily Report */}
          <ReportCard title={`Daily Report (${selectedDate})`} stats={dailyStats}>
            {dailyStats?.readings && dailyStats.readings.length > 0 && (
              <div style={{ marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
                <strong>Today's Slot Breakdown:</strong>
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  {dailyStats.readings.map((r) => (
                    <li key={r.id}>
                      {r.time_slot}: <strong>{r.glucose_value} mg/dl</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ReportCard>

          {/* Month-to-Date Report */}
          <ReportCard
            title={`Month-to-Date Report (${monthToDateStats?.start_date || ''} to ${monthToDateStats?.end_date || selectedDate})`}
            stats={monthToDateStats}
          />

          {/* Monthly Report */}
          <ReportCard
            title={`Monthly Report (${monthlyStats?.start_date || ''} to ${monthlyStats?.end_date || ''})`}
            stats={monthlyStats}
          />
        </>
      )}
    </div>
  );
};
