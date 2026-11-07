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
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/readings');
      setReadings(res.data.readings || []);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load readings.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleFormSuccess = () => {
    setFeedback({
      type: 'success',
      message: editingReading ? 'Reading updated successfully!' : 'New reading recorded successfully!',
    });
    setEditingReading(null);
    fetchReadings();

    // Auto-dismiss alert after 4 seconds
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleEditClick = (reading: Reading) => {
    setEditingReading(reading);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/readings/${id}`);
      setFeedback({ type: 'success', message: 'Reading deleted successfully.' });
      fetchReadings();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete reading.',
      });
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Blood Glucose Dashboard</h1>
          <p className="page-subtitle">Record and review your daily blood sugar levels</p>
        </div>
      </div>

      {feedback && <AlertBanner type={feedback.type} message={feedback.message} />}

      {/* Reading Form (Add or Edit) */}
      <ReadingForm
        initialData={editingReading}
        onSuccess={handleFormSuccess}
        onCancel={() => setEditingReading(null)}
      />

      {/* Glucose Trend Chart */}
      <GlucoseChart readings={readings} />

      {/* Readings Table */}
      {loading ? (
        <div className="loading-state">Loading readings...</div>
      ) : (
        <ReadingTable
          readings={readings}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
