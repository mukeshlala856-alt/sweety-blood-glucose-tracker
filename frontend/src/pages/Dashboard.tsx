import React, { useState, useEffect } from 'react';
import api from '../api/client';
import type { Reading } from '../types';
import { ReadingForm } from '../components/ReadingForm';
import { ReadingTable } from '../components/ReadingTable';
import { GlucoseChart } from '../components/GlucoseChart';
import { AlertBanner } from '../components/AlertBanner';

export const Dashboard: React.FC = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReadings = async () => {
    try {
      const res = await api.get('/readings');
      setReadings(res.data.readings || []);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load readings.',
      });
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleSuccess = () => {
    setFeedback({
      type: 'success',
      message: editingReading ? 'Reading updated successfully.' : 'Reading added successfully.',
    });
    setEditingReading(null);
    fetchReadings();
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;

    try {
      await api.delete(`/readings/${id}`);
      setFeedback({ type: 'success', message: 'Reading deleted.' });
      fetchReadings();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to delete reading.' });
    }
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>

      {feedback && <AlertBanner type={feedback.type} message={feedback.message} />}

      <ReadingForm
        initialData={editingReading}
        onSuccess={handleSuccess}
        onCancel={() => setEditingReading(null)}
      />

      <GlucoseChart readings={readings} />

      <ReadingTable
        readings={readings}
        onEdit={(r) => {
          setEditingReading(r);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};
