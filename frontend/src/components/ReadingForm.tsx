import React, { useState, useEffect } from 'react';
import api from '../api/client';
import type { Reading, TimeSlot } from '../types';
import { AlertBanner } from './AlertBanner';

interface ReadingFormProps {
  initialData?: Reading | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const TIME_SLOTS: TimeSlot[] = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

// Helper to get local date in YYYY-MM-DD
const getLocalToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ReadingForm: React.FC<ReadingFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const todayStr = getLocalToday();

  const [date, setDate] = useState(todayStr);
  const [slot, setSlot] = useState<TimeSlot>('Morning (fasting)');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.reading_date);
      setSlot(initialData.time_slot);
      setValue(String(initialData.glucose_value));
    } else {
      setDate(todayStr);
      setSlot('Morning (fasting)');
      setValue('');
    }
    setError('');
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Kenpath Rule 1: Value is required
    if (!value.trim()) {
      setError('Please enter a glucose value.');
      return;
    }

    // Kenpath Rule 2: Value must be a whole number between 40 and 600
    const num = Number(value);
    if (!Number.isInteger(num) || num < 40 || num > 600) {
      setError('Value must be between 40 and 600 mg/dl.');
      return;
    }

    // Kenpath Rule 5: Date cannot be in the future
    if (date > todayStr) {
      setError('Date cannot be in the future.');
      return;
    }

    try {
      setLoading(true);
      if (initialData) {
        await api.put(`/readings/${initialData.id}`, {
          reading_date: date,
          time_slot: slot,
          glucose_value: num,
        });
      } else {
        await api.post('/readings', {
          reading_date: date,
          time_slot: slot,
          glucose_value: num,
        });
        setValue('');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save reading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">
        {initialData ? 'Edit Glucose Reading' : 'Add New Glucose Reading'}
      </h3>

      <AlertBanner type="error" message={error} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Time Slot</label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value as TimeSlot)}
              className="form-input"
            >
              {TIME_SLOTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Blood Glucose (mg/dl)</label>
            <input
              type="number"
              placeholder="e.g. 110"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div>
          {initialData && onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Reading' : 'Save Reading'}
          </button>
        </div>
      </form>
    </div>
  );
};
