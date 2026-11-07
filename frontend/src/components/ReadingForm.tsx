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

export const ReadingForm: React.FC<ReadingFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [readingDate, setReadingDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('Morning (fasting)');
  const [glucoseValue, setGlucoseValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setReadingDate(initialData.reading_date);
      setTimeSlot(initialData.time_slot);
      setGlucoseValue(String(initialData.glucose_value));
    } else {
      setReadingDate(todayStr);
      setTimeSlot('Morning (fasting)');
      setGlucoseValue('');
    }
    setError('');
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validations matching Kenpath requirements
    if (!glucoseValue.trim()) {
      setError('Please enter a glucose value.');
      return;
    }

    const numValue = Number(glucoseValue);
    if (!Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
      setError('Value must be between 40 and 600 mg/dl.');
      return;
    }

    if (readingDate > todayStr) {
      setError('Date cannot be in the future.');
      return;
    }

    try {
      setLoading(true);

      if (initialData) {
        // Update existing reading
        await api.put(`/readings/${initialData.id}`, {
          reading_date: readingDate,
          time_slot: timeSlot,
          glucose_value: numValue,
        });
      } else {
        // Add new reading
        await api.post('/readings', {
          reading_date: readingDate,
          time_slot: timeSlot,
          glucose_value: numValue,
        });
        // Reset form for next entry
        setGlucoseValue('');
      }

      onSuccess();
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || 'Failed to save reading. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reading-form-card">
      <div className="form-card-header">
        <h3 className="form-title">
          {initialData ? '✏️ Edit Blood Glucose Reading' : '➕ Record New Glucose Reading'}
        </h3>
        {initialData && onCancel && (
          <button type="button" onClick={onCancel} className="btn-cancel-header">
            ✕ Cancel
          </button>
        )}
      </div>

      {error && <AlertBanner type="error" message={error} />}

      <form onSubmit={handleSubmit} className="reading-form">
        <div className="form-row">
          {/* Date Picker */}
          <div className="form-group">
            <label htmlFor="readingDate">Date</label>
            <input
              id="readingDate"
              type="date"
              max={todayStr}
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Time Slot Select */}
          <div className="form-group">
            <label htmlFor="timeSlot">Time Slot</label>
            <select
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
              className="form-input"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Glucose Value Input */}
          <div className="form-group">
            <label htmlFor="glucoseValue">Blood Glucose (mg/dl)</label>
            <input
              id="glucoseValue"
              type="number"
              placeholder="40 - 600"
              min="40"
              max="600"
              value={glucoseValue}
              onChange={(e) => setGlucoseValue(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          {initialData && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
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
