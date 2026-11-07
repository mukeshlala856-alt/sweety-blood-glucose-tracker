import React from 'react';
import type { Reading } from '../types';

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
  if (readings.length === 0) {
    return (
      <div className="card empty-box">
        <p>No glucose readings added yet. Use the form above to add your first reading.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">Readings History ({readings.length})</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time Slot</th>
            <th>Glucose (mg/dl)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td>{reading.reading_date}</td>
              <td>{reading.time_slot}</td>
              <td><strong>{reading.glucose_value} mg/dl</strong></td>
              <td>
                <button onClick={() => onEdit(reading)} className="btn-edit">
                  Edit
                </button>
                <button
                  onClick={() => onDelete(reading.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
