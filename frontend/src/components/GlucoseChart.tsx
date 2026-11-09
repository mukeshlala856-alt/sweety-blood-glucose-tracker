import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { Reading } from '../types';

interface GlucoseChartProps {
  readings: Reading[];
}

export const GlucoseChart: React.FC<GlucoseChartProps> = ({ readings }) => {
  if (!readings || readings.length === 0) return null;

  const chartData = [...readings]
    .sort((a, b) => new Date(a.reading_date).getTime() - new Date(b.reading_date).getTime())
    .map((r) => ({
      date: r.reading_date.slice(5),
      value: r.glucose_value,
      slot: r.time_slot,
    }));

  return (
    <div className="card">
      <h3 className="card-title">Glucose Readings Trend</h3>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" />
            <YAxis domain={[40, 300]} unit=" mg" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
