import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { Reading } from '../types';

interface GlucoseChartProps {
  readings: Reading[];
}

export const GlucoseChart: React.FC<GlucoseChartProps> = ({ readings }) => {
  if (!readings || readings.length === 0) {
    return null;
  }

  // Sort readings chronologically (oldest to newest) for chart timeline
  const chartData = [...readings]
    .sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime() || a.id - b.id)
    .map((r) => ({
      date: r.reading_date.slice(5), // 'MM-DD'
      fullDate: r.reading_date,
      slot: r.time_slot,
      value: r.glucose_value,
    }));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">📈 Blood Glucose Trend</h3>
        <span className="chart-subtitle">Normal target range: 70 - 180 mg/dl</span>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis domain={[40, 300]} stroke="#64748b" fontSize={12} unit=" mg" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="chart-tooltip">
                      <p className="tooltip-date">{data.fullDate}</p>
                      <p className="tooltip-slot">{data.slot}</p>
                      <p className="tooltip-value">
                        <strong>{data.value}</strong> mg/dl
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Clinical Target Range Guideline Lines */}
            <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Low (70)', fill: '#10b981', fontSize: 11 }} />
            <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'High (180)', fill: '#f59e0b', fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
