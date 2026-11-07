import React from 'react';
import type { TimeSlot } from '../types';

interface SlotBadgeProps {
  slot: TimeSlot | string;
}

export const SlotBadge: React.FC<SlotBadgeProps> = ({ slot }) => {
  const getBadgeClass = (s: string) => {
    switch (s) {
      case 'Morning (fasting)':
        return 'badge-morning';
      case 'After breakfast':
        return 'badge-breakfast';
      case 'After lunch':
        return 'badge-lunch';
      case 'After dinner':
        return 'badge-dinner';
      default:
        return 'badge-default';
    }
  };

  return <span className={`slot-badge ${getBadgeClass(slot)}`}>{slot}</span>;
};
