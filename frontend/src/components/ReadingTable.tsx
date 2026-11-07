import React from 'react';
import type { Reading } from '../types';
import { SlotBadge } from './SlotBadge';

interface ReadingTableProps {
  readings: Reading[];
  onEdit: (reading: Reading) => void;
  onDelete: (id: number) => void;
}

export const ReadingTable: React.FC<ReadingTableProps> = ({
  readings,
  onEdit,
  onDelete,
}) => {
  const handleDelete = (id: number, date: string, slot: string) => {
    if (window.confirm(`Are you sure you want to delete the ${slot} reading for ${date}?`)) {
      onDelete(id);
    }
  };

  if (readings.length === 0) {
    return (
      <div className="empty-table-card">
        <span className="empty-icon">📊</span>
        <h3>No Glucose Readings Yet</h3>
        <p>Use the form above to record your first blood glucose measurement.</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h3 className="table-title">📋 Reading History</h3>
        <span className="table-count">{readings.length} total entries</span>
      </div>

      <div className="table-responsive">
        <table className="readings-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Glucose Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => {
              // Health indicator category (standard clinical ranges)
              let statusLabel = 'Normal';
              let statusClass = 'status-normal';
              if (reading.glucose_value < 70) {
                statusLabel = 'Low';
                statusClass = 'status-low';
              } else if (reading.glucose_value > 180) {
                statusLabel = 'High';
                statusClass = 'status-high';
              }

              return (
                <tr key={reading.id}>
                  <td className="font-medium">{reading.reading_date}</td>
                  <td>
                    <SlotBadge slot={reading.time_slot} />
                  </td>
                  <td>
                    <span className="glucose-pill">{reading.glucose_value} mg/dl</span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEdit(reading)}
                        className="btn-action btn-edit"
                        title="Edit reading"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(reading.id, reading.reading_date, reading.time_slot)
                        }
                        className="btn-action btn-delete"
                        title="Delete reading"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
